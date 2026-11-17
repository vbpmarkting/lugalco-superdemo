// Textos de las versiones nuevas. Los nombres de producto vienen del listado de Javier y se quedan en español.
window.LG_I18N = (() => {
  const dict = {
    es: {
      demo: 'Demo: datos, tarifas y envases provisionales',
      navLugalco: 'Lugalco', navBrands: 'Marcas', navProducts: 'Productos', navHow: 'Cómo pedir',
      clientArea: 'Área cliente',
      frioTitle: 'Congelado en origen.\nListo para tu cocina.',
      frioLead: 'Lugalco distribuye alimentación congelada en España y Portugal. Y prepara Umami, su marca propia.',
      frioTemp: 'Temperatura de conservación',
      rutasTitle: 'Del mercado internacional a la península ibérica.',
      rutasLead: 'Compramos alimentación congelada donde mejor se produce y la llevamos a distribuidores y cocinas de España y Portugal.',
      rutasLegend: 'Lo que mueve cada ruta',
      marTitle: 'Todo bajo\ncero.',
      marLead: 'Productos del mar, vegetales, patatas, elaborados y aves. Congelados, seleccionados y servidos desde Vigo.',
      scrollHint: 'Desliza para congelar',
      seeProducts: 'Ver productos', askQuote: 'Pedir cotización',
      aboutTitle: 'Producto congelado con una persona al otro lado.',
      aboutText: 'Conectamos la oferta internacional de alimentación congelada con compradores de España y Portugal. Una selección de marcas reconocidas y una marca propia en camino.',
      umamiTitle: 'Umami, la marca propia de Lugalco',
      umamiText: '16 referencias en su gama inicial: patatas, verduras, elaborados y productos del mar. Envases en fase de propuesta.',
      umamiCta: 'Ver la gama Umami',
      brandsTitle: 'También trabajamos con',
      brandsNote: 'Nombres tomados del listado comercial. Logotipos pendientes de autorización.',
      catTitle: 'Catálogo', catLead: '128 referencias entre Umami y la selección de marcas. Las tarifas se consultan en el área cliente.',
      search: 'Buscar producto', searchPh: 'Brócoli, gamba, nuggets…', allBrands: 'Todas las marcas', all: 'Todo',
      fam: { vegetales: 'Vegetales', mar: 'Productos del mar', patatas: 'Patatas', elaborados: 'Elaborados', aves: 'Aves', otros: 'Otros' },
      format: 'Formato', results: n => `${n} productos`, more: 'Ver más productos', planned: 'Gama prevista',
      noResults: 'No hay productos con esa búsqueda. Prueba con otra palabra o quita el filtro.',
      howTitle: 'Pedir precio lleva menos de un minuto',
      how: [['Entra', 'Con tu email. Te llega un código y listo, sin contraseñas.'], ['Elige', 'Busca, indica cajas o kilos y añade. O repite tu última solicitud.'], ['Envía', 'Javier revisa disponibilidad y te responde con la oferta en 24 h.']],
      howCta: 'Entrar al área cliente',
      footer: 'Lugalco Import-Export · Vigo', other: 'Ver otras versiones',
      // Área cliente
      cEnterTitle: 'Entra para pedir precio', cEnterText: 'Escribe tu email y te mandamos un código de acceso. Sin contraseñas.',
      cEmail: 'Email de empresa', cSendCode: 'Recibir código', cCode: 'Código de 6 cifras', cEnter: 'Entrar',
      cDemoUser: 'Entrar como cliente de ejemplo', cCodeSent: c => `Demo: tu código es ${c}`, cBadCode: 'Ese código no coincide. Revisa el último que te ha llegado.',
      cBadEmail: 'Escribe un email válido, por ejemplo compras@tuempresa.com.',
      cHello: n => `Hola, ${n}`, cLogout: 'Salir', cTabNew: 'Nueva solicitud', cTabMine: 'Mis cotizaciones',
      cRepeat: 'Repetir mi última solicitud', cAdd: 'Añadir', cAdded: 'Añadido', cBoxes: 'cajas', cKg: 'kg',
      cPrice: p => `${p} /kg orientativo`, cNoPrice: 'Precio a consultar',
      cBasket: (l, k) => `${l} ${l === 1 ? 'producto' : 'productos'}${k ? ` · ${k} kg aprox.` : ''}`, cReview: 'Revisar y enviar',
      cEmptyBasket: 'Añade al menos un producto para pedir precio.',
      cDest: 'Destino de la entrega', cDestPh: 'Ciudad o almacén', cNote: 'Comentario (opcional)', cNotePh: 'Fechas, calibres, alternativas…',
      cSend: 'Enviar solicitud', cSent: 'Solicitud enviada', cSentText: 'Javier te responde con la oferta en menos de 24 h. La verás en Mis cotizaciones.',
      cBack: 'Seguir eligiendo', cRemove: 'Quitar',
      cNone: 'Todavía no has pedido ninguna cotización. Empieza en Nueva solicitud.',
      cPending: 'Esperando oferta', cAnswered: 'Oferta recibida', cView: 'Ver oferta', cPdf: 'Descargar PDF',
      cOffer: 'Oferta de Lugalco', cTotal: 'Total sin IVA ni transporte', cTerms: 'Condiciones', cClose: 'Cerrar',
      cNotice: 'Demo: los datos se guardan solo en este navegador.',
      cLines: n => `${n} ${n === 1 ? 'línea' : 'líneas'}`, panel: 'Panel de Javier (demo)',
    },
    en: {
      demo: 'Demo: provisional data, prices and packaging',
      navLugalco: 'Lugalco', navBrands: 'Brands', navProducts: 'Products', navHow: 'How to order',
      clientArea: 'Customer area',
      frioTitle: 'Frozen at source.\nReady for your kitchen.',
      frioLead: 'Lugalco distributes frozen food across Spain and Portugal, and is launching Umami, its own brand.',
      frioTemp: 'Storage temperature',
      rutasTitle: 'From the global market to the Iberian Peninsula.',
      rutasLead: 'We buy frozen food where it is produced best and bring it to distributors and kitchens in Spain and Portugal.',
      rutasLegend: 'What each route carries',
      marTitle: 'All below\nzero.',
      marLead: 'Seafood, vegetables, potatoes, prepared foods and poultry. Frozen, selected and shipped from Vigo.',
      scrollHint: 'Scroll to freeze',
      seeProducts: 'See products', askQuote: 'Request a quote',
      aboutTitle: 'Frozen products with a real person on the other side.',
      aboutText: 'We connect the international frozen food supply with buyers in Spain and Portugal: a selection of established brands and our own brand on the way.',
      umamiTitle: 'Umami, Lugalco’s own brand',
      umamiText: '16 products in the first range: potatoes, vegetables, prepared foods and seafood. Packaging at proposal stage.',
      umamiCta: 'See the Umami range',
      brandsTitle: 'We also work with',
      brandsNote: 'Names from the sales listing. Logos pending permission.',
      catTitle: 'Catalogue', catLead: '128 products across Umami and our brand selection. Prices are available in the customer area.',
      search: 'Search products', searchPh: 'Broccoli, prawns, nuggets…', allBrands: 'All brands', all: 'All',
      fam: { vegetales: 'Vegetables', mar: 'Seafood', patatas: 'Potatoes', elaborados: 'Prepared foods', aves: 'Poultry', otros: 'Other' },
      format: 'Pack', results: n => `${n} products`, more: 'Show more products', planned: 'Planned range',
      noResults: 'No products match that search. Try another word or clear the filter.',
      howTitle: 'Getting a price takes under a minute',
      how: [['Sign in', 'With your email. You get a code, no passwords.'], ['Choose', 'Search, set boxes or kilos and add. Or repeat your last request.'], ['Send', 'Javier checks availability and replies with an offer within 24 h.']],
      howCta: 'Go to the customer area',
      footer: 'Lugalco Import-Export · Vigo, Spain', other: 'See other versions',
      cEnterTitle: 'Sign in to request prices', cEnterText: 'Enter your email and we will send you an access code. No passwords.',
      cEmail: 'Work email', cSendCode: 'Get code', cCode: '6-digit code', cEnter: 'Sign in',
      cDemoUser: 'Sign in as a sample customer', cCodeSent: c => `Demo: your code is ${c}`, cBadCode: 'That code does not match. Check the latest one you received.',
      cBadEmail: 'Enter a valid email, for example purchasing@yourcompany.com.',
      cHello: n => `Hello, ${n}`, cLogout: 'Sign out', cTabNew: 'New request', cTabMine: 'My quotes',
      cRepeat: 'Repeat my last request', cAdd: 'Add', cAdded: 'Added', cBoxes: 'boxes', cKg: 'kg',
      cPrice: p => `${p} /kg indicative`, cNoPrice: 'Price on request',
      cBasket: (l, k) => `${l} ${l === 1 ? 'product' : 'products'}${k ? ` · approx. ${k} kg` : ''}`, cReview: 'Review and send',
      cEmptyBasket: 'Add at least one product to request a price.',
      cDest: 'Delivery destination', cDestPh: 'City or warehouse', cNote: 'Comment (optional)', cNotePh: 'Dates, sizes, alternatives…',
      cSend: 'Send request', cSent: 'Request sent', cSentText: 'Javier will reply with an offer within 24 h. You will find it in My quotes.',
      cBack: 'Keep choosing', cRemove: 'Remove',
      cNone: 'You have not requested any quotes yet. Start in New request.',
      cPending: 'Awaiting offer', cAnswered: 'Offer received', cView: 'View offer', cPdf: 'Download PDF',
      cOffer: 'Lugalco offer', cTotal: 'Total excl. VAT and transport', cTerms: 'Terms', cClose: 'Close',
      cNotice: 'Demo: data is stored only in this browser.',
      cLines: n => `${n} ${n === 1 ? 'line' : 'lines'}`, panel: 'Javier’s panel (demo)',
    },
    pt: {
      demo: 'Demo: dados, preços e embalagens provisórios',
      navLugalco: 'Lugalco', navBrands: 'Marcas', navProducts: 'Produtos', navHow: 'Como pedir',
      clientArea: 'Área de cliente',
      frioTitle: 'Congelado na origem.\nPronto para a sua cozinha.',
      frioLead: 'A Lugalco distribui alimentação congelada em Espanha e Portugal, e prepara a Umami, a sua marca própria.',
      frioTemp: 'Temperatura de conservação',
      rutasTitle: 'Do mercado internacional à Península Ibérica.',
      rutasLead: 'Compramos alimentação congelada onde melhor se produz e levamo-la a distribuidores e cozinhas de Espanha e Portugal.',
      rutasLegend: 'O que leva cada rota',
      marTitle: 'Tudo abaixo\nde zero.',
      marLead: 'Produtos do mar, vegetais, batatas, elaborados e aves. Congelados, selecionados e enviados a partir de Vigo.',
      scrollHint: 'Deslize para congelar',
      seeProducts: 'Ver produtos', askQuote: 'Pedir cotação',
      aboutTitle: 'Produto congelado com uma pessoa do outro lado.',
      aboutText: 'Ligamos a oferta internacional de alimentação congelada a compradores de Espanha e Portugal: uma seleção de marcas reconhecidas e uma marca própria a caminho.',
      umamiTitle: 'Umami, a marca própria da Lugalco',
      umamiText: '16 referências na gama inicial: batatas, legumes, elaborados e produtos do mar. Embalagens em fase de proposta.',
      umamiCta: 'Ver a gama Umami',
      brandsTitle: 'Também trabalhamos com',
      brandsNote: 'Nomes retirados da lista comercial. Logótipos pendentes de autorização.',
      catTitle: 'Catálogo', catLead: '128 referências entre a Umami e a seleção de marcas. Os preços consultam-se na área de cliente.',
      search: 'Procurar produto', searchPh: 'Brócolos, camarão, nuggets…', allBrands: 'Todas as marcas', all: 'Tudo',
      fam: { vegetales: 'Vegetais', mar: 'Produtos do mar', patatas: 'Batatas', elaborados: 'Elaborados', aves: 'Aves', otros: 'Outros' },
      format: 'Formato', results: n => `${n} produtos`, more: 'Ver mais produtos', planned: 'Gama prevista',
      noResults: 'Não há produtos com essa pesquisa. Experimente outra palavra ou retire o filtro.',
      howTitle: 'Pedir preço demora menos de um minuto',
      how: [['Entre', 'Com o seu email. Recebe um código, sem palavras-passe.'], ['Escolha', 'Procure, indique caixas ou quilos e adicione. Ou repita o último pedido.'], ['Envie', 'O Javier confirma a disponibilidade e responde com a oferta em 24 h.']],
      howCta: 'Entrar na área de cliente',
      footer: 'Lugalco Import-Export · Vigo, Espanha', other: 'Ver outras versões',
      cEnterTitle: 'Entre para pedir preço', cEnterText: 'Escreva o seu email e enviamos-lhe um código de acesso. Sem palavras-passe.',
      cEmail: 'Email da empresa', cSendCode: 'Receber código', cCode: 'Código de 6 dígitos', cEnter: 'Entrar',
      cDemoUser: 'Entrar como cliente de exemplo', cCodeSent: c => `Demo: o seu código é ${c}`, cBadCode: 'Esse código não coincide. Verifique o último que recebeu.',
      cBadEmail: 'Escreva um email válido, por exemplo compras@asuaempresa.pt.',
      cHello: n => `Olá, ${n}`, cLogout: 'Sair', cTabNew: 'Novo pedido', cTabMine: 'As minhas cotações',
      cRepeat: 'Repetir o meu último pedido', cAdd: 'Adicionar', cAdded: 'Adicionado', cBoxes: 'caixas', cKg: 'kg',
      cPrice: p => `${p} /kg indicativo`, cNoPrice: 'Preço sob consulta',
      cBasket: (l, k) => `${l} ${l === 1 ? 'produto' : 'produtos'}${k ? ` · aprox. ${k} kg` : ''}`, cReview: 'Rever e enviar',
      cEmptyBasket: 'Adicione pelo menos um produto para pedir preço.',
      cDest: 'Destino da entrega', cDestPh: 'Cidade ou armazém', cNote: 'Comentário (opcional)', cNotePh: 'Datas, calibres, alternativas…',
      cSend: 'Enviar pedido', cSent: 'Pedido enviado', cSentText: 'O Javier responde com a oferta em menos de 24 h. Vai encontrá-la em As minhas cotações.',
      cBack: 'Continuar a escolher', cRemove: 'Retirar',
      cNone: 'Ainda não pediu nenhuma cotação. Comece em Novo pedido.',
      cPending: 'À espera de oferta', cAnswered: 'Oferta recebida', cView: 'Ver oferta', cPdf: 'Descarregar PDF',
      cOffer: 'Oferta da Lugalco', cTotal: 'Total sem IVA nem transporte', cTerms: 'Condições', cClose: 'Fechar',
      cNotice: 'Demo: os dados ficam guardados apenas neste navegador.',
      cLines: n => `${n} ${n === 1 ? 'linha' : 'linhas'}`, panel: 'Painel do Javier (demo)',
    },
  };
  const KEY = 'lg-sd-lang';
  let lang = 'es';
  try { lang = localStorage.getItem(KEY) || 'es'; } catch { /* sin almacenamiento */ }
  if (!dict[lang]) lang = 'es';
  const listeners = [];
  const t = key => dict[lang][key] ?? dict.es[key];
  function set(next) {
    if (!dict[next]) return;
    lang = next;
    try { localStorage.setItem(KEY, next); } catch { /* sin almacenamiento */ }
    document.documentElement.lang = next;
    apply();
    listeners.forEach(fn => fn(next));
  }
  // Rellena [data-t] y marca el idioma activo en [data-lang]
  function apply(root = document) {
    root.querySelectorAll('[data-t]').forEach(el => {
      const v = t(el.dataset.t);
      if (typeof v === 'string') el.textContent = v;
    });
    root.querySelectorAll('[data-t-ph]').forEach(el => { el.placeholder = t(el.dataset.tPh); });
    root.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (b) set(b.dataset.lang);
  });
  document.documentElement.lang = lang;
  return { extend: (l, o) => Object.assign(dict[l], o), t, set, apply, get lang() { return lang; }, onChange: fn => listeners.push(fn) };
})();
