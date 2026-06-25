-- Patch minimo para que el panel de Pastor/Directivo cree publicaciones
-- con enlaces separados de Facebook e Instagram.
-- Ejecutar en Supabase SQL Editor si aparece:
-- "facebook_url no esta en la BDD" / "Could not find the 'facebook_url' column".

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
      and rol in ('admin', 'pastor')
  )
);

grant select, insert on public.publications to authenticated;
