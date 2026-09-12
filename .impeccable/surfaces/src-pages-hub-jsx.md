---
version: 1
slug: "src-pages-hub-jsx"
primary_target: "src/pages/Hub.jsx"
related_targets: ["src/components/content/ContentCard.jsx","src/pages/Publish.jsx","src/pages/Admin.jsx"]
---

# Noticias y publicación editorial

Alcance: extensión concreta de la red existente. Noticias es Experience/Read;
Publicar y exportar son Operate. El usuario fija Instagram como referencia,
modo claro, coordinación en la cabecera y ninguna publicación forzada a 100vh.
El hero público, permisos existentes y datos reales se conservan. Excel confirmado:
Usuarios y contactos, Publicaciones y Misiones; sin credenciales.

## Direction contract

THESIS: una noticia se recorre, se lee y se conversa, sin saltos de pantalla.
La creación deja de competir con el feed y tiene su propia ruta visible para editores.

OWN-WORLD: blanco y gris de la interfaz existente, tinta navy, acento azul;
logotipos oficiales, tipografía Inter heredada, líneas discretas y controles de iconos.

STORY: reconocer la coordinación, ver el contenido completo, reaccionar o conversar.
Editores encuentran Publicar en el menú; superadmin descarga tres hojas de Excel.

FIRST VIEWPORT: barra superior existente, encabezado discreto de Noticias,
columna central de 620 px con cabecera de coordinación, imagen/video de proporción
natural y acciones debajo. En móvil, ancho completo con márgenes de texto de 16 px.
Los comentarios abren una hoja clara, cerrable y con foco protegido.

FORM: feed social editorial fijado por el usuario; extensión code-led, sin sorteo
ni nuevo mundo visual. Referencia: captura de Instagram suministrada el 12/09/2026.
Interacción distintiva: tres burbujas de compartir y conversación con respuestas;
movimiento breve, sin animaciones de entrada que oculten las noticias.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Overview

Registro observado de una extensión ordinaria fijada por el usuario, no de una identidad nueva.
`DESIGN.md` y `.impeccable/design.json` permanecen intactos como autoridad normativa del mundo
incumbente: inicio navy/dorado, Inter, identidad oficial y variantes heredadas. Su descripción
del feed tipo TikTok y la conversación oscura no se reescribe: Noticias autenticadas (`/noticias`,
`/hub`) usa aquí la excepción clara y continua. Home/hero queda fuera del cambio; la ausencia
preexistente de `PRODUCT.md` no inicia otra entrevista ni una reparación de deriva documental.

## Colors

- Noticias: fondo y cabecera de publicación (`#fafafa`; blanco a ≤640px), publicación/hoja/campos
  blancos (`#fff`), tinta (`#17212e`), separadores (`#e1e5e9`), metadatos (`#647081`) y enlaces
  secundarios (`#627081`). El fondo de medios (`#10141c`) no convierte el feed en modo oscuro.
- Acciones, enlaces principales y foco (`#1a237e`); apoyos de filtro/estado (`#ebedf7`). Me gusta
  de publicación (`#d73860`); burbujas Facebook (`#1877f2`), WhatsApp (`#148c4b`) e Instagram
  (`#b72c75`), con iconos blancos; confirmación de compartido (`#217048`).
- Conversación clara: texto/autor (`#17212e`), secundarios y `--conversation-muted` local
  (`#637080`), «Tú» (`#775a05`), mención/envío (`#1a237e`), corazón activo (`#c92951`), campo y
  respuesta en curso (`#f3f5f7`), cierre/más comentarios (`#f1f3f6`). VIP: texto (`#285e40`),
  icono (`#217048`) sobre (`#ebf6ef`). No sustituye los tokens de conversación oscura del mundo incumbente.
- Publicar: secundarios (`#637080`), etiquetas (`#364255`), bordes de panel (`#dbe0e7`) y campo
  (`#d7dde5`), ayuda (`#f3f5f8`), acción de vista previa (`#e7eaf5`). Eliminar (`#b62536`);
  confirmación (`#812c37` sobre `#fff1f1`) y botón destructivo (`#fff` sobre `#ad2534`).
  Exportar conserva azul (`#1A237E`, hover `#131b62`) y blanco; aviso administrativo (`#475569`).
- Los dos placeholders corregidos están en (`#5b6675`): campos del compositor sobre blanco
  (contraste calculado 5.83:1) y comentario sobre (`#f3f5f7`, 5.33:1). En la hoja blanca,
  tinta (16.24:1), secundarios (5.05:1), azul (13.24:1), «Tú» (6.46:1) y corazón activo (5.36:1).
  Son cálculos de los pares CSS opacos observados, no una aprobación integral de accesibilidad.

## Typography

Inter y alternativas de sistema siguen heredadas. «Para ti» (22px, peso 750; 20px a ≤640px);
coordinación (15px/700; 14px móvil), metadatos (12px; 11px móvil), texto de publicación
(14px, interlineado 1.55). Comentario/respuesta conservan (15/14px, 1.48); autor claro (14px),
metadatos (11px) y campo (16px). Título de Publicar (28px/750; 24px móvil); sus campos pasan
de (14px) a (16px) a ≤640px. No se introduce una escala global.

## Layout

- Un solo desplazamiento vertical del feed: `.app-main-scroll` de `AppLayout.jsx`, con
  `scroll-snap-type: none` y contenido sin scroll anidado. `Hub.jsx` revela publicaciones de
  diez en diez con observador en ese mismo contenedor (`rootMargin: 300px`) y botón alternativo.
- Columna centrada (`width: min(100%, 620px)`), padding exterior de escritorio (0 24px 32px).
  Imagen/video (`width: 100%`, `height: auto`, `object-fit: contain`, máximo 500px de alto);
  video mínimo (220px). A ≤640px: padding exterior (0 0 24px), medios de proporción natural
  hasta (540px), cabecera/texto con laterales (16px); barra del feed (74px → 62px).
- Comentarios en portal modal: ancho (`min(100%, 640px)`), alto máximo (`min(85dvh, 780px)`),
  al borde inferior; a ≥768px se separa (5vh). Laterales (24px; 16px a ≤640px) y resguardo
  inferior móvil (`max(12px, env(safe-area-inset-bottom))`). Solo la lista de conversación
  desplaza mientras el feed queda bloqueado; cabecera y formulario no se contraen. Campo
  (44–90px de alto). Avatares de conversación (38/28px), indentación de respuestas (50px);
  a ≤400px pasan a (32/25px) e indentación (30px).
- Publicar: ancho máximo (1080px); formulario con campos y preview lateral (260px), padding/gap
  (24px). A ≤900px pasa a una columna y preview de hasta (420px); a ≤640px, campos/listado
  apilados, padding (16px), gap (20px) y acciones estiradas. En Admin, cabecera, pestañas y
  datos del usuario admiten salto de línea; los detalles usan dos columnas desde `sm`.

## Elevation & Depth

Publicaciones separadas por línea; compositor/preview sin sombra local. Compartir conserva
(`0 5px 20px #12203a20`); hoja clara (`0 -8px 40px #12203a15`), con velo (`#17212e80`).
Estos tratamientos locales no prohíben efectos en otras superficies.

## Shapes

Medios (radio 10px; 0 en móvil), compositor (12px), campos/preview/acciones editoriales (8px),
lista editorial (10px); hoja inferior (18px 18px 0 0; 16px a ≥768px). Avatares y burbujas
circulares. Controles principales del feed y burbujas (44px); controles de video (40px).

## Components

- **Noticias:** cabecera de coordinación, sello oficial salvo `isOfficial === false`, fecha
  es-CO y acceso editorial. Texto expandible después de (160 caracteres); reacción, comentarios,
  tres opciones de compartir y enlaces originales. Filtros de búsqueda/coordinación/región/orden;
  carga, error con reintento, vacío y fin de lista explícitos. El render social no añade entrada
  animada a cada noticia. Video con reproducción/pausa, sonido y línea de tiempo real.
- **Avatares de coordinación:** `coordinationLogos.js` mapea c1–c12 a 12 PNG presentes
  (0 ausentes), todos de (128×72px). Cada `impeccable:prompt` incrustado identifica el PNG
  preexistente homónimo en `src/assets/coordinaciones/optimized/` y su redimensionado proporcional
  con `sips` a 128px, sin generación ni alteración del logo. Se muestran a (44×44px), con
  padding (4px) y `object-fit: contain`; fallback existente `/isologo-somos-mision.svg`.
- **Comentarios:** diálogo claro con cierre, Escape, ciclo de Tab y retorno de foco al disparador;
  restaura el scroll anterior al cerrar. Mantiene respuestas, reacciones, carga/vacío, más
  comentarios y VIP. Máximo (500 caracteres), envío deshabilitado vacío/ocupado. Foco local
  azul (2px, offset 4px); no aplica la entrada deslizante inmersiva en el modo social.
- **Publicar:** ruta propia `/publicar`, visible en ambos menús y feed mediante `canPublish`
  (usuario no inactivo, rol `admin` o permiso editorial explícito). Pestañas Nueva/Editar y
  Publicadas, navegación de teclado, búsqueda, editar y eliminación con confirmación irreversible.
  Compositor: enlaces Facebook/Instagram, preview, título, coordinación, descripción, portada
  manual por URL, formato y destacado; estados de obtención/guardado y errores. Exige al menos
  un enlace social válido y título; el bloqueo de preview permite completar los campos manualmente.
- **Superadmin:** Exportar Excel, estado anunciado, bloqueo durante preparación y aviso sobre
  datos personales; detalles de contacto/permisos desplegables por usuario. Libro con exactamente
  **Usuarios** (incluye contactos), **Publicaciones** y **Misiones**: columnas explícitas sin
  contraseñas/tokens, teléfonos e identificadores como texto, fechas Colombia, cabecera congelada
  y filtros incluso vacío. `admin_export_rows` exige perfil `admin` activo, pagina resultados y
  no consulta `auth.users`. Handoff verificado por main con autorización del usuario: SQL desplegado
  y validado en producción (admin permitido, no-admin rechazado, anon sin EXECUTE); esta pasada
  documental no realizó esa validación.

## Fuentes y evidencia

- Fuentes principales cotejadas: `src/pages/Hub.jsx`, `src/pages/Publish.jsx`, `src/pages/Admin.jsx`,
  `src/pages/social-feed.css`, `src/pages/publishing.css`, `src/pages/admin-export.css`;
  `src/components/content/ContentCard.jsx`, `SocialPost.jsx`, `PublicationComposer.jsx`,
  `coordinationLogos.js`; `src/components/layout/AppLayout.jsx`, `src/utils/databaseExport.js`
  y `supabase/admin_export.sql`. Herencia/permisos contrastados con `src/index.css`,
  `src/components/content/comment-threads.css`, `src/App.jsx`, `src/utils/permissions.js`
  y navegación existente, además de ambos documentos normativos preservados.
- Capturas locales inspeccionadas en `.impeccable/review/`: `desktop.png`, `desktop-comments.png`,
  `desktop-publish.png`, `desktop-admin.png` (1280×900); `mobile.png`, `mobile-comments.png`,
  `mobile-share.png`, `mobile-publish.png`, `mobile-publish-list.png`, `mobile-admin.png` (390×844).
  Son fixtures mock locales: nombres, cifras y contenido ilustrativo no acreditan datos de producción
  ni el estado posterior de cada corrección CSS.
- Handoff recibido: **15 pruebas Node aprobadas**, instalación limpia npm y build de producción
  correctos. Esta pasada leyó las 15 pruebas: `src/utils/commentThreads.test.js` (6),
  `profileContact.test.js` (4), `permissions.test.js` (2), `databaseExport.test.js` (2) y
  `src/api/editorial.test.js` (1). Cubren hilos/contactos, permisos, libro seguro/vacío y CRUD/export
  en mock; no equivalen a pruebas visuales ni de la base real. No se reejecutaron aquí pruebas,
  instalación, build, navegador ni acciones de base de datos.
- La revisión de acabado reportó únicamente dos contrastes insuficientes de placeholder;
  ambas correcciones a (`#5b6675`) están confirmadas en CSS. Handoff final del finish reviewer:
  **verdict: resolved; remaining: clear; disposition: ship**, con contrastes (5.83:1 / 5.33:1).
  El cierre corresponde únicamente a la corrección de contraste, no a una nueva revisión integral
  ni a una aprobación completa de la superficie.
