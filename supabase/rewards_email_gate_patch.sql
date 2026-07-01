-- Patch: rachas funcionales, insignias mas dificiles y mas misiones sin bloquear XP.
-- Ejecutar en Supabase SQL Editor despues de schema.sql/production_fix.
-- Es seguro correrlo mas de una vez.

alter table public.profiles add column if not exists can_publish boolean not null default false;
alter table public.profiles add column if not exists tiene_cargo boolean;
alter table public.profiles add column if not exists usuario_redes text;
alter table public.profiles add column if not exists perfil_completo boolean not null default false;
alter table public.profiles add column if not exists last_streak_date date;
alter table public.profiles add column if not exists email_gate_verified_at timestamptz;
alter table public.publications add column if not exists source_url text;
alter table public.publications add column if not exists facebook_url text;
alter table public.publications add column if not exists instagram_url text;
alter table public.publications add column if not exists source_platform text not null default 'manual';
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
    where conname = 'publications_source_platform_check'
      and conrelid = 'public.publications'::regclass
  ) then
    alter table public.publications
      add constraint publications_source_platform_check
      check (source_platform in ('facebook', 'instagram', 'manual'));
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

create index if not exists shares_publication_user_idx on public.shares(publication_id, user_id);
create index if not exists shares_user_created_idx on public.shares(user_id, created_at desc);
create index if not exists xp_activities_profile_fecha_idx on public.xp_activities(profile_id, fecha desc);

drop policy if exists "pastors create publications" on public.publications;
create policy "pastors create publications"
on public.publications
for insert
to authenticated
with check (
  author_profile_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (rol = 'admin' or can_publish = true)
  )
);

grant select, insert on public.publications to authenticated;

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

create or replace function public.mark_email_gate_verified()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'No authenticated user';
  end if;

  update public.profiles
  set email_gate_verified_at = coalesce(email_gate_verified_at, now())
  where id = v_user;
end;
$$;

create or replace function public.apply_xp(
  p_profile_id uuid,
  p_points integer,
  p_action text,
  p_reference_type text default null,
  p_reference_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'America/Bogota')::date;
  v_points integer := greatest(coalesce(p_points, 0), 0);
begin
  if v_points <= 0 then
    return;
  end if;

  update public.profiles
  set
    xp = xp + v_points,
    streak = case
      when last_streak_date = v_today then streak
      when last_streak_date = v_today - 1 then streak + 1
      else 1
    end,
    last_streak_date = v_today
  where id = p_profile_id;

  insert into public.xp_activities (profile_id, accion, puntos_ganados, reference_type, reference_id)
  values (p_profile_id, p_action, v_points, p_reference_type, p_reference_id);
end;
$$;

insert into public.badges (id, name, icon, description, xp, color) values
  ('b1', 'Primer Impacto', 'Sprout', 'Gana XP con tu primer contenido compartido.', 100, '#22c55e'),
  ('b2', 'Multiplicador Firme', 'Zap', 'Comparte 25 publicaciones diferentes con XP.', 1250, '#D4AF37'),
  ('b3', 'Racha Viva', 'Flame', 'Mantén una racha real de 7 días sumando XP.', 1500, '#E65100'),
  ('b4', 'Voz Nacional', 'Megaphone', 'Alcanza 2000 XP acumulados.', 2000, '#1A237E'),
  ('b5', 'Misionero Constante', 'Globe', 'Completa 15 misiones oficiales.', 2500, '#5C1800'),
  ('b6', 'Señal de Oro', 'Radio', 'Comparte 50 publicaciones diferentes con XP.', 3500, '#F59E0B'),
  ('b7', 'Columna de Luz', 'Sparkles', 'Mantén 30 días reales de racha.', 5000, '#60A5FA'),
  ('b8', 'Pionero Nacional', 'Crown', 'Alcanza 5000 XP acumulados.', 5000, '#D4AF37'),
  ('b9', 'Red Expandida', 'Share2', 'Comparte 100 publicaciones diferentes con XP.', 7500, '#0EA5E9'),
  ('b10', 'Disciplina Misionera', 'Target', 'Completa 30 misiones oficiales.', 8000, '#7C3AED'),
  ('b11', 'Embajador Mayor', 'Medal', 'Alcanza 10000 XP acumulados.', 10000, '#C2410C'),
  ('b12', 'Antorcha Nacional', 'Trophy', 'Mantén 90 días reales de racha.', 15000, '#DC2626')
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  xp = excluded.xp,
  color = excluded.color;

create or replace function public.refresh_profile_badges(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_xp integer := 0;
  v_distinct_awarded_shares integer := 0;
  v_missions integer := 0;
  v_streak integer := 0;
begin
  select coalesce(xp, 0), coalesce(streak, 0)
  into v_xp, v_streak
  from public.profiles
  where id = p_profile_id;

  select count(distinct publication_id)
  into v_distinct_awarded_shares
  from public.shares
  where user_id = p_profile_id
    and xp_awarded > 0;

  select count(*)
  into v_missions
  from public.mission_completions
  where profile_id = p_profile_id;

  if v_distinct_awarded_shares >= 1 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b1') on conflict do nothing;
  end if;
  if v_distinct_awarded_shares >= 25 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b2') on conflict do nothing;
  end if;
  if v_streak >= 7 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b3') on conflict do nothing;
  end if;
  if v_xp >= 2000 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b4') on conflict do nothing;
  end if;
  if v_missions >= 15 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b5') on conflict do nothing;
  end if;
  if v_distinct_awarded_shares >= 50 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b6') on conflict do nothing;
  end if;
  if v_streak >= 30 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b7') on conflict do nothing;
  end if;
  if v_xp >= 5000 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b8') on conflict do nothing;
  end if;
  if v_distinct_awarded_shares >= 100 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b9') on conflict do nothing;
  end if;
  if v_missions >= 30 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b10') on conflict do nothing;
  end if;
  if v_xp >= 10000 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b11') on conflict do nothing;
  end if;
  if v_streak >= 90 then
    insert into public.profile_badges (profile_id, badge_id) values (p_profile_id, 'b12') on conflict do nothing;
  end if;
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
  v_shared_id uuid;
  v_already_awarded boolean := false;
  v_xp integer := 0;
  v_base_xp integer := 0;
  v_profile_xp integer := 0;
  v_profile_complete boolean := false;
  v_email_gate_verified boolean := false;
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

  select
    coalesce(p.xp, 0),
    coalesce(p.perfil_completo, false),
    p.email_gate_verified_at is not null
  into v_profile_xp, v_profile_complete, v_email_gate_verified
  from public.profiles p
  where p.id = v_user;

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
  v_email_gate_verified boolean := false;
begin
  if v_user is null then
    raise exception 'No authenticated user';
  end if;

  select
    coalesce(p.xp, 0),
    coalesce(p.perfil_completo, false),
    p.email_gate_verified_at is not null
  into v_profile_xp, v_profile_complete, v_email_gate_verified
  from public.profiles p
  where p.id = v_user;

  select id into v_exists
  from public.mission_completions
  where mission_id = p_mission_id and profile_id = v_user;

  if v_exists is null then
    insert into public.mission_completions (mission_id, profile_id)
    values (p_mission_id, v_user)
    returning id into v_exists;

    select coalesce(xp_reward, 0) into v_xp
    from public.missions
    where id = p_mission_id and active = true;

    if not found then
      raise exception 'Mission not found or inactive';
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
grant execute on function public.mark_email_gate_verified() to authenticated;

insert into public.missions (id, type, title, description, xp_reward, goal, unit, icon, default_status, default_progress, active, order_index) values
  ('11111111-bbbb-4111-8111-111111111111', 'daily', 'Primera señal del día', 'Comparte una publicación oficial y registra el avance de hoy.', 55, 1, 'contenido', 'Zap', 'pending', 0, true, 10),
  ('22222222-bbbb-4222-8222-222222222222', 'daily', 'Ruta WhatsApp', 'Comparte una publicación por WhatsApp con tu contacto o grupo misionero.', 45, 1, 'envío', 'Send', 'pending', 0, true, 11),
  ('33333333-bbbb-4333-8333-333333333333', 'daily', 'Contenido destacado', 'Comparte una publicación marcada como destacada para impulsar la señal nacional.', 85, 1, 'destacado', 'Star', 'pending', 0, true, 12),
  ('44444444-bbbb-4444-8444-444444444444', 'daily', 'Perfil listo', 'Completa tu cargo y usuario de redes para liberar el avance completo.', 90, 1, 'perfil', 'UserCheck', 'pending', 0, true, 13),
  ('55555555-bbbb-4555-8555-555555555555', 'weekly', 'Semana de 5 señales', 'Comparte cinco publicaciones diferentes durante la semana.', 240, 5, 'contenidos', 'Radio', 'pending', 0, true, 20),
  ('66666666-bbbb-4666-8666-666666666666', 'weekly', 'Tres frentes conectados', 'Participa compartiendo contenido de tres coordinaciones distintas.', 260, 3, 'coordinaciones', 'Network', 'pending', 0, true, 21),
  ('77777777-bbbb-4777-8777-777777777777', 'weekly', 'Racha semanal', 'Suma XP durante cinco días distintos de la semana.', 300, 5, 'días', 'Flame', 'pending', 0, true, 22),
  ('10000001-cccc-4001-8001-000000000001', 'weekly', 'Coordinación Evangelismo', 'Activa una acción de evangelismo urbano, barrial o de nuevos campos.', 140, 1, 'acción', 'Megaphone', 'pending', 0, true, 31),
  ('10000002-cccc-4002-8002-000000000002', 'weekly', 'Coordinación Hospitalaria', 'Comparte una señal de fe, acompañamiento y oración por hospitales.', 140, 1, 'acción', 'HeartPulse', 'pending', 0, true, 32),
  ('10000003-cccc-4003-8003-000000000003', 'weekly', 'Coordinación Carcelaria', 'Impulsa una publicación sobre libertad espiritual y acompañamiento carcelario.', 140, 1, 'acción', 'Scale', 'pending', 0, true, 33),
  ('10000004-cccc-4004-8004-000000000004', 'weekly', 'Coordinación Asuntos Étnicos', 'Comparte contenido de alcance a comunidades étnicas y territorios especiales.', 140, 1, 'acción', 'Leaf', 'pending', 0, true, 34),
  ('10000005-cccc-4005-8005-000000000005', 'weekly', 'Población Vulnerable y Especiales', 'Activa una publicación de cuidado, acompañamiento y restauración integral.', 140, 1, 'acción', 'Heart', 'pending', 0, true, 35),
  ('10000006-cccc-4006-8006-000000000006', 'weekly', 'Medios de Comunicación', 'Comparte una publicación preparada para redes, radio o señal digital.', 140, 1, 'acción', 'Radio', 'pending', 0, true, 36),
  ('10000007-cccc-4007-8007-000000000007', 'weekly', 'Estadísticas', 'Registra y comparte una señal que ayude a medir el avance misionero.', 140, 1, 'acción', 'BarChart3', 'pending', 0, true, 37),
  ('10000008-cccc-4008-8008-000000000008', 'weekly', 'Capacitación Misionera', 'Impulsa contenido de formación para obreros y multiplicadores.', 140, 1, 'acción', 'BookOpenCheck', 'pending', 0, true, 38),
  ('10000009-cccc-4009-8009-000000000009', 'weekly', 'Misión Juvenil', 'Comparte una publicación que active jóvenes en la red nacional.', 140, 1, 'acción', 'Flame', 'pending', 0, true, 39),
  ('10000010-cccc-4010-8010-000000000010', 'weekly', 'Instituciones Públicas', 'Comparte contenido enfocado en puertas abiertas e instituciones públicas.', 140, 1, 'acción', 'Landmark', 'pending', 0, true, 40),
  ('10000011-cccc-4011-8011-000000000011', 'weekly', 'Restauración Espiritual', 'Comparte una señal de restauración, cuidado y retorno a la fe.', 140, 1, 'acción', 'RefreshCw', 'pending', 0, true, 41),
  ('10000012-cccc-4012-8012-000000000012', 'weekly', 'Población Sorda y Sordociega', 'Impulsa una publicación de inclusión y acceso al evangelio.', 140, 1, 'acción', 'HandHeart', 'pending', 0, true, 42),
  ('90000001-dddd-4001-9001-000000000001', 'special', 'Embajador 1000', 'Alcanza 1000 XP con compartidos y misiones reales.', 250, 1, 'logro', 'Medal', 'pending', 0, true, 70),
  ('90000002-dddd-4002-9002-000000000002', 'special', 'Red expandida', 'Comparte 25 publicaciones diferentes con XP ganado.', 320, 25, 'contenidos', 'Share2', 'pending', 0, true, 71),
  ('90000003-dddd-4003-9003-000000000003', 'special', 'Racha de fuego', 'Mantén siete días reales de actividad con XP.', 350, 7, 'días', 'Flame', 'pending', 0, true, 72),
  ('90000004-dddd-4004-9004-000000000004', 'special', 'Top regional', 'Sube en el ranking de tu región compartiendo contenido oficial.', 450, 1, 'ranking', 'Trophy', 'pending', 0, true, 73)
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  description = excluded.description,
  xp_reward = excluded.xp_reward,
  goal = excluded.goal,
  unit = excluded.unit,
  icon = excluded.icon,
  default_status = excluded.default_status,
  default_progress = excluded.default_progress,
  active = excluded.active,
  order_index = excluded.order_index;
