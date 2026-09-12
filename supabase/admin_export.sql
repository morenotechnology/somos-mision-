-- Exportación de información operativa; nunca lee auth.users ni credenciales.
create or replace function public.admin_export_rows(
  p_sheet text, p_offset integer default 0, p_limit integer default 500
)
returns setof jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles where id = auth.uid() and rol = 'admin' and cuenta_activa = true
  ) then
    raise exception 'Solo el superadmin puede exportar la base de datos.' using errcode = '42501';
  end if;
  if p_sheet = 'usuarios' then
    return query select to_jsonb(p) || jsonb_build_object(
      'region_name', r.name, 'district_name', d.name,
      'church_name', coalesce(nullif(btrim(p.congregacion), ''), c.nombre),
      'badge_names', (select string_agg(b.name, ', ' order by b.name)
        from public.profile_badges pb join public.badges b on b.id = pb.badge_id where pb.profile_id = p.id)
    ) from public.profiles p
    left join public.regions r on r.id = p.region_id
    left join public.districts d on d.id = p.district_id
    left join public.congregations c on c.id = p.congregacion_id
    order by p.created_at, p.id
    limit greatest(1,least(coalesce(p_limit,500),1000)) offset greatest(coalesce(p_offset,0),0);
  elsif p_sheet = 'publicaciones' then
    return query select to_jsonb(p) || jsonb_build_object('coordination_name',c.name,'author_name',a.nombre_completo)
    from public.publications p
    left join public.coordinations c on c.id = p.coordination_id
    left join public.profiles a on a.id = p.author_profile_id
    order by p.created_at, p.id
    limit greatest(1,least(coalesce(p_limit,500),1000)) offset greatest(coalesce(p_offset,0),0);
  elsif p_sheet = 'misiones' then
    return query select to_jsonb(m) from public.missions m order by m.id
    limit greatest(1,least(coalesce(p_limit,500),1000)) offset greatest(coalesce(p_offset,0),0);
  else
    raise exception 'Hoja de exportación no válida.' using errcode = '22023';
  end if;
end $$;
revoke all on function public.admin_export_rows(text,integer,integer) from public,anon;
grant execute on function public.admin_export_rows(text,integer,integer) to authenticated;
