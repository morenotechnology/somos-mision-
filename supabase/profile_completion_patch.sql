-- Patch: completar perfil y compuerta de XP después de 100 puntos.
-- Ejecutar en Supabase SQL Editor después del schema base/production_fix.

alter table public.profiles add column if not exists tiene_cargo boolean;
alter table public.profiles add column if not exists usuario_redes text;
alter table public.profiles add column if not exists perfil_completo boolean not null default false;
alter table public.profiles add column if not exists last_streak_date date;

update public.profiles
set perfil_completo = true
where perfil_completo = false
  and usuario_redes is not null
  and trim(usuario_redes) <> ''
  and (tiene_cargo = false or (tiene_cargo = true and coalesce(trim(cargo), '') <> ''));

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
  v_profile_xp integer := 0;
  v_profile_complete boolean := false;
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

  select coalesce(xp, 0), coalesce(perfil_completo, false)
  into v_profile_xp, v_profile_complete
  from public.profiles
  where id = v_user;

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

    if not v_profile_complete then
      v_xp := greatest(least(v_xp, 100 - v_profile_xp), 0);
    end if;

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

    if v_xp > 0 then
      perform public.apply_xp(v_user, v_xp, 'contenido_compartido', 'publication', p_publication_id::text);
      perform public.refresh_profile_badges(v_user);
    end if;
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

    v_xp := 0;
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

create or replace function public.complete_mission_action(p_mission_id uuid)
returns table(completion_id uuid, xp_ganado integer, total_completions integer, profile_xp integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_exists uuid;
  v_xp integer := 0;
  v_profile_xp integer := 0;
  v_profile_complete boolean := false;
begin
  if v_user is null then
    raise exception 'No authenticated user';
  end if;

  select coalesce(xp, 0), coalesce(perfil_completo, false)
  into v_profile_xp, v_profile_complete
  from public.profiles
  where id = v_user;

  select id into v_exists
  from public.mission_completions
  where mission_id = p_mission_id and profile_id = v_user;

  if v_exists is null then
    insert into public.mission_completions (mission_id, profile_id)
    values (p_mission_id, v_user)
    returning id into v_exists;

    select coalesce(xp_reward, 0) into v_xp
    from public.missions
    where id = p_mission_id;

    if not v_profile_complete then
      v_xp := greatest(least(v_xp, 100 - v_profile_xp), 0);
    end if;

    if v_xp > 0 then
      perform public.apply_xp(v_user, v_xp, 'mision_completada', 'mission', p_mission_id::text);
      perform public.refresh_profile_badges(v_user);
    end if;
  else
    v_xp := 0;
  end if;

  return query
  select
    v_exists,
    coalesce(v_xp, 0),
    (select count(*)::integer from public.mission_completions where profile_id = v_user),
    (select xp from public.profiles where id = v_user);
end;
$$;

grant execute on function public.share_publication(bigint, text, text, text, integer) to authenticated;
grant execute on function public.complete_mission_action(uuid) to authenticated;
