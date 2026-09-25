---
version: 1
slug: "src-pages-missions-jsx"
primary_target: "src/pages/Missions.jsx"
related_targets: ["src/pages/weekly-missions.css", "src/components/missions/MissionCard.jsx", "src/components/common/BadgeEmblem.jsx", "src/components/common/badge-emblem.css", "src/pages/Profile.jsx"]
---

# Misiones semanales sencillas

Modo Operate. Extensión de la interfaz clara existente, no una identidad nueva.

## Direction contract

THESIS: elegir una coordinación y compartir una sola publicación, sin categorías diarias o especiales ni métricas repetidas.

OWN-WORLD: fondo claro, texto navy, filas separadas por una línea, enlaces de acción accesibles, emblemas vectoriales navy/dorado. Bloqueados en gris con candado.

STORY: entender la acción, ir directamente a publicaciones de esa coordinación y volver para ver progreso real. Semana de lunes a domingo en Colombia; solo se ofrecen coordinaciones con publicaciones activas.

FIRST VIEWPORT: título y explicación breve; fecha de semana y progreso; filas de coordinaciones con recompensa existente de 140 XP y botón Ver publicaciones. En móvil cada enlace queda debajo del texto, no lo comprime. La colección de insignias queda después de las misiones y se comparte con Perfil.

FORM: lista de acciones code-led dentro del shell actual. Sin tarjetas anidadas ni pestañas; los premios previos se conservan. Ocho motivos geométricos personalizados sin generación de raster.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementación y evidencia — 2026-09-25

- `Missions.jsx` presenta solo misiones semanales: compartir una publicación de la coordinación elegida, sin categorías diarias/especiales. `MissionCard.jsx` enlaza directamente a `/noticias?coordinacion=…`; el catálogo solo ofrece coordinaciones con publicaciones activas.
- `supabase/weekly_missions_20260924.sql` calcula en servidor el período desde el lunes a las 00:00 en `America/Bogota`, conserva completados históricos y recompensas existentes de 140 XP, y distingue las nuevas semanas por período. `src/utils/missionWeek.js` evita que IDs históricos completen una semana nueva; `supabaseAdapter.js` consulta `get_weekly_missions`. El refresco de la interfaz no sustituye el cálculo del servidor.
- `BadgeEmblem.jsx` define ocho motivos SVG propios (Sprout, Zap, Medal, Megaphone, Globe, Flame, Sparkles, Crown), compartidos por Misiones y Perfil. `badge-emblem.css` representa bloqueados en gris con candado; no se generaron raster para insignias.
- Contraste estático del build existente: `dist/assets/Missions-CK-wIstl.js` contiene «Misiones semanales» y el filtro `coordinacion=`; `BadgeEmblem-COMIWqGy.js` y `BadgeEmblem-BoACkxcz.css` contienen el estado `is-locked`. Fuentes adicionales: `src/pages/Profile.jsx`, `supabase/weekly_missions_20260924.verify.sql` y `supabase/weekly_missions_20260924.md`.
- Evidencia del agente principal, no verificación independiente de BD en esta pasada: SQL de producción probado con rollback PASS y luego aplicado, 6 completados históricos preservados y 4 misiones disponibles; 18 tests y build aprobados. Veredicto final pendiente del agente principal.
- Se conserva el modo Operate y el contrato local. DESIGN.md y `.impeccable/design.json` intactos; sidecar obsoleto preexistente reportado solamente.
- Feed de destino: recuperación con reproductor oficial embebido Facebook/Instagram cuando los metadatos no incluyen MP4; detección de reels/share/v aunque estén almacenados como imagen; caché de preview de 5 minutos y reintento (`src/utils/socialPreview.js`). No garantiza medios privados; reproducción pendiente de pruebas del agente principal.
- Cambio relacionado de home, sin alterar este contrato Operate: primera diapositiva solo video a todo el ancho y controles, sin titular/CTA (16:9, máximo `calc(100svh - 180px)`); segunda de 550px/440px con el H1 exacto y unirse/iniciar sesión. Contador y puntos compartidos fuera de ambas; copy normativo en `.impeccable/home-slider-brief.md`.
