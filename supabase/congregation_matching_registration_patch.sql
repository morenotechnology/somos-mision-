-- Activa selección de congregación existente durante el registro.
-- Ejecutar completo en Supabase Dashboard > SQL Editor.
-- No borra datos: si llega congregacion_id válido, reutiliza esa iglesia; si no, crea una nueva.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  user_email text := coalesce(new.email, meta ->> 'email', new.id::text || '@pendiente.local');
  full_name text := coalesce(nullif(meta ->> 'nombre_completo', ''), nullif(meta ->> 'name', ''), split_part(user_email, '@', 1), 'Usuario');
  assigned_role public.app_role := 'multiplicador';
  v_region_id text := nullif(meta ->> 'region_id', '');
  v_district_id text := nullif(meta ->> 'district_id', '');
  v_congregation_meta text := nullif(meta ->> 'congregacion_id', '');
  v_congregation_id bigint := null;
  v_congregation_name text := nullif(trim(coalesce(meta ->> 'congregacion', '')), '');
  v_existing_congregation_name text := null;
  v_existing_region_id text := null;
  v_existing_district_id text := null;
  v_can_publish boolean := false;
begin
  if meta ->> 'rol' = 'pastor'
    and (
      meta ->> 'pastor_access_key' = 'IPUC2026MISION'
      or meta ->> 'publisher_access_key' = 'ADMIN2026MISION'
    ) then
    assigned_role := 'pastor';
  elsif meta ->> 'rol' = 'admin' then
    assigned_role := 'admin';
  end if;

  v_can_publish := assigned_role = 'admin'
    or meta ->> 'publisher_access_key' = 'ADMIN2026MISION';

  if v_region_id is not null and not exists (select 1 from public.regions where id = v_region_id) then
    v_region_id := null;
  end if;

  if v_district_id is not null and not exists (select 1 from public.districts where id = v_district_id) then
    v_district_id := null;
  end if;

  if v_congregation_meta ~ '^[0-9]+$' then
    select id, nombre, region_id, district_id
    into v_congregation_id, v_existing_congregation_name, v_existing_region_id, v_existing_district_id
    from public.congregations
    where id = v_congregation_meta::bigint;

    if v_congregation_id is not null then
      v_congregation_name := coalesce(v_existing_congregation_name, v_congregation_name);
      v_region_id := coalesce(v_existing_region_id, v_region_id);
      v_district_id := coalesce(v_existing_district_id, v_district_id);
    end if;
  end if;

  if v_congregation_id is null and v_congregation_name is not null then
    insert into public.congregations (region_id, district_id, nombre, descripcion, redes_sociales, es_punto_blanco)
    values (v_region_id, v_district_id, v_congregation_name, 'Congregación registrada desde la beta.', '{}'::jsonb, false)
    returning id into v_congregation_id;
  end if;

  insert into public.profiles (
    id,
    nombre,
    nombre_completo,
    email,
    rol,
    region_id,
    district_id,
    congregacion_id,
    congregacion,
    cargo,
    celular,
    whatsapp,
    avatar,
    avatar_color,
    can_publish,
    cuenta_activa
  )
  values (
    new.id,
    coalesce(meta ->> 'nombre', split_part(full_name, ' ', 1)),
    full_name,
    user_email,
    assigned_role,
    v_region_id,
    v_district_id,
    v_congregation_id,
    v_congregation_name,
    nullif(meta ->> 'cargo', ''),
    nullif(meta ->> 'celular', ''),
    nullif(meta ->> 'whatsapp', ''),
    public.initials_from_name(full_name),
    coalesce(nullif(meta ->> 'avatar_color', ''), '#1A237E'),
    v_can_publish,
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        nombre = excluded.nombre,
        nombre_completo = excluded.nombre_completo,
        rol = excluded.rol,
        region_id = excluded.region_id,
        district_id = excluded.district_id,
        congregacion_id = excluded.congregacion_id,
        congregacion = excluded.congregacion,
        cargo = excluded.cargo,
        celular = excluded.celular,
        whatsapp = excluded.whatsapp,
        can_publish = excluded.can_publish;

  if exists (select 1 from public.badges where id = 'b1') then
    insert into public.profile_badges (profile_id, badge_id)
    values (new.id, 'b1')
    on conflict do nothing;
  end if;

  return new;
exception
  when others then
    raise log 'handle_new_user failed for %, email %, metadata %: %', new.id, user_email, meta, sqlerrm;
    begin
      insert into public.profiles (
        id,
        nombre,
        nombre_completo,
        email,
        rol,
        region_id,
        district_id,
        congregacion,
        celular,
        whatsapp,
        avatar,
        avatar_color,
        can_publish,
        cuenta_activa
      )
      values (
        new.id,
        coalesce(meta ->> 'nombre', split_part(full_name, ' ', 1)),
        full_name,
        user_email,
        assigned_role,
        v_region_id,
        v_district_id,
        v_congregation_name,
        nullif(meta ->> 'celular', ''),
        nullif(meta ->> 'whatsapp', ''),
        public.initials_from_name(full_name),
        coalesce(nullif(meta ->> 'avatar_color', ''), '#1A237E'),
        v_can_publish,
        true
      )
      on conflict (id) do nothing;
    exception
      when others then
        raise log 'minimal profile fallback failed for %, email %: %', new.id, user_email, sqlerrm;
    end;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
