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
- El feed consulta la portada aun si había una imagen guardada, prioriza la portada actual, busca el segundo enlace cuando falta información y mantiene el respaldo original si la red no responde.
- Editor: detección al guardar, portada renovada y URL canónica conservada; no convierte fotos en videos sin evidencia. Conserva el título y la descripción editoriales.
- Archivos directos: controles nativos de reproducción, progreso, volumen y pantalla completa. Videos sin archivo directo: reproductor oficial incrustado, con acceso al original si la plataforma rechaza la incrustación. No se garantiza disponibilidad de contenidos restringidos por terceros.

Las correcciones de formato son reversibles desde el editor; no se aplicó ninguna migración ni borrado de base de datos.
