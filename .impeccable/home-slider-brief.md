# Inicio: bienvenida en video

Refinamiento acotado del home público existente, modo Persuade. Se conserva la identidad navy/dorado, el video real, las rutas y el contador conectado. El usuario fija la composición: video primero, imagen provisional al finalizar, sin mapa ni marcas repetidas. No es una identidad nueva ni requiere un torneo de conceptos.

## Direction contract

THESIS: la invitación real abre la red; una sola marca institucional en el header.

OWN-WORLD: Inter heredada, navy y dorado, fondo claro, controles discretos y textura ilustrada de bienvenida sin águilas ni mapas.

STORY: ver el mensaje de bienvenida, descubrir la red de los 5.000 Amigos y unirse. El número de multiplicadores conserva su fuente real.

FIRST VIEWPORT: primera diapositiva solo video real a todo el ancho y controles superpuestos; sin titular ni CTA. Viewport 16:9 con máximo calc(100svh - 180px). Segunda diapositiva de bienvenida con únicamente el mensaje exacto en H1 y botones de unirse/iniciar sesión; 550px de alto en escritorio y 440px en móvil. Contador real y puntos compartidos fuera de ambas diapositivas. Queda sustituida la composición anterior de copy y video en columnas.

FORM: slider code-led definido por el usuario. Avanza una vez al terminar el video, permanece en bienvenida y permite volver manualmente. Transición lateral breve, anulada con movimiento reducido. Regiones con marca blanca opaca; publicaciones nacionales con BrandLogo oficial.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Copy vigente y cierre documental — 2026-09-25

La instrucción más reciente prevalece sobre cualquier formulación anterior: la primera diapositiva solo presenta video y controles, sin titular ni CTA. Solo la segunda dice, en H1, exactamente «Ser parte de la red de los 5000 es convertirse en un multiplicador virtual de misiones nacionales», junto a «Unirme a la red» e «Iniciar sesión». Sin titulares genéricos, subtextos ni créditos visibles anteriores. Contador real y puntos compartidos quedan fuera de ambas diapositivas. Es una decisión local del hero, no una nueva identidad global; se conserva el modo Persuade y la línea FINISH.

- Fuente actual: `src/components/landing/HomeHero.jsx` usa `heroMessage` únicamente en el H1 de bienvenida, con énfasis dorado en «multiplicador virtual». `home-hero.css`: video 16:9 con máximo `calc(100svh - 180px)`; bienvenida de 550px/440px. Video real primero, arte al finalizar, controles superpuestos y navegación compartida sobre un mismo escenario navy/dorado.
- Marca única en el header del home (`Landing.jsx`); BrandLogo nacional (`SocialPost.jsx`) y máscaras regionales blancas opacas (`src/index.css`).
- El contraste previo de `dist/assets/Landing-BvnewB3i.js` y `Landing-DBB_8s1U.css` corresponde a la versión anterior; no verifica el último ajuste. Los dos raster y su README con prompt estaban presentes en origen y `dist/media/welcome/`.
- Evidencia comunicada por el agente principal: 18 tests y build aprobados. La única observación del finish anterior era la unión de palabras del encabezado móvil; el nuevo texto reemplaza ese encabezado. No se repitió revisión visual: veredicto final pendiente del agente principal, sin declarar ship.
- DESIGN.md y `.impeccable/design.json` no se modifican. La obsolescencia preexistente del sidecar queda reportada, sin reparación ni rerun de contexto.
- Feed: recuperación mediante reproductor oficial embebido FB/IG cuando no hay MP4 en metadatos; detección de reels/share/v incluso con tipo imagen almacenado; preview con caché de 5 minutos y reintento. No garantiza acceso a medios privados. El agente principal sigue probando la reproducción; no se declara verificada.
