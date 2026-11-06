# Gin La Elisa

Sitio en React + Vite con una identidad basada en el isologo y las etiquetas de la marca: violeta, lavanda, crema y verde menta. Incluye productos, historia, barra de autoservicio y barra completa, agenda con filtros, sucursales, galería y consulta para eventos.

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
- `src/App.jsx`: estructura, textos e interacciones.
- `src/App.css`: diseño para celular, tablet y escritorio.
- `src/index.css`: paleta, tipografías locales y estilos base.
- `public/images/`: fotos WebP y versiones pequeñas; isologo con transparencia.
- `src/image-metadata.json`: dimensiones de imágenes.
- `assets/manifest.json`: correspondencia entre originales y optimizados, con sus pesos.
- `assets/referencias-optimizadas/`: fotos HEIC ajenas al gin convertidas a WebP y referencias de marca.

Los eventos y las tres sucursales son **ficticios, por pedido del cliente**, y se identifican como ejemplos en la interfaz. Reemplazar los datos por información confirmada antes de un lanzamiento público.

El formulario prepara una consulta para copiar o descargar. No envía datos ni simula una reserva. Cuando se disponga del WhatsApp, correo o servicio de contacto oficial, conectar ese canal. No se inventaron números ni perfiles sociales.

Las fuentes se sirven desde el proyecto. Las fotos originales de Descargas permanecen intactas.

## Imágenes

Las 27 fotos recibidas se convirtieron a WebP. Sus versiones principales pasan de 23,96 MB a 3,68 MB (aproximadamente 85 % menos). Las fotos de gin incluyen además versiones de hasta 640 px. Se recortaron los márgenes de capturas y la interfaz de redes sociales donde correspondía.

Para repetir la importación de esta entrega, extraer primero el ZIP de WhatsApp a `tmp/assets/`, manteniendo los nombres originales. Luego:

```sh
node scripts/inspect-material.mjs
node scripts/prepare-assets.mjs
```

El primer script busca los originales en la carpeta Descargas del usuario. Acepta otra carpeta como primer argumento. Estos scripts corresponden a esta entrega concreta y no son necesarios para ejecutar ni compilar la web. Los temporales quedan en `tmp/`, excluido del proyecto versionado.

## Verificación de interfaz

Con el servidor local ejecutándose:

```sh
npm run test:ui
```

Comprueba imágenes, seis tamaños entre 320 y 1440 px, filtros y detalles de eventos, descarga de calendario, productos, consultas, selección de barra, sucursales y menú móvil. Guarda capturas en `tmp/qa/`.

Por defecto usa `http://127.0.0.1:5173` y Microsoft Edge en Windows. Para otro puerto o navegador, definir `SITE_URL` o `BROWSER_PATH`. En otros sistemas usa el Chromium de Playwright, que debe estar instalado.
