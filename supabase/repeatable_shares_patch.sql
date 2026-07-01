-- Patch: permitir compartir varias veces una publicacion sin sumar XP repetido.
-- Ejecutar en Supabase SQL Editor. Es seguro correrlo mas de una vez.

alter table public.profiles add column if not exists perfil_completo boolean not null default false;
alter table public.shares add column if not exists share_url text;
alter table public.shares add column if not exists verification_status text not null default 'pending';
alter table public.shares add column if not exists verification_method text not null default 'client_open_return';
alter table public.shares add column if not exists opened_at timestamptz;
alter table public.shares add column if not exists verified_at timestamptz;
alter table public.shares add column if not exists share_latency_ms integer;
alter table public.shares add column if not exists xp_awarded integer not null default 0;

do $$
begin
  alter table public.shares drop constraint if exists shares_publication_id_user_id_key;
  alter table public.shares drop constraint if exists shares_publication_id_user_id_social_network_key;

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

create index if not exists shares_publication_user_idx on public.shares(publication_id, user_id);
create index if not exists shares_user_created_idx on public.shares(user_id, created_at desc);

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
  v_shared_id uuid;
  v_already_awarded boolean := false;
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

  select exists (
    select 1
    from public.shares
    where publication_id = p_publication_id
      and user_id = v_user
      and xp_awarded > 0
  ) into v_already_awarded;

  if not v_already_awarded then
    v_xp := v_base_xp + v_featured_bonus + v_speed_bonus + v_verified_bonus;

    if not v_profile_complete then
      v_xp := greatest(least(v_xp, 100 - v_profile_xp), 0);
    end if;
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
  returning id into v_shared_id;

  update public.publications
  set shares_count = shares_count + 1
  where id = p_publication_id;

  if v_xp > 0 then
    perform public.apply_xp(v_user, v_xp, 'contenido_compartido', 'publication', p_publication_id::text);
    perform public.refresh_profile_badges(v_user);
  end if;

  return query
  select
    v_shared_id,
    coalesce(v_xp, 0),
    (select shares_count from public.publications where id = p_publication_id),
    (select xp from public.profiles where id = v_user),
    (select s.verification_status from public.shares s where s.id = v_shared_id),
    (select p.streak from public.profiles p where p.id = v_user);
end;
$$;

grant execute on function public.share_publication(bigint, text, text, text, integer) to authenticated;
