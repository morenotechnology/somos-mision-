-- Fix incremental para producción:
-- 1) Registro robusto aunque falten badges/regiones/distritos.
-- 2) Publicaciones con links separados de Facebook e Instagram.
-- 3) Compartidos por red con estado opened/verified y XP solo una vez por publicación.

alter table public.publications add column if not exists source_url text;
alter table public.publications add column if not exists facebook_url text;
alter table public.publications add column if not exists instagram_url text;
alter table public.publications add column if not exists source_platform text not null default 'manual';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'publications_source_platform_check'
      and conrelid = 'public.publications'::regclass
  ) then
    alter table public.publications
      add constraint publications_source_platform_check
      check (source_platform in ('facebook', 'instagram', 'manual'));
  end if;
end $$;

alter table public.shares add column if not exists share_url text;
alter table public.shares add column if not exists verification_status text not null default 'pending';
alter table public.shares add column if not exists verification_method text not null default 'client_open_return';
alter table public.shares add column if not exists opened_at timestamptz;
alter table public.shares add column if not exists verified_at timestamptz;

do $$
begin
  alter table public.shares drop constraint if exists shares_publication_id_user_id_key;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'shares_publication_id_user_id_social_network_key'
      and conrelid = 'public.shares'::regclass
  ) then
    alter table public.shares
      add constraint shares_publication_id_user_id_social_network_key
      unique (publication_id, user_id, social_network);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'shares_verification_status_check'
      and conrelid = 'public.shares'::regclass
  ) then
    alter table public.shares
      add constraint shares_verification_status_check
      check (verification_status in ('pending', 'opened', 'verified'));
  end if;
end $$;

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
begin
  if meta ->> 'rol' = 'pastor' and meta ->> 'pastor_access_key' = 'IPUC2026MISION' then
    assigned_role := 'pastor';
  end if;

  if v_region_id is not null and not exists (select 1 from public.regions where id = v_region_id) then
    v_region_id := null;
  end if;

  if v_district_id is not null and not exists (select 1 from public.districts where id = v_district_id) then
    v_district_id := null;
  end if;

  insert into public.profiles (
    id,
    nombre,
    nombre_completo,
    email,
    rol,
    region_id,
    district_id,
    congregacion,
    cargo,
    celular,
    whatsapp,
    avatar,
    avatar_color,
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
    nullif(meta ->> 'congregacion', ''),
    nullif(meta ->> 'cargo', ''),
    nullif(meta ->> 'celular', ''),
    nullif(meta ->> 'whatsapp', ''),
    public.initials_from_name(full_name),
    coalesce(nullif(meta ->> 'avatar_color', ''), '#1A237E'),
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        nombre = excluded.nombre,
        nombre_completo = excluded.nombre_completo,
        rol = excluded.rol,
        region_id = excluded.region_id,
        district_id = excluded.district_id,
        congregacion = excluded.congregacion,
        cargo = excluded.cargo,
        celular = excluded.celular,
        whatsapp = excluded.whatsapp;

  if exists (select 1 from public.badges where id = 'b1') then
    insert into public.profile_badges (profile_id, badge_id)
    values (new.id, 'b1')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop function if exists public.share_publication(bigint, text);

create or replace function public.share_publication(
  p_publication_id bigint,
  p_red_social text default 'whatsapp',
  p_share_url text default null,
  p_verification_status text default 'opened'
)
returns table(shared_id uuid, xp_ganado integer, publication_shares integer, profile_xp integer, verification_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_exists uuid;
  v_xp integer;
  v_status text := case
    when p_verification_status in ('pending', 'opened', 'verified') then p_verification_status
    else 'opened'
  end;
  v_network text := coalesce(nullif(p_red_social, ''), 'whatsapp');
  v_has_publication_share boolean := false;
begin
  if v_user is null then
    raise exception 'No authenticated user';
  end if;

  select exists (
    select 1
    from public.shares
    where publication_id = p_publication_id and user_id = v_user
  ) into v_has_publication_share;

  select id into v_exists
  from public.shares
  where publication_id = p_publication_id
    and user_id = v_user
    and social_network = v_network;

  if v_exists is null then
    insert into public.shares (
      publication_id,
      user_id,
      social_network,
      share_url,
      verification_status,
      verification_method,
      opened_at,
      verified_at
    )
    values (
      p_publication_id,
      v_user,
      v_network,
      p_share_url,
      v_status,
      'client_open_return',
      now(),
      case when v_status = 'verified' then now() else null end
    )
    returning id into v_exists;

    update public.publications
    set shares_count = shares_count + 1
    where id = p_publication_id
    returning xp_reward into v_xp;

    if not v_has_publication_share then
      perform public.apply_xp(v_user, coalesce(v_xp, 0), 'contenido_compartido', 'publication', p_publication_id::text);
      perform public.refresh_profile_badges(v_user);
    else
      v_xp := 0;
    end if;
  else
    update public.shares as existing_share
    set
      share_url = coalesce(p_share_url, existing_share.share_url),
      verification_status = case
        when existing_share.verification_status = 'verified' then 'verified'
        when v_status = 'verified' then 'verified'
        else v_status
      end,
      opened_at = coalesce(existing_share.opened_at, now()),
      verified_at = case
        when existing_share.verification_status = 'verified' or v_status = 'verified' then coalesce(existing_share.verified_at, now())
        else existing_share.verified_at
      end
    where existing_share.id = v_exists;

    v_xp := 0;
  end if;

  return query
  select
    v_exists,
    coalesce(v_xp, 0),
    (select shares_count from public.publications where id = p_publication_id),
    (select xp from public.profiles where id = v_user),
    (select s.verification_status from public.shares s where s.id = v_exists);
end;
$$;

drop policy if exists "pastors create publications" on public.publications;
create policy "pastors create publications" on public.publications for insert to authenticated with check (
  author_profile_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and rol in ('admin', 'pastor')
  )
);

grant execute on function public.share_publication(bigint, text, text, text) to authenticated;
