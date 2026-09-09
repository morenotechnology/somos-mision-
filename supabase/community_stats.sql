-- Public aggregate only. Never publish personal profile data to the home page.
begin;
create table if not exists public.community_stats (
  id smallint primary key default 1 check (id = 1),
  active_multipliers bigint not null default 0 check (active_multipliers >= 0),
  updated_at timestamptz not null default now()
);
alter table public.community_stats enable row level security;
revoke all on public.community_stats from anon, authenticated;
grant select on public.community_stats to anon, authenticated;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='community_stats' and policyname='Public aggregate is readable') then
    create policy "Public aggregate is readable" on public.community_stats for select to anon, authenticated using (true);
  end if;
end $$;

-- Serialize changes to the singleton so simultaneous registrations cannot lose increments.
lock table public.profiles in share row exclusive mode;
insert into public.community_stats(id, active_multipliers)
select 1, count(*) from public.profiles where cuenta_activa and rol = 'multiplicador'
on conflict (id) do update set active_multipliers=excluded.active_multipliers, updated_at=now();

create or replace function public.sync_community_stats()
returns trigger language plpgsql security definer set search_path=public as $$
declare delta integer := 0;
begin
  if TG_OP <> 'INSERT' and old.cuenta_activa and old.rol = 'multiplicador' then delta := delta - 1; end if;
  if TG_OP <> 'DELETE' and new.cuenta_activa and new.rol = 'multiplicador' then delta := delta + 1; end if;
  if delta <> 0 then
    update public.community_stats set active_multipliers=active_multipliers + delta, updated_at=now() where id=1;
  end if;
  return null;
end $$;
revoke all on function public.sync_community_stats() from public, anon, authenticated;
create or replace trigger profiles_community_stats
after insert or delete or update of cuenta_activa, rol on public.profiles
for each row execute function public.sync_community_stats();
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='community_stats') then
    alter publication supabase_realtime add table public.community_stats;
  end if;
end $$;
commit;
