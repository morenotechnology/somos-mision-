-- Reset puntual para producción:
-- 1) Deja todas las misiones sin progreso inicial para usuarios nuevos.
-- 2) Elimina todas las publicaciones actuales.

update public.missions
set default_status = 'pending',
    default_progress = 0
where active = true;

delete from public.publications;

select setval(pg_get_serial_sequence('public.publications', 'id'), 1, false);
