// Rellena las estadísticas del hero según el idioma
(() => {
  const I = window.LG_I18N;
  const draw = () => document.querySelectorAll('[data-stats]').forEach(ul => {
    ul.innerHTML = ['heroStat1', 'heroStat2', 'heroStat3'].map(k => { const [n, l] = I.t(k); return `<li><b>${n}</b><span>${l}</span></li>`; }).join('');
  });
  window.LG_HERO = draw; draw(); I.onChange(draw);
})();
