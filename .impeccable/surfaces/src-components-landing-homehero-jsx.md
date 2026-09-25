---
version: 1
slug: "src-components-landing-homehero-jsx"
primary_target: "src/components/landing/HomeHero.jsx"
related_targets: ["src/components/landing/home-hero.css","src/pages/Landing.jsx","src/components/content/SocialPost.jsx","src/index.css"]
---

# Inicio: bienvenida en video

Refinamiento acotado del home público existente, modo Persuade. Se conserva la identidad navy/dorado, el video real, las rutas y el contador conectado. El usuario fija la composición: video primero, imagen provisional al finalizar, sin mapa ni marcas repetidas. No es una identidad nueva ni requiere un torneo de conceptos.

## Direction contract

THESIS: la invitación real abre la red; una sola marca institucional en el header.

OWN-WORLD: Inter heredada, navy y dorado, fondo claro, controles discretos y textura ilustrada de bienvenida sin águilas ni mapas.

STORY: ver el mensaje de bienvenida, descubrir la red de los 5.000 Amigos y unirse. El número de multiplicadores conserva su fuente real.

FIRST VIEWPORT: primera diapositiva exclusivamente con video real a todo el ancho y controles superpuestos, sin titular ni CTA. Viewport 16:9 con altura máxima calc(100svh - 180px). Segunda diapositiva con arte de bienvenida, únicamente el mensaje exacto en H1 y botones de unirse/iniciar sesión; altura de 550px en escritorio y 440px en móvil. Contador real y puntos de navegación compartidos fuera de ambas diapositivas. Esta instrucción sustituye la composición anterior de copy y video en columnas.

FORM: slider code-led definido por el usuario. Avanza una vez al terminar el video, permanece en bienvenida y permite volver manualmente. Transición lateral breve, anulada con movimiento reducido. Regiones con marca blanca opaca; publicaciones nacionales con BrandLogo oficial.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementación y evidencia — 2026-09-25

- Última instrucción: la primera diapositiva no contiene titular ni CTA, solo video y controles. La segunda contiene el único H1: «Ser parte de la red de los 5000 es convertirse en un multiplicador virtual de misiones nacionales», con énfasis dorado en «multiplicador virtual», y los botones «Unirme a la red» e «Iniciar sesión». Sin titulares genéricos, subtextos ni créditos visibles anteriores. Contador conectado a `api.community` y puntos de navegación fuera de ambas diapositivas.
- `HomeHero.jsx` y `home-hero.css`: escenario navy/dorado integrado, video real primero y arte provisional después de `onEnded`, controles superpuestos, retorno manual y movimiento reducido. `Landing.jsx` conserva una sola marca en el header del home y oculta la del footer en esa vista; `SocialPost.jsx` usa BrandLogo para publicaciones nacionales y `src/index.css` máscaras regionales blancas con opacidad 1.
- Contraste actual de fuente: `HomeHero.jsx` contiene el H1 solo en bienvenida y navegación compartida; `home-hero.css` establece `.is-video` en 16:9, máximo `calc(100svh - 180px)`, y `.is-welcome` en 550px/440px. El contraste previo de `Landing-BvnewB3i.js`/`Landing-DBB_8s1U.css` corresponde a la versión anterior, no verifica este último ajuste.
- Procedencia de los dos raster: `public/media/welcome/README.md` incluye prompt y tamaños de `red-amigos.jpg` y `red-amigos-mobile.jpg`; los tres archivos también existen en `dist/media/welcome/`.
- Evidencia del agente principal: 18 tests y build aprobados. La revisión anterior solo señaló palabras pegadas en el encabezado móvil; el nuevo copy reemplaza aquel encabezado. Veredicto final pendiente del agente principal, sin declarar publicación aprobada. DESIGN.md y `.impeccable/design.json` permanecen intactos; sidecar obsoleto preexistente reportado, no reparado.
- Feed relacionado: recuperación con reproductor oficial embebido de Facebook/Instagram si los metadatos no ofrecen MP4; detección de reels y share/v aunque el tipo almacenado sea imagen, caché de preview de 5 minutos y reintento. No garantiza medios privados. Reproducción aún en pruebas por el agente principal; no se declara verificada.
