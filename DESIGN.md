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
  campaign-5000-ocean: "#082542"
  campaign-5000-gold: "#ffcf51"
  campaign-5000-text: "#f8fafc"
  campaign-5000-copy: "#cedcf3"
  campaign-5000-label: "#dfebfa"
  campaign-5000-white: "#fff"
  campaign-5000-ink: "#052744"
  campaign-5000-film: "#04121d"
  campaign-5000-menu: "#092a48"
  campaign-5000-live: "#42e787"
  campaign-5000-offline: "#b3c5d9"
  campaign-5000-secondary: "#bfd4ed06"
typography:
  body: { fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", lineHeight: 1.5 }
  display: { fontSize: "clamp(48px, 5.3vw, 76px)", fontWeight: 900, lineHeight: 0.99, letterSpacing: "-.035em" }
  display-mobile: { fontSize: "clamp(42px, 11vw, 58px)", fontWeight: 900, lineHeight: 1.02, letterSpacing: "-.035em" }
  comment-body: { fontSize: "15px", fontWeight: 450, lineHeight: 1.48 }
  reply-body: { fontSize: "14px", fontWeight: 450, lineHeight: 1.48 }
  title: { fontSize: "13px", fontWeight: 700 }
  label: { fontSize: "10px" }
  campaign-5000-body: { fontFamily: "'Campaign Sans', sans-serif", fontWeight: 400 }
  campaign-5000-display: { fontFamily: "'Campaign Display', sans-serif", fontSize: "14.3cqw", fontWeight: 400, lineHeight: 0.94, letterSpacing: "-.035em" }
  campaign-5000-invitation: { fontFamily: "'Campaign Sans', sans-serif", fontSize: "4.25cqw", lineHeight: 1.25, letterSpacing: "-.025em" }
  campaign-5000-invitation-mobile: { fontFamily: "'Campaign Sans', sans-serif", fontSize: "max(14px, 4.25cqw)", lineHeight: 1.25, letterSpacing: "-.025em" }
  campaign-5000-story: { fontFamily: "'Campaign Sans', sans-serif", fontSize: "5.2cqw", fontWeight: 700, lineHeight: 1.22 }
rounded:
  r-sm: "10px"
  r: "16px"
  r-xl: "24px"
  local-control: "12px"
  conversation-sheet: "18px 18px 0 0"
  campaign-5000-pill: "999px"
  campaign-5000-film: "4cqw"
  campaign-5000-band: "4.8cqw"
  campaign-5000-menu: "16px"
components:
  home-join: { backgroundColor: "{colors.home-gold}", textColor: "{colors.home-navy}", rounded: "{rounded.local-control}", padding: "0 24px" }
  home-join-hover: { backgroundColor: "{colors.home-gold-hover}" }
  comment-field: { backgroundColor: "{colors.conversation-field}", textColor: "{colors.conversation-body}", rounded: "{rounded.local-control}", padding: "11px 14px" }
  comment-sheet: { backgroundColor: "{colors.conversation-background}", textColor: "{colors.conversation-body}", rounded: "{rounded.conversation-sheet}" }
  campaign-5000-join: { textColor: "{colors.campaign-5000-ink}", rounded: "{rounded.campaign-5000-pill}", width: "100%" }
  campaign-5000-learn: { backgroundColor: "{colors.campaign-5000-secondary}", textColor: "{colors.campaign-5000-white}", rounded: "{rounded.campaign-5000-pill}", width: "100%" }
  campaign-5000-menu: { backgroundColor: "{colors.campaign-5000-menu}", textColor: "{colors.campaign-5000-white}", rounded: "{rounded.campaign-5000-menu}", padding: "12px" }
---

# Design System: Misiones Nacionales Colombia

## Overview

Actualización acotada 2026-09-25: campaign-5000 es el reemplazo visual aprobado únicamente para el home público y su cabecera, según «haz esto, tal cual, genera los assets necesarios» y `.impeccable/mocks/reference-5000/approved.png`. Sus tokens llevan el prefijo campaign-5000-. Los tokens y textos anteriores se conservan como sistema heredado: las descripciones del antiguo home son históricas y quedan sustituidas solo en esta superficie; comentarios, navegación y demás rutas no cambian. No se repara drift ajeno preexistente. El contrato actual está en `.impeccable/surfaces/src-components-landing-homehero-jsx.md`.

### Registro heredado conservado

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

### Variante local campaign-5000

La paleta campaign-5000 usa ocean como fondo, gold para acciones/foco, text y white para jerarquía principal, copy para la invitación y label para comunidad. Film y menu separan reproductor y navegación. Live solo señala conexión confirmada; offline no simula actividad. El CTA tiene un degradado real (linear-gradient(105deg, #fbd369, #ffca49 55%, #fbd369)), no un nuevo color global. Los valores home-* anteriores son legado, no los colores actuales de esta campaña.

## Typography

Inter y sus alternativas de sistema se heredan de src/index.css. El título del hero usa display/display-mobile. Su descripción mide (17px, interlineado 1.6, máximo 34ch), y en móvil (15px, 1.5, 40ch). Los comentarios usan comment-body y las respuestas reply-body, sin truncamiento; title corresponde al autor y label a nivel/insignia y distrito. Fecha (11px), Responder (12px, peso 600) y cifras tabulares completan la jerarquía. No se deduce una escala tipográfica nueva.

### Variante local campaign-5000

Campaign Display es Archivo Black 400, autoalojada en `public/fonts/campaign-5000/archivo-black.ttf`; su peso de archivo es 400 pese al trazo pesado. Campaign Sans es Work Sans 400/700, desde `work-sans-regular.ttf` y `work-sans-bold.ttf` (el CSS declara este último para 600–900). Todas usan font-display swap. El H1 utiliza campaign-5000-display; la invitación tiene la variante móvil a ≤760px. No se hereda Inter para el hero/cabecera ni se usan Roboto o Allura aquí.

La firma «Somos Misión Colombia» es `public/media/campaign-5000/signature.jpg`, no una fuente: JPEG negro opaco integrado mediante mix-blend-mode screen, ancho 22%, proporción 176/133, imagen al 138% y traslación (-14%, -14%). Los intentos alfa se descartaron; no afirmar transparencia real. Licencias y prompts: `public/media/campaign-5000/README.md` y los OFL del directorio de fuentes.

## Layout

Hero de escritorio: grid `minmax(250px, .8fr) minmax(0, 1.65fr)`, separación `clamp(28px, 4vw, 64px)`; texto/CTA a la izquierda y video en aproximadamente dos tercios del ancho de columnas. Padding superior (124px), laterales `max(28px, calc((100vw - 1280px) / 2))`; video 16:9 con `object-fit: contain`. A ≤760px: padding (90px 20px 22px), título/descripción → video → unirse/iniciar sesión → contador real → conocer la misión. El botón de unión ocupa todo el ancho.

Comentarios inmersivos: hoja inferior `height: min(80%, 650px)`, máximo (86%), mínimo heredado (280px; 260px a ≤760px), laterales (20px; 16px a ≤760px). Solo la lista desplaza la conversación: flex creciente, `min-height: 0`, `overflow-y: auto`, `overscroll-behavior: contain`; cabecera y compositor quedan fuera. El textarea puede crecer hasta (90px). En modo no inmersivo, la lista conserva el máximo heredado (240px). Respuestas indentadas (50px; 30px a ≤400px), avatares raíz/respuesta (38/28px; 32/25px a ≤400px).

### Variante local campaign-5000

Fuente: `src/components/landing/home-hero.css`. Columna centrada al 87%, máximo 818px, container-type inline-size; cqw usa ese ancho. Padding superior clamp(92px, 15.5vw, 146px). Cabecera absoluta al 87%, máximo 818px, top clamp(16px, 4.3vw, 40px); marca y menú se ajustan en Y con clamp(-8px, -.85vw, -3px) y clamp(-13px, -1.4vw, -5px). A ≥1100px la cabecera permite 1080px, el cuerpo mantiene 818px y padding superior 155px.

Orden local: preludio/firma → lema/H1/invitación → carrusel 16:9 → banda grid 1fr .9fr → acciones apiladas → indicadores/noticias → cierre. Video object-fit contain. Acciones separadas 2.4cqw, mínimo 10.5cqw. A ≤760px: botones inferiores del video 44×44px, seek en fila propia de 24px de alto; invitación mínima 14px, CTA mínimo 44px, banda mínima 76px. A ≤360px los puntos y la nota ocupan filas separadas y desaparece el salto forzado de invitación. Fondo de mapa/papel/montañas al 100% × 100%; no es un footer de producto. `src/index.css` desactiva scroll snap solo en `html:has(.ln-home-main)`.

## Elevation & Depth

Hero y mensajes son superficies planas. La hoja inmersiva conserva la sombra estructural heredada `0 -18px 40px rgba(0,0,0,0.26)` y un fondo exterior desenfocado (3px); «plano» no significa eliminar estas capas. La cabecera pública y el sidebar de escritorio conservan transparencia, desenfoque y sombras existentes; no se establece una prohibición global de efectos.

### Variante local campaign-5000

Capas atmosféricas observadas, no una regla plana global: banda con linear-gradient(110deg, #07335365, #bfd4ed09) y sombra inset 0 1px 10px #d0e9ff06; menú con 0 18px 48px #00122666. Los controles del video usan linear-gradient(transparent, #03101dbf 65%, #030b12e6). La firma depende de screen sobre el fondo oscuro; el JPEG no sirve como recorte alfa universal.

## Shapes

El inicio usa local-control para CTA y marco del video; el marco reparte las esquinas entre pantalla y controles. La hoja inmersiva redondea solo arriba con conversation-sheet; el editor usa local-control. Avatares circulares, indicador de agarre tipo cápsula y respuestas sin tarjetas individuales. Las cápsulas de la cabecera y radios generales heredados siguen vigentes.

### Variante local campaign-5000

Los radios campaign-5000-pill, film, band y menu pertenecen solo a esta campaña. El marco de video tiene borde 2px #c2d6e575; la banda, 2px #6986a024 (1px móvil); Iniciar sesión, 2px #93acc59c. Play e indicadores son circulares. Los puntos tienen área clamp(44px, 6cqw, 52px), separada de su círculo visual. No reemplazar los radios heredados de otras superficies.

## Components

- **Invitación:** logo oficial mediante BrandLogo, desde `src/assets/logos/ISOLOGO SOMOS MISIONES NACIONALES.png`, sin recorte. Video propio `/media/somos-mision-bienvenida.mp4` (35 s según public/media/README.md), portada del mismo video y subtítulos españoles incrustados según el usuario. El tiempo mostrado usa la duración real del archivo. Controles de reproducción, progreso y sonido; inicia silenciado, pausa fuera de vista/pestaña y respeta movimiento reducido al reproducir automáticamente. Ofrece enlace al archivo si falla.
- **Acciones del inicio:** «Unirme a la red», mínimo (54px), peso (800), hover home-gold-hover; acceso secundario subrayado (13px). Foco dorado (3px, desplazamiento 5px). Contador de `api.community.getStats()` con suscripción y refresco cada (30 s): solo indica «Actualización en vivo» conectado; distingue actualización automática, conexión inicial, reconexión y cifra no disponible. No fija como dato real la cifra de una captura.
- **Conversación:** nombre, «Tú» cuando corresponde, insignia o nivel y distrito cuando existe. Cuerpo completo con saltos y ajuste de palabras; fecha es-CO y Responder debajo; corazón alineado a la derecha, relleno y rosa al activar, con contador compacto y `aria-pressed`. Respuestas muestran mención y se pueden ocultar/expandir. Editor (mínimo 44px, máximo 500 caracteres), envío dorado desactivado vacío/ocupado; foco local (2px, desplazamiento 3px). Conserva carga, vacío, más comentarios y cancelación de respuesta.
- **Navegación:** cabecera pública fija con logo, Ver más, VIP, inicio de sesión y Unirme; a ≤760px conserva logo/Ver más/Unirme y oculta VIP/login. Sidebar de escritorio translúcido claro, ancho (260px; 68px contraído), activo azul; drawer móvil oscuro blue-800 (18rem), activo gold-500. Ambos conservan Noticias, Ranking, Misiones, perfil, Ver más y Comunidad VIP. La variante de escritorio empieza en el `lg` heredado de Tailwind (64rem).

### Variante local campaign-5000

- **Cabecera:** `CampaignHeader.jsx`, emblema claro `brand-mark-small.png` derivado del oficial, texto Misiones Colombia y menú en todos los tamaños. Filas mínimas de 48px. Escape cierra y devuelve foco; también cierra al pulsar fuera o elegir. Login → /login, Unirme ahora → /register, Ver más → /saber-mas; WhatsApp conserva el grupo existente.
- **Video y carrusel:** `HomeHero.jsx` conserva el MP4 auténtico y su fotograma a los 18 s como poster. Preload metadata, sin autoplay ni loop; primer play por gesto con sonido, después respeta mute. Etiqueta central dinámica con/sin sonido. Pausa con pestaña oculta, intersección <.2 y cambio de panel. Fin → segundo panel. Tres puntos, swipe y flechas del teclado; paneles inactivos inert/aria-hidden. Foco dentro del panel saliente pasa al indicador entrante; estado polite. Seek mantiene sus propias flechas; tiempo real, no duración fija.
- **Acciones y estados:** CTA con degradado del apartado Colors, borde 1px #ffe09e, peso 700; hover brightness(1.07)/translateY(-2px). Iniciar sesión abre /login y usa campaign-5000-secondary y hover #e5efff12. Foco 3px campaign-5000-gold con offset 5px. Track .6s cubic-bezier(.22, 1, .36, 1); transiciones anuladas con movimiento reducido.
- **Dato real:** api.community.getStats(), suscripción opcional y refresco 30 s, sin consultas estando oculta. activeMultipliers en es-CO, guion si falta; estados conectando, automática, en vivo solo conectado sin error, o cifra no disponible. No copiar 314 de la referencia.
- **Integración y evidencia:** solo la rama previewOnly de `Landing.jsx`; otras rutas conservan la base. README de assets conserva prompts y originales. Los 20 tests/build y cinco viewports reportados corresponden al pase anterior al lote correctivo; no se atribuyen automáticamente al nuevo lote. Según el cierre comunicado por el agente principal, la segunda revisión resolvió cabecera/móvil/foco/ARIA y dejó tipografía/firma parciales, sin bloqueo funcional. Por orden explícita del usuario se desplegó: Vercel success, commit `a1895e1be0cd7bac88b3cb0ae3dae844dbac6091`, estado reportado y no comprobado independientemente en este pase documental. No equivale a aprobación visual total ni a un gate de alfa aprobado.

## Do's and Don'ts

- Do conservar el logo suministrado, el español y los tokens heredados fuera de estas variantes locales.
- Do mantener el video completo y el orden móvil observado del inicio.
- Do conservar la jerarquía de respuestas, el cuerpo legible y una sola lista desplazable por conversación.
- Don't reemplazar la cifra conectada por números ilustrativos de capturas o snippets.
- Don't convertir la composición del hero o la superficie plana de comentarios en prohibiciones para toda la aplicación.

### Variante local campaign-5000

- Do aplicar campaign-5000 solo al home público y su cabecera; mantener el video auténtico, el contador conectado y las rutas existentes.
- Do mantener Archivo Black/Work Sans autoalojadas y documentar la firma JPEG/screen como tal, sin fingir alfa.
- Don't imponer la composición de campaña, sus fuentes o su paleta a otras rutas.
- Don't convertir capturas, evidencia anterior o un estado local en un pase de revisión, una cifra real fija o prueba de despliegue.
