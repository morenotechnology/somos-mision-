-- Permite que admin y Pastor/Directivo editorial editen publicaciones existentes.
-- Ejecutar en Supabase SQL Editor si el boton "Editar publicacion" falla por permisos.

alter table public.publications add column if not exists source_url text;
alter table public.publications add column if not exists facebook_url text;
alter table public.publications add column if not exists instagram_url text;
alter table public.publications add column if not exists source_platform text not null default 'manual';
alter table public.profiles add column if not exists can_publish boolean not null default false;

drop policy if exists "editors update publications" on public.publications;
create policy "editors update publications"
on public.publications
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (rol = 'admin' or can_publish = true)
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (rol = 'admin' or can_publish = true)
  )
);

drop policy if exists "editors delete publications" on public.publications;
create policy "editors delete publications"
on public.publications
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (rol = 'admin' or can_publish = true)
  )
);

grant select, insert, update, delete on public.publications to authenticated;
