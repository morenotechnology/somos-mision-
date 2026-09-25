# Misiones semanales · 24 septiembre 2026

Proyecto: `somos-misioné` (`nthvztmrqhyaijulhinb`). Aplicado en producción antes del despliegue del frontend.

- Solo misiones semanales de compartir **una publicación de la coordinación exacta**. Se conservan los IDs y la recompensa existente de 140 XP.
- `get_weekly_missions()` ofrece únicamente coordinaciones con publicaciones activas: al aplicar, cuatro (Evangelismo, Evangelismo Carcelario, Misión Juvenil y Población Sorda, Ciega y Sordociega). Las demás aparecen cuando tengan contenido.
- Reinicio lunes 00:00, `America/Bogota`. La unicidad se aplica a misión, perfil y semana. La sincronización serializa por perfil y no duplica premios.
- La actividad debe existir en el servidor. El RPC manual también la comprueba; no se permite insertar completados desde el cliente ni ejecutar premios como anónimo.
- Se desactivó el catálogo anterior diario/especial, sin eliminar sus registros, XP ni insignias.

## Respaldo y verificación

`mission_migration_backup` conserva `missions_20260924`, `completions_20260924` y las definiciones originales de los dos RPC. El esquema y tablas no dan acceso a `public`, `anon` ni `authenticated`, y tienen RLS habilitado sin políticas públicas. Las seis finalizaciones previas se conservaron.

El archivo `.verify.sql` se ejecutó en la misma transacción de ensayo, reemplazando el `COMMIT` de la migración. Terminó en `ROLLBACK`: las acciones, puntos y finalizaciones de prueba **no persistieron**. Resultado: PASS para una acción, repetición sin duplicados, nueva semana, historial, rechazo sin compartir y acceso anónimo denegado. Después se ejecutó la migración sin las pruebas y se comprobó: 0 misiones diarias/especiales activas, 4 disponibles y 6 finalizaciones históricas (6 respaldadas).

No volver a ejecutar parches antiguos que reemplacen `sync_my_mission_progress` o la unicidad. Para recuperación, usar los respaldos desde una conexión administrativa; no eliminar las nuevas finalizaciones de semanas posteriores. El frontend anterior presupone finalizaciones vitalicias, por lo que una reversión de código debe coordinarse con la de estas funciones.
