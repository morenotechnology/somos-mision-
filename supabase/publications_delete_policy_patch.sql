-- Permite eliminar publicaciones oficiales únicamente a administradores y editores.
-- Ejecutar en el SQL Editor de Supabase después de publications_edit_policy_patch.sql.

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

grant delete on public.publications to authenticated;
