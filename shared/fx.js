// Efectos de movimiento (solo se activan en la versión 4 y respetan "reducir movimiento")
(() => {
  if (!['4', '5', '6', '7'].includes(document.documentElement.dataset.ver)) return;
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
    document.querySelectorAll('.lg-cartera-head,.lg-tile,.lg-about h2,.lg-about p,.lg-umami-head,.lg-lab,.lg-brands,.lg-catalog-head,.lg-card,.lg-how li,.lg-how h2,.lg-how .lg-btn').forEach(el => {
      if (el.dataset.rv) return; el.dataset.rv = '1'; el.classList.add('rv'); el.style.setProperty('--i', (el.matches('.lg-card') ? [...el.parentNode.children].indexOf(el) % 4 : 0));
      io.observe(el);
    });
  };
  new MutationObserver(tag).observe(document.getElementById('lg-sections'), { childList: true, subtree: true });
  tag();

  // Versión 6: el wordmark se encoge hacia el header y Umami entra como escena de scroll
  if (document.documentElement.dataset.ver === '6' && !reduce) {
    const root = document.documentElement; let tick = false;
    const clamp = v => Math.max(0, Math.min(1, v));
    const update = () => {
      tick = false;
      const w = document.querySelector('.v5-word');
      if (w) { const h = w.offsetHeight + w.offsetTop + 80; root.style.setProperty('--p', clamp(scrollY / h).toFixed(3)); }
      const u = document.querySelector('.lg-umami');
      if (u) { const r = u.getBoundingClientRect(), vh = innerHeight; root.style.setProperty('--sp', clamp((vh - r.top) / (vh * .9)).toFixed(3)); u.style.setProperty('--sp', clamp((vh - r.top) / (vh * .9)).toFixed(3)); }
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update); new MutationObserver(update).observe(document.getElementById('lg-sections'), { childList: true }); update();
  }

  // Versión 7 · Cámara fría: hielo que se descongela con el puntero y pasillo horizontal de congeladores
  if (document.documentElement.dataset.ver === '7') {
    const hero = document.getElementById('v7-hero');
    if (hero) {
      let tx = .72, ty = .4, x = tx, y = ty, touched = false, t0 = performance.now();
      const set = () => { hero.style.setProperty('--x', (x * 100).toFixed(2) + '%'); hero.style.setProperty('--y', (y * 100).toFixed(2) + '%'); };
      hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; touched = true; hero.classList.add('is-touched'); });
      const loop = t => {
        if (!touched) { const k = (t - t0) / 1000; if (innerWidth <= 860) { tx = .5 + Math.cos(k * .9) * .32; ty = .8 + Math.sin(k * 1.3) * .1; } else { tx = .62 + Math.cos(k * .9) * .26; ty = .45 + Math.sin(k * 1.3) * .22; } }
        x += (tx - x) * .12; y += (ty - y) * .12; set(); requestAnimationFrame(loop);
      };
      set();
      if (reduce) { hero.style.setProperty('--x', '70%'); hero.style.setProperty('--y', '45%'); } else requestAnimationFrame(loop);
    }
    const aisle = () => document.querySelector('.lg-aisle');
    const clamp = v => Math.max(0, Math.min(1, v));
    const walk = () => {
      const a = aisle(); if (!a) return; const track = a.querySelector('.lg-aisle-track'), cabs = a.querySelectorAll('.lg-cab');
      const pinned = innerWidth > 860;
      if (!pinned) { a.style.height = ''; track.style.transform = ''; cabs.forEach(c => c.classList.add('is-open')); return; }
      const dist = Math.max(0, track.scrollWidth - innerWidth + 120);
      a.style.height = (dist + innerHeight) + 'px';
      const p = clamp(-a.getBoundingClientRect().top / Math.max(1, dist));
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      a.style.setProperty('--ap', p.toFixed(3));
      cabs.forEach(c => { const r = c.getBoundingClientRect(), mid = r.left + r.width / 2; c.classList.toggle('is-open', mid > innerWidth * .12 && mid < innerWidth * .88); });
    };
    addEventListener('scroll', walk, { passive: true }); addEventListener('resize', walk);
    new MutationObserver(walk).observe(document.getElementById('lg-sections'), { childList: true }); walk();
    addEventListener('load', walk);
  }
  // Números que cuentan
  const count = ul => {
    ul.querySelectorAll('b').forEach(b => {
      const m = b.textContent.match(/^(\d+)(.*)$/); if (!m) return; const to = +m[1], suf = m[2], t0 = performance.now();
      const step = t => { const k = Math.min(1, (t - t0) / 1100), v = Math.round(to * (1 - Math.pow(1 - k, 3))); b.textContent = v + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  };
  const stats = document.querySelector('.v4-stats,.v5-stats,.v6-stats,.v7-stats');
  if (stats && io) { const so = new IntersectionObserver(es => { if (es[0].isIntersecting) { count(stats); so.disconnect(); } }, { threshold: .5 }); so.observe(stats); }
})();
