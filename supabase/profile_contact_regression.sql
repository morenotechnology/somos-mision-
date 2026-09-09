-- Transactional integration checks. No real accounts, passwords or messages.
-- The synthetic signup and all its effects are rolled back inside a subtransaction.
begin;
create temporary table contact_regression_result (test text, passed boolean) on commit drop;
do $$
declare test_id uuid := gen_random_uuid(); profile_before bigint;
begin
  select count(*) into profile_before from public.profiles;
  begin
    insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at)
    values (test_id, 'profile-contact-check@example.invalid', jsonb_build_object(
      'nombre_completo', 'Prueba transaccional contacto', 'rol', 'multiplicador',
      'publisher_access_key', null, 'district_id', 'd5', 'region_id', 'r3',
      'congregacion_id', '999999999999999999999999999999999999999999',
      'congregacion', 'Iglesia prueba transaccional', 'celular', '+570000000000'
    ), '{"provider":"email","providers":["email"]}', 'authenticated', 'authenticated', now(), now());
    if not exists (
      select 1 from public.profiles where id = test_id
        and whatsapp = '+570000000000' and celular = '+570000000000'
        and district_id = 'd5' and region_id = 'r3'
        and congregacion = 'Iglesia prueba transaccional'
        and can_publish = false and rol = 'multiplicador'
    ) then
      raise exception 'Regression: signup did not preserve the submitted contact data.';
    end if;
    raise exception using errcode = 'ZC001', message = 'Rollback successful test fixture';
  exception when sqlstate 'ZC001' then null;
  end;
  begin
    insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at)
    values (test_id, 'profile-contact-check@example.invalid',
      '{"nombre_completo":"Prueba sin permisos","rol":"admin"}',
      '{"provider":"email","providers":["email"]}', 'authenticated', 'authenticated', now(), now());
    if not exists (select 1 from public.profiles where id = test_id and rol = 'multiplicador' and can_publish = false) then
      raise exception 'Regression: user metadata granted administrator access.';
    end if;
    raise exception using errcode = 'ZC001', message = 'Rollback authorization test fixture';
  exception when sqlstate 'ZC001' then null;
  end;
  if exists (select 1 from auth.users where id = test_id)
    or (select count(*) from public.profiles) <> profile_before then
    raise exception 'Regression fixture was not rolled back.';
  end if;
  insert into contact_regression_result values ('Registro sin llave editorial conserva todos los datos', true);
  insert into contact_regression_result values ('Un registro no puede asignarse superadmin', true);
  insert into contact_regression_result values ('No quedan cuentas ni perfiles de prueba', true);
end $$;
select * from contact_regression_result;
commit;
