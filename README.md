# Lugalco · Superdemo

Web de demostración de Lugalco con cuatro versiones visuales sobre el mismo núcleo:

| Versión | Archivo | Estilo |
|---|---|---|
| 1 Storefront | `v1.html` | Claro y comercial |
| 2 Glass | `v2.html` | Oscuro y lima, vidrio |
| 3 Cálido | `v3.html` | Editorial, serif y terracota |
| 4 Pop | `v4.html` | Amarillo Umami, tipografía enorme, movimiento |

`index.html` es el selector. Además: `cliente.html` (área cliente) y `panel.html` (panel de Javier).

## Funciones
Catálogo de 128 referencias con búsqueda y filtros, Umami Lab, fichas de producto, Mi consulta (descarga TXT), área cliente con perfiles cliente/distribuidor, unidades (cajas, bolsas, unidades, kg), cotización, aceptar oferta y seguimiento de pedido, panel de ofertas y pedidos, ES/EN/PT.

## Ver en local
Sitio estático, sin compilación:

```bash
python -m http.server 8780
```

y abrir http://localhost:8780/. Los datos de la demo se guardan solo en el navegador (localStorage).

## Avisos
Datos, tarifas y envases son provisionales. Las imágenes son ilustrativas de productos similares; derechos no verificados para publicación comercial. Ver `creditos-umami.html`. Mantener el repositorio privado.
