// Ficha de producto en ventana modal + panel "Mi consulta" (productos marcados, descarga TXT).
(() => {
  const LG = window.LG, I = window.LG_I18N, t = I.t;
  const { esc, products, details } = LG;
  const fix = p => (p ? p.replace(/^\.?\//, '') : null);

  const dlg = document.createElement('dialog');
  dlg.className = 'lg-dialog lg-ficha'; dlg.setAttribute('aria-label', 'Ficha');
  const qd = document.createElement('dialog');
  qd.className = 'lg-dialog lg-query'; qd.setAttribute('aria-labelledby', 'lg-q-title');
  document.body.append(dlg, qd);
  let current = null, media = 'pack';

  function mediaTabs(p) {
    const d = details[p.id] || {};
    const tabs = [];
    if (d.mockup) tabs.push(['pack', t('fPack')]);
    if (d.backPhoto) tabs.push(['back', t('fBack')]);
    if (d.animation) tabs.push(['video', t('fVideo')]);
    if (d.photo) tabs.push(['photo', t('fPhoto')]);
    return tabs;
  }
  function mediaView(p) {
    const d = details[p.id] || {};
    if (media === 'video' && d.animation) return `<video class="lg-ficha-frame" src="${esc(fix(d.animation))}" autoplay loop muted playsinline controls poster="${esc(fix(d.mockup) || '')}"></video>`;
    const src = fix(media === 'back' ? d.backPhoto : media === 'photo' ? d.photo : d.mockup || d.photo);
    return src ? `<img class="lg-ficha-img" src="${esc(src)}" alt="${esc(p.name)}">` : `<p class="lg-empty">${esc(t('fNoMedia'))}</p>`;
  }
  function render() {
    const p = products.find(x => x.id === current); if (!p) return;
    const d = details[p.id] || {};
    const tabs = mediaTabs(p);
    if (!tabs.some(x => x[0] === media)) media = tabs[0]?.[0] || 'none';
    const inQ = LG.hasConsulta(p.id);
    const sheet = LG.consulta().find(x => x.id === p.id)?.sheet;
    const pr = LG.price(p);
    dlg.innerHTML = `<div class="lg-dialog-in">
      <div class="lg-dialog-top"><h2>${esc(p.name)}</h2><button type="button" class="cl-x" data-close aria-label="${esc(t('fClose'))}">×</button></div>
      <div class="lg-ficha-grid">
        <div class="lg-ficha-media"><div class="lg-ficha-stage">${mediaView(p)}</div>
          ${tabs.length > 1 ? `<div class="lg-chips lg-ficha-tabs">${tabs.map(([k, l]) => `<button type="button" data-media="${k}" aria-pressed="${media === k}">${esc(l)}</button>`).join('')}</div>` : ''}
          <p class="lg-ficha-cap">${esc(d.mockupCaption || d.photoCaption || t('fWhy'))}</p></div>
        <div class="lg-ficha-info">
          <dl><dt>${esc(t('fBrand'))}</dt><dd>${esc(p.brand)}${p.planned ? ` · ${esc(t('planned'))}` : ''}</dd>
          <dt>${esc(t('fFormat'))}</dt><dd>${esc(p.format)}</dd>
          <dt>${esc(t('fCategory'))}</dt><dd>${esc(t('fam')[p.category] || '')}</dd>
          ${p.supplier ? `<dt>${esc(t('fSupplier'))}</dt><dd>${esc(p.supplier)}</dd>` : ''}
          ${LG.boxKg(p) ? `<dt>kg / ${esc(t('cBoxes'))}</dt><dd>${LG.kgNum.format(LG.boxKg(p))}</dd>` : ''}
          ${pr != null && LG.session() ? `<dt>€/kg</dt><dd>${LG.money.format(pr)}</dd>` : ''}</dl>
          ${p.specificationNote ? `<p class="lg-ficha-note"><b>${esc(t('fNote'))}.</b> ${esc(p.specificationNote)}</p>` : ''}
          <div class="lg-ficha-actions">
            <button type="button" class="lg-btn" data-toggle-q aria-pressed="${inQ}">${esc(inQ ? t('fInQuery') : t('fAddQuery'))}</button>
            <button type="button" class="lg-btn lg-btn-ghost" data-sheet ${sheet ? 'aria-pressed="true"' : ''}>${esc(sheet ? t('fSheetAsked') : t('fAskSheet'))}</button>
            <a class="lg-btn lg-btn-ghost" href="${esc(LG.url('cliente.html'))}">${esc(t('fAsk'))}</a>
          </div></div></div></div>`;
  }
  function open(id) { current = id; media = 'pack'; render(); if (!dlg.open) dlg.showModal(); }
  dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.closest('[data-close]')) { dlg.close(); return; }
    const m = e.target.closest('[data-media]'); if (m) { media = m.dataset.media; render(); return; }
    if (e.target.closest('[data-toggle-q]')) { LG.toggleConsulta(current); render(); return; }
    if (e.target.closest('[data-sheet]')) { const has = LG.hasConsulta(current); LG.toggleConsulta(current, { sheet: !(LG.consulta().find(x => x.id === current)?.sheet), keep: has }); render(); }
  });
  dlg.addEventListener('close', () => { dlg.innerHTML = ''; });

  // ---- Mi consulta ----
  const fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'lg-fab'; fab.hidden = true; document.body.append(fab);
  function fabRender() { const n = LG.consulta().length; fab.hidden = !n; fab.innerHTML = `<span>${esc(t('myQuery'))}</span><b>${n}</b>`; }
  function queryRender() {
    const rows = LG.consulta().map(x => ({ x, p: products.find(p => p.id === x.id) })).filter(r => r.p);
    qd.innerHTML = `<div class="lg-dialog-in">
      <div class="lg-dialog-top"><h2 id="lg-q-title">${esc(t('qTitle'))}</h2><button type="button" class="cl-x" data-close aria-label="${esc(t('fClose'))}">×</button></div>
      ${rows.length ? `<p class="lg-count">${esc(t('qCount')(rows.length))}</p><ul class="lg-q-list">${rows.map(({ x, p }) => `<li><span><b>${esc(p.name)}</b><br><small>${esc(p.brand)} · ${esc(p.format)}${x.sheet ? ` · ${esc(t('fSheetAsked'))}` : ''}</small></span><button type="button" class="cl-link" data-rm="${esc(p.id)}">×</button></li>`).join('')}</ul>
      <p class="lg-ficha-cap">${esc(t('qNote'))}</p>
      <div class="cl-dialog-actions"><button type="button" class="lg-btn lg-btn-ghost" data-clear>${esc(t('qClear'))}</button><button type="button" class="lg-btn lg-btn-ghost" data-dl>${esc(t('qDownload'))}</button><a class="lg-btn" href="${esc(LG.url('cliente.html?consulta=1'))}">${esc(t('qGo'))}</a></div>` : `<p class="lg-empty">${esc(t('qEmpty'))}</p>`}
    </div>`;
  }
  fab.addEventListener('click', () => { queryRender(); qd.showModal(); });
  qd.addEventListener('click', e => {
    if (e.target === qd || e.target.closest('[data-close]')) { qd.close(); return; }
    const rm = e.target.closest('[data-rm]'); if (rm) { LG.toggleConsulta(rm.dataset.rm); return; }
    if (e.target.closest('[data-clear]')) { LG.clearConsulta(); qd.close(); return; }
    if (e.target.closest('[data-dl]')) LG.download('consulta-lugalco.txt', LG.consultaText());
  });
  addEventListener('lg-consulta', () => { fabRender(); if (qd.open) queryRender(); if (dlg.open) render(); document.dispatchEvent(new CustomEvent('lg-consulta-changed')); });
  I.onChange(() => { fabRender(); if (dlg.open) render(); if (qd.open) queryRender(); });
  fabRender();
  window.LG_FICHA = { open };
})();
