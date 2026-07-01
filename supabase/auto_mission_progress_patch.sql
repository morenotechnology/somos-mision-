-- Misiones automáticas: calcula progreso real por actividad y completa sin botón manual.
-- Ejecutar en Supabase SQL Editor después de los parches de perfiles/puntos.

alter table public.profiles add column if not exists tiene_cargo boolean;
alter table public.profiles add column if not exists usuario_redes text;
alter table public.profiles add column if not exists perfil_completo boolean not null default false;
alter table public.profiles add column if not exists email_gate_verified_at timestamptz;

alter table public.shares add column if not exists xp_awarded integer not null default 0;
alter table public.shares add column if not exists share_url text;
alter table public.shares add column if not exists verification_status text not null default 'pending';
alter table public.shares add column if not exists share_latency_ms integer;

create or replace function public.sync_my_mission_progress()
returns table(mission_id uuid, progress integer, computed_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_week_start date := date_trunc('week', now() at time zone 'America/Bogota')::date;
  v_profile_xp integer := 0;
  v_streak integer := 0;
  v_profile_complete boolean := false;
  v_email_verified boolean := false;
  v_daily_shares integer := 0;
  v_daily_whatsapp integer := 0;
  v_daily_featured integer := 0;
  v_weekly_shares integer := 0;
  v_weekly_featured integer := 0;
  v_weekly_coord_count integer := 0;
  v_weekly_active_days integer := 0;
  v_total_awarded_shares integer := 0;
  v_regional_rank integer := 999999;
  v_mission record;
  v_title text;
  v_metric integer;
  v_progress integer;
  v_completion uuid;
  v_award_xp integer;
begin
  if v_user is null then
    return;
  end if;

  select
    coalesce(p.xp, 0),
    coalesce(p.streak, 0),
    coalesce(p.perfil_completo, false),
    p.email_gate_verified_at is not null
  into v_profile_xp, v_streak, v_profile_complete, v_email_verified
  from public.profiles p
  where p.id = v_user;

  select count(distinct s.publication_id)
  into v_daily_shares
  from public.shares s
  where s.user_id = v_user
    and (s.created_at at time zone 'America/Bogota')::date = v_today;

  select count(distinct s.publication_id)
  into v_daily_whatsapp
  from public.shares s
  where s.user_id = v_user
    and lower(s.social_network) = 'whatsapp'
    and (s.created_at at time zone 'America/Bogota')::date = v_today;

  select count(distinct s.publication_id)
  into v_daily_featured
  from public.shares s
  join public.publications p on p.id = s.publication_id
  where s.user_id = v_user
    and p.featured = true
    and (s.created_at at time zone 'America/Bogota')::date = v_today;

  select count(distinct s.publication_id)
  into v_weekly_shares
  from public.shares s
  where s.user_id = v_user
    and (s.created_at at time zone 'America/Bogota')::date >= v_week_start;

  select count(distinct s.publication_id)
  into v_weekly_featured
  from public.shares s
  join public.publications p on p.id = s.publication_id
  where s.user_id = v_user
    and p.featured = true
    and (s.created_at at time zone 'America/Bogota')::date >= v_week_start;

  select count(distinct p.coordination_id)
  into v_weekly_coord_count
  from public.shares s
  join public.publications p on p.id = s.publication_id
  where s.user_id = v_user
    and p.coordination_id is not null
    and (s.created_at at time zone 'America/Bogota')::date >= v_week_start;

  select count(distinct (x.fecha at time zone 'America/Bogota')::date)
  into v_weekly_active_days
  from public.xp_activities x
  where x.profile_id = v_user
    and (x.fecha at time zone 'America/Bogota')::date >= v_week_start
    and x.puntos_ganados > 0;

  select count(distinct s.publication_id)
  into v_total_awarded_shares
  from public.shares s
  where s.user_id = v_user
    and s.xp_awarded > 0;

  select count(*) + 1
  into v_regional_rank
  from public.profiles other_profile
  where other_profile.cuenta_activa = true
    and other_profile.region_id = (select region_id from public.profiles where id = v_user)
    and coalesce(other_profile.xp, 0) > v_profile_xp;

  for v_mission in
    select *
    from public.missions
    where active = true
    order by order_index, created_at
  loop
    v_title := lower(v_mission.title);
    v_metric := 0;

    if v_title like '%3 contenidos%hoy%' or v_title like '%mensajero activo%' then
      v_metric := v_daily_shares;
    elsif v_title like '%whatsapp%' then
      v_metric := v_daily_whatsapp;
    elsif v_title like '%destacado%' or v_title like '%campaña%' then
      v_metric := greatest(v_daily_featured, v_weekly_featured);
    elsif v_title like '%perfil%' then
      v_metric := case when v_profile_complete then 1 else 0 end;
    elsif v_title like '%primer%' or v_title like '%primera%' or v_title like '%señal del día%' then
      v_metric := v_daily_shares;
    elsif v_title like '%semana%' or v_title like '%5 señales%' or v_title like '%10 contenidos%' then
      v_metric := v_weekly_shares;
    elsif v_title like '%tres frentes%' or v_title like '%coordinaciones distintas%' then
      v_metric := v_weekly_coord_count;
    elsif v_title like '%racha%' then
      v_metric := greatest(v_streak, v_weekly_active_days);
    elsif v_title like '%1000%' then
      v_metric := case when v_profile_xp >= 1000 then 1 else 0 end;
    elsif v_title like '%red expandida%' then
      v_metric := v_total_awarded_shares;
    elsif v_title like '%top regional%' or v_title like '%ranking%' then
      v_metric := case when v_regional_rank <= 10 then 1 else 0 end;
    elsif v_title like '%evangelismo%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and lower(c.name) like '%evangelismo%';
    elsif v_title like '%hospital%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and lower(c.name) like '%hospital%';
    elsif v_title like '%carcel%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and lower(c.name) like '%carcel%';
    elsif v_title like '%étnic%' or v_title like '%etnic%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and (lower(c.name) like '%étnic%' or lower(c.name) like '%etnic%');
    elsif v_title like '%vulnerable%' or v_title like '%especiales%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and (lower(c.name) like '%especial%' or lower(c.name) like '%vulnerable%');
    elsif v_title like '%medios%' or v_title like '%comunicación%' or v_title like '%comunicacion%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and (lower(c.name) like '%medio%' or lower(c.name) like '%comunic%');
    elsif v_title like '%estad%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and lower(c.name) like '%estad%';
    elsif v_title like '%capacitación%' or v_title like '%capacitacion%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and lower(c.name) like '%capacit%';
    elsif v_title like '%juvenil%' or v_title like '%joven%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and (lower(c.name) like '%juven%' or lower(c.name) like '%joven%');
    elsif v_title like '%instituciones%' or v_title like '%públicas%' or v_title like '%publicas%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and (lower(c.name) like '%instit%' or lower(c.name) like '%públic%' or lower(c.name) like '%public%');
    elsif v_title like '%restauración%' or v_title like '%restauracion%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and lower(c.name) like '%restaur%';
    elsif v_title like '%sorda%' or v_title like '%sordociega%' then
      select count(distinct s.publication_id) into v_metric
      from public.shares s
      join public.publications p on p.id = s.publication_id
      join public.coordinations c on c.id = p.coordination_id
      where s.user_id = v_user
        and (s.created_at at time zone 'America/Bogota')::date >= v_week_start
        and (lower(c.name) like '%sorda%' or lower(c.name) like '%sordociega%');
    else
      v_metric := coalesce(v_mission.default_progress, 0);
    end if;

    v_progress := least(greatest(coalesce(v_metric, 0), 0), greatest(v_mission.goal, 1));

    computed_status := case
      when v_progress >= greatest(v_mission.goal, 1) then 'completed'
      when v_mission.default_status = 'locked' then 'locked'
      when v_progress > 0 then 'in_progress'
      else 'pending'
    end;

    if computed_status = 'completed' then
      v_completion := null;
      insert into public.mission_completions (mission_id, profile_id, progress)
      values (v_mission.id, v_user, v_progress)
      on conflict (mission_id, profile_id) do nothing
      returning id into v_completion;

      if v_completion is not null then
        v_award_xp := coalesce(v_mission.xp_reward, 0);

        if v_award_xp > 0 then
          perform public.apply_xp(v_user, v_award_xp, 'mision_auto_completada', 'mission', v_mission.id::text);
          v_profile_xp := v_profile_xp + v_award_xp;
        end if;
        perform public.refresh_profile_badges(v_user);
      end if;
    end if;

    mission_id := v_mission.id;
    progress := v_progress;
    return next;
  end loop;
end;
$$;

grant execute on function public.sync_my_mission_progress() to authenticated;
