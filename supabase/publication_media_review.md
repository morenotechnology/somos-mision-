# Revisión de medios de publicaciones

Se revisaron los 19 registros visibles en la gestión editorial de producción. Correcciones guardadas por la interfaz autorizada:

| ID | Publicación | Antes | Después |
|---|---|---|---|
| 17 | Chocó, llegó tu hora | imagen | video |
| 15 | Alta Guajira / EXPECODES | imagen | video |
| 10 | Video Instructivo / Red 5.000 amigos | imagen | video |
| 14 | Región Orinoquía | video | imagen |

Evidencia: enlaces originales `/share/v/` o `/reel/`; la lista editorial confirmó Video tras cada guardado. Orinoquía se comprobó en el post original: es una imagen pública, no un video. No se eliminaron publicaciones ni se alteraron permisos. Las publicaciones de Instagram con rutas `/p/` no se reclasificaron sin evidencia de video.

Recuperación de portada de id 22: imagen original pública copiada sin edición en `public/media/publication-covers/la-mision-nos-une.jpg`. El origen y el motivo constan en su README.

## Comportamiento del código

- `/api/social-preview` resuelve solo enlaces de redes permitidas; normaliza `web.facebook.com`, enlaces de Instagram con usuario, y elimina parámetros de seguimiento. No acepta URLs arbitrarias, credenciales ni destinos internos.
- Metadatos compartidos en caché durante 15 minutos, consultas simultáneas deduplicadas y 3 consultas máximas simultáneas en el cliente. El endpoint no solicita cookies del usuario ni claves privadas.
- Desde la corrección del 09/10, el feed presenta inmediatamente las portadas guardadas o archivadas. Solo consulta metadatos para videos y medios ausentes/fallidos cerca del viewport (400px); los originales introducidos por el editor tienen prioridad sobre un `source_url` derivado antiguo. No se mezclan imagen, video y permalink de enlaces distintos.
- Editor: detección al guardar, portada renovada y URL canónica conservada; no convierte fotos en videos sin evidencia. Conserva el título y la descripción editoriales.
- Archivos directos: `NativeVideoPlayer`, con reproducción, progreso/retroceso, sonido y pantalla completa propios. El feed y el editor no montan el reproductor de Facebook. Un archivo bloqueado conserva la portada, reintento y acceso al original; no se garantiza disponibilidad de contenidos restringidos por terceros.

Las correcciones de formato son reversibles desde el editor; no se aplicó ninguna migración ni borrado de base de datos.

## Incidencia de la publicación 29 · 09/10/2026

El original `https://web.facebook.com/share/p/18S89KZcun/` y su permalink numérico `1562744235879237` muestran imágenes. El registro estaba marcado como video. El home sustituía su portada guardada con un MP4 externo de 4441 segundos descubierto en la página por Microlink. La clasificación introducida en `ac5ba5e` permitía que cualquier `videoUrl` detectado convirtiera un post en video; `c7fcbdf` montaba automáticamente el reproductor de respaldo. La versión `4afd7bc` priorizaba la portada guardada y el video nativo con controles propios.

Corrección: fotos de Facebook solo leen Open Graph del post; redirects a login/home, IDs de publicación incompatibles y archivos de Facebook no verificados se rechazan. Un post fotográfico mal clasificado no activa `plugins/video.php`. El medio original de la publicación 29 se archivó sin edición y sirve como portada estable, enlazada exclusivamente a sus originales comprobados. La interfaz editorial evita conservar medios del enlace anterior al cambiar de URL. Esta corrección no modifica perfiles, permisos, puntos ni filas de publicaciones en la base de datos.

`PublicationMedia` comparte el mismo comportamiento en Noticias, editor y preview público: esqueleto accesible, reserva de espacio, carga próxima al viewport, controles propios, pausa fuera de pantalla, plazo de carga y reintento. Al recuperar conexión vuelve a cargar el medio y conserva la posición del video cuando es posible. Las imágenes y los archivos de video usan sus proporciones originales, sin max-height, recorte o altura de pantalla. La segunda invitación pública bloqueada conserva su efecto de vista previa.

La petición anterior podía encadenar dos consultas de 12s y un timeout de cliente de 27s por enlace. El cliente limita a 18s y conserva la cola de 3 y la caché de resultados válidos. Facebook intenta primero obtener el MP4 del VideoConfig del reproductor público, con presupuesto total de 6s y sin cookies ni ejecutar scripts. Los enlaces compartidos solo siguen redirects de Facebook. Se comprueba el `video_id` exacto; no se compara `xpv_asset_id` con el ID del post, porque son identificadores distintos. Si no hay archivo, el lector de metadatos tiene consultas de 8s; los errores no se guardan como medios válidos.

Verificación de esta petición: el video de la captura, publicación 26 / `1143327601562691`, devolvió MP4 HTTP 206 y se reprodujo con controles propios y cero iframes en navegador local. Su marco móvil midió exactamente lo mismo que el video (354 × 199,125), sin el bloque negro inferior. Pausa, retroceso y sonido comprobados. El video de Chocó / `1210710887884576` también devolvió MP4 verificado con proporción 576:1024. La resolución de ambos enlaces compartidos tardó menos de 1s en el entorno local; no se presenta esto como un SLA de producción. Facebook puede cambiar este formato público o retirar contenido; no se promete reproducción permanente de archivos externos.

Auditoría ampliada de enlaces públicos: los IDs 26, 19, 17, 13, 12 y 10 recuperaron archivo de Facebook. El ID 15 (Alta Guajira) entregó portada pero no MP4. El reel de Instagram del ID 4 también entregó solo portada; los otros reels no se atribuyen a la prueba de Facebook. El editor permite guardar un enlace HTTPS a MP4/WebM original en `media_url`, sin migración; los registros existentes conservan sus originales y no se modificaron durante las pruebas. Si hay una segunda red enlazada, un video inaccesible puede probar esa fuente completa, sin combinar su video con la portada de otra publicación.

## Portadas recortadas y caducadas · 10/10/2026

La captura corresponde al ID 25. Su `<img>` tenía `object-fit: contain`, ancho/alto automáticos, sin `max-height` ni transformación: el recorte estaba dentro del archivo recibido. La URL guardada contenía `stp=c230.0.691.691a_dst-jpg_e35_s640x640`; su imagen natural era 640×640 aunque el original del post es vertical. Los IDs 28 y 24 también usaban miniaturas cuadradas con `stp=c…`; el ID 27 tenía imagen caducada. No se cambiaron las proporciones del feed ni el reproductor propio.

Se recuperaron originales sin recorte y se comprobaron los 16 registros actuales de imagen/carrusel: todos tienen copia local, enlazada por original verificado (no por ID de publicación). Distrito 8 y dos posts de Instagram se recuperaron desde sus imágenes visibles tras confirmar la publicación y el adjunto; no se usaron fotos sugeridas ni se transmitieron cookies al servidor. La procedencia está en el README de portadas.

Para nuevas publicaciones, `facebookPhoto.js` lee solo el adjunto del post público o su Open Graph, sin ejecutar JavaScript. `social-cover` sirve imágenes desde nuestra web con caché de bytes, valida el host de medios, tamaño máximo de 6 MiB, MIME de imagen, rechaza SVG/HTML y redirects y no acepta direcciones internas. Nunca usa miniaturas con recorte `stp=c…`. Esto evita depender en el navegador de enlaces firmados caducados o bloqueos de hotlink. Las imágenes del feed mantienen su tamaño natural y se consultan cerca del viewport; los originales manuales y los videos siguen conservándose.

No se aplicaron migraciones, actualizaciones de publicaciones ni cambios de permisos/puntos. No se garantiza disponibilidad perpetua de futuros posts que una red retire o restrinja; los originales actuales permanecen guardados en el proyecto.
