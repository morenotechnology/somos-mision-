-- Synthetic accounts only. All test users, points and badge writes roll back.
begin;
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); c uuid := gen_random_uuid(); d uuid := gen_random_uuid();
  token text; initial_xp integer;
begin
  insert into auth.users(id,email,raw_user_meta_data) values (a,a::text || '@example.invalid','{}');
  select xp into strict initial_xp from public.profiles where id=a;
  perform set_config('request.jwt.claim.sub', a::text, true);
  token := public.my_network_referral()->>'code';
  if token is null or token <> (public.my_network_referral()->>'code') then raise exception 'Unstable code'; end if;
  insert into auth.users(id,email,raw_user_meta_data) values (b,b::text || '@example.invalid',jsonb_build_object('referral_code',token));
  if (select xp from public.profiles where id=a) <> initial_xp then raise exception 'Unconfirmed signup awarded'; end if;
  update auth.users set raw_user_meta_data='{}', email_confirmed_at=now() where id=b;
  update auth.users set email_confirmed_at=now() where id=b;
  insert into auth.users(id,email,raw_user_meta_data,email_confirmed_at)
    values (c,c::text || '@example.invalid',jsonb_build_object('referral_code',token),now());
  insert into auth.users(id,email,raw_user_meta_data) values (d,d::text || '@example.invalid','{"referral_code":"invalid"}');
  update auth.users set raw_user_meta_data=jsonb_build_object('referral_code',token), email_confirmed_at=now() where id=d;
  if (select xp from public.profiles where id=a) <> initial_xp + 800
    or (public.my_network_referral()->>'confirmed')::int <> 2
    or exists(select from public.network_referrals where invitee_id=d)
    then raise exception 'Incorrect referral attribution or amount'; end if;
  if has_table_privilege('authenticated','public.network_referrals','INSERT')
    or has_function_privilege('authenticated','public.apply_xp(uuid,integer,text,text,text)','EXECUTE')
    or has_function_privilege('anon','public.my_network_referral()','EXECUTE')
    then raise exception 'Unexpected client privileges'; end if;
  if not exists(select from storage.buckets where id='network-avatars' and public and file_size_limit=524288 and allowed_mime_types=array['image/jpeg'])
    or (select count(*) from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'network avatar owner %') <> 3
    then raise exception 'Avatar bucket or permissions missing'; end if;
end $$;
select 'OK: 2 registros confirmados = 800 XP; sin duplicados ni atribución retroactiva. Fotos con límites y permisos de propietario.' as resultado;
rollback;
