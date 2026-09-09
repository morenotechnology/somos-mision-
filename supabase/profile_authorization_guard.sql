-- Private contact access depends on a server-assigned role, never a role
-- the user can give themselves. Existing administrators are unchanged.
begin;

revoke update on public.profiles from public, anon, authenticated;
revoke update (id, email, rol, can_publish, cuenta_activa, xp, level, created_at)
  on public.profiles from public, anon, authenticated;
grant update (
  nombre, nombre_completo, region_id, district_id, congregacion_id,
  congregacion, cargo, celular, whatsapp, fecha_cumpleanos, avatar,
  avatar_color, avatar_url, foto_perfil_url, foto_portada_url,
  mostrar_celular, mostrar_cumpleanos, mostrar_congregacion, mostrar_email,
  mostrar_distrito, tiene_cargo, usuario_redes, perfil_completo, email_gate_verified_at
) on public.profiles to authenticated;

-- Restrictive policy composes with the existing owner-only insert policy.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public'
    and tablename = 'profiles' and policyname = 'no client assigned admin') then
    create policy "no client assigned admin" on public.profiles
      as restrictive for insert to authenticated with check (rol <> 'admin');
  end if;
end $$;

commit;
