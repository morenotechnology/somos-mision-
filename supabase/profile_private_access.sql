-- Phase 1: deploy BEFORE the frontend that uses these RPCs.
-- Existing access is unchanged here. Phase 2 (profile_contact_recovery.sql)
-- closes direct private-column reads before restoring contacts.
begin;

create or replace function public.get_profile_private(p_profile_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare result jsonb;
begin
  if auth.uid() is null or (auth.uid() <> p_profile_id and not exists (
    select 1 from public.profiles where id = auth.uid() and rol = 'admin' and cuenta_activa = true
  )) then
    raise exception 'No tienes permiso para consultar estos datos.' using errcode = '42501';
  end if;
  select to_jsonb(p) || jsonb_build_object(
    'regions', case when r.id is not null then jsonb_build_object('id', r.id, 'name', r.name, 'color', r.color) end,
    'districts', case when d.id is not null then jsonb_build_object('id', d.id, 'name', d.name, 'region_id', d.region_id) end,
    'congregations', case when c.id is not null then jsonb_build_object('id', c.id, 'nombre', c.nombre, 'portada_url', c.portada_url) end
  ) into result
  from public.profiles p
  left join public.regions r on r.id = p.region_id
  left join public.districts d on d.id = p.district_id
  left join public.congregations c on c.id = p.congregacion_id
  where p.id = p_profile_id;
  return result;
end $$;

create or replace function public.admin_list_profiles(
  p_offset integer default 0, p_limit integer default 500,
  p_sort text default 'registered_desc', p_query text default null, p_role text default null
)
returns setof jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles where id = auth.uid() and rol = 'admin' and cuenta_activa = true
  ) then
    raise exception 'Solo el superadmin puede consultar el directorio privado.' using errcode = '42501';
  end if;
  return query
  select to_jsonb(p) || jsonb_build_object(
    'regions', case when r.id is not null then jsonb_build_object('id', r.id, 'name', r.name, 'color', r.color) end,
    'districts', case when d.id is not null then jsonb_build_object('id', d.id, 'name', d.name, 'region_id', d.region_id) end,
    'congregations', case when c.id is not null then jsonb_build_object('id', c.id, 'nombre', c.nombre, 'portada_url', c.portada_url) end
  )
  from public.profiles p
  left join public.regions r on r.id = p.region_id
  left join public.districts d on d.id = p.district_id
  left join public.congregations c on c.id = p.congregacion_id
  where (nullif(btrim(p_query), '') is null or p.nombre_completo ilike '%' || btrim(p_query) || '%'
    or p.email ilike '%' || btrim(p_query) || '%')
    and (nullif(p_role, '') is null or p.rol::text = p_role)
  order by case when p_sort = 'registered_desc' then p.created_at end desc,
    case when p_sort <> 'registered_desc' then p.xp end desc, p.id
  limit greatest(1, least(coalesce(p_limit, 500), 500))
  offset greatest(coalesce(p_offset, 0), 0);
end $$;

revoke all on function public.get_profile_private(uuid) from public, anon;
revoke all on function public.admin_list_profiles(integer, integer, text, text, text) from public, anon;
grant execute on function public.get_profile_private(uuid) to authenticated;
grant execute on function public.admin_list_profiles(integer, integer, text, text, text) to authenticated;

commit;
