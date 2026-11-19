// Área cliente: acceso por código, perfiles, unidades, cotización, aceptar oferta y seguimiento de pedidos.
(() => {
  const LG = window.LG, I = window.LG_I18N, t = I.t;
  const { products, esc, norm, money, kgNum } = LG;
  const app = document.getElementById('cl-app');
  const dialog = document.getElementById('cl-dialog');
  const toastEl = document.getElementById('cl-toast');
  document.getElementById('cl-home').href = LG.home();
  const families = ['vegetales', 'mar', 'patatas', 'elaborados', 'aves', 'otros'];
  const brands = ['Umami', 'Friusa', 'Eurofrits', 'Gelagri', 'Doux', 'Caterfrits'];
  const unitLabel = u => ({ cajas: t('cBoxes'), bolsas: t('cBags'), unidades: t('cUnits'), kg: t('cKg') })[u];
  const stateLabel = s => t({ confirmed: 'oConfirmed', preparing: 'oPreparing', shipped: 'oShipped', delivered: 'oDelivered' }[s]);

  const state = { view: LG.session() ? 'new' : 'login', email: '', code: '', profile: 'cliente', fam: 'all', brand: 'all', q: '', shown: 20, basket: new Map(), lastSent: null, err: LG.wasExpired() ? 'cExpired' : '' };
  const fmtDate = s => new Date(s).toLocaleDateString(I.lang === 'en' ? 'en-GB' : I.lang === 'pt' ? 'pt-PT' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  const num = v => Number(String(v).replace(',', '.'));
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toast.h); toast.h = setTimeout(() => toastEl.classList.remove('is-on'), 6000); }

  function header() {
    const s = LG.session();
    const who = document.getElementById('cl-who');
    who.hidden = !s; document.getElementById('cl-logout').hidden = !s;
    if (s) who.textContent = `${s.company} · ${s.profile === 'distribuidor' ? t('cProfDist') : t('cProfCliente')}`;
  }

  function viewLogin() {
    const codeStep = state.view === 'code';
    return `<section class="cl-login">
      <ol class="cl-steps" aria-label="Pasos"><li aria-current="step">1</li><li>2</li><li>3</li></ol>
      <h1>${esc(t('cEnterTitle'))}</h1><p>${esc(t('cEnterText'))}</p>
      ${state.err === 'cExpired' ? `<p class="cl-error" role="alert">${esc(t('cExpired'))}</p>` : ''}
      <form id="cl-login-form" novalidate>
        <label><span>${esc(t('cEmail'))}</span><input type="email" id="cl-email" autocomplete="email" inputmode="email" required value="${esc(state.email)}" ${codeStep ? 'readonly' : ''}></label>
        <label><span>${esc(t('cProfile'))}</span><select id="cl-profile" ${codeStep ? 'disabled' : ''}><option value="cliente" ${state.profile === 'cliente' ? 'selected' : ''}>${esc(t('cProfCliente'))}</option><option value="distribuidor" ${state.profile === 'distribuidor' ? 'selected' : ''}>${esc(t('cProfDist'))}</option></select></label>
        ${codeStep ? `<label><span>${esc(t('cCode'))}</span><input id="cl-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required></label>` : ''}
        ${state.err && state.err !== 'cExpired' ? `<p class="cl-error" role="alert">${esc(state.err)}</p>` : ''}
        <button class="lg-btn lg-btn-strong" type="submit">${esc(codeStep ? t('cEnter') : t('cSendCode'))}</button>
      </form>
      <button type="button" class="cl-link" data-demo="cliente">${esc(t('cDemoUser'))}</button>
      <button type="button" class="cl-link" data-demo="distribuidor">${esc(t('cDemoDist'))}</button>
    </section>`;
  }

  function filtered() {
    const q = norm(state.q.trim());
    return products.filter(p => (state.fam === 'all' || p.category === state.fam) && (state.brand === 'all' || p.brand === state.brand)
      && norm([p.name, p.brand, p.format, t('fam')[p.category]].join(' ')).includes(q));
  }

  function row(p) {
    const inB = state.basket.get(p.id);
    const pr = LG.price(p);
    const qty = inB ? inB.qty : 1, unit = inB ? inB.unit : 'cajas';
    const sub = inB ? LG.lineAmount(p, inB.qty, inB.unit) : null;
    return `<li class="cl-row${inB ? ' is-in' : ''}" data-id="${esc(p.id)}">
      <div class="cl-row-info"><h3><button type="button" class="cl-link-inline" data-ficha="${esc(p.id)}">${esc(p.name)}</button></h3><p>${esc(p.brand)}${p.planned ? ` (${esc(t('planned'))})` : ''}<br>${esc(t('format'))} ${esc(p.format)}</p>
      <p class="cl-row-price">${pr != null ? esc(t('cPrice')(money.format(pr))) : esc(t('cNoPrice'))}${sub ? ` · <span data-sub>${esc(t('cSubtotal'))} ${money.format(sub)}</span>` : ''}</p></div>
      <div class="cl-row-ctl">
        <div class="cl-qty"><button type="button" data-step="-1" aria-label="−1">−</button><input type="text" inputmode="decimal" value="${qty}" aria-label="${esc(t('cUnit'))} ${esc(p.name)}" data-qty><button type="button" data-step="1" aria-label="+1">+</button></div>
        <select data-unit aria-label="${esc(t('cUnit'))}">${LG.UNITS.map(u => `<option value="${u}" ${unit === u ? 'selected' : ''}>${esc(unitLabel(u))}</option>`).join('')}</select>
        <button type="button" class="cl-add" data-add aria-pressed="${!!inB}">${esc(inB ? t('cAdded') : t('cAdd'))}</button>
      </div></li>`;
  }

  function basketTotals() {
    let kg = 0, eur = 0;
    state.basket.forEach((l, id) => { const p = products.find(x => x.id === id); const k = LG.kgOf(p, l.qty, l.unit); if (k) kg += k; eur += LG.lineAmount(p, l.qty, l.unit) || 0; });
    return { kg, eur };
  }
  const basketText = () => { const { kg, eur } = basketTotals(); return t('cBasket')(state.basket.size, kg ? kgNum.format(kg) : '') + (eur ? ` · ${money.format(eur)}` : ''); };

  function tabs(active) {
    const s = LG.session();
    const mine = LG.quotes().filter(q => q.email === s.email);
    const orders = mine.filter(q => q.status === 'accepted').length;
    return `<button type="button" role="tab" data-tab="new" aria-selected="${active === 'new'}">${esc(t('cTabNew'))}</button>
      <button type="button" role="tab" data-tab="mine" aria-selected="${active === 'mine'}">${esc(t('cTabMine'))}${mine.length ? ` <span>${mine.length}</span>` : ''}</button>
      <button type="button" role="tab" data-tab="orders" aria-selected="${active === 'orders'}">${esc(t('cTabOrders'))}${orders ? ` <span>${orders}</span>` : ''}</button>`;
  }

  function viewNew() {
    const s = LG.session();
    const last = LG.quotes().find(q => q.email === s.email);
    const list = filtered();
    return `<div class="cl-tabs" role="tablist">${tabs('new')}</div>
    <section class="cl-pick">
      <ol class="cl-steps" aria-label="Pasos"><li>1</li><li aria-current="step">2</li><li>3</li></ol>
      ${last ? `<button type="button" class="cl-repeat" id="cl-repeat">${esc(t('cRepeat'))} <span>${esc(last.id)}, ${esc(t('cLines')(last.lines.length))}</span></button>` : ''}
      <label class="cl-search"><span class="lg-sr">${esc(t('search'))}</span><input type="search" id="cl-q" placeholder="${esc(t('searchPh'))}" value="${esc(state.q)}" autocomplete="off"></label>
      <div class="cl-filters">
        <div class="lg-chips" role="group" aria-label="${esc(t('navProducts'))}">${['all', ...families].map(f => `<button type="button" data-fam="${f}" aria-pressed="${state.fam === f}">${esc(f === 'all' ? t('all') : t('fam')[f])}</button>`).join('')}</div>
        <select id="cl-brand" aria-label="${esc(t('allBrands'))}"><option value="all">${esc(t('allBrands'))}</option>${brands.map(b => `<option ${state.brand === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
      </div>
      <p class="lg-count" role="status">${esc(t('results')(list.length))}</p>
      <ul class="cl-list">${list.length ? list.slice(0, state.shown).map(row).join('') : `<li class="lg-empty">${esc(t('noResults'))}</li>`}</ul>
      ${list.length > state.shown ? `<button type="button" class="lg-more" id="cl-more">${esc(t('more'))}</button>` : ''}
    </section>
    <div class="cl-bar${state.basket.size ? ' is-on' : ''}" id="cl-bar"><p>${esc(basketText())}</p><button type="button" class="lg-btn" id="cl-review">${esc(t('cReview'))}</button></div>`;
  }

  function openReview() {
    if (!state.basket.size) { toast(t('cEmptyBasket')); return; }
    const bad = [...state.basket].find(([id, l]) => !LG.validQty(l.qty, l.unit));
    if (bad) { toast(t('cBadQty')); return; }
    const lines = [...state.basket].map(([id, l]) => { const p = products.find(x => x.id === id); return { p, l, kg: LG.kgOf(p, l.qty, l.unit), amt: LG.lineAmount(p, l.qty, l.unit) }; });
    const { eur } = basketTotals();
    dialog.innerHTML = `<form method="dialog" class="cl-dialog-in" id="cl-send-form">
      <div class="cl-dialog-top"><h2 id="cl-dialog-title">${esc(t('cReview'))}</h2><button type="button" class="cl-x" data-close aria-label="${esc(t('cClose'))}">×</button></div>
      <ol class="cl-steps" aria-label="Pasos"><li>1</li><li>2</li><li aria-current="step">3</li></ol>
      <ul class="cl-lines">${lines.map(({ p, l, kg, amt }) => `<li><span><b>${esc(p.name)}</b><br><small>${esc(p.brand)}, ${esc(p.format)}</small></span><span>${l.qty} ${esc(LG.unitText(l.qty, l.unit, I.lang))}${kg && l.unit !== 'kg' ? `<br><small>≈ ${kgNum.format(kg)} kg</small>` : ''}${amt ? `<br><small>${money.format(amt)}</small>` : ''}</span><button type="button" class="cl-link" data-remove="${esc(p.id)}">${esc(t('cRemove'))}</button></li>`).join('')}</ul>
      ${eur ? `<p class="pn-total"><span>${esc(t('cTotalEst'))}</span><span>${money.format(eur)}</span></p>` : ''}
      <label><span>${esc(t('cDest'))}</span><input id="cl-dest" required placeholder="${esc(t('cDestPh'))}" value="${esc(LG.session().lastDest || '')}"></label>
      <label><span>${esc(t('cNote'))}</span><textarea id="cl-note" rows="3" placeholder="${esc(t('cNotePh'))}"></textarea></label>
      <div class="cl-dialog-actions"><button type="button" class="lg-btn lg-btn-ghost" data-close>${esc(t('cBack'))}</button><button class="lg-btn lg-btn-strong" type="submit">${esc(t('cSend'))}</button></div>
    </form>`;
    if (!dialog.open) dialog.showModal();
  }

  // Aviso por correo de cada solicitud de cotización (FormSubmit → info@vbpmarketing.com).
  // El asunto empieza siempre por "[Lugalco]" para que el filtro de Gmail lo etiquete.
  const QUOTE_MAIL = 'https://formsubmit.co/ajax/info@vbpmarketing.com';
  function notifyQuote(q) {
    const detalle = q.lines.map((l, i) => `${i + 1}. ${l.name} (${l.brand || '-'}, ${l.format || '-'}): ${l.qty} ${LG.unitText(l.qty, l.unit)}`).join('\n');
    const body = {
      _subject: `[Lugalco] Solicitud de cotización ${q.id} · ${q.company || q.email}`,
      _template: 'box', _captcha: 'false', _replyto: q.email,
      Referencia: q.id, Empresa: q.company || '-', Email: q.email,
      Perfil: q.profile === 'distribuidor' ? 'Distribuidor' : 'Cliente',
      Destino: q.destination, Productos: detalle, Observaciones: q.note || '-',
      Fecha: new Date(q.createdAt).toLocaleString('es-ES')
    };
    fetch(QUOTE_MAIL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .catch(() => { /* la demo sigue funcionando aunque falle el correo */ });
  }

  function send() {
    const s = LG.renewSession(); if (!s) { dialog.close(); render(); return; }
    const dest = dialog.querySelector('#cl-dest');
    if (!dest.value.trim()) { dest.focus(); dest.setAttribute('aria-invalid', 'true'); return; }
    const lines = [...state.basket].map(([id, l]) => { const p = products.find(x => x.id === id); return { id, name: p.name, brand: p.brand, format: p.format, qty: l.qty, unit: l.unit }; });
    const q = { id: LG.nextId(), email: s.email, company: s.company, profile: s.profile, createdAt: new Date().toISOString(), destination: dest.value.trim(), note: dialog.querySelector('#cl-note').value.trim(), lines, status: 'pending' };
    LG.addQuote(q); LG.setSession({ ...s, lastDest: q.destination }); LG.clearConsulta();
    notifyQuote(q);
    state.basket.clear(); state.lastSent = q; state.view = 'sent';
    dialog.close(); render();
  }

  function viewSent() {
    const q = state.lastSent;
    return `<section class="cl-done"><h1>${esc(t('cSent'))}</h1><p class="cl-done-id">${esc(q.id)}</p><p>${esc(t('cSentText'))}</p>
      <div class="cl-dialog-actions"><button type="button" class="lg-btn lg-btn-ghost" data-tab="new">${esc(t('cTabNew'))}</button><button type="button" class="lg-btn" data-tab="mine">${esc(t('cTabMine'))}</button></div></section>`;
  }

  const badge = q => { const st = LG.quoteStatus(q); return `<span class="cl-badge ${st}">${esc(st === 'order' ? t('cOrder') + ' · ' + stateLabel(q.order.state) : st === 'answered' ? t('cAnswered') : t('cPending'))}</span>`; };
  function viewMine() {
    const s = LG.session();
    const mine = LG.quotes().filter(q => q.email === s.email);
    return `<div class="cl-tabs" role="tablist">${tabs('mine')}</div>
    <section class="cl-mine">${mine.length ? `<ul>${mine.map(q => `<li>
      <div><h3>${esc(q.id)}</h3><p>${esc(fmtDate(q.createdAt))}. ${esc(t('cLines')(q.lines.length))}, ${esc(q.destination)}</p></div>${badge(q)}
      ${q.offer ? `<button type="button" class="lg-btn" data-offer="${esc(q.id)}">${esc(t('cView'))}</button>` : '<span></span>'}</li>`).join('')}</ul>` : `<p class="lg-empty">${esc(t('cNone'))}</p>`}</section>`;
  }

  function viewOrders() {
    const s = LG.session();
    const orders = LG.quotes().filter(q => q.email === s.email && q.status === 'accepted');
    return `<div class="cl-tabs" role="tablist">${tabs('orders')}</div>
    <section class="cl-orders">${orders.length ? orders.map(q => {
      const idx = LG.ORDER_STATES.indexOf(q.order.state);
      return `<article class="cl-order"><div class="cl-order-top"><div><h3>${esc(q.id)}</h3><p>${esc(t('cLines')(q.lines.length))} · ${esc(q.destination)} · ${money.format(LG.offerTotal(q))}</p></div><button type="button" class="lg-btn lg-btn-ghost" data-offer="${esc(q.id)}">${esc(t('cView'))}</button></div>
        <ol class="cl-track">${LG.ORDER_STATES.map((st, i) => `<li class="${i < idx ? 'is-done' : ''}" ${i === idx ? 'aria-current="step"' : ''}><span>${esc(stateLabel(st))}</span></li>`).join('')}</ol></article>`;
    }).join('') : `<p class="lg-empty">${esc(t('cOrderNone'))}</p>`}</section>`;
  }

  function openOffer(id) {
    const q = LG.quotes().find(x => x.id === id);
    if (!q?.offer) return;
    const rows = q.lines.map(l => { const p = products.find(x => x.id === l.id); const kg = p ? LG.kgOf(p, l.qty, l.unit) : null; const pr = q.offer.prices[l.id]; return { l, kg, pr, amt: p && pr ? LG.lineAmount(p, l.qty, l.unit, pr) : null }; });
    dialog.innerHTML = `<div class="cl-dialog-in cl-offer">
      <div class="cl-dialog-top"><h2 id="cl-dialog-title">${esc(t('cOffer'))} ${esc(q.id)}</h2><button type="button" class="cl-x" data-close aria-label="${esc(t('cClose'))}">×</button></div>
      <p class="cl-offer-meta">${esc(q.company)}. ${esc(fmtDate(q.offer.answeredAt))}. ${esc(q.destination)}</p>
      <table><thead><tr><th scope="col">${esc(t('cProductsInReq'))}</th><th scope="col">${esc(t('cUnit'))}</th><th scope="col">€/kg</th><th scope="col">€</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td>${esc(r.l.name)}<br><small>${esc(r.l.brand)}, ${esc(r.l.format)}</small></td><td>${r.l.qty} ${esc(LG.unitText(r.l.qty, r.l.unit, I.lang))}${r.kg && r.l.unit !== 'kg' ? `<br><small>${kgNum.format(r.kg)} kg</small>` : ''}</td><td>${r.pr ? money.format(r.pr) : esc(t('cNoPrice'))}</td><td>${r.amt ? money.format(r.amt) : '—'}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th scope="row" colspan="3">${esc(t('cTotal'))}</th><td>${money.format(LG.offerTotal(q))}</td></tr></tfoot></table>
      <h3>${esc(t('cTerms'))}</h3><p>${esc(q.offer.terms)}</p>
      ${q.status === 'accepted' ? `<p class="pn-note">${esc(t('cOrder'))}: ${esc(stateLabel(q.order.state))}</p>` : ''}
      <div class="cl-dialog-actions"><button type="button" class="lg-btn lg-btn-ghost" data-close>${esc(t('cClose'))}</button><button type="button" class="lg-btn lg-btn-ghost" id="cl-print">${esc(t('cPrint'))}</button>${q.status === 'answered' ? `<button type="button" class="lg-btn" data-accept="${esc(q.id)}">${esc(t('cAccept'))}</button>` : ''}</div>
    </div>`;
    if (!dialog.open) dialog.showModal();
  }

  function render() {
    if (LG.session() === null && !['login', 'code'].includes(state.view)) { state.view = 'login'; if (LG.wasExpired()) state.err = 'cExpired'; }
    header();
    app.innerHTML = state.view === 'login' || state.view === 'code' ? viewLogin() : state.view === 'mine' ? viewMine() : state.view === 'orders' ? viewOrders() : state.view === 'sent' ? viewSent() : viewNew();
    I.apply();
  }
  function refreshList() {
    const tmp = document.createElement('div'); tmp.innerHTML = viewNew();
    app.querySelector('.cl-list').replaceWith(tmp.querySelector('.cl-list'));
    app.querySelector('.lg-count').replaceWith(tmp.querySelector('.lg-count'));
    const more = app.querySelector('#cl-more'), nmore = tmp.querySelector('#cl-more');
    if (more && !nmore) more.remove(); else if (!more && nmore) app.querySelector('.cl-list').after(nmore);
    refreshBar();
  }
  function refreshBar() {
    const bar = app.querySelector('#cl-bar'); if (!bar) return;
    bar.classList.toggle('is-on', state.basket.size > 0);
    bar.querySelector('p').textContent = basketText();
  }
  function login(profileData) {
    LG.setSession(profileData);
    // Si llegan productos desde "Mi consulta", se cargan en la solicitud
    const fromQuery = new URLSearchParams(location.search).get('consulta') && LG.consulta().length;
    if (fromQuery) { LG.consulta().forEach(x => { if (products.some(p => p.id === x.id)) state.basket.set(x.id, { qty: 1, unit: 'cajas' }); }); }
    state.view = 'new'; state.err = ''; render();
    if (fromQuery) toast(t('cFromQuery'));
  }
  // Si ya hay sesión al llegar desde Mi consulta, también se cargan
  if (LG.session() && new URLSearchParams(location.search).get('consulta')) LG.consulta().forEach(x => { if (products.some(p => p.id === x.id)) state.basket.set(x.id, { qty: 1, unit: 'cajas' }); });

  app.addEventListener('submit', e => {
    if (e.target.id !== 'cl-login-form') return;
    e.preventDefault();
    if (state.view === 'login') {
      const email = app.querySelector('#cl-email').value.trim().toLowerCase();
      state.profile = app.querySelector('#cl-profile').value;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { state.err = t('cBadEmail'); state.email = email; render(); return; }
      // Acceso directo para presentar la demo: correo@correo.com entra sin código
      if (email === 'correo@correo.com') { login({ email, name: 'Cliente', company: 'Empresa de demostración', profile: state.profile }); return; }
      state.email = email; state.code = String(Math.floor(100000 + Math.random() * 900000)); state.view = 'code'; state.err = '';
      render(); toast(t('cCodeSent')(state.code)); app.querySelector('#cl-code').focus();
    } else {
      if (app.querySelector('#cl-code').value.trim() !== state.code) { state.err = t('cBadCode'); render(); app.querySelector('#cl-code').focus(); return; }
      const email = state.email;
      const known = Object.values(LG.DEMOS).find(d => d.email === email);
      login(known || { email, name: email.split('@')[0], company: (email.split('@')[1] || '').split('.')[0].replace(/^\w/, c => c.toUpperCase()), profile: state.profile });
    }
  });

  function lineFor(el) { const id = el.closest('[data-id]').dataset.id; return [id, state.basket.get(id)]; }
  function refreshSub(rowEl, l, p) {
    const sub = LG.lineAmount(p, l.qty, l.unit);
    const holder = rowEl.querySelector('.cl-row-price');
    let span = holder.querySelector('[data-sub]');
    if (sub) { if (!span) { holder.insertAdjacentHTML('beforeend', ' · <span data-sub></span>'); span = holder.querySelector('[data-sub]'); } span.textContent = `${t('cSubtotal')} ${money.format(sub)}`; }
    else if (span) { span.previousSibling?.remove?.(); span.remove(); }
  }
  app.addEventListener('input', e => {
    LG.renewSession();
    if (e.target.id === 'cl-q') { state.q = e.target.value; state.shown = 20; refreshList(); }
    if (e.target.matches('[data-qty]')) {
      const [id, l] = lineFor(e.target); const p = products.find(x => x.id === id);
      const ok = LG.validQty(num(e.target.value), (e.target.closest('.cl-row-ctl').querySelector('[data-unit]')).value);
      e.target.setAttribute('aria-invalid', String(!ok));
      if (l && ok) { l.qty = num(e.target.value); refreshSub(e.target.closest('[data-id]'), l, p); refreshBar(); }
    }
  });
  app.addEventListener('change', e => {
    if (e.target.id === 'cl-brand') { state.brand = e.target.value; state.shown = 20; refreshList(); }
    if (e.target.matches('[data-unit]')) {
      const rowEl = e.target.closest('[data-id]'); const [id, l] = lineFor(e.target); const p = products.find(x => x.id === id);
      const inp = rowEl.querySelector('[data-qty]');
      // al pasar a una unidad entera se redondea la cantidad
      if (e.target.value !== 'kg' && !Number.isInteger(num(inp.value))) inp.value = Math.max(1, Math.round(num(inp.value) || 1));
      inp.setAttribute('aria-invalid', String(!LG.validQty(num(inp.value), e.target.value)));
      if (l) { l.unit = e.target.value; l.qty = num(inp.value) || 1; refreshSub(rowEl, l, p); refreshBar(); }
    }
  });
  app.addEventListener('click', e => {
    const el = e.target.closest('button'); if (!el) return;
    if (el.dataset.demo) { login(LG.DEMOS[el.dataset.demo]); return; }
    if (LG.session()) LG.renewSession();
    if (el.dataset.ficha) { window.LG_FICHA.open(el.dataset.ficha); return; }
    if (el.dataset.tab) { state.view = el.dataset.tab; render(); scrollTo(0, 0); return; }
    if (el.dataset.fam) { state.fam = el.dataset.fam; state.shown = 20; app.querySelectorAll('[data-fam]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); refreshList(); return; }
    if (el.id === 'cl-more') { state.shown += 20; refreshList(); return; }
    if (el.id === 'cl-review') { openReview(); return; }
    if (el.dataset.offer) { openOffer(el.dataset.offer); return; }
    if (el.id === 'cl-repeat') {
      const last = LG.quotes().find(q => q.email === LG.session().email);
      last.lines.forEach(l => state.basket.set(l.id, { qty: l.qty, unit: l.unit }));
      refreshList(); openReview(); return;
    }
    const rowEl = el.closest('[data-id]'); if (!rowEl) return;
    const id = rowEl.dataset.id, input = rowEl.querySelector('[data-qty]'), unitSel = rowEl.querySelector('[data-unit]');
    if (el.dataset.step) {
      const next = (num(input.value) || 0) + Number(el.dataset.step);
      input.value = unitSel.value === 'kg' ? Math.max(0.5, Math.round(next * 10) / 10) : Math.max(1, Math.round(next));
      input.dispatchEvent(new Event('input', { bubbles: true })); return;
    }
    if ('add' in el.dataset) {
      if (state.basket.has(id)) state.basket.delete(id);
      else {
        const q = num(input.value);
        if (!LG.validQty(q, unitSel.value)) { input.setAttribute('aria-invalid', 'true'); input.focus(); toast(t('cBadQty')); return; }
        state.basket.set(id, { qty: q, unit: unitSel.value });
      }
      const on = state.basket.has(id);
      el.setAttribute('aria-pressed', String(on)); el.textContent = on ? t('cAdded') : t('cAdd'); rowEl.classList.toggle('is-in', on);
      refreshSub(rowEl, { qty: num(input.value), unit: unitSel.value }, products.find(x => x.id === id));
      refreshBar();
    }
  });

  dialog.addEventListener('click', e => {
    if (e.target === dialog || e.target.closest('[data-close]')) { dialog.close(); return; }
    const rm = e.target.closest('[data-remove]');
    if (rm) { state.basket.delete(rm.dataset.remove); if (state.basket.size) openReview(); else dialog.close(); refreshList(); }
    const ac = e.target.closest('[data-accept]');
    if (ac) { LG.renewSession(); LG.acceptQuote(ac.dataset.accept); dialog.close(); state.view = 'orders'; render(); toast(t('cAccepted')); scrollTo(0, 0); }
    if (e.target.id === 'cl-print') window.print();
  });
  dialog.addEventListener('submit', e => { if (e.target.id === 'cl-send-form') { e.preventDefault(); send(); } });
  document.getElementById('cl-logout').addEventListener('click', () => { LG.setSession(null); state.view = 'login'; state.basket.clear(); state.err = ''; render(); });
  // La sesión caduca a la hora sin actividad: se comprueba cada 30 s y al volver a la pestaña
  const guard = () => { if (!['login', 'code'].includes(state.view) && !LG.session()) { dialog.open && dialog.close(); render(); } };
  setInterval(guard, 30000); document.addEventListener('visibilitychange', guard);
  addEventListener('storage', () => { if (['mine', 'orders'].includes(state.view)) render(); });
  I.onChange(render);
  render();
})();
