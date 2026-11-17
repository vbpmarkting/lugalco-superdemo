// Secciones del portal público: Lugalco, Umami Lab, catálogo con fichas, cómo pedir y pie.
(() => {
  const LG = window.LG, I = window.LG_I18N, t = I.t;
  const { products, image, esc, norm, details } = LG;
  const root = document.getElementById('lg-sections');
  const brands = ['Friusa', 'Eurofrits', 'Gelagri', 'Doux', 'Caterfrits'];
  const umami = products.filter(p => p.brand === 'Umami');
  const families = ['vegetales', 'mar', 'patatas', 'elaborados', 'aves', 'otros'];
  const PAGE = 12;
  const state = { fam: 'all', brand: 'all', q: '', shown: PAGE, lab: umami[0]?.id, labMode: 'pack' };
  const famMark = { vegetales: 'Vg', mar: 'Mr', patatas: 'Pt', elaborados: 'El', aves: 'Av', otros: 'Ot' };
  const fix = p => (p ? p.replace(/^\.?\//, '') : null);

  function card(p) {
    const img = image(p), inQ = LG.hasConsulta(p.id);
    return `<li class="lg-card${p.brand === 'Umami' ? ' is-umami' : ''}">
      <button type="button" class="lg-card-open" data-open="${esc(p.id)}" aria-label="${esc(t('open'))}: ${esc(p.name)}">
        <div class="lg-card-media">${img ? `<img src="${esc(img)}" alt="" loading="lazy" width="360" height="360">` : `<span class="lg-card-mark" aria-hidden="true">${famMark[p.category] || ''}</span>`}</div>
        <div class="lg-card-body"><p class="lg-card-brand">${esc(p.brand)}${p.planned ? ` <span>${esc(t('planned'))}</span>` : ''}</p>
        <h3>${esc(p.name)}</h3><p class="lg-card-meta">${esc(t('fam')[p.category] || '')}<br>${esc(t('format'))} ${esc(p.format)}</p></div>
      </button>
      <button type="button" class="lg-card-q" data-q="${esc(p.id)}" aria-pressed="${inQ}">${esc(inQ ? t('fInQuery') : t('fAddQuery'))}</button></li>`;
  }
  function filtered() {
    const q = norm(state.q.trim());
    return products.filter(p => (state.fam === 'all' || p.category === state.fam) && (state.brand === 'all' || p.brand === state.brand)
      && norm([p.name, p.brand, p.format, t('fam')[p.category]].join(' ')).includes(q));
  }
  function renderList() {
    const list = filtered();
    root.querySelector('#lg-list').innerHTML = list.length ? list.slice(0, state.shown).map(card).join('') : `<li class="lg-empty">${esc(t('noResults'))}</li>`;
    root.querySelector('#lg-count').textContent = t('results')(list.length);
    root.querySelector('#lg-more').hidden = list.length <= state.shown;
  }
  function labStage() {
    const p = products.find(x => x.id === state.lab); if (!p) return '';
    const d = details[p.id] || {};
    const body = state.labMode === 'video' && d.animation
      ? `<video src="${esc(fix(d.animation))}" autoplay loop muted playsinline controls poster="${esc(fix(d.mockup) || '')}"></video>`
      : `<img src="${esc(image(p))}" alt="${esc(p.name)}">`;
    return `<div class="lg-lab-view">${body}</div>
      <div class="lg-lab-bar"><div class="lg-chips"><button type="button" data-lab-mode="pack" aria-pressed="${state.labMode === 'pack'}">${esc(t('fPack'))}</button>${d.animation ? `<button type="button" data-lab-mode="video" aria-pressed="${state.labMode === 'video'}">${esc(t('labAnim'))}</button>` : ''}</div>
      <div><b>${esc(p.name)}</b><br><small>${esc(t('format'))} ${esc(p.format)}</small></div>
      <button type="button" class="lg-btn" data-open="${esc(p.id)}">${esc(t('open'))}</button></div>`;
  }
  function renderLab() { const el = root.querySelector('#lg-lab-stage'); if (el) el.innerHTML = labStage(); root.querySelectorAll('[data-lab]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lab === state.lab))); }

  const v5 = LG.ver === '5';
  const cnt = b => products.filter(x => x.brand === b).length;
  const topFams = b => { const c = {}; products.filter(x => x.brand === b).forEach(x => { c[x.category] = (c[x.category] || 0) + 1; }); return Object.entries(c).sort((a, b2) => b2[1] - a[1]).slice(0, 3).map(([k]) => t('fam')[k]); };
  function cartera() {
    const pick = ['umami-gamba-pelada', 'umami-patata-99', 'umami-hamburguesa'].map(id => products.find(x => x.id === id)).filter(Boolean);
    return `<section class="lg-cartera" id="cartera"><div class="lg-cartera-head"><p class="lg-kicker">${esc(t('cartKicker'))}</p><h2>${esc(t('cartTitle'))}</h2><p>${esc(t('cartLead'))}</p></div>
      <div class="lg-cartera-grid">
        <article class="lg-tile is-umami"><div class="lg-tile-copy"><span class="lg-tag">${esc(t('cartOwn'))}</span><h3>umami</h3><p>${esc(t('cartUmamiText'))}</p><p class="lg-tile-n">${esc(t('refs')(cnt('Umami')))}</p><a class="lg-btn" href="#lab">${esc(t('cartUmamiCta'))}</a></div>
          <div class="lg-tile-bags" aria-hidden="true">${pick.map((x, i) => `<img src="${esc(image(x))}" alt="" loading="lazy" style="--i:${i}">`).join('')}</div></article>
        ${brands.map(b => `<button type="button" class="lg-tile" data-brand-filter="${b}"><span class="lg-tag">${esc(t('cartPartner'))}</span><h3>${b}</h3><p class="lg-tile-n">${esc(t('refs')(cnt(b)))}</p><p class="lg-tile-f">${esc(topFams(b).join(' · '))}</p><span class="lg-tile-go">${esc(t('cartSee'))} →</span></button>`).join('')}
      </div></section>`;
  }
  function render() {
    const how = t('how');
    root.innerHTML = `
    <section class="lg-about" id="lugalco"><h2>${esc(t('aboutTitle'))}</h2><p>${esc(t('aboutText'))}</p></section>
    ${v5 ? cartera() : ''}
    <section class="lg-umami" id="umami">
      <div class="lg-umami-head"><p class="lg-umami-word" aria-hidden="true">umami</p>
        <div><h2>${esc(t('umamiTitle'))}</h2><p>${esc(t('umamiText'))}</p><a class="lg-btn" href="#lab">${esc(t('labTitle'))}</a></div></div>
      <div class="lg-lab" id="lab"><div class="lg-lab-head"><h3>${esc(t('labTitle'))}</h3><p>${esc(t('labLead'))}</p></div>
        <div class="lg-lab-grid">
          <ul class="lg-lab-list" aria-label="${esc(t('labPick'))}">${umami.map(p => `<li><button type="button" data-lab="${esc(p.id)}" aria-pressed="${p.id === state.lab}"><img src="${esc(image(p))}" alt="" width="44" height="56" loading="lazy"><span>${esc(p.name)}</span></button></li>`).join('')}</ul>
          <div class="lg-lab-stage" id="lg-lab-stage"></div></div></div>
      ${v5 ? '' : `<div class="lg-brands"><h3>${esc(t('brandsTitle'))}</h3><ul>${brands.map(b => `<li>${b}</li>`).join('')}</ul><p>${esc(t('brandsNote'))}</p></div>`}
    </section>
    <section class="lg-catalog" id="productos">
      <div class="lg-catalog-head"><h2>${esc(t('catTitle'))}</h2><p>${esc(t('catLead'))}</p></div>
      <div class="lg-tools">
        <label class="lg-search"><span>${esc(t('search'))}</span><input type="search" id="lg-q" placeholder="${esc(t('searchPh'))}" autocomplete="off" value="${esc(state.q)}"></label>
        <label class="lg-brand"><span class="lg-sr">${esc(t('allBrands'))}</span><select id="lg-brand"><option value="all">${esc(t('allBrands'))}</option>${['Umami', ...brands].map(b => `<option ${state.brand === b ? 'selected' : ''}>${b}</option>`).join('')}</select></label></div>
      <div class="lg-chips" role="group" aria-label="${esc(t('navProducts'))}">${['all', ...families].map(f => `<button type="button" data-fam="${f}" aria-pressed="${state.fam === f}">${esc(f === 'all' ? t('all') : t('fam')[f])}</button>`).join('')}</div>
      <p class="lg-count" id="lg-count" role="status" aria-live="polite"></p>
      <ul class="lg-grid" id="lg-list"></ul>
      <button type="button" class="lg-more" id="lg-more">${esc(t('more'))}</button>
    </section>
    <section class="lg-how" id="como-pedir"><h2>${esc(t('howTitle'))}</h2>
      <ol>${how.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
      <a class="lg-btn lg-btn-strong" href="${esc(LG.url('cliente.html'))}">${esc(t('howCta'))}</a></section>
    <footer class="lg-footer"><span class="lg-footer-logo">lugalco</span><span>${esc(t('footer'))}</span>
      <a href="creditos-umami.html">${esc(t('labCredits'))}</a><a href="${esc(LG.url('panel.html'))}">${esc(t('panel'))}</a><a href="index.html">${esc(t('otherVersions'))}</a></footer>`;
    renderList(); renderLab();
  }

  root.addEventListener('input', e => { if (e.target.id === 'lg-q') { state.q = e.target.value; state.shown = PAGE; renderList(); } });
  root.addEventListener('change', e => { if (e.target.id === 'lg-brand') { state.brand = e.target.value; state.shown = PAGE; renderList(); } });
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.fam) { state.fam = b.dataset.fam; state.shown = PAGE; root.querySelectorAll('[data-fam]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderList(); }
    else if (b.id === 'lg-more') { state.shown += PAGE; renderList(); }
    else if (b.dataset.open) window.LG_FICHA.open(b.dataset.open);
    else if (b.dataset.brandFilter) {
      state.brand = b.dataset.brandFilter; state.fam = 'all'; state.q = ''; state.shown = PAGE;
      root.querySelector('#lg-brand').value = state.brand; root.querySelector('#lg-q').value = '';
      root.querySelectorAll('[data-fam]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.fam === 'all')));
      renderList(); document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    }
    else if (b.dataset.q) LG.toggleConsulta(b.dataset.q);
    else if (b.dataset.lab) { state.lab = b.dataset.lab; renderLab(); }
    else if (b.dataset.labMode) { state.labMode = b.dataset.labMode; renderLab(); }
  });
  document.querySelectorAll('[data-client]').forEach(a => { a.href = LG.url('cliente.html'); });
  addEventListener('lg-consulta', () => { if (root.querySelector('#lg-list')) renderList(); });
  render(); I.apply(); I.onChange(render);
})();
