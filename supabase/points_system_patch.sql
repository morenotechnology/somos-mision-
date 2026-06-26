-- Patch de puntos, racha y coordinaciones oficiales.
-- Ejecutar en Supabase SQL Editor sobre una base existente.

alter table public.shares add column if not exists share_url text;
alter table public.shares add column if not exists verification_status text not null default 'pending';
alter table public.shares add column if not exists verification_method text not null default 'client_open_return';
alter table public.shares add column if not exists opened_at timestamptz;
alter table public.shares add column if not exists verified_at timestamptz;
alter table public.shares add column if not exists share_latency_ms integer;
alter table public.shares add column if not exists xp_awarded integer not null default 0;
alter table public.profiles add column if not exists last_streak_date date;

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

insert into public.coordinations (id, name, icon, color, members_count, active) values
  ('c1', 'Evangelismo', 'Megaphone', '#1A237E', 842, true),
  ('c2', 'Hospitalaria', 'HeartPulse', '#5C1800', 315, true),
  ('c3', 'Evangelismo Carcelario', 'Scale', '#283593', 228, true),
  ('c4', 'Asuntos Étnicos', 'Leaf', '#2E7D32', 520, true),
  ('c5', 'Población Vulnerable y Especiales', 'Heart', '#6A1B9A', 267, true),
  ('c6', 'Evangelismo en Medios de Comunicación', 'Radio', '#E65100', 531, true),
  ('c7', 'Estadísticas', 'BarChart3', '#00838F', 184, true),
  ('c8', 'Capacitación Misionera', 'BookOpenCheck', '#AD1457', 412, true),
  ('c9', 'Misión Juvenil', 'Flame', '#0B5D91', 760, true),
  ('c10', 'Instituciones Públicas', 'Landmark', '#8B5CF6', 236, true),
  ('c11', 'Restauración Espiritual', 'RefreshCw', '#16A34A', 305, true),
  ('c12', 'Población Sorda, Ciega y Sordociega', 'HandHeart', '#C2410C', 148, true)
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  color = excluded.color,
  members_count = excluded.members_count,
  active = excluded.active;

create or replace function public.apply_xp(p_profile_id uuid, p_points integer, p_action text, p_reference_type text default null, p_reference_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
begin
  update public.profiles
  set
    xp = xp + greatest(p_points, 0),
    streak = case
      when last_streak_date = v_today then streak
      when last_streak_date = v_today - 1 then streak + 1
      else 1
    end,
    last_streak_date = v_today
  where id = p_profile_id;

  insert into public.xp_activities (profile_id, accion, puntos_ganados, reference_type, reference_id)
  values (p_profile_id, p_action, greatest(p_points, 0), p_reference_type, p_reference_id);
end;
$$;

drop function if exists public.share_publication(bigint, text);
drop function if exists public.share_publication(bigint, text, text, text);
drop function if exists public.share_publication(bigint, text, text, text, integer);

create or replace function public.share_publication(
  p_publication_id bigint,
  p_red_social text default 'whatsapp',
  p_share_url text default null,
  p_verification_status text default 'opened',
  p_share_latency_ms integer default null
)
returns table(shared_id uuid, xp_ganado integer, publication_shares integer, profile_xp integer, verification_status text, streak_dias integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_exists uuid;
  v_xp integer := 0;
  v_base_xp integer := 0;
  v_featured boolean := false;
  v_featured_bonus integer := 0;
  v_speed_bonus integer := 0;
  v_verified_bonus integer := 0;
  v_status text := case
    when p_verification_status in ('pending', 'opened', 'verified') then p_verification_status
    else 'opened'
  end;
  v_network text := coalesce(nullif(p_red_social, ''), 'whatsapp');
begin
  if v_user is null then
    raise exception 'No authenticated user';
  end if;

  select coalesce(xp_reward, 50), coalesce(featured, false)
  into v_base_xp, v_featured
  from public.publications
  where id = p_publication_id and active = true;

  if not found then
    raise exception 'Publication not found or inactive';
  end if;

  if v_featured then
    v_featured_bonus := ceil(v_base_xp * 0.35)::integer;
  end if;

  v_speed_bonus := case
    when p_share_latency_ms is null then 0
    when p_share_latency_ms <= 5000 then 25
    when p_share_latency_ms <= 15000 then 15
    when p_share_latency_ms <= 30000 then 8
    else 0
  end;

  if v_status = 'verified' then
    v_verified_bonus := 10;
  end if;

  select id into v_exists
  from public.shares
  where publication_id = p_publication_id
    and user_id = v_user
    and social_network = v_network;

  if v_exists is null then
    v_xp := v_base_xp + v_featured_bonus + v_speed_bonus + v_verified_bonus;

    insert into public.shares (
      publication_id,
      user_id,
      social_network,
      share_url,
      verification_status,
      verification_method,
      opened_at,
      verified_at,
      share_latency_ms,
      xp_awarded
    )
    values (
      p_publication_id,
      v_user,
      v_network,
      p_share_url,
      v_status,
      'client_open_return',
      now(),
      case when v_status = 'verified' then now() else null end,
      p_share_latency_ms,
      v_xp
    )
    returning id into v_exists;

    update public.publications
    set shares_count = shares_count + 1
    where id = p_publication_id;

    perform public.apply_xp(v_user, v_xp, 'contenido_compartido', 'publication', p_publication_id::text);
    perform public.refresh_profile_badges(v_user);
  else
    update public.shares as existing_share
    set
      share_url = coalesce(p_share_url, existing_share.share_url),
      share_latency_ms = coalesce(p_share_latency_ms, existing_share.share_latency_ms),
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
  end if;

  return query
  select
    v_exists,
    coalesce(v_xp, 0),
    (select shares_count from public.publications where id = p_publication_id),
    (select xp from public.profiles where id = v_user),
    (select s.verification_status from public.shares s where s.id = v_exists),
    (select p.streak from public.profiles p where p.id = v_user);
end;
$$;

grant execute on function public.share_publication(bigint, text, text, text, integer) to authenticated;
