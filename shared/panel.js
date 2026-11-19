// Panel de Javier: solicitudes nuevas, ofertas por línea y seguimiento de pedidos aceptados.
(() => {
  const LG = window.LG; const { products, esc, money, kgNum } = LG;
  const app = document.getElementById('pn-app');
  const toastEl = document.getElementById('cl-toast');
  document.getElementById('pn-home').href = LG.home();
  document.getElementById('pn-client').href = LG.url('cliente.html');
  
  const STATE_ES = { confirmed: 'Confirmado', preparing: 'En preparación', shipped: 'Enviado', delivered: 'Entregado' };
  const state = { filter: 'pending', sel: null, tab: 'quotes', q: '', fam: '', shown: 40 };
  const fmt = s => new Date(s).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const toast = m => { toastEl.textContent = m; toastEl.classList.add('is-on'); clearTimeout(toast.h); toast.h = setTimeout(() => toastEl.classList.remove('is-on'), 4000); };
  const profileTag = q => (q.profile === 'distribuidor' ? 'Distribuidor' : 'Cliente');
  const inTab = (q, f) => (f === 'orders' ? q.status === 'accepted' : q.status === f);

  const nav = () => `<nav class="pn-nav" aria-label="Secciones del panel">${[['quotes', 'Cotizaciones y pedidos'], ['tarifas', 'Tarifas'], ['condiciones', 'Condiciones comerciales']].map(([k, l]) => `<button type="button" data-ptab="${k}" aria-current="${state.tab === k}">${l}</button>`).join('')}</nav>`;
  function render() {
    if (state.tab === 'tarifas') { app.innerHTML = nav() + viewTarifas(); return; }
    if (state.tab === 'condiciones') { app.innerHTML = nav() + viewCondiciones(); return; }
    renderQuotes();
  }

  // ---- Tarifas: precio €/kg por referencia, editable. Se aplica en las ofertas y en el área cliente ----
  const FAMS = [...new Set(products.map(p => p.category).filter(Boolean))];
  function tarifaRows() {
    const q = LG.norm(state.q.trim());
    return products.filter(p => (!state.fam || p.category === state.fam) && (!q || LG.norm(`${p.name} ${p.brand} ${p.format}`).includes(q)));
  }
  function viewTarifas() {
    const rows = tarifaRows(); const custom = products.filter(LG.isCustomPrice).length;
    return `<div class="pn-head"><div><h1>Tarifas</h1><p>Precio por kg de cada referencia. Se usa al preparar cada oferta y en los precios orientativos del área cliente. Déjalo vacío para «a consultar».${custom ? ` <b>${custom} ${custom === 1 ? 'precio modificado' : 'precios modificados'}.</b>` : ''}</p></div>
      ${custom ? '<button type="button" class="lg-btn lg-btn-ghost" data-reset-all>Restaurar tarifa base</button>' : ''}</div>
    <div class="pn-tools"><input type="search" id="pn-q" placeholder="Buscar producto, marca o formato" value="${esc(state.q)}" aria-label="Buscar en la tarifa">
      <select id="pn-fam" aria-label="Familia"><option value="">Todas las familias</option>${FAMS.map(f => `<option value="${esc(f)}" ${state.fam === f ? 'selected' : ''}>${esc(f[0].toUpperCase() + f.slice(1))}</option>`).join('')}</select></div>
    <div class="pn-detail pn-tarifa"><table><thead><tr><th scope="col">Producto</th><th scope="col">Marca</th><th scope="col">Formato</th><th scope="col">Tarifa base</th><th scope="col">€/kg</th></tr></thead><tbody>
      ${rows.slice(0, state.shown).map(p => { const v = LG.price(p); const mod = LG.isCustomPrice(p); return `<tr data-pid="${esc(p.id)}" class="${mod ? 'is-mod' : ''}"><td><b>${esc(p.name)}</b></td><td>${esc(p.brand || '-')}</td><td>${esc(p.format || '-')}</td><td>${LG.basePrice(p) != null ? money.format(LG.basePrice(p)) : '—'}</td>
        <td><input type="number" step="0.01" min="0" value="${v ?? ''}" placeholder="A consultar" aria-label="Precio por kg de ${esc(p.name)}" data-price>${mod ? ' <button type="button" class="cl-link" data-reset>Deshacer</button>' : ''}</td></tr>`; }).join('')}
    </tbody></table>${rows.length > state.shown ? `<p style="text-align:center"><button type="button" class="lg-btn lg-btn-ghost" data-more>Ver más (${rows.length - state.shown})</button></p>` : ''}
    ${rows.length ? '' : '<p class="lg-empty">No hay productos con ese filtro.</p>'}</div>`;
  }

  // ---- Condiciones comerciales: se cargan en cada oferta nueva ----
  function viewCondiciones() {
    const c = LG.conditions();
    const f = (id, label, val, type = 'text', extra = '') => `<label><span>${label}</span><input type="${type}" id="${id}" value="${esc(val)}" ${extra}></label>`;
    return `<div class="pn-head"><div><h1>Condiciones comerciales</h1><p>Se aplican automáticamente a cada oferta nueva. En cada oferta se pueden retocar antes de enviarla.</p></div></div>
    <form class="pn-detail pn-cond" id="pn-cond">
      <div class="pn-cond-grid">
        ${f('c-iva', 'Impuestos', c.iva)}
        ${f('c-transporte', 'Transporte / portes', c.transporte)}
        ${f('c-validez', 'Validez de la oferta (días)', c.validez, 'number', 'min="1" step="1"')}
        ${f('c-pago', 'Forma de pago', c.pago)}
        ${f('c-minimo', 'Pedido mínimo', c.minimo, 'text', 'placeholder="Ej.: 300 € o 10 cajas"')}
        ${f('c-desc', 'Descuento a distribuidores (%)', c.descDist, 'number', 'min="0" max="90" step="0.5"')}
      </div>
      <label><span>Otras condiciones</span><textarea id="c-notas" rows="3">${esc(c.notas)}</textarea></label>
      <p class="pn-note"><b>Así lo verá el cliente:</b> <span id="c-preview">${esc(LG.termsText(c))}</span>${Number(c.descDist) ? ` <br><small>Los distribuidores reciben un ${esc(c.descDist)} % de descuento sobre la tarifa al preparar su oferta.</small>` : ''}</p>
      <div class="cl-dialog-actions"><button type="button" class="lg-btn lg-btn-ghost" data-cond-reset>Restaurar</button><button class="lg-btn lg-btn-strong" type="submit">Guardar condiciones</button></div>
    </form>`;
  }
  const readCond = f => ({ iva: f.querySelector('#c-iva').value.trim(), transporte: f.querySelector('#c-transporte').value.trim(), validez: Number(f.querySelector('#c-validez').value) || '', pago: f.querySelector('#c-pago').value.trim(), minimo: f.querySelector('#c-minimo').value.trim(), descDist: Math.min(90, Math.max(0, Number(f.querySelector('#c-desc').value) || 0)), notas: f.querySelector('#c-notas').value.trim() });

  function renderQuotes() {
    const all = LG.quotes();
    const list = all.filter(q => inTab(q, state.filter));
    if (!list.find(q => q.id === state.sel)) state.sel = list[0]?.id || null;
    const q = all.find(x => x.id === state.sel);
    const pend = all.filter(x => x.status === 'pending').length;
    const ord = all.filter(x => x.status === 'accepted' && x.order.state !== 'delivered').length;
    app.innerHTML = nav() + `<div class="pn-head"><div><h1>Cotizaciones y pedidos</h1><p>${pend ? `${pend} ${pend === 1 ? 'solicitud espera' : 'solicitudes esperan'} respuesta.` : 'No hay solicitudes pendientes.'}${ord ? ` ${ord} ${ord === 1 ? 'pedido en curso' : 'pedidos en curso'}.` : ''}</p></div></div>
    <div class="cl-tabs" role="tablist">
      <button type="button" role="tab" data-f="pending" aria-selected="${state.filter === 'pending'}">Nuevas${pend ? ` <span>${pend}</span>` : ''}</button>
      <button type="button" role="tab" data-f="answered" aria-selected="${state.filter === 'answered'}">Respondidas</button>
      <button type="button" role="tab" data-f="orders" aria-selected="${state.filter === 'orders'}">Pedidos${ord ? ` <span>${ord}</span>` : ''}</button></div>
    <div class="pn-grid">
      <ul class="pn-list">${list.length ? list.map(x => `<li><button type="button" data-sel="${esc(x.id)}" aria-current="${x.id === state.sel}"><b>${esc(x.company)}</b><span>${esc(x.id)} · ${profileTag(x)} · ${fmt(x.createdAt)} · ${x.lines.length} ${x.lines.length === 1 ? 'línea' : 'líneas'}${x.order ? ` · ${STATE_ES[x.order.state]}` : ''}</span></button></li>`).join('') : `<li class="lg-empty">${state.filter === 'pending' ? 'Cuando un cliente envíe una solicitud aparecerá aquí. Pruébalo desde el área cliente.' : state.filter === 'orders' ? 'Cuando un cliente acepte una oferta aparecerá aquí.' : 'Todavía no has respondido ninguna solicitud.'}</li>`}</ul>
      ${q ? detail(q) : '<div></div>'}
    </div>`;
  }

  function detail(q) {
    const done = q.status !== 'pending';
    const rows = q.lines.map(l => { const p = products.find(x => x.id === l.id); const kg = p ? LG.kgOf(p, l.qty, l.unit) : null; const base = LG.price(p); const disc = q.profile === 'distribuidor' ? Number(LG.conditions().descDist) || 0 : 0; const pr = done ? q.offer.prices[l.id] : (base != null ? Math.round(base * (100 - disc)) / 100 : ''); return { l, kg, pr }; });
    const tl = q.order ? `<div class="pn-order"><h3>Seguimiento del pedido</h3>
      <ol class="cl-track">${LG.ORDER_STATES.map((st, i) => `<li class="${i < LG.ORDER_STATES.indexOf(q.order.state) ? 'is-done' : ''}" ${st === q.order.state ? 'aria-current="step"' : ''}><span>${STATE_ES[st]}</span></li>`).join('')}</ol>
      <ul class="pn-hist">${q.order.history.map(h => `<li>${STATE_ES[h.state]} · ${fmt(h.at)}</li>`).join('')}</ul>
      ${q.order.state !== 'delivered' ? `<button type="button" class="lg-btn" data-advance="${esc(q.id)}">Pasar a «${STATE_ES[LG.ORDER_STATES[LG.ORDER_STATES.indexOf(q.order.state) + 1]]}»</button>` : ''}</div>` : '';
    return `<form class="pn-detail" id="pn-form" data-id="${esc(q.id)}">
      <h2>${esc(q.company)} <small class="pn-tag">${profileTag(q)}</small></h2><p>${esc(q.id)}. ${esc(q.email)}. Entrega en ${esc(q.destination)}.</p>
      ${!done && q.profile === 'distribuidor' && Number(LG.conditions().descDist) ? `<p class="pn-note">Precios con el ${esc(LG.conditions().descDist)} % de descuento de distribuidor ya aplicado.</p>` : ''}
      ${q.note ? `<p class="pn-note">${esc(q.note)}</p>` : ''}
      <table><thead><tr><th scope="col">Producto</th><th scope="col">Cantidad</th><th scope="col">€/kg</th><th scope="col">Importe</th></tr></thead><tbody>
      ${rows.map(r => `<tr data-line="${esc(r.l.id)}" data-kg="${r.kg ?? ''}"><td>${esc(r.l.name)}<br><small>${esc(r.l.brand)}, ${esc(r.l.format)}</small></td><td>${r.l.qty} ${esc(LG.unitText(r.l.qty, r.l.unit))}${r.kg && r.l.unit !== 'kg' ? `<br><small>${kgNum.format(r.kg)} kg</small>` : ''}</td>
        <td><input type="number" step="0.01" min="0" value="${r.pr}" aria-label="Precio por kg de ${esc(r.l.name)}" placeholder="A consultar" ${done ? 'readonly' : ''}></td><td data-amt></td></tr>`).join('')}
      </tbody></table>
      <p class="pn-total"><span>Total sin IVA ni transporte</span><span id="pn-total"></span></p>
      <label><span>Condiciones</span><textarea id="pn-terms" rows="3" ${done ? 'readonly' : ''}>${esc(done ? q.offer.terms : LG.termsText())}</textarea></label>
      ${done ? `<p class="pn-note">Oferta enviada el ${fmt(q.offer.answeredAt)}.</p>` : '<div class="cl-dialog-actions"><button class="lg-btn lg-btn-strong" type="submit">Enviar oferta</button></div>'}
      ${tl}
    </form>`;
  }

  function totals() {
    const f = app.querySelector('#pn-form'); if (!f) return;
    const q = LG.quotes().find(x => x.id === f.dataset.id);
    let sum = 0;
    f.querySelectorAll('[data-line]').forEach(tr => {
      const l = q.lines.find(x => x.id === tr.dataset.line); const p = products.find(x => x.id === l.id);
      const pr = Number(tr.querySelector('input').value); const amt = pr ? LG.lineAmount(p, l.qty, l.unit, pr) || 0 : 0;
      sum += amt; tr.querySelector('[data-amt]').textContent = amt ? money.format(amt) : '—';
    });
    f.querySelector('#pn-total').textContent = money.format(sum);
  }

  app.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ptab) { state.tab = b.dataset.ptab; render(); totals(); scrollTo(0, 0); return; }
    if ('more' in b.dataset) { state.shown += 40; render(); return; }
    if ('resetAll' in b.dataset) { LG.resetPrices(); render(); toast('Tarifa base restaurada.'); return; }
    if ('reset' in b.dataset) { const p = products.find(x => x.id === b.closest('[data-pid]').dataset.pid); LG.resetPrice(p); render(); toast(`${p.name}: vuelve a la tarifa base.`); return; }
    if ('condReset' in b.dataset) { LG.setConditions(LG.COND_DEFAULT); render(); toast('Condiciones restauradas.'); return; }
    if (b.dataset.f) { state.filter = b.dataset.f; state.sel = null; render(); totals(); }
    if (b.dataset.sel) { state.sel = b.dataset.sel; render(); totals(); }
    if (b.dataset.advance) {
      const q = LG.quotes().find(x => x.id === b.dataset.advance);
      const next = LG.ORDER_STATES[LG.ORDER_STATES.indexOf(q.order.state) + 1];
      LG.setOrderState(q.id, next); toast(`Pedido ${q.id}: ${STATE_ES[next]}. El cliente ya lo ve en Mis pedidos.`); render(); totals();
    }
  });
  app.addEventListener('input', e => {
    if (e.target.id === 'pn-q') { state.q = e.target.value; state.shown = 40; const pos = e.target.selectionStart; render(); const i = app.querySelector('#pn-q'); i.focus(); i.setSelectionRange(pos, pos); return; }
    if (e.target.closest('#pn-cond')) { app.querySelector('#c-preview').textContent = LG.termsText(readCond(e.target.closest('#pn-cond'))); return; }
    totals();
  });
  app.addEventListener('change', e => {
    if (e.target.id === 'pn-fam') { state.fam = e.target.value; state.shown = 40; render(); return; }
    if (e.target.matches('[data-price]')) {
      const p = products.find(x => x.id === e.target.closest('[data-pid]').dataset.pid);
      const v = e.target.value === '' ? null : Math.round(Number(e.target.value) * 100) / 100;
      if (v != null && !(v >= 0)) { e.target.setAttribute('aria-invalid', 'true'); return; }
      LG.setPrice(p, v); render(); toast(`${p.name}: ${v == null ? 'a consultar' : money.format(v) + '/kg'}. Guardado.`);
    }
  });
  app.addEventListener('submit', e => {
    e.preventDefault();
    if (e.target.id === 'pn-cond') { LG.setConditions(readCond(e.target)); render(); toast('Condiciones guardadas. Se aplicarán a las próximas ofertas.'); return; }
    const f = e.target; const id = f.dataset.id;
    const prices = {}; f.querySelectorAll('[data-line]').forEach(tr => { const val = tr.querySelector('input').value; prices[tr.dataset.line] = val === '' ? null : Number(val); });
    LG.updateQuote(id, q => { q.status = 'answered'; q.offer = { answeredAt: new Date().toISOString(), terms: f.querySelector('#pn-terms').value.trim(), prices }; });
    { const q = LG.quotes().find(x => x.id === id); if (q) LG.mail(`[Lugalco] Oferta enviada ${q.id} · ${q.company || q.email}`, LG.offerSummary(q), q.email); }
    toast(`Oferta ${id} enviada. El cliente ya la ve en Mis cotizaciones.`);
    state.filter = 'answered'; render(); totals();
  });
  addEventListener('storage', () => { render(); totals(); });
  render(); totals();
})();
