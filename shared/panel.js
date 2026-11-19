// Panel de Javier: solicitudes nuevas, ofertas por línea y seguimiento de pedidos aceptados.
(() => {
  const LG = window.LG; const { products, esc, money, kgNum } = LG;
  const app = document.getElementById('pn-app');
  const toastEl = document.getElementById('cl-toast');
  document.getElementById('pn-home').href = LG.home();
  document.getElementById('pn-client').href = LG.url('cliente.html');
  const TERMS = 'Precios por kg, sin IVA ni transporte. Validez 7 días. Pago a 30 días. Disponibilidad confirmada al aceptar.';
  const STATE_ES = { confirmed: 'Confirmado', preparing: 'En preparación', shipped: 'Enviado', delivered: 'Entregado' };
  const state = { filter: 'pending', sel: null };
  const fmt = s => new Date(s).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const toast = m => { toastEl.textContent = m; toastEl.classList.add('is-on'); clearTimeout(toast.h); toast.h = setTimeout(() => toastEl.classList.remove('is-on'), 4000); };
  const profileTag = q => (q.profile === 'distribuidor' ? 'Distribuidor' : 'Cliente');
  const inTab = (q, f) => (f === 'orders' ? q.status === 'accepted' : q.status === f);

  function render() {
    const all = LG.quotes();
    const list = all.filter(q => inTab(q, state.filter));
    if (!list.find(q => q.id === state.sel)) state.sel = list[0]?.id || null;
    const q = all.find(x => x.id === state.sel);
    const pend = all.filter(x => x.status === 'pending').length;
    const ord = all.filter(x => x.status === 'accepted' && x.order.state !== 'delivered').length;
    app.innerHTML = `<div class="pn-head"><div><h1>Cotizaciones y pedidos</h1><p>${pend ? `${pend} ${pend === 1 ? 'solicitud espera' : 'solicitudes esperan'} respuesta.` : 'No hay solicitudes pendientes.'}${ord ? ` ${ord} ${ord === 1 ? 'pedido en curso' : 'pedidos en curso'}.` : ''}</p></div></div>
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
    const rows = q.lines.map(l => { const p = products.find(x => x.id === l.id); const kg = p ? LG.kgOf(p, l.qty, l.unit) : null; const pr = done ? q.offer.prices[l.id] : (LG.price(p) ?? ''); return { l, kg, pr }; });
    const tl = q.order ? `<div class="pn-order"><h3>Seguimiento del pedido</h3>
      <ol class="cl-track">${LG.ORDER_STATES.map((st, i) => `<li class="${i < LG.ORDER_STATES.indexOf(q.order.state) ? 'is-done' : ''}" ${st === q.order.state ? 'aria-current="step"' : ''}><span>${STATE_ES[st]}</span></li>`).join('')}</ol>
      <ul class="pn-hist">${q.order.history.map(h => `<li>${STATE_ES[h.state]} · ${fmt(h.at)}</li>`).join('')}</ul>
      ${q.order.state !== 'delivered' ? `<button type="button" class="lg-btn" data-advance="${esc(q.id)}">Pasar a «${STATE_ES[LG.ORDER_STATES[LG.ORDER_STATES.indexOf(q.order.state) + 1]]}»</button>` : ''}</div>` : '';
    return `<form class="pn-detail" id="pn-form" data-id="${esc(q.id)}">
      <h2>${esc(q.company)} <small class="pn-tag">${profileTag(q)}</small></h2><p>${esc(q.id)}. ${esc(q.email)}. Entrega en ${esc(q.destination)}.</p>
      ${q.note ? `<p class="pn-note">${esc(q.note)}</p>` : ''}
      <table><thead><tr><th scope="col">Producto</th><th scope="col">Cantidad</th><th scope="col">€/kg</th><th scope="col">Importe</th></tr></thead><tbody>
      ${rows.map(r => `<tr data-line="${esc(r.l.id)}" data-kg="${r.kg ?? ''}"><td>${esc(r.l.name)}<br><small>${esc(r.l.brand)}, ${esc(r.l.format)}</small></td><td>${r.l.qty} ${esc(LG.unitText(r.l.qty, r.l.unit))}${r.kg && r.l.unit !== 'kg' ? `<br><small>${kgNum.format(r.kg)} kg</small>` : ''}</td>
        <td><input type="number" step="0.01" min="0" value="${r.pr}" aria-label="Precio por kg de ${esc(r.l.name)}" placeholder="A consultar" ${done ? 'readonly' : ''}></td><td data-amt></td></tr>`).join('')}
      </tbody></table>
      <p class="pn-total"><span>Total sin IVA ni transporte</span><span id="pn-total"></span></p>
      <label><span>Condiciones</span><textarea id="pn-terms" rows="3" ${done ? 'readonly' : ''}>${esc(done ? q.offer.terms : TERMS)}</textarea></label>
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
    if (b.dataset.f) { state.filter = b.dataset.f; state.sel = null; render(); totals(); }
    if (b.dataset.sel) { state.sel = b.dataset.sel; render(); totals(); }
    if (b.dataset.advance) {
      const q = LG.quotes().find(x => x.id === b.dataset.advance);
      const next = LG.ORDER_STATES[LG.ORDER_STATES.indexOf(q.order.state) + 1];
      LG.setOrderState(q.id, next); toast(`Pedido ${q.id}: ${STATE_ES[next]}. El cliente ya lo ve en Mis pedidos.`); render(); totals();
    }
  });
  app.addEventListener('input', totals);
  app.addEventListener('submit', e => {
    e.preventDefault();
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
