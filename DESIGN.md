---
name: Misiones Nacionales Colombia
description: Extensión observada del inicio público y los comentarios de la red IPUC para multiplicadores.
colors:
  blue-900: "#0A0F52"
  blue-800: "#0D1257"
  blue-700: "#1A237E"
  gold-500: "#D4AF37"
  bg: "#F5F5F7"
  surface: "#FFFFFF"
  text: "#1D1D1F"
  text-3: "#6E6E73"
  home-navy: "#0c1940"
  home-gold: "#f4cc53"
  home-gold-hover: "#ffe18a"
  home-copy: "#c5d0e6"
  home-muted: "#b4c1d9"
  film-background: "#050910"
  conversation-background: "#202023"
  conversation-body: "#f5f5f7"
  conversation-muted: "#b5b5bc"
  conversation-author: "#c4c4cc"
  conversation-metadata: "#aeb6c8"
  conversation-field: "#303034"
  conversation-liked: "#ff829d"
typography:
  body: { fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", lineHeight: 1.5 }
  display: { fontSize: "clamp(48px, 5.3vw, 76px)", fontWeight: 900, lineHeight: 0.99, letterSpacing: "-.035em" }
  display-mobile: { fontSize: "clamp(42px, 11vw, 58px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-.035em" }
  comment-body: { fontSize: "15px", fontWeight: 450, lineHeight: 1.48 }
  reply-body: { fontSize: "14px", fontWeight: 450, lineHeight: 1.48 }
  title: { fontSize: "13px", fontWeight: 700 }
  label: { fontSize: "10px" }
rounded:
  r-sm: "10px"
  r: "16px"
  r-xl: "24px"
  local-control: "12px"
  conversation-sheet: "18px 18px 0 0"
components:
  home-join: { backgroundColor: "{colors.home-gold}", textColor: "{colors.home-navy}", rounded: "{rounded.local-control}", padding: "0 24px" }
  home-join-hover: { backgroundColor: "{colors.home-gold-hover}" }
  comment-field: { backgroundColor: "{colors.conversation-field}", textColor: "{colors.conversation-body}", rounded: "{rounded.local-control}", padding: "11px 14px" }
  comment-sheet: { backgroundColor: "{colors.conversation-background}", textColor: "{colors.conversation-body}", rounded: "{rounded.conversation-sheet}" }
---

# Design System: Misiones Nacionales Colombia

## Overview

Registro acotado de la identidad existente, no una identidad nueva ni de reemplazo. La verdad de producto fue confirmada por el usuario: red social en español de IPUC Misiones Nacionales Colombia para multiplicadores, con invitación pública y feed/comentarios de interacción tipo TikTok. No existe PRODUCT.md; no se introduce una metáfora creativa.

Autoridad: HomeHero.jsx/home-hero.css, CommentThreads.jsx/comment-threads.css, Sidebar.jsx, MobileSidebar.jsx y Landing.jsx. src/index.css conserva la autoridad sobre los tokens generales de :root; el frontmatter recoge un subconjunto observado, no renombra ni sustituye esa base. ContentCard.jsx aporta el contenedor y formulario de comentarios.

**Key Characteristics:**

- Identidad oficial conservada: logo suministrado, navy/dorado e interfaz en español.
- Inicio centrado en el video propio; comentarios oscuros con texto completo y respuestas subordinadas.
- Navegación heredada conservada, con tratamientos distintos en escritorio y móvil.

Evidencia visual local: .impeccable/review/home-desktop.png (1440), home-mobile.png (390), comments-desktop.png (1280) y comments-mobile.png (390). La revisión técnica no señaló defectos visuales materiales y cerró los dos ajustes puntuados con «ship»; este registro documenta el diseño, no sustituye la verificación de despliegue.

## Colors

Primary: home-navy y home-gold corresponden solo al hero, su CTA, foco y contador. Los blue-* y gold-500 heredados siguen vigentes en navegación; no se igualan a los colores locales del inicio.

Neutral: conversation-background es la hoja de comentarios; conversation-body prioriza el mensaje, conversation-author el nombre y conversation-muted/conversation-metadata la información secundaria. conversation-field separa el editor por tono. conversation-liked identifica el corazón activado; no es un nuevo acento general. El contador conectado usa el punto verde observado (#87d9aa).

## Typography

Inter y sus alternativas de sistema se heredan de src/index.css. El título del hero usa display/display-mobile. Su descripción mide (17px, interlineado 1.6, máximo 34ch), y en móvil (15px, 1.5, 40ch). Los comentarios usan comment-body y las respuestas reply-body, sin truncamiento; title corresponde al autor y label a nivel/insignia y distrito. Fecha (11px), Responder (12px, peso 600) y cifras tabulares completan la jerarquía. No se deduce una escala tipográfica nueva.

## Layout

Hero de escritorio: grid `minmax(250px, .8fr) minmax(0, 1.65fr)`, separación `clamp(28px, 4vw, 64px)`; texto/CTA a la izquierda y video en aproximadamente dos tercios del ancho de columnas. Padding superior (124px), laterales `max(28px, calc((100vw - 1280px) / 2))`; video 16:9 con `object-fit: contain`. A ≤760px: padding (90px 20px 22px), título/descripción → video → unirse/iniciar sesión → contador real → conocer la misión. El botón de unión ocupa todo el ancho.

Comentarios inmersivos: hoja inferior `height: min(80%, 650px)`, máximo (86%), mínimo heredado (280px; 260px a ≤760px), laterales (20px; 16px a ≤760px). Solo la lista desplaza la conversación: flex creciente, `min-height: 0`, `overflow-y: auto`, `overscroll-behavior: contain`; cabecera y compositor quedan fuera. El textarea puede crecer hasta (90px). En modo no inmersivo, la lista conserva el máximo heredado (240px). Respuestas indentadas (50px; 30px a ≤400px), avatares raíz/respuesta (38/28px; 32/25px a ≤400px).

## Elevation & Depth

Hero y mensajes son superficies planas. La hoja inmersiva conserva la sombra estructural heredada `0 -18px 40px rgba(0,0,0,0.26)` y un fondo exterior desenfocado (3px); «plano» no significa eliminar estas capas. La cabecera pública y el sidebar de escritorio conservan transparencia, desenfoque y sombras existentes; no se establece una prohibición global de efectos.

## Shapes

El inicio usa local-control para CTA y marco del video; el marco reparte las esquinas entre pantalla y controles. La hoja inmersiva redondea solo arriba con conversation-sheet; el editor usa local-control. Avatares circulares, indicador de agarre tipo cápsula y respuestas sin tarjetas individuales. Las cápsulas de la cabecera y radios generales heredados siguen vigentes.

## Components

- **Invitación:** logo oficial mediante BrandLogo, desde `src/assets/logos/ISOLOGO SOMOS MISIONES NACIONALES.png`, sin recorte. Video propio `/media/somos-mision-bienvenida.mp4` (35 s según public/media/README.md), portada del mismo video y subtítulos españoles incrustados según el usuario. El tiempo mostrado usa la duración real del archivo. Controles de reproducción, progreso y sonido; inicia silenciado, pausa fuera de vista/pestaña y respeta movimiento reducido al reproducir automáticamente. Ofrece enlace al archivo si falla.
- **Acciones del inicio:** «Unirme a la red», mínimo (54px), peso (800), hover home-gold-hover; acceso secundario subrayado (13px). Foco dorado (3px, desplazamiento 5px). Contador de `api.community.getStats()` con suscripción y refresco cada (30 s): solo indica «Actualización en vivo» conectado; distingue actualización automática, conexión inicial, reconexión y cifra no disponible. No fija como dato real la cifra de una captura.
- **Conversación:** nombre, «Tú» cuando corresponde, insignia o nivel y distrito cuando existe. Cuerpo completo con saltos y ajuste de palabras; fecha es-CO y Responder debajo; corazón alineado a la derecha, relleno y rosa al activar, con contador compacto y `aria-pressed`. Respuestas muestran mención y se pueden ocultar/expandir. Editor (mínimo 44px, máximo 500 caracteres), envío dorado desactivado vacío/ocupado; foco local (2px, desplazamiento 3px). Conserva carga, vacío, más comentarios y cancelación de respuesta.
- **Navegación:** cabecera pública fija con logo, Ver más, VIP, inicio de sesión y Unirme; a ≤760px conserva logo/Ver más/Unirme y oculta VIP/login. Sidebar de escritorio translúcido claro, ancho (260px; 68px contraído), activo azul; drawer móvil oscuro blue-800 (18rem), activo gold-500. Ambos conservan Noticias, Ranking, Misiones, perfil, Ver más y Comunidad VIP. La variante de escritorio empieza en el `lg` heredado de Tailwind (64rem).

## Do's and Don'ts

- Do conservar el logo suministrado, el español y los tokens heredados fuera de estas variantes locales.
- Do mantener el video completo y el orden móvil observado del inicio.
- Do conservar la jerarquía de respuestas, el cuerpo legible y una sola lista desplazable por conversación.
- Don't reemplazar la cifra conectada por números ilustrativos de capturas o snippets.
- Don't convertir la composición del hero o la superficie plana de comentarios en prohibiciones para toda la aplicación.
