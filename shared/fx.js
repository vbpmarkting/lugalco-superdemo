// Efectos de movimiento (solo se activan en la versión 4 y respetan "reducir movimiento")
(() => {
  if (document.documentElement.dataset.ver !== '4') return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Abanico de envases: se mueve con el ratón o el dedo
  const fan = document.getElementById('v4-fan');
  if (fan && !reduce) {
    const move = e => { const r = fan.getBoundingClientRect(); fan.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5) * 2); fan.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5) * 2); };
    fan.addEventListener('pointermove', move);
    fan.addEventListener('pointerleave', () => { fan.style.setProperty('--mx', 0); fan.style.setProperty('--my', 0); });
  }
  // Cinta de envases Umami: pasa sola, se pausa al pasar el ratón y abre la ficha
  const reel = document.getElementById('v4-reel');
  if (reel) {
    const um = window.LG.products.filter(p => p.brand === 'Umami');
    const bag = (p, i) => `<button type="button" class="v4-bag" data-open="${window.LG.esc(p.id)}" style="--t:${i % 2 ? 3 : -3}deg;--y:${i % 3 * 8}px" aria-label="${window.LG.esc(p.name)}"><img src="${window.LG.esc(window.LG.image(p))}" alt="" loading="lazy" width="220" height="275"><span>${window.LG.esc(p.name)}</span></button>`;
    const row = um.map(bag).join('');
    reel.innerHTML = `<div class="v4-reel-track">${row}${row}</div>`;
    reel.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) window.LG_FICHA.open(b.dataset.open); });
  }
  // Paralaje del abanico al bajar
  if (fan && !reduce) addEventListener('scroll', () => fan.style.setProperty('--sy', Math.min(scrollY, 700) / 700), { passive: true });
  // Aparición al hacer scroll
  const io = 'IntersectionObserver' in window && !reduce ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' }) : null;
  const tag = () => {
    if (!io) return;
    document.querySelectorAll('.lg-about h2,.lg-about p,.lg-umami-head,.lg-lab,.lg-brands,.lg-catalog-head,.lg-card,.lg-how li,.lg-how h2,.lg-how .lg-btn').forEach(el => {
      if (el.dataset.rv) return; el.dataset.rv = '1'; el.classList.add('rv'); el.style.setProperty('--i', (el.matches('.lg-card') ? [...el.parentNode.children].indexOf(el) % 4 : 0));
      io.observe(el);
    });
  };
  new MutationObserver(tag).observe(document.getElementById('lg-sections'), { childList: true, subtree: true });
  tag();
  // Números que cuentan
  const count = ul => {
    ul.querySelectorAll('b').forEach(b => {
      const m = b.textContent.match(/^(\d+)(.*)$/); if (!m) return; const to = +m[1], suf = m[2], t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / 1100), v = Math.round(to * (1 - Math.pow(1 - k, 3))); b.textContent = v + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  };
  const stats = document.querySelector('.v4-stats');
  if (stats && io) { const so = new IntersectionObserver(es => { if (es[0].isIntersecting) { count(stats); so.disconnect(); } }, { threshold: .5 }); so.observe(stats); }
})();
