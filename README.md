# Gin La Elisa

Sitio institucional en React + Vite, con una página principal y un catálogo independiente en `/productos/`. La identidad se basa en el isologo y las etiquetas de la marca. La navegación de la página principal permanece visible e indica la sección actual: nosotros, nuestro gin, barras, agenda, sucursales, galería y contacto. Incluye detalles desplegables, un formulario de consulta integrado y fotografías ampliables.

La página de productos reúne los tres gins, tres variantes de pan de papa, pizzetas, prepizzas y alfajores. Ofrece filtros por categoría, fotos ampliadas (con tomas alternativas cuando están disponibles) y enlaces de WhatsApp con el producto seleccionado en el mensaje. Los precios y la disponibilidad se consultan; no se inventaron importes. Se accede desde «Productos» en el menú o desde el enlace bajo las variedades de gin. Las fotos de los envases identifican como pizzetas el material originalmente guardado con el nombre `pan-hamburguesa`.

Al elegir una sección, el menú mantiene marcado el destino durante el desplazamiento. Al llegar o interrumpirlo con rueda, teclado, táctil o arrastre, vuelve a indicar la sección visible.

La carga inicial muestra el isologo con una órbita lavanda, el nombre de la marca y un indicador animado sobre fondo crema. Aparece desde el HTML inicial y espera únicamente la portada y las fuentes; las demás fotos conservan la carga diferida. Se mantiene al menos 1,4 segundos desde el inicio de la navegación, sin sumar esa espera a las cargas más lentas; con movimiento reducido no agrega demora. La transición bloquea temporalmente la interacción con el contenido y libera la página tras un máximo de 5,5 segundos desde el montaje (con respaldo a los 8 segundos si falla el arranque).

La galería reúne ocho fotos WebP, sin repetir las del resto de la página, en una tira horizontal con ajuste entre fotos, flechas, rango visible e indicador de posición. Se puede recorrer con el gesto táctil, trackpad o teclado; no avanza sola y respeta el movimiento reducido.

El contenido aprovecha hasta 1600 px en escritorio, con fotos y títulos de escala adaptable. Los párrafos y el formulario conservan límites propios de ancho para facilitar la lectura. En tablet y celular se mantienen los márgenes y las columnas adaptadas a cada pantalla.

Las secciones alternan fondos crema, lavanda y violeta de la marca. La portada ocupa todo el ancho y al menos la altura visible bajo el encabezado. Usa la foto nocturna de la botella, completa y sin estirarla, con el texto superpuesto y un degradado para facilitar la lectura. En celular el texto queda arriba y la botella debajo; la foto no se repite en la galería. Lenis suaviza la rueda y la navegación interna; conserva el desplazamiento táctil y por teclado, y se desactiva si se solicita movimiento reducido o se abre la galería.

## Desarrollo

```sh
npm install
npm run dev
```

Vite muestra la dirección local disponible. Para generar los archivos de producción:

```sh
npm run build
npm run preview
```

## Contenido editable

- `src/data.js`: productos, eventos y sucursales.
- `src/catalog-data.js`: los nueve productos del catálogo y sus categorías.
- `src/Catalog.jsx` y `src/Catalog.css`: página de productos, filtros y detalles.
- `productos/index.html` y `src/catalog-main.jsx`: entrada independiente del catálogo, con sus propios metadatos.
- `src/App.jsx`: estructura, textos e interacciones.
- `src/components.jsx`: marca, fotos, iconos y formulario de consulta.
- `src/PhotoGallery.jsx`: galería horizontal, controles y navegación por teclado.
- `src/downloads.js`: descargas de consultas y de eventos de ejemplo.
- `src/useSectionNavigation.js`: secciones y seguimiento de la navegación.
- `src/useScrollReveal.js`: animaciones que se repiten al bajar y subir; conserva visible el contenido enfocado y respeta el movimiento reducido.
- `src/useSmoothScroll.js`: suavizado de rueda y enlaces internos, con preferencias de accesibilidad.
- `src/useInitialLoading.js`: espera de portada y fuentes, salida del loading y límite de espera.
- `src/loading.css`: diseño y animaciones de la pantalla de carga inicial.
- `src/AnimatedDialog.jsx`: apertura y cierre de la galería ampliada.
- `src/App.css`: diseño para celular, tablet y escritorio.
- `src/index.css`: paleta, tipografías locales y estilos base.
- `public/images/`: fotos WebP y versiones pequeñas; isologo con transparencia.
- `src/image-metadata.json`: dimensiones de imágenes.
- `assets/manifest.json`: correspondencia entre originales y optimizados, con sus pesos.
- `assets/referencias-optimizadas/`: fuentes WebP de panes, pizzetas, prepizzas y alfajores, más referencias de marca.

Los eventos y las tres sucursales son **ficticios, por pedido del cliente**, y se identifican como ejemplos en la interfaz. Reemplazar los datos por información confirmada antes de un lanzamiento público.

El formulario prepara una consulta para copiar o descargar. No envía datos ni simula una reserva. Los íconos de contacto abren el WhatsApp oficial (+54 9 3364 31-2425) y el Instagram de la marca (@ginlaelisa), confirmados por el cliente.

Los íconos SVG de WhatsApp e Instagram aparecen en una cápsula flotante y en el pie de página. Los enlaces se configuran en `socialChannels`, dentro de `src/data.js`: usar `https://wa.me/` seguido del número internacional sin signos para WhatsApp y la URL del perfil para Instagram. Mientras el enlace esté vacío, el ícono indica «Próximamente» y permanece inactivo. Los enlaces configurados abren una nueva pestaña.

Las fuentes se sirven desde el proyecto. Las fotos originales de Descargas permanecen intactas.

## Imágenes

Las 27 fotos recibidas se convirtieron a WebP. Sus versiones principales pasan de 23,96 MB a 3,68 MB (aproximadamente 85 % menos). Las fotos de gin incluyen además versiones de hasta 640 px. Se recortaron los márgenes de capturas y la interfaz de redes sociales donde correspondía.

El catálogo incorpora las diez fotos de alimentos con versiones adaptables, a partir de `assets/referencias-optimizadas/`. `npm run prepare:catalog` regenera los archivos públicos y sus dimensiones, y corrige la orientación de las fotos de pizzetas y prepizzas. Los originales permanecen intactos.

Para repetir la importación de esta entrega, extraer primero el ZIP de WhatsApp a `tmp/assets/`, manteniendo los nombres originales. Luego:

```sh
node scripts/inspect-material.mjs
node scripts/prepare-assets.mjs
npm run prepare:catalog
```

El primer script busca los originales en la carpeta Descargas del usuario. Acepta otra carpeta como primer argumento. Estos scripts corresponden a esta entrega concreta y no son necesarios para ejecutar ni compilar la web. Los temporales quedan en `tmp/`, excluido del proyecto versionado.

## Verificación de interfaz

Con el servidor local ejecutándose:

```sh
npm run test:ui
npm run test:loading
npm run test:catalog
```

Comprueba fotos sin repeticiones, siete tamaños entre 320 y 1900 px, navegación fija, enlaces internos, productos y eventos desplegables, calendario, información de sucursales, consulta integrada, galería ampliada, menú móvil y movimiento reducido. Guarda capturas en `tmp/qa/`.

La prueba del catálogo verifica su acceso desde el inicio, recarga de la URL independiente, categorías, fotografías, navegación de los detalles, mensajes de WhatsApp por producto y adaptación de 320 a 1900 px. Vite genera `dist/index.html` y `dist/productos/index.html` para servir ambas páginas sin depender de reescrituras de una SPA.

Por defecto usa `http://127.0.0.1:5173` y Microsoft Edge en Windows. Para otro puerto o navegador, definir `SITE_URL` o `BROWSER_PATH`. En otros sistemas usa el Chromium de Playwright, que debe estar instalado.
