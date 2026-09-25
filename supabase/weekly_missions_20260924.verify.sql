-- Append inside the migration transaction instead of COMMIT, then ROLLBACK.
-- All test shares, awards and completions are rolled back; no member is altered.
do $$
declare
  v_user uuid;
  v_mission uuid;
  v_publication bigint;
  v_share uuid;
  v_xp integer;
  v_xp_after integer;
  v_status text;
  v_week date := date_trunc('week', now() at time zone 'America/Bogota')::date;
begin
  select p.id into v_user from public.profiles p
    where p.cuenta_activa = true
      and not exists(select 1 from public.shares s where s.user_id = p.id and s.created_at >= v_week::timestamp at time zone 'America/Bogota')
      and not exists(select 1 from public.mission_completions mc where mc.profile_id = p.id and mc.period_start = v_week)
    limit 1;
  if v_user is null then raise exception 'No isolated fixture member available; verification not run'; end if;
  select m.id, p.id into v_mission, v_publication from public.get_weekly_missions() m
    join public.publications p on p.coordination_id = m.coordination_id and p.active limit 1;
  perform set_config('request.jwt.claim.sub', v_user::text, true);
  select s.computed_status into v_status from public.sync_my_mission_progress() s where s.mission_id = v_mission;
  if v_status is distinct from 'pending' then raise exception 'Empty activity should be pending'; end if;
  begin
    perform public.complete_mission_action(v_mission);
    raise exception 'Unsafe: mission can be claimed without sharing';
  exception when others then
    if sqlerrm not like 'Comparte una publicación%' then raise; end if;
  end;
  insert into public.shares(publication_id, user_id, social_network, verification_status, xp_awarded)
    values(v_publication, v_user, 'whatsapp', 'opened', 0) returning id into v_share;
  select xp into v_xp from public.profiles where id = v_user;
  select s.computed_status into v_status from public.sync_my_mission_progress() s where s.mission_id = v_mission;
  if v_status is distinct from 'completed' then raise exception 'One share must complete the mission'; end if;
  select xp into v_xp_after from public.profiles where id = v_user;
  if v_xp_after < v_xp + 140 then raise exception 'XP reward was not applied'; end if;
  perform public.sync_my_mission_progress();
  if (select xp from public.profiles where id = v_user) <> v_xp_after then raise exception 'Repeated sync duplicated XP'; end if;
  -- Move only our fixture to the prior week, proving historical IDs do not carry.
  update public.mission_completions set period_start = v_week - 7
    where mission_id = v_mission and profile_id = v_user and period_start = v_week;
  update public.shares set created_at = now() - interval '7 days' where id = v_share;
  select s.computed_status into v_status from public.sync_my_mission_progress() s where s.mission_id = v_mission;
  if v_status is distinct from 'pending' then raise exception 'Historical completion leaked into new week'; end if;
  update public.shares set created_at = now() where id = v_share;
  perform public.sync_my_mission_progress();
  if (select count(*) from public.mission_completions where mission_id = v_mission and profile_id = v_user and period_start in (v_week, v_week - 7)) <> 2 then
    raise exception 'A second week cannot be completed';
  end if;
  if has_function_privilege('anon', 'public.sync_my_mission_progress()', 'execute') then raise exception 'Anonymous users can award XP'; end if;
  if exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'mission_completions' and cmd = 'INSERT') then raise exception 'Clients can forge completions'; end if;
end;
$$;
select 'PASS: one share, weekly reset, preserved history, no duplicate XP, no manual or anonymous awards' as verification;
rollback;
