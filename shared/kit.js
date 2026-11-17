// Utilidades comunes de las versiones 8, 9 y 10 (capítulos, bento y tienda): tarjeta, filtros y enlaces con la ficha y Mi consulta.
window.KIT = (() => {
  const LG = window.LG, I = window.LG_I18N, t = I.t;
  const { products, image, esc, norm } = LG;
  const brands = ['Friusa', 'Eurofrits', 'Gelagri', 'Doux', 'Caterfrits'];
  const umami = products.filter(p => p.brand === 'Umami');
  const COL = { Umami: '#FFBF3F', Friusa: '#5fd6c2', Eurofrits: '#ff9b73', Gelagri: '#a5e06d', Doux: '#ff8fae', Caterfrits: '#a9b4ff' };
  const families = ['vegetales', 'mar', 'patatas', 'elaborados', 'aves', 'otros'];
  const famMark = { vegetales: 'Vg', mar: 'Mr', patatas: 'Pt', elaborados: 'El', aves: 'Av', otros: 'Ot' };
  const cnt = b => products.filter(x => x.brand === b).length;
  const byBrand = b => products.filter(x => x.brand === b);
  const names = (b, n = 6) => [...new Set(byBrand(b).map(x => x.name))].slice(0, n);
  const topFams = b => { const c = {}; byBrand(b).forEach(x => { c[x.category] = (c[x.category] || 0) + 1; }); return Object.entries(c).sort((a, z) => z[1] - a[1]).slice(0, 3).map(([k]) => t('fam')[k]); };
  const pick = () => { const pref = ['umami-gamba-pelada', 'umami-patata-99', 'umami-hamburguesa', 'umami-pollo-empanado', 'umami-patata-77'].map(id => products.find(x => x.id === id)).filter(Boolean); umami.forEach(x => { if (pref.length < 6 && !pref.includes(x)) pref.push(x); }); return pref; };
  function card(p) {
    const img = image(p), inQ = LG.hasConsulta(p.id);
    return `<li class="k-card${p.brand === 'Umami' ? ' is-umami' : ''}" style="--bc:${COL[p.brand] || '#ccc'}">
      <button type="button" class="k-card-open" data-open="${esc(p.id)}" aria-label="${esc(t('open'))}: ${esc(p.name)}">
        <span class="k-card-media">${img ? `<img src="${esc(img)}" alt="" loading="lazy" width="320" height="320">` : `<span class="k-card-mark" aria-hidden="true">${famMark[p.category] || ''}</span>`}</span>
        <span class="k-card-body"><span class="k-card-brand">${esc(p.brand)}</span><b>${esc(p.name)}</b><small>${esc(t('fam')[p.category] || '')} · ${esc(p.format)}</small></span></button>
      <button type="button" class="k-card-q" data-q="${esc(p.id)}" aria-pressed="${inQ}">${esc(inQ ? t('fInQuery') : t('fAddQuery'))}</button></li>`;
  }
  const filter = ({ brand = 'all', fam = 'all', q = '' } = {}) => { const nq = norm(q.trim()); return products.filter(p => (brand === 'all' || p.brand === brand) && (fam === 'all' || p.category === fam) && norm([p.name, p.brand, p.format, t('fam')[p.category]].join(' ')).includes(nq)); };
  // Un solo manejador: abre la ficha y marca para Mi consulta
  function bind(root) {
    root.addEventListener('click', e => {
      const o = e.target.closest('[data-open]'); if (o && root.contains(o)) { e.preventDefault(); window.LG_FICHA.open(o.dataset.open); return; }
      const q = e.target.closest('[data-q]'); if (q && root.contains(q)) { LG.toggleConsulta(q.dataset.q); }
    });
  }
  addEventListener('lg-consulta', () => document.querySelectorAll('[data-q]').forEach(b => { const on = LG.hasConsulta(b.dataset.q); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? t('fInQuery') : t('fAddQuery'); }));
  return { LG, I, t, esc, image, products, brands, umami, COL, families, cnt, byBrand, names, topFams, pick, card, filter, bind };
})();
