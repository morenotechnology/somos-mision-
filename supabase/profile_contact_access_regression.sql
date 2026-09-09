-- Execute after contact recovery. Results contain no contact data.
begin;
create temporary table contact_access_result (test text, passed boolean) on commit drop;
do $$
declare ordinary_id uuid; admin_id uuid; private_row jsonb; expected_count bigint;
begin
  select id into ordinary_id from public.profiles
    where rol = 'multiplicador' and nullif(btrim(whatsapp), '') is not null limit 1;
  select id into admin_id from public.profiles where rol = 'admin' and cuenta_activa limit 1;
  if ordinary_id is null or admin_id is null then raise exception 'Missing test subjects'; end if;
  if has_column_privilege('authenticated','public.profiles','whatsapp','SELECT')
    or has_column_privilege('authenticated','public.profiles','celular','SELECT')
    or has_column_privilege('authenticated','public.profiles','email','SELECT')
    or has_column_privilege('authenticated','public.profiles','rol','UPDATE')
    or has_column_privilege('authenticated','public.profiles','can_publish','UPDATE') then
    raise exception 'Private columns or authorization remain writable/readable directly';
  end if;
  if not has_column_privilege('authenticated','public.profiles','whatsapp','UPDATE')
    or not has_column_privilege('authenticated','public.profiles','xp','SELECT') then
    raise exception 'Owner editing or public ranking permissions were lost';
  end if;
  insert into contact_access_result values ('Contactos privados y rol protegidos',true);

  perform set_config('request.jwt.claim.sub',ordinary_id::text,true);
  perform set_config('contact.test_user',ordinary_id::text,true);
  private_row := public.get_profile_private(ordinary_id);
  if nullif(private_row->>'whatsapp','') is null then raise exception 'Owner contact lookup failed'; end if;
  insert into contact_access_result values ('La persona puede consultar su propio contacto',true);
  begin
    perform public.get_profile_private(admin_id);
    raise exception 'Other private profiles were exposed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.admin_list_profiles();
    raise exception 'Ordinary user could read the admin directory';
  exception when insufficient_privilege then null;
  end;
  insert into contact_access_result values ('Usuario normal no accede a contactos ajenos ni al directorio',true);

  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  select count(*) into expected_count from public.profiles;
  if (select count(*) from public.admin_list_profiles()) <> expected_count then
    raise exception 'Admin directory is incomplete';
  end if;
  private_row := public.get_profile_private(ordinary_id);
  if nullif(private_row->>'whatsapp','') is null then raise exception 'Admin contact lookup failed'; end if;
  insert into contact_access_result values ('Superadmin consulta el directorio y el contacto recuperado',true);

  perform set_config('request.jwt.claim.sub','',true);
  begin
    perform public.get_profile_private(ordinary_id);
    raise exception 'Anonymous access was allowed';
  exception when insufficient_privilege then null;
  end;
  insert into contact_access_result values ('Sin sesión no se exponen contactos',true);
  perform set_config('request.jwt.claim.sub',ordinary_id::text,true);
end $$;

grant select, insert on contact_access_result to authenticated;
set local role authenticated;
do $$
declare own_id uuid := current_setting('contact.test_user')::uuid; own_phone text; affected integer;
begin
  -- Exercise actual DB grants/RLS as the authenticated role.
  perform id, nombre_completo, xp, district_id from public.profiles limit 1;
  own_phone := public.get_profile_private(own_id)->>'whatsapp';
  begin
    update public.profiles set whatsapp = own_phone where id = own_id;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception 'Owner profile editing failed'; end if;
    raise exception using errcode = 'ZC002', message = 'Rollback test update';
  exception when sqlstate 'ZC002' then null;
  end;
  insert into contact_access_result values ('Edición propia y lectura social siguen funcionando con RLS',true);
end $$;
reset role;
select * from contact_access_result;
commit;
