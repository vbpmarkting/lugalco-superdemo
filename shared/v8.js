// Versión 8 · Capítulos: una pantalla por marca, Umami como capítulo final y el catálogo en un panel lateral.
(() => {
  const K = window.KIT, { LG, I, t, esc, image, brands, umami, COL, families } = K;
  const { details } = LG;
  const app = document.getElementById('app');
  const PAGE = 12, st = { brand: 'all', fam: 'all', q: '', shown: PAGE, lab: umami[0]?.id, mode: 'pack' };
  const fix = p => (p ? p.replace(/^\.?\//, '') : null);
  const total = brands.length + 3, two = n => String(n).padStart(2, '0');
  const WAVE = '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M4 13c6-7 11 7 17 0s11 7 16 0M4 21c6-7 11 7 17 0s11 7 16 0M4 29c6-7 11 7 17 0s11 7 16 0" stroke="currentColor" stroke-width="3"/></svg>';

  function labStage() {
    const p = LG.products.find(x => x.id === st.lab); if (!p) return '';
    const d = details[p.id] || {};
    const view = st.mode === 'video' && d.animation ? `<video src="${esc(fix(d.animation))}" autoplay loop muted playsinline controls poster="${esc(fix(d.mockup) || '')}"></video>` : `<img src="${esc(image(p))}" alt="${esc(p.name)}">`;
    return `<div class="k8-lab-view">${view}</div><div class="k8-lab-bar"><div class="lg-chips"><button type="button" data-mode="pack" aria-pressed="${st.mode === 'pack'}">${esc(t('fPack'))}</button>${d.animation ? `<button type="button" data-mode="video" aria-pressed="${st.mode === 'video'}">${esc(t('labAnim'))}</button>` : ''}</div><b>${esc(p.name)}</b><button type="button" class="k8-btn" data-open="${esc(p.id)}">${esc(t('open'))}</button></div>`;
  }
  function brandCh(b, i) {
    const list = K.names(b, 7).map(n => { const p = K.byBrand(b).find(x => x.name === n); return `<li><span>${esc(n)}</span><i></i><em>${esc(p.format)}</em></li>`; }).join('');
    return `<section class="ch ch-brand" id="c${i + 1}" data-ch="${i + 1}" style="--bc:${COL[b]}"><div class="ch-bg" aria-hidden="true">${b}</div>
      <div class="ch-in"><div class="ch-l"><p class="ch-n">${two(i + 2)} <span>/ ${two(total)}</span></p><p class="ch-tag">${esc(t('cartPartner'))}</p><h2>${b}</h2>
        <p class="ch-big"><b>${K.cnt(b)}</b> ${esc(t('refs')(0).replace(/^0\s*/, ''))}</p><p class="ch-fam">${esc(K.topFams(b).join(' · '))}</p>
        <button type="button" class="k8-btn" data-brand="${b}">${esc(t('cartSee'))} →</button></div>
        <ul class="ch-menu" aria-hidden="true">${list}</ul></div></section>`;
  }
  function render() {
    app.innerHTML = `
    <section class="ch ch-intro" id="c0" data-ch="0"><div class="ch-in"><p class="ch-n">01 <span>/ ${two(total)}</span></p><p class="k8-kicker" data-t="heroKicker"></p>
      <h1 class="k8-word" aria-label="Lugalco">${WAVE}<span aria-hidden="true">lugalco</span></h1>
      <p class="k8-lead" data-t="heroLead"></p><div class="k8-actions"><a class="k8-btn" href="#c1" data-t="cartKicker"></a><a class="k8-btn line" data-client href="cliente.html" data-t="askQuote"></a></div>
      <ul class="k8-stats" data-stats></ul><p class="k8-cue" aria-hidden="true">↓</p></div></section>
    ${brands.map(brandCh).join('')}
    <section class="ch ch-umami" id="c${brands.length + 1}" data-ch="${brands.length + 1}"><div class="ch-bg" aria-hidden="true">umami</div>
      <div class="ch-in"><p class="ch-n">${two(total - 1)} <span>/ ${two(total)}</span></p><p class="ch-tag">${esc(t('cartOwn'))}</p><h2 class="um">umami</h2><p class="um-p">${esc(t('cartUmamiText'))}</p>
        <div class="k8-lab"><ul class="k8-lab-list" aria-label="${esc(t('labPick'))}">${umami.map(p => `<li><button type="button" data-lab="${esc(p.id)}" aria-pressed="${p.id === st.lab}"><img src="${esc(image(p))}" alt="" width="40" height="50" loading="lazy"><span>${esc(p.name)}</span></button></li>`).join('')}</ul><div class="k8-lab-stage" id="k8-stage">${labStage()}</div></div></div></section>
    <section class="ch ch-how" id="c${brands.length + 2}" data-ch="${brands.length + 2}"><div class="ch-in"><p class="ch-n">${two(total)} <span>/ ${two(total)}</span></p><h2>${esc(t('howTitle'))}</h2>
      <ol class="k8-how">${t('how').map(([h, p]) => `<li><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join('')}</ol>
      <div class="k8-actions"><a class="k8-btn" href="${esc(LG.url('cliente.html'))}">${esc(t('howCta'))}</a><button type="button" class="k8-btn line" data-brand="all">${esc(t('catTitle'))} · 128</button></div>
      <p class="k8-foot">${esc(t('footer'))} · <a href="creditos-umami.html">${esc(t('labCredits'))}</a> · <a href="${esc(LG.url('panel.html'))}">${esc(t('panel'))}</a> · <a href="index.html">${esc(t('otherVersions'))}</a></p></div></section>`;
    dots(); I.apply(); if (window.LG_HERO) window.LG_HERO(); watch();
  }
  // Índice de capítulos
  function dots() {
    const nav = document.getElementById('k8-dots');
    nav.innerHTML = [...document.querySelectorAll('.ch')].map((c, i) => `<a href="#${c.id}" data-i="${i}" aria-label="${i + 1}"><span>${two(i + 1)}</span></a>`).join('');
  }
  let io, io2;
  function watch() {
    io && io.disconnect(); io2 && io2.disconnect();
    // Aparición: basta con ver un trozo del capítulo
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: .12 });
    // Capítulo activo: el que cruza la mitad de la pantalla
    io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const i = e.target.dataset.ch; document.querySelectorAll('#k8-dots a').forEach(a => a.toggleAttribute('aria-current', a.dataset.i === i)); document.body.dataset.ch = e.target.classList.contains('ch-umami') ? 'um' : e.target.classList.contains('ch-brand') ? 'br' : 'in'; } }), { rootMargin: '-50% 0px -50% 0px' });
    document.querySelectorAll('.ch').forEach(c => { io.observe(c); io2.observe(c); });
  }
  // Panel lateral con el catálogo
  const dr = document.getElementById('k8-drawer');
  function drawer() {
    const list = K.filter(st);
    dr.innerHTML = `<div class="k8-dr-in"><div class="k8-dr-top"><h2>${st.brand === 'all' ? esc(t('catTitle')) : esc(st.brand)}</h2><button type="button" class="k8-x" data-close aria-label="${esc(t('fClose'))}">×</button></div>
      <label class="k8-search"><span class="lg-sr">${esc(t('search'))}</span><input type="search" id="k8-q" placeholder="${esc(t('searchPh'))}" value="${esc(st.q)}" autocomplete="off"></label>
      <div class="lg-chips" role="group">${['all', ...families].map(f => `<button type="button" data-fam="${f}" aria-pressed="${st.fam === f}">${esc(f === 'all' ? t('all') : t('fam')[f])}</button>`).join('')}</div>
      <p class="lg-count" role="status">${esc(t('results')(list.length))}</p>
      <ul class="k8-grid">${list.length ? list.slice(0, st.shown).map(K.card).join('') : `<li class="lg-empty">${esc(t('noResults'))}</li>`}</ul>${list.length > st.shown ? `<button type="button" class="k8-btn line" data-more>${esc(t('more'))}</button>` : ''}</div>`;
  }
  function openDrawer(b) { st.brand = b; st.fam = 'all'; st.q = ''; st.shown = PAGE; drawer(); dr.classList.add('open'); document.body.classList.add('dr-open'); dr.querySelector('#k8-q').focus({ preventScroll: true }); }
  function closeDrawer() { dr.classList.remove('open'); document.body.classList.remove('dr-open'); }
  dr.addEventListener('input', e => { if (e.target.id === 'k8-q') { st.q = e.target.value; st.shown = PAGE; const pos = e.target.selectionStart; drawer(); const q = dr.querySelector('#k8-q'); q.focus(); q.setSelectionRange(pos, pos); } });
  dr.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { closeDrawer(); return; }
    const f = e.target.closest('[data-fam]'); if (f) { st.fam = f.dataset.fam; st.shown = PAGE; drawer(); return; }
    if (e.target.closest('[data-more]')) { st.shown += PAGE; drawer(); }
  });
  K.bind(dr);
  addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
    if (dr.classList.contains('open') || /input|select|textarea/i.test(e.target.tagName) || document.querySelector('dialog[open]')) return;
    const cs = [...document.querySelectorAll('.ch')]; const cur = cs.findIndex(c => c.getBoundingClientRect().top > -innerHeight * .4);
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { const n = cs[Math.min(cs.length - 1, Math.max(0, cur) + (cs[cur]?.getBoundingClientRect().top > 80 ? 0 : 1))]; if (n) { e.preventDefault(); n.scrollIntoView({ behavior: 'smooth' }); } }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { const n = cs[Math.max(0, cur - 1)]; if (n) { e.preventDefault(); n.scrollIntoView({ behavior: 'smooth' }); } }
  });
  app.addEventListener('click', e => {
    const b = e.target.closest('[data-brand]'); if (b) { openDrawer(b.dataset.brand); return; }
    const l = e.target.closest('[data-lab]'); if (l) { st.lab = l.dataset.lab; document.getElementById('k8-stage').innerHTML = labStage(); app.querySelectorAll('[data-lab]').forEach(x => x.setAttribute('aria-pressed', String(x === l))); return; }
    const m = e.target.closest('[data-mode]'); if (m) { st.mode = m.dataset.mode; document.getElementById('k8-stage').innerHTML = labStage(); }
  });
  K.bind(app);
  document.querySelectorAll('[data-client]').forEach(a => { a.href = LG.url('cliente.html'); });
  render(); I.onChange(() => { render(); if (dr.classList.contains('open')) drawer(); });
})();
