// Datos de la superdemo compartidos por web, área cliente y panel. Todo se guarda solo en este navegador.
window.LG = (() => {
  const products = window.UMAMI_PRODUCTS || [];
  const details = window.LUGALCO_TECHNICAL_DETAILS || {};
  const prices = window.LUGALCO_DEMO_PRICES || {};
  const fix = p => (p ? p.replace(/^\.?\//, '') : null);
  const image = p => { const d = details[p.id] || {}; return fix(d.mockup || d.photo); };
  const price = p => prices[p.sourceProductId || p.id] ?? null;
  const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  const kgNum = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
  const drop = k => { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } };

  // ---- Versión visual activa (1, 2 o 3): se conserva al ir de la web al área cliente y al panel ----
  const VERSIONS = { 1: 'storefront', 2: 'glass', 3: 'calido', 4: 'pop', 5: 'lugalco', 6: 'lugalco-plus', 7: 'camara-fria', 8: 'capitulos', 9: 'bento', 10: 'tienda' };
  let ver = '1';
  try { ver = new URLSearchParams(location.search).get('v') || document.documentElement.dataset.ver || localStorage.getItem('lg-sd-ver') || '1'; } catch { /* */ }
  if (!VERSIONS[ver]) ver = '1';
  try { localStorage.setItem('lg-sd-ver', ver); } catch { /* */ }
  const home = () => `v${ver}.html`;
  const url = page => `${page}${page.includes('?') ? '&' : '?'}v=${ver}`;

  // ---- Formatos y unidades ----
  // "4x2,5KG" -> { packs: 4, weight: 2.5 }
  function parseFormat(p) {
    const m = String(p.format).replace(/\s/g, '').match(/(\d+)[xX](\d+(?:[.,]\d+)?)(kg)?(?![\d.,]*g)/i);
    return m ? { packs: Number(m[1]), weight: Number(m[2].replace(',', '.')) } : null;
  }
  const boxKg = p => { const f = parseFormat(p); return f ? f.packs * f.weight : null; };
  const bagKg = p => { const f = parseFormat(p); return f ? f.weight : null; };
  const UNITS = ['cajas', 'bolsas', 'unidades', 'kg'];
  // kilos de una línea; las unidades sueltas no se convierten
  const kgOf = (p, qty, unit) => (unit === 'kg' ? qty : unit === 'cajas' ? (boxKg(p) != null ? qty * boxKg(p) : null) : unit === 'bolsas' ? (bagKg(p) != null ? qty * bagKg(p) : null) : null);
  const unitWords = { es: { cajas: ['caja', 'cajas'], bolsas: ['bolsa', 'bolsas'], unidades: ['unidad', 'unidades'] }, en: { cajas: ['box', 'boxes'], bolsas: ['bag', 'bags'], unidades: ['unit', 'units'] }, pt: { cajas: ['caixa', 'caixas'], bolsas: ['saco', 'sacos'], unidades: ['unidade', 'unidades'] } };
  const unitText = (qty, unit, lang = 'es') => unit === 'kg' ? 'kg' : (unitWords[lang] || unitWords.es)[unit]?.[Number(qty) === 1 ? 0 : 1] || unit;
  // cajas, bolsas y unidades: enteros; kg: cualquier cantidad positiva
  const validQty = (qty, unit) => Number.isFinite(qty) && qty > 0 && (unit === 'kg' || Number.isInteger(qty));
  const lineAmount = (p, qty, unit, pr = price(p)) => { const kg = kgOf(p, qty, unit); return kg != null && pr ? Math.round(pr * 100) * kg / 100 : null; };

  // ---- Perfiles de la demo y sesión (caduca a la hora) ----
  const DEMOS = {
    cliente: { email: 'compras@restauranteatlantico.es', name: 'Marta', company: 'Restaurante Atlántico (ficticio)', profile: 'cliente' },
    distribuidor: { email: 'pedidos@distribucionesnorte.es', name: 'Iván', company: 'Distribuciones Norte (ficticio)', profile: 'distribuidor' },
  };
  const SKEY = 'lg-sd-session', TTL = 60 * 60 * 1000;
  function session() {
    const s = read(SKEY, null);
    if (!s) return null;
    if (s.exp && Date.now() > s.exp) { drop(SKEY); try { sessionStorage.setItem('lg-sd-expired', '1'); } catch { /* */ } return null; }
    return s;
  }
  const setSession = s => (s ? write(SKEY, { ...s, exp: Date.now() + TTL }) : drop(SKEY));
  const renewSession = () => { const s = session(); if (s) setSession(s); return s; }; // cada acción reinicia la hora
  const wasExpired = () => { try { const v = sessionStorage.getItem('lg-sd-expired'); sessionStorage.removeItem('lg-sd-expired'); return !!v; } catch { return false; } };

  // ---- Cotizaciones y pedidos ----
  const KEY = 'lg-sd-quotes';
  const lineOf = (id, qty, unit) => { const p = products.find(x => x.id === id); return { id, name: p.name, brand: p.brand, format: p.format, qty, unit }; };
  const offerFor = (lines, answeredAt) => ({ answeredAt, terms: 'Precios por kg, sin IVA ni transporte. Validez 7 días. Pago a 30 días. Disponibilidad confirmada al aceptar.', prices: Object.fromEntries(lines.map(l => [l.id, price(products.find(x => x.id === l.id)) ?? 0])) });
  // Tres solicitudes de ejemplo (una por fase) para que el panel y "Mis cotizaciones" no salgan vacíos
  function seed() {
    if (read(KEY, null)) return;
    const a = [lineOf('umami-patata-99', 40, 'cajas'), lineOf('umami-guisante-fino', 25, 'cajas'), lineOf('umami-gamba-pelada', 10, 'cajas')];
    const b = [lineOf('umami-brocoli', 60, 'cajas'), lineOf('umami-hamburguesa', 30, 'cajas')];
    const c = [lineOf('umami-patata-77', 120, 'cajas'), lineOf('umami-menestra-comun', 50, 'bolsas')];
    write(KEY, [
      { id: 'LG-2611-003', email: DEMOS.distribuidor.email, company: DEMOS.distribuidor.company, profile: 'distribuidor', createdAt: '2026-11-16T09:40:00', destination: 'Santiago de Compostela', note: 'Reposición semanal para tres almacenes.', lines: c, status: 'pending' },
      { id: 'LG-2611-002', email: DEMOS.cliente.email, company: DEMOS.cliente.company, profile: 'cliente', createdAt: '2026-11-10T11:05:00', destination: 'Vigo', note: '', lines: b, status: 'answered', offer: offerFor(b, '2026-11-10T17:30:00') },
      { id: 'LG-2611-001', email: DEMOS.cliente.email, company: DEMOS.cliente.company, profile: 'cliente', createdAt: '2026-11-03T10:20:00', destination: 'Vigo', note: 'Entrega antes del viernes si es posible.', lines: a, status: 'accepted', offer: offerFor(a, '2026-11-03T16:05:00'),
        order: { acceptedAt: '2026-11-04T08:10:00', state: 'shipped', history: [{ state: 'confirmed', at: '2026-11-04T08:10:00' }, { state: 'preparing', at: '2026-11-04T15:00:00' }, { state: 'shipped', at: '2026-11-05T09:30:00' }] } },
    ]);
  }
  const quotes = () => read(KEY, []);
  const saveQuotes = q => write(KEY, q);
  const addQuote = q => { const all = quotes(); all.unshift(q); saveQuotes(all); };
  const updateQuote = (id, fn) => { const all = quotes(); const q = all.find(x => x.id === id); if (q) { fn(q); saveQuotes(all); } return q; };
  const nextId = () => 'LG-2611-' + String(quotes().length + 1).padStart(3, '0');
  const offerTotal = q => (q.offer ? q.lines.reduce((s, l) => s + (lineAmount(products.find(x => x.id === l.id), l.qty, l.unit, q.offer.prices[l.id]) || 0), 0) : null);
  const ORDER_STATES = ['confirmed', 'preparing', 'shipped', 'delivered'];
  const acceptQuote = id => updateQuote(id, q => { const at = new Date().toISOString(); q.status = 'accepted'; q.order = { acceptedAt: at, state: 'confirmed', history: [{ state: 'confirmed', at }] }; });
  const setOrderState = (id, state) => updateQuote(id, q => { if (!q.order) return; q.order.state = state; q.order.history.push({ state, at: new Date().toISOString() }); });
  const quoteStatus = q => (q.status === 'accepted' ? 'order' : q.status);

  // ---- Mi consulta: productos marcados en la web, listos para pedir cotización ----
  const CKEY = 'lg-sd-consulta';
  const consulta = () => read(CKEY, []);
  const hasConsulta = id => consulta().some(x => x.id === id);
  const emitConsulta = () => dispatchEvent(new CustomEvent('lg-consulta'));
  function toggleConsulta(id, extra = {}) {
    const all = consulta(); const i = all.findIndex(x => x.id === id);
    if (i >= 0 && !extra.keep) all.splice(i, 1); else if (i < 0) all.push({ id, ...extra }); else Object.assign(all[i], extra);
    write(CKEY, all); emitConsulta(); return i < 0;
  }
  const clearConsulta = () => { drop(CKEY); emitConsulta(); };
  addEventListener('storage', e => { if (e.key === CKEY) emitConsulta(); });
  function consultaText() {
    const items = consulta();
    const rows = items.map(x => ({ x, p: products.find(p => p.id === x.id) })).filter(r => r.p);
    return ['LUGALCO · CONSULTA DE PRODUCTOS (DEMO)', new Date().toLocaleDateString('es-ES'), '', ...rows.map(({ x, p }) => `- ${p.name} | ${p.brand} | ${p.format}${x.sheet ? ' | ficha técnica solicitada' : ''}`), '', 'Demo sin envío real: descarga este archivo y envíalo a tu contacto en Lugalco.'].join('\n');
  }
  const download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };

  // ---- Avisos por correo a info@vbpmarketing.com (FormSubmit). Asunto siempre con "[Lugalco]". ----
  const MAIL_URL = 'https://formsubmit.co/ajax/info@vbpmarketing.com';
  const eur = n => (n == null || n === '' ? 'a consultar' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n));
  function offerSummary(q) {
    const lines = q.lines.map((l, i) => { const pr = q.offer?.prices?.[l.id]; return `${i + 1}. ${l.name} (${l.brand || '-'}, ${l.format || '-'}): ${l.qty} ${unitText(l.qty, l.unit)} · ${eur(pr)}/kg`; }).join('\n');
    return { Referencia: q.id, Empresa: q.company || '-', Email: q.email, Perfil: q.profile === 'distribuidor' ? 'Distribuidor' : 'Cliente', Destino: q.destination || '-',
      Productos: lines, 'Total estimado': eur(offerTotal(q)), Condiciones: q.offer?.terms || '-' };
  }
  function mail(subject, fields, replyto) {
    const body = { _subject: subject, _template: 'box', _captcha: 'false', ...(replyto ? { _replyto: replyto } : {}), ...fields, Fecha: new Date().toLocaleString('es-ES') };
    try { fetch(MAIL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }).catch(() => {}); } catch { /* sin red */ }
  }

  seed();
  return { VERSIONS, ver, home, url, products, details, image, price, money, kgNum, boxKg, bagKg, kgOf, UNITS, unitText, validQty, lineAmount, esc, norm, read, write,
    DEMOS, session, setSession, renewSession, wasExpired, quotes, saveQuotes, addQuote, updateQuote, nextId, offerTotal, ORDER_STATES, acceptQuote, setOrderState, quoteStatus,
    consulta, hasConsulta, toggleConsulta, clearConsulta, consultaText, download, mail, offerSummary };
})();
