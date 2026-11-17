// Versión 9 · Bento: una sola pantalla con piezas de distinto tamaño; cada pieza se abre a pantalla completa.
(() => {
  const K = window.KIT, { LG, I, t, esc, image, brands, umami, COL, families } = K;
  const { details } = LG;
  const app = document.getElementById('app'), sheet = document.getElementById('k9-sheet');
  const PAGE = 12, st = { brand: 'all', fam: 'all', q: '', shown: PAGE, lab: umami[0]?.id, mode: 'pack', kind: null };
  const fix = p => (p ? p.replace(/^\.?\//, '') : null);
  const WAVE = '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M4 13c6-7 11 7 17 0s11 7 16 0M4 21c6-7 11 7 17 0s11 7 16 0M4 29c6-7 11 7 17 0s11 7 16 0" stroke="currentColor" stroke-width="3"/></svg>';
  const picks = K.pick();
  let bagTimer;

  function render() {
    app.innerHTML = `
    <article class="b b-lug"><span class="b-ico">${WAVE}</span><p class="b-kick" data-t="heroKicker"></p><h1>lugalco</h1><p class="b-lead" data-t="heroLead"></p></article>
    <button type="button" class="b b-um" data-open-sheet="umami" aria-label="${esc(t('labTitle'))}"><span class="b-tag">${esc(t('cartOwn'))}</span><span class="b-umword">umami</span>
      <span class="b-bags" id="k9-bags">${picks.map((x, i) => `<img src="${esc(image(x))}" alt="${esc(x.name)}" class="${i === 0 ? 'on' : ''}">`).join('')}</span><span class="b-go">${esc(t('labTitle'))} →</span></button>
    <article class="b b-stats"><ul data-stats></ul></article>
    <a class="b b-ask" data-client href="${esc(LG.url('cliente.html'))}"><span>${esc(t('askQuote'))}</span><i>→</i></a>
    <label class="b b-search"><span class="lg-sr">${esc(t('search'))}</span><input type="search" id="k9-q" placeholder="${esc(t('searchPh'))}" autocomplete="off"><button type="button" data-open-sheet="all">${esc(t('catTitle'))} · ${LG.products.length} →</button></label>
    ${brands.map((b, i) => `<button type="button" class="b b-brand" data-open-sheet="${b}" style="--bc:${COL[b]};grid-column:${i * 2 + 1} / span 2"><small>${esc(t('cartPartner'))}</small><b>${b}</b><span>${esc(t('refs')(K.cnt(b)))}</span></button>`).join('')}`;
    I.apply(); window.LG_HERO && window.LG_HERO(); cycle();
  }
  function cycle() {
    clearInterval(bagTimer); const wrap = document.getElementById('k9-bags'); if (!wrap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0; bagTimer = setInterval(() => { const imgs = wrap.querySelectorAll('img'); if (!imgs.length) return; imgs[i].classList.remove('on'); i = (i + 1) % imgs.length; imgs[i].classList.add('on'); }, 2400);
  }
  function labStage() {
    const p = LG.products.find(x => x.id === st.lab); if (!p) return '';
    const d = details[p.id] || {};
    const view = st.mode === 'video' && d.animation ? `<video src="${esc(fix(d.animation))}" autoplay loop muted playsinline controls poster="${esc(fix(d.mockup) || '')}"></video>` : `<img src="${esc(image(p))}" alt="${esc(p.name)}">`;
    return `<div class="k9-lab-view">${view}</div><div class="k9-lab-bar"><div class="lg-chips"><button type="button" data-mode="pack" aria-pressed="${st.mode === 'pack'}">${esc(t('fPack'))}</button>${d.animation ? `<button type="button" data-mode="video" aria-pressed="${st.mode === 'video'}">${esc(t('labAnim'))}</button>` : ''}</div><b>${esc(p.name)}</b><button type="button" class="k9-btn" data-open="${esc(p.id)}">${esc(t('open'))}</button></div>`;
  }
  function sheetHtml() {
    const um = st.kind === 'umami', all = st.kind === 'all';
    if (um) {
      return `<div class="k9-sh-in um"><div class="k9-sh-top"><h2>umami</h2><button type="button" class="k9-x" data-close aria-label="${esc(t('fClose'))}">×</button></div><p class="k9-sh-p">${esc(t('labLead'))}</p>
        <div class="k9-lab"><ul class="k9-lab-list">${umami.map(p => `<li><button type="button" data-lab="${esc(p.id)}" aria-pressed="${p.id === st.lab}"><img src="${esc(image(p))}" alt="" width="40" height="50" loading="lazy"><span>${esc(p.name)}</span></button></li>`).join('')}</ul><div class="k9-lab-stage" id="k9-stage">${labStage()}</div></div>
        <ul class="k9-grid">${umami.map(K.card).join('')}</ul></div>`;
    }
    const list = K.filter(st);
    return `<div class="k9-sh-in"><div class="k9-sh-top"><h2>${all ? esc(t('catTitle')) : esc(st.kind)}</h2><button type="button" class="k9-x" data-close aria-label="${esc(t('fClose'))}">×</button></div>
      <div class="k9-tools"><label class="k9-search"><span class="lg-sr">${esc(t('search'))}</span><input type="search" id="k9-sq" placeholder="${esc(t('searchPh'))}" value="${esc(st.q)}" autocomplete="off"></label>
      ${all ? `<label class="k9-sel"><span class="lg-sr">${esc(t('allBrands'))}</span><select id="k9-sb"><option value="all">${esc(t('allBrands'))}</option>${['Umami', ...brands].map(b => `<option ${st.brand === b ? 'selected' : ''}>${b}</option>`).join('')}</select></label>` : ''}</div>
      <div class="lg-chips">${['all', ...families].map(f => `<button type="button" data-fam="${f}" aria-pressed="${st.fam === f}">${esc(f === 'all' ? t('all') : t('fam')[f])}</button>`).join('')}</div>
      <p class="lg-count" role="status">${esc(t('results')(list.length))}</p><ul class="k9-grid">${list.length ? list.slice(0, st.shown).map(K.card).join('') : `<li class="lg-empty">${esc(t('noResults'))}</li>`}</ul>${list.length > st.shown ? `<button type="button" class="k9-btn line" data-more>${esc(t('more'))}</button>` : ''}</div>`;
  }
  const draw = () => { sheet.innerHTML = sheetHtml(); };
  // La hoja crece desde la pieza pulsada
  function openSheet(kind, from, q) {
    st.kind = kind; st.brand = kind === 'all' ? 'all' : kind === 'umami' ? 'Umami' : kind; st.fam = 'all'; st.q = q || ''; st.shown = PAGE; draw();
    const r = from.getBoundingClientRect(); sheet.hidden = false; document.body.classList.add('sh-open');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { sheet.style.cssText = ''; sheet.classList.add('open'); return; }
    sheet.style.cssText = `top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;border-radius:28px;opacity:.4`;
    sheet.getBoundingClientRect();
    sheet.classList.add('open'); sheet.style.cssText = '';
  }
  function closeSheet() { sheet.classList.remove('open'); document.body.classList.remove('sh-open'); setTimeout(() => { if (!sheet.classList.contains('open')) sheet.hidden = true; }, 380); }
  app.addEventListener('click', e => {
    const o = e.target.closest('[data-open-sheet]'); if (!o) return;
    const q = o.closest('.b-search')?.querySelector('input')?.value || ''; openSheet(o.dataset.openSheet, o.closest('.b') || o, q);
  });
  app.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'k9-q') openSheet('all', e.target.closest('.b'), e.target.value); });
  sheet.addEventListener('input', e => { if (e.target.id === 'k9-sq') { st.q = e.target.value; st.shown = PAGE; const pos = e.target.selectionStart; draw(); const q = sheet.querySelector('#k9-sq'); q.focus(); q.setSelectionRange(pos, pos); } });
  sheet.addEventListener('change', e => { if (e.target.id === 'k9-sb') { st.brand = e.target.value; st.shown = PAGE; draw(); } });
  sheet.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { closeSheet(); return; }
    const f = e.target.closest('[data-fam]'); if (f) { st.fam = f.dataset.fam; st.shown = PAGE; draw(); return; }
    if (e.target.closest('[data-more]')) { st.shown += PAGE; draw(); return; }
    const l = e.target.closest('[data-lab]'); if (l) { st.lab = l.dataset.lab; sheet.querySelector('#k9-stage').innerHTML = labStage(); sheet.querySelectorAll('[data-lab]').forEach(x => x.setAttribute('aria-pressed', String(x === l))); return; }
    const m = e.target.closest('[data-mode]'); if (m) { st.mode = m.dataset.mode; sheet.querySelector('#k9-stage').innerHTML = labStage(); }
  });
  K.bind(sheet);
  addEventListener('keydown', e => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) closeSheet(); });
  render(); I.onChange(() => { render(); if (!sheet.hidden) draw(); });
})();
