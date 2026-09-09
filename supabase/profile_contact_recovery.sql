-- Recupera exclusivamente datos que la persona ya proporcionó al registrarse.
-- No altera roles, permisos, contraseñas, puntos ni fechas de registro.
-- El respaldo queda dentro de la base, protegido por RLS y sin acceso público.
begin;

-- Run only after deploying profile_private_access.sql and its frontend.
-- Public social/profile fields remain readable for ranking and comments;
-- private contact fields are owner/admin-only through the protected RPCs.
revoke select on public.profiles from public, anon, authenticated;
revoke select (email, celular, whatsapp, fecha_cumpleanos) on public.profiles from public, anon, authenticated;
grant select (
  id, nombre, nombre_completo, rol, region_id, district_id, congregacion_id,
  congregacion, cargo, avatar, avatar_color, avatar_url, foto_perfil_url,
  foto_portada_url, cuenta_activa, xp, level, streak, mostrar_celular,
  mostrar_cumpleanos, mostrar_congregacion, mostrar_email, mostrar_distrito,
  created_at, updated_at, last_streak_date, can_publish, tiene_cargo,
  usuario_redes, perfil_completo, email_gate_verified_at
) on public.profiles to authenticated;

create table if not exists public.profile_contact_backup_20260909 (
  id uuid primary key,
  profile_data jsonb not null,
  backed_up_at timestamptz not null default now()
);
alter table public.profile_contact_backup_20260909 enable row level security;
revoke all on public.profile_contact_backup_20260909 from public, anon, authenticated;

insert into public.profile_contact_backup_20260909 (id, profile_data)
select id, to_jsonb(p) from public.profiles p
on conflict (id) do nothing;

create temporary table profile_contact_before on commit drop as
select id, rol, can_publish, xp, created_at from public.profiles;

with source as (
  select p.id,
    coalesce(nullif(btrim(p.whatsapp), ''), nullif(btrim(p.celular), ''),
      nullif(btrim(u.raw_user_meta_data->>'whatsapp'), ''),
      nullif(btrim(u.raw_user_meta_data->>'celular'), '')) as whatsapp,
    coalesce(nullif(btrim(p.celular), ''), nullif(btrim(p.whatsapp), ''),
      nullif(btrim(u.raw_user_meta_data->>'celular'), ''),
      nullif(btrim(u.raw_user_meta_data->>'whatsapp'), '')) as celular,
    coalesce(p.district_id, d.id, current_church.district_id) as district_id,
    coalesce(p.region_id, current_district.region_id, d.region_id, r.id,
      current_church.region_id) as region_id,
    coalesce(p.congregacion_id, registered_church.id) as congregacion_id,
    coalesce(
      case when lower(btrim(coalesce(p.congregacion,''))) not in
        ('', 'sin congregación', 'sin congregacion', 'sin registrar')
        then p.congregacion end,
      nullif(btrim(current_church.nombre), ''),
      nullif(btrim(u.raw_user_meta_data->>'congregacion'), ''),
      nullif(btrim(registered_church.nombre), '')
    ) as congregacion
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.districts d on d.id = nullif(btrim(u.raw_user_meta_data->>'district_id'), '')
  left join public.districts current_district on current_district.id = p.district_id
  left join public.regions r on r.id = nullif(btrim(u.raw_user_meta_data->>'region_id'), '')
  left join public.congregations current_church on current_church.id = p.congregacion_id
  left join public.congregations registered_church
    on registered_church.id::text = nullif(btrim(u.raw_user_meta_data->>'congregacion_id'), '')
), repaired as (
  update public.profiles p set
    whatsapp = s.whatsapp, celular = s.celular,
    district_id = s.district_id, region_id = s.region_id,
    congregacion = s.congregacion, congregacion_id = s.congregacion_id
  from source s where s.id = p.id and
    (p.whatsapp, p.celular, p.district_id, p.region_id, p.congregacion, p.congregacion_id)
    is distinct from
    (s.whatsapp, s.celular, s.district_id, s.region_id, s.congregacion, s.congregacion_id)
  returning p.id
)
select count(*) as perfiles_recuperados from repaired;

-- Una reparación de contacto nunca debe modificar autorización ni actividad.
do $$
begin
  if exists (
    select 1 from public.profiles p
    join profile_contact_before b on b.id = p.id
    where p.rol is distinct from b.rol
      or p.can_publish is distinct from b.can_publish
      or p.xp is distinct from b.xp
      or p.created_at is distinct from b.created_at
  ) then
    raise exception 'Se detectó un cambio ajeno a la recuperación: se cancela la transacción.';
  end if;
end $$;

commit;

select count(*) as perfiles,
  count(nullif(btrim(coalesce(nullif(btrim(whatsapp), ''), celular)), '')) as con_whatsapp,
  count(district_id) as con_distrito,
  count(region_id) as con_region,
  count(nullif(btrim(congregacion), '')) as con_iglesia
from public.profiles;
