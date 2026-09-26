---
version: 1
slug: "src-components-landing-homehero-jsx"
primary_target: "src/components/landing/HomeHero.jsx"
related_targets: ["src/components/landing/home-hero.css","src/components/landing/CampaignHeader.jsx","src/pages/Landing.jsx"]
---

# Home — campaña 5000 Amigos

## Direction contract — vigente 2026-09-25

Modo: Persuade. La instrucción aprobada «haz esto, tal cual, genera los assets necesarios» fija `.impeccable/mocks/reference-5000/approved.png` como referencia. Es un reemplazo del mundo visual del home público, no una identidad nueva para todo el producto. Este contrato sustituye los anteriores de video exclusivo y bienvenida provisional; no requiere otro sondeo de conceptos.

THESIS: hacer tangible la invitación a la misión mediante una campaña colombiana, el video auténtico y la comunidad conectada.

OWN-WORLD: azul oceánico texturado con mapa tonal, titular blanco de trazo pesado, dorado, banda estadística translúcida, firma artística y cierre de papel rasgado con montañas grises. Archivo Black y Work Sans son locales a esta variante.

STORY: comprender 5000 Amigos, ver la invitación, reconocer la comunidad real y unirse o saber más.

FIRST VIEWPORT: cabecera transparente con emblema claro, Misiones Colombia y menú; línea de unidad y firma; lema dorado, H1 «5000 AMIGOS», invitación; carrusel 16:9; banda de comunidad; dos acciones apiladas; tres indicadores y nota de noticias; cierre «Más iglesias / Más misioneros / Más naciones». Es una composición vertical adaptable, no una promesa de que todo quepa en una pantalla móvil.

FORM: tres diapositivas funcionales. Titular, contador y acciones permanecen fuera de los paneles. Video inicial detenido, sonido habilitado y reproducción solo por gesto. Fin del video → segunda diapositiva; sin rotación temporizada.

FINISH: documentar la fuente implementada y su procedencia no equivale a un pase visual completo. Según el cierre comunicado por el agente principal, la segunda revisión resolvió cabecera, móvil, foco y ARIA; tipografía y firma quedaron parciales, sin bloqueo funcional. La orden explícita del usuario priorizó desplegar. No se registra un gate aprobado ficticio.

## Alcance e integración

- Autoridad actual: `src/components/landing/HomeHero.jsx`, `home-hero.css`, `CampaignHeader.jsx` y la rama `previewOnly` de `src/pages/Landing.jsx`. `src/App.jsx` sirve esta rama en `/` para visitantes; usuarios autenticados van a `/noticias`.
- `Landing.jsx` monta CampaignHeader → HomeHero → vista previa de noticias; oculta solo el emblema del footer mediante `hideMark={previewOnly}`. El hero recibe registro e inicio de sesión.
- Acciones grandes: «Unirme ahora» → `/register`; «Iniciar sesión» → `/login`. El menú conserva «Ver más» → `/saber-mas` y el acceso a iniciar sesión. La cabecera y el tercer panel enlazan al grupo WhatsApp existente definido por `communityUrl`, con nueva pestaña y `rel="noreferrer"`.
- La rama no-preview conserva Nav y las secciones informativas. No se extiende esta tipografía, paleta o composición a noticias, comentarios, regiones, sidebar u otras rutas. En `src/index.css`, `html:has(.ln-home-main)` desactiva el scroll snap del home; no es una prohibición global.
- DESIGN.md y `.impeccable/design.json` reciben únicamente el merge autorizado `campaign-5000-*`. Sus tokens anteriores permanecen: los del home viejo son legado, los del resto de la aplicación no cambian. El drift ajeno preexistente no se repara.

## Especificación local observada

### Tipografía y firma

Fuente CSS: `src/components/landing/home-hero.css`. Los archivos se sirven desde `public/fonts/campaign-5000/`, con `font-display: swap` y fallback sans-serif.

| Uso | Fuente y valor implementado |
| --- | --- |
| H1 | Archivo Black, alias «Campaign Display», archivo `archivo-black.ttf`, peso CSS 400, tamaño 14.3cqw, interlineado .94, tracking -.035em, sin salto |
| Cuerpo / cabecera | Work Sans, alias «Campaign Sans»: `work-sans-regular.ttf` (400) y `work-sans-bold.ttf` (archivo 700 declarado para 600–900) |
| Lema | 700, 3.8cqw / 1.3, tracking .23em, mayúsculas |
| Invitación | 4.25cqw / 1.25, tracking -.025em; a ≤760px: max(14px, 4.25cqw) |
| Paneles de relato | H2: 700, 5.2cqw / 1.22; énfasis dorado sin cursiva |
| Marca «Misiones» | clamp(23px, 4.6vw, 44px) / 1, tracking -.04em; «Colombia»: clamp(11px, 2.5vw, 24px) / 1.3, tracking .21em |

La firma ya no es Allura ni texto CSS: es `public/media/campaign-5000/signature.jpg`, con alt «Somos Misión Colombia». Contenedor de 22%, proporción 176/133, margen superior -.5cqw, overflow oculto y `mix-blend-mode: screen`; imagen al 138% y traslación (-14%, -14%). Roboto y Allura no son fuentes activas de esta variante. Licencias: `ArchivoBlack-OFL.txt` y `WorkSans-OFL.txt`.

### Paleta, profundidad y formas

- Base: #082542; texto principal #f8fafc; blanco de controles/cabecera #fff; acento y foco #ffcf51; invitación #cedcf3; etiquetas de comunidad #dfebfa.
- Video: #04121d; marco de carrusel #062640 con borde 2px #c2d6e575 y radio 4cqw. Paneles de relato: #092c49 con el mismo fondo de mapa.
- CTA principal: `linear-gradient(105deg, #fbd369, #ffca49 55%, #fbd369)`, texto #052744, borde 1px #ffe09e; hover brightness(1.07) y translateY(-2px). Secundario: #bfd4ed06, borde 2px #93acc59c, texto blanco, hover #e5efff12. Ambos son cápsulas de radio 999px.
- Banda de comunidad: `linear-gradient(110deg, #07335365, #bfd4ed09)`, borde 2px #6986a024, radio 4.8cqw, sombra interior `inset 0 1px 10px #d0e9ff06`; divisor #738eac80. Estado conectado #42e787 con halo #42e7870d; desconectado #b3c5d9.
- Menú: #092a48, borde 1px #7897b7, radio 16px, sombra `0 18px 48px #00122666`; filas de radio 8px, hover #ffffff12.
- Reproductor: controles superpuestos con degradado transparente → #03101dbf al 65% → #030b12e6; play circular #061c31b8, borde #deecf3bb, hover #082d4bea y escala 1.04. Foco de botones, enlaces e input: 3px #ffcf51, offset 5px; desactivados con opacidad .5.
- Fondo, papel rasgado y montañas pertenecen a `blue-world.jpg`, no a un footer nuevo ni a una captura de UI publicada.

### Geometría y adaptación

`cqw` se refiere al contenedor `campaign-body`: ancho 87%, máximo 818px, centrado, `container-type: inline-size`, padding superior clamp(92px, 15.5vw, 146px). Fondo del hero centrado, 100% × 100%, sin repetir; padding inferior 3.8%. No hay layout de copy/video en dos columnas ni alturas antiguas de 550/440px.

Cabecera absoluta, no fija: ancho 87%, máximo 818px, top clamp(16px, 4.3vw, 40px), z-index 50. Emblema clamp(48px, 10.2vw, 96px). La alineación revisada desplaza la marca en Y clamp(-8px, -.85vw, -3px) y el menú clamp(-13px, -1.4vw, -5px). Menú desplegable: ancho min(310px, 100%), top calc(100% + 12px), padding 12px; filas de mínimo 48px.

Preludio de 15.2cqw; carrusel 16:9 con overflow oculto y `touch-action: pan-y`. Track flex al 300%, paneles al 33.333333%; desplazamiento lateral de .6s con cubic-bezier(.22, 1, .36, 1). Video siempre completo con `object-fit: contain`. Banda en grid 1fr .9fr, mínimo 18cqw y margen superior 2.8cqw. Acciones apiladas, gap 2.4cqw, margen superior 2.8cqw y mínimo 10.5cqw. Indicadores con área clamp(44px, 6cqw, 52px).

- A ≤760px: botones inferiores de video exactamente 44×44px; grid `44px minmax(0, 1fr) 44px 44px`, gap 0 4px, padding 16px 6px 0. Seek en fila propia a todo el ancho, altura 24px (no 44px); tiempo de 12px. Play central al 42%, diámetro 16cqw. Banda mínima 76px; número mínimo 22px y etiquetas mínimas 11px. CTA mínimo 44px, texto principal mínimo 16px y secundario mínimo 14px.
- A ≤360px, incluido 320px: indicadores y nota de noticias en filas separadas; nota estática, 9px / 1.35, guion oculto; cierre con margen superior 10cqw. Se elimina el salto forzado de la invitación.
- A ≥1100px: cabecera máxima 1080px, cuerpo mantiene 818px y padding superior 155px; padding inferior del hero 34px.
- Movimiento reducido: transiciones del hero y sus pseudo-elementos anuladas; no activa reproducción automática.

## Comportamiento y datos

1. **Video auténtico:** `/media/somos-mision-bienvenida.mp4`, poster `/media/campaign-5000/welcome-film.jpg`, `playsInline`, `preload="metadata"`, sin autoplay ni loop. Estado inicial detenido y no silenciado. Play solo desde botones; si terminó, reinicia a cero. Si el usuario lo silenció, se conserva esa elección: el nombre accesible central cambia entre «con sonido» y «sin sonido». Tiempo y duración proceden del medio; antes de metadata se muestra —:—, no una duración inventada.
2. **Pausas y controles:** pausa con pestaña oculta, intersección inferior a .2, cambio de panel o desmontaje; no reanuda por volver a estar visible. Seek de paso .1 s; volumen sincronizado por `onVolumeChange`. Pantalla completa sobre el contenedor, con alternativa WebKit sobre el video. Errores muestran estado y enlace «Abrir video» al MP4 real.
3. **Tres paneles:** video; «Tu lugar en la misión» con H2 «Ser parte de la red de los 5000 es convertirse en un multiplicador virtual de misiones nacionales»; «La misión también se comparte.» con acceso WhatsApp. Al terminar el video selecciona el segundo, sin avance temporizado posterior. El único H1 «5000 AMIGOS» está fuera del carrusel.
4. **Navegación accesible:** tres puntos con nombre y `aria-pressed`; flechas izquierda/derecha del teclado dentro de la región, sin interceptar el input de seek; swipe horizontal >50px y mayor que dos veces el desplazamiento vertical, excluyendo gestos iniciados en botones, enlaces o inputs. Selección circular; no hay botones visibles de flecha anterior/siguiente. Paneles inactivos con `aria-hidden` e `inert`. Si el foco estaba dentro del panel que se oculta, pasa al indicador de destino con preventScroll, también al terminar el video. Estado «Diapositiva N de 3» anunciado de forma polite.
5. **Comunidad real:** `api.community.getStats()` y `api.community.subscribe` opcional; usa `activeMultipliers`, formato es-CO y guion cuando no es finito. Refresco cada 30 s, al volver a la pestaña y al conectar; no consulta estando oculta ni duplica consultas pendientes. «en vivo» solo con conexión y sin error; otros estados: «conectando…», «automática», «Cifra no disponible». Un error puede conservar el último número recibido, pero no el estado en vivo. Nunca fijar 314, 259 ni la cifra de una captura.
6. **Menú:** botón con `aria-expanded`/`aria-controls`, nav oculto con `hidden`; cierra al elegir, pulsar fuera o Escape. Escape devuelve el foco al botón.

## Assets y evidencia de implementación

La procedencia y los prompts exactos están en `public/media/campaign-5000/README.md`: `blue-world.jpg` es un fondo generado sin UI; `brand-mark-small.png` es la variante clara generada desde el emblema oficial `src/assets/logos/ISOLOGO SOMOS MISIONES NACIONALES.png`; `welcome-film.jpg` es un fotograma auténtico a los 18 s del MP4, extraído con AVFoundation; `signature.jpg` es la firma generada sobre negro opaco. Los originales generados están identificados en ese README. No se sintetizó a la persona ni se sustituyó el video.

**Limitación de la firma / gate JPEG:** la firma servida no tiene transparencia alfa; el fondo negro se integra mediante screen. Los intentos de alfa se descartaron por residuos. No documentarla como PNG transparente ni registrar un pase manual falso de un gate que exija alfa; esa exigencia no la satisface este JPEG. Es una decisión de implementación local, no una regla de marca global.

**Estado de verificación y publicación:** el agente principal reportó antes del lote correctivo 20 tests y build aprobados, geometría en cinco viewports (941, 390, 1440, 320 y 818px) y comprobaciones de reproducción, seek, mute, menú y rutas. Ese resultado no certifica automáticamente el lote nuevo. Tras el «fix» se implementaron Archivo Black, firma JPEG, alineación, controles móviles, separación del cierre, gestión de foco, etiqueta dinámica y preload metadata. En la segunda revisión, según el cierre comunicado, cabecera/móvil/foco/ARIA quedaron resueltos; tipografía y firma quedaron parciales, sin bloqueo funcional. La orden explícita del usuario priorizó desplegar. El agente principal comunicó despliegue Vercel con estado success del commit `a1895e1be0cd7bac88b3cb0ae3dae844dbac6091`. Este pase documental no repite pruebas, no verifica el despliegue de forma independiente ni convierte ese success en aprobación total del diseño. No se dispone aquí de un resultado nuevo de la batería completa del lote correctivo.

Fuentes de comprobación: `src/components/landing/HomeHero.test.js` (estructura SSR; no prueba por sí sola interacción), `.impeccable/review/reference-5000/check.mjs` (geometría e interacción en navegador) y capturas `reference.png`, `mobile.png`, `desktop.png`, `small.png`, `user-818.png` y variantes `-full.png` del mismo directorio. Una captura no certifica la ejecución más reciente: la inspeccionada muestra duración aún pendiente, compatible con un estado previo a metadata, no con una duración fija.

Discrepancias documentales resueltas: quedan retirados de este brief el home sin titular, las dos diapositivas, Inter/Roboto/Allura como fuentes locales, el autoplay silenciado, el arte provisional y las alturas antiguas. Los relatos globales viejos se conservan etiquetados como legado mediante el merge acotado; no deben aplicarse sobre esta campaña.
