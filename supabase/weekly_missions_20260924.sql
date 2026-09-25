-- Weekly-only, one-share missions. Run on somos-misioné (nthvztmrqhyaijulhinb).
-- Keeps all earned XP, badges and historical completions. No user records deleted.
begin;

-- Recovery snapshots are not exposed by the public API and contain no passwords.
create schema if not exists mission_migration_backup;
revoke all on schema mission_migration_backup from public, anon, authenticated;
create table if not exists mission_migration_backup.missions_20260924 as table public.missions;
create table if not exists mission_migration_backup.completions_20260924 as table public.mission_completions;
create table if not exists mission_migration_backup.functions_20260924 as
select oid::regprocedure::text as signature, pg_get_functiondef(oid) as definition
from pg_proc where oid in ('public.sync_my_mission_progress()'::regprocedure, 'public.complete_mission_action(uuid)'::regprocedure);
revoke all on all tables in schema mission_migration_backup from public, anon, authenticated;
alter table mission_migration_backup.missions_20260924 enable row level security;
alter table mission_migration_backup.completions_20260924 enable row level security;
alter table mission_migration_backup.functions_20260924 enable row level security;

alter table public.missions add column if not exists coordination_id text references public.coordinations(id);
-- Retain the existing coordination mission IDs and their 140 XP rewards.
update public.missions m set coordination_id = c.id, type = 'weekly',
  title = c.name, description = 'Comparte 1 publicación de ' || c.name || ' esta semana.',
  goal = 1, unit = 'publicación', default_status = 'pending', default_progress = 0
from public.coordinations c
where m.id::text = '100000' || lpad(substring(c.id from 2), 2, '0') || '-cccc-40' || lpad(substring(c.id from 2), 2, '0') || '-80' || lpad(substring(c.id from 2), 2, '0') || '-0000000000' || lpad(substring(c.id from 2), 2, '0');
update public.missions set active = false where coordination_id is null;
update public.missions set active = true where coordination_id is not null and type = 'weekly';

alter table public.mission_completions add column if not exists period_start date;
update public.mission_completions set period_start = date_trunc('week', completed_at at time zone 'America/Bogota')::date where period_start is null;
alter table public.mission_completions alter column period_start set default date_trunc('week', now() at time zone 'America/Bogota')::date;
alter table public.mission_completions alter column period_start set not null;
alter table public.mission_completions drop constraint if exists mission_completions_mission_id_profile_id_key;
create unique index if not exists mission_completions_week_unique on public.mission_completions(mission_id, profile_id, period_start);
-- All awards must pass the server's activity check, never a client-side insert.
drop policy if exists "users insert own mission completions" on public.mission_completions;

create or replace function public.get_weekly_missions()
returns setof public.missions language sql stable security invoker set search_path = public as $$
  select m.* from public.missions m
  where m.active and m.type = 'weekly' and m.coordination_id is not null
    and exists (select 1 from public.publications p where p.active and p.coordination_id = m.coordination_id)
  order by m.order_index, m.id;
$$;

create or replace function public.sync_my_mission_progress()
returns table(mission_id uuid, progress integer, computed_status text)
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_week date := date_trunc('week', now() at time zone 'America/Bogota')::date;
  v_start timestamptz := v_week::timestamp at time zone 'America/Bogota';
  v_mission record;
  v_done boolean;
  v_inserted uuid;
begin
  if v_user is null then return; end if;
  -- Serialize concurrent syncs for this member; the unique index is a second guard.
  perform 1 from public.profiles where id = v_user and cuenta_activa = true for update;
  if not found then return; end if;
  for v_mission in select * from public.get_weekly_missions() loop
    select exists(select 1 from public.mission_completions mc where mc.profile_id = v_user and mc.mission_id = v_mission.id and mc.period_start = v_week) into v_done;
    if not v_done and exists (
      select 1 from public.shares s join public.publications p on p.id = s.publication_id
      where s.user_id = v_user and p.coordination_id = v_mission.coordination_id and p.active
        and s.created_at >= v_start and s.created_at < v_start + interval '7 days'
    ) then
      v_inserted := null;
      insert into public.mission_completions(mission_id, profile_id, progress, period_start)
      values (v_mission.id, v_user, 1, v_week)
      on conflict do nothing returning id into v_inserted;
      if v_inserted is not null then
        perform public.apply_xp(v_user, v_mission.xp_reward, 'mision_auto_completada', 'mission', v_mission.id::text || ':' || v_week::text);
        perform public.refresh_profile_badges(v_user);
      end if;
      v_done := true;
    end if;
    mission_id := v_mission.id;
    progress := case when v_done then 1 else 0 end;
    computed_status := case when v_done then 'completed' else 'pending' end;
    return next;
  end loop;
end;
$$;

-- Compatibility for older clients. Calling this cannot bypass the share check.
create or replace function public.complete_mission_action(p_mission_id uuid)
returns table(completion_id uuid, xp_ganado integer, total_completions integer, profile_xp integer)
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_week date := date_trunc('week', now() at time zone 'America/Bogota')::date;
  v_before uuid;
  v_after uuid;
begin
  if v_user is null then raise exception 'Inicia sesión para participar'; end if;
  perform 1 from public.profiles where id = v_user and cuenta_activa = true for update;
  if not found then raise exception 'Cuenta no disponible'; end if;
  if not exists(select 1 from public.get_weekly_missions() m where m.id = p_mission_id) then raise exception 'Misión no disponible'; end if;
  select mc.id into v_before from public.mission_completions mc where mc.mission_id = p_mission_id and mc.profile_id = v_user and mc.period_start = v_week;
  perform public.sync_my_mission_progress();
  select mc.id into v_after from public.mission_completions mc where mc.mission_id = p_mission_id and mc.profile_id = v_user and mc.period_start = v_week;
  if v_after is null then raise exception 'Comparte una publicación de esta coordinación para completar la misión'; end if;
  return query select v_after,
    case when v_before is null then (select m.xp_reward from public.missions m where m.id = p_mission_id) else 0 end,
    (select count(*)::integer from public.mission_completions mc where mc.profile_id = v_user),
    (select p.xp from public.profiles p where p.id = v_user);
end;
$$;

revoke all on function public.get_weekly_missions() from public, anon;
revoke all on function public.sync_my_mission_progress() from public, anon;
revoke all on function public.complete_mission_action(uuid) from public, anon;
grant execute on function public.get_weekly_missions(), public.sync_my_mission_progress(), public.complete_mission_action(uuid) to authenticated;

-- Fail atomically if the expected existing catalog was not found.
do $$ begin
  if (select count(*) from public.missions where active and type = 'weekly' and coordination_id is not null) <> 12 then
    raise exception 'Expected 12 coordination missions; check catalog before applying';
  end if;
end $$;
commit;
