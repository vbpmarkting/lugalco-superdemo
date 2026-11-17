// Versión 10 · Tienda: menú fijo de marcas a la izquierda y muro de productos a la derecha. Umami manda en todas las vistas.
(() => {
  const K = window.KIT, { LG, I, t, esc, image, brands, umami, COL, families } = K;
  const { details } = LG;
  const side = document.getElementById('k10-side'), app = document.getElementById('app'), bar = document.getElementById('k10-q');
  const PAGE = 18, st = { view: 'home', fam: 'all', q: '', shown: PAGE, lab: umami[0]?.id, mode: 'pack' };
  const fix = p => (p ? p.replace(/^\.?\//, '') : null);
  const WAVE = '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M4 13c6-7 11 7 17 0s11 7 16 0M4 21c6-7 11 7 17 0s11 7 16 0M4 29c6-7 11 7 17 0s11 7 16 0" stroke="currentColor" stroke-width="3"/></svg>';

  function sidebar() {
    side.innerHTML = `<a class="k10-logo" href="#" data-view="home">${WAVE}<span>lugalco</span></a>
      <nav aria-label="${esc(t('navBrands'))}"><button type="button" data-view="home" aria-current="${st.view === 'home'}"><i style="--c:#0b1f2e"></i><span>${esc(t('navLugalco'))}</span></button>
      <button type="button" class="um" data-view="Umami" aria-current="${st.view === 'Umami'}"><i style="--c:${COL.Umami}"></i><span>Umami</span><em>${K.cnt('Umami')}</em></button>
      <p class="k10-lbl">${esc(t('cartPartner'))}</p>
      ${brands.map(b => `<button type="button" data-view="${b}" aria-current="${st.view === b}"><i style="--c:${COL[b]}"></i><span>${b}</span><em>${K.cnt(b)}</em></button>`).join('')}
      <button type="button" data-view="all" aria-current="${st.view === 'all'}" class="all"><i style="--c:#7a8a96"></i><span>${esc(t('catTitle'))}</span><em>${LG.products.length}</em></button></nav>
      <div class="k10-side-foot"><a href="${esc(LG.url('panel.html'))}">${esc(t('panel'))}</a><a href="index.html">${esc(t('otherVersions'))}</a></div>`;
  }
  function labStage() {
    const p = LG.products.find(x => x.id === st.lab); if (!p) return '';
    const d = details[p.id] || {};
    const view = st.mode === 'video' && d.animation ? `<video src="${esc(fix(d.animation))}" autoplay loop muted playsinline controls poster="${esc(fix(d.mockup) || '')}"></video>` : `<img src="${esc(image(p))}" alt="${esc(p.name)}">`;
    return `<div class="k10-lab-view">${view}</div><div class="k10-lab-bar"><div class="lg-chips"><button type="button" data-mode="pack" aria-pressed="${st.mode === 'pack'}">${esc(t('fPack'))}</button>${d.animation ? `<button type="button" data-mode="video" aria-pressed="${st.mode === 'video'}">${esc(t('labAnim'))}</button>` : ''}</div><b>${esc(p.name)}</b><button type="button" class="k10-btn" data-open="${esc(p.id)}">${esc(t('open'))}</button></div>`;
  }
  const grid = list => `<ul class="k10-grid">${list.length ? list.slice(0, st.shown).map(K.card).join('') : `<li class="lg-empty">${esc(t('noResults'))}</li>`}</ul>${list.length > st.shown ? `<button type="button" class="k10-btn line" data-more>${esc(t('more'))}</button>` : ''}`;
  const chips = () => `<div class="lg-chips">${['all', ...families].map(f => `<button type="button" data-fam="${f}" aria-pressed="${st.fam === f}">${esc(f === 'all' ? t('all') : t('fam')[f])}</button>`).join('')}</div>`;
  function home() {
    const um = K.pick();
    return `<section class="k10-hero"><div><p class="k10-kick" data-t="heroKicker"></p><h1>lugalco</h1><p class="k10-lead" data-t="heroLead"></p><div class="k10-acts"><a class="k10-btn" data-client href="${esc(LG.url('cliente.html'))}">${esc(t('askQuote'))}</a><button type="button" class="k10-btn line" data-view="all">${esc(t('catTitle'))} · ${LG.products.length}</button></div></div><ul class="k10-stats" data-stats></ul></section>
      <section class="k10-um"><div class="k10-um-head"><div><span class="k10-tag">${esc(t('cartOwn'))}</span><h2>umami</h2><p>${esc(t('cartUmamiText'))}</p></div><button type="button" class="k10-btn dark" data-view="Umami">${esc(t('cartUmamiCta'))} →</button></div>
        <ul class="k10-row">${um.map(p => `<li><button type="button" data-open="${esc(p.id)}"><img src="${esc(image(p))}" alt="${esc(p.name)}" loading="lazy"><span>${esc(p.name)}</span></button></li>`).join('')}</ul></section>
      <section class="k10-brands">${brands.map(b => `<button type="button" data-view="${b}" style="--bc:${COL[b]}"><small>${esc(t('cartPartner'))}</small><b>${b}</b><span>${esc(t('refs')(K.cnt(b)))}</span></button>`).join('')}</section>
      <section class="k10-how"><h2>${esc(t('howTitle'))}</h2><ol>${t('how').map(([h, p]) => `<li><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join('')}</ol></section>`;
  }
  function view() {
    if (st.q.trim()) { const list = K.filter({ q: st.q, fam: st.fam }); return `<header class="k10-banner"><h2>“${esc(st.q)}”</h2><p>${esc(t('results')(list.length))}</p></header>${chips()}${grid(list)}`; }
    if (st.view === 'home') return home();
    if (st.view === 'all') { const list = K.filter({ fam: st.fam }); return `<header class="k10-banner"><h2>${esc(t('catTitle'))}</h2><p>${esc(t('catLead'))}</p></header>${chips()}${grid(list)}`; }
    if (st.view === 'Umami') {
      const list = K.filter({ brand: 'Umami', fam: st.fam });
      return `<header class="k10-banner um"><span class="k10-tag">${esc(t('cartOwn'))}</span><h2>umami</h2><p>${esc(t('labLead'))}</p></header>
        <div class="k10-lab"><ul class="k10-lab-list">${umami.map(p => `<li><button type="button" data-lab="${esc(p.id)}" aria-pressed="${p.id === st.lab}"><img src="${esc(image(p))}" alt="" width="40" height="50" loading="lazy"><span>${esc(p.name)}</span></button></li>`).join('')}</ul><div class="k10-lab-stage" id="k10-stage">${labStage()}</div></div>${chips()}${grid(list)}`;
    }
    const list = K.filter({ brand: st.view, fam: st.fam });
    return `<header class="k10-banner" style="--bc:${COL[st.view]}"><span class="k10-tag">${esc(t('cartPartner'))}</span><h2>${esc(st.view)}</h2><p>${esc(t('refs')(K.cnt(st.view)))} · ${esc(K.topFams(st.view).join(' · '))}</p></header>${chips()}${grid(list)}`;
  }
  function render(keepScroll) {
    sidebar(); app.innerHTML = view(); I.apply(); window.LG_HERO && window.LG_HERO();
    document.body.dataset.view = st.view === 'Umami' ? 'um' : st.view === 'home' ? 'home' : 'br';
    if (!keepScroll) scrollTo({ top: 0 });
  }
  const go = v => { st.view = v; st.fam = 'all'; st.q = ''; st.shown = PAGE; bar.value = ''; render(); };
  document.addEventListener('click', e => {
    const v = e.target.closest('[data-view]'); if (v) { e.preventDefault(); go(v.dataset.view); return; }
    if (!app.contains(e.target)) return;
    const f = e.target.closest('[data-fam]'); if (f) { st.fam = f.dataset.fam; st.shown = PAGE; render(true); return; }
    if (e.target.closest('[data-more]')) { st.shown += PAGE; render(true); return; }
    const l = e.target.closest('[data-lab]'); if (l) { st.lab = l.dataset.lab; document.getElementById('k10-stage').innerHTML = labStage(); app.querySelectorAll('[data-lab]').forEach(x => x.setAttribute('aria-pressed', String(x === l))); return; }
    const m = e.target.closest('[data-mode]'); if (m) { st.mode = m.dataset.mode; document.getElementById('k10-stage').innerHTML = labStage(); }
  });
  K.bind(app);
  bar.addEventListener('input', () => { st.q = bar.value; st.shown = PAGE; render(true); });
  render(); I.onChange(() => { bar.placeholder = t('searchPh'); render(true); });
  bar.placeholder = t('searchPh');
})();
