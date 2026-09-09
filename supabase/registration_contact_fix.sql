-- Guardar datos de registro de forma completa o fallar de forma visible.
-- La ausencia de una llave editorial NO puede producir can_publish = NULL.
-- Los fallos accesorios (catálogo/insignia) no pueden borrar el contacto.
begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  user_email text := coalesce(new.email, meta ->> 'email', new.id::text || '@pendiente.local');
  full_name text := coalesce(nullif(btrim(meta ->> 'nombre_completo'), ''), nullif(btrim(meta ->> 'name'), ''), split_part(user_email, '@', 1), 'Usuario');
  assigned_role public.app_role := 'multiplicador';
  v_region_id text := nullif(btrim(meta ->> 'region_id'), '');
  v_district_id text := nullif(btrim(meta ->> 'district_id'), '');
  v_congregation_meta text := nullif(btrim(meta ->> 'congregacion_id'), '');
  v_congregation_id bigint;
  v_congregation_name text := nullif(btrim(meta ->> 'congregacion'), '');
  v_existing_congregation_name text;
  v_existing_region_id text;
  v_existing_district_id text;
  v_can_publish boolean := false;
begin
  if meta ->> 'rol' = 'pastor' and (
    meta ->> 'pastor_access_key' = 'IPUC2026MISION'
    or meta ->> 'publisher_access_key' = 'ADMIN2026MISION'
  ) then
    assigned_role := 'pastor';
  elsif meta ->> 'rol' = 'admin' then
    assigned_role := 'admin';
  end if;
  v_can_publish := assigned_role = 'admin'
    or coalesce(meta ->> 'publisher_access_key' = 'ADMIN2026MISION', false);

  if not exists (select 1 from public.regions where id = v_region_id) then
    v_region_id := null;
  end if;
  if not exists (select 1 from public.districts where id = v_district_id) then
    v_district_id := null;
  end if;
  if v_district_id is not null then
    select region_id into v_region_id from public.districts where id = v_district_id;
  end if;
  if lower(v_congregation_name) in ('sin congregación', 'sin congregacion', 'sin registrar') then
    v_congregation_name := null;
  end if;

  -- Resolve catalog IDs as text: malformed or oversized metadata must not abort signup.
  select id, nombre, region_id, district_id
  into v_congregation_id, v_existing_congregation_name, v_existing_region_id, v_existing_district_id
  from public.congregations where id::text = v_congregation_meta;
  if v_congregation_id is not null then
    v_congregation_name := coalesce(v_existing_congregation_name, v_congregation_name);
    v_region_id := coalesce(v_existing_region_id, v_region_id);
    v_district_id := coalesce(v_existing_district_id, v_district_id);
  elsif v_congregation_name is not null then
    begin
      select id into v_congregation_id from public.congregations
      where lower(btrim(nombre)) = lower(v_congregation_name)
        and district_id is not distinct from v_district_id
      order by id limit 1;
      if v_congregation_id is null then
        insert into public.congregations (region_id, district_id, nombre, descripcion, redes_sociales, es_punto_blanco)
        values (v_region_id, v_district_id, v_congregation_name, 'Congregación registrada desde la red.', '{}'::jsonb, false)
        returning id into v_congregation_id;
      end if;
    exception when others then
      -- The provided church name survives even if its optional catalog link fails.
      v_congregation_id := null;
      raise log 'handle_new_user: optional congregation link failed for %, SQLSTATE %', new.id, sqlstate;
    end;
  end if;

  insert into public.profiles (
    id, nombre, nombre_completo, email, rol, region_id, district_id,
    congregacion_id, congregacion, cargo, celular, whatsapp,
    avatar, avatar_color, can_publish, cuenta_activa
  ) values (
    new.id, coalesce(nullif(btrim(meta ->> 'nombre'), ''), split_part(full_name, ' ', 1)),
    full_name, user_email, assigned_role, v_region_id, v_district_id,
    v_congregation_id, v_congregation_name, nullif(btrim(meta ->> 'cargo'), ''),
    coalesce(nullif(btrim(meta ->> 'celular'), ''), nullif(btrim(meta ->> 'whatsapp'), '')),
    coalesce(nullif(btrim(meta ->> 'whatsapp'), ''), nullif(btrim(meta ->> 'celular'), '')),
    public.initials_from_name(full_name), coalesce(nullif(meta ->> 'avatar_color', ''), '#1A237E'),
    v_can_publish, true
  ) on conflict (id) do nothing;

  begin
    if exists (select 1 from public.badges where id = 'b1') then
      insert into public.profile_badges (profile_id, badge_id)
      values (new.id, 'b1') on conflict do nothing;
    end if;
  exception when others then
    raise log 'handle_new_user: optional badge failed for %, SQLSTATE %', new.id, sqlstate;
  end;
  return new;
end $$;

commit;
