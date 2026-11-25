-- Run after admin_followup.sql. Synthetic rows only, rolled back.
begin;
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); member uuid:=gen_random_uuid();
  token text; doc jsonb; post bigint;
begin
  insert into auth.users(id,email,raw_user_meta_data) values
    (a,a::text||'@example.invalid','{}'),(b,b::text||'@example.invalid','{}');
  update public.profiles set rol='admin' where id in (a,b);
  perform set_config('request.jwt.claim.sub',a::text,true);
  token:=public.my_network_referral()->>'code';
  insert into auth.users(id,email,raw_user_meta_data) values
    (member,member::text||'@example.invalid',jsonb_build_object('referral_code',token));
  -- Navigate directly to the synthetic invitation in this transaction regardless of directory size.
  select j into strict doc from public.admin_followup_page('referrals',0,500) j where j->>'invitee_id'=member::text;
  if doc->>'inviter_id' <> a::text or doc->>'first_shared_at' is not null or doc->>'credited_at' is not null then raise exception 'Incorrect initial referral'; end if;
  if not (public.admin_whatsapp_contact(member,'open')->>'may_open')::boolean then raise exception 'Claim failed'; end if;
  if (public.admin_whatsapp_contact(member,'open')->>'may_open')::boolean then raise exception 'Duplicate click'; end if;
  perform set_config('request.jwt.claim.sub',b::text,true);
  doc:=public.admin_whatsapp_contact(member,'open');
  if (doc->>'may_open')::boolean or doc->'contact'->>'opened_by' <> a::text then raise exception 'Duplicate claim'; end if;
  begin perform public.admin_whatsapp_contact(member,'sent'); raise exception 'Wrong admin could mark sent'; exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',a::text,true);
  perform public.admin_whatsapp_contact(member,'release');
  perform set_config('request.jwt.claim.sub',b::text,true);
  perform public.admin_whatsapp_contact(member,'open');
  if not (public.admin_whatsapp_contact(member,'resume')->>'may_open')::boolean then raise exception 'Resume failed'; end if;
  doc:=public.admin_whatsapp_contact(member,'sent');
  if doc->'contact'->>'sent_at' is null or (public.admin_whatsapp_contact(member,'resume')->>'may_open')::boolean then raise exception 'Sent state incorrect'; end if;
  if not exists (select from public.community_outreach where member_id=member and opened_by=b and sent_at is not null) then raise exception 'Missing contact'; end if;
  perform set_config('request.jwt.claim.sub',member::text,true);
  begin perform public.admin_followup_page('referrals',0,1); raise exception 'Private report exposed'; exception when insufficient_privilege then null; end;
  begin perform public.admin_whatsapp_contact(a,'open'); raise exception 'Member could claim'; exception when insufficient_privilege then null; end;
  if has_table_privilege('authenticated','public.community_outreach','SELECT') or
    has_function_privilege('anon','public.admin_followup_page(text,integer,integer)','EXECUTE') then raise exception 'Unexpected grant'; end if;
  insert into public.publications(title,description,category,copy_text) values ('Prueba temporal','Prueba','Prueba','Prueba') returning id into post;
  perform public.share_publication(post,'whatsapp',null,'opened',null);
  delete from public.publications where id=post;
  perform set_config('request.jwt.claim.sub',a::text,true);
  select j into strict doc from public.admin_followup_page('referrals',0,500) j where j->>'invitee_id'=member::text;
  if doc->>'first_shared_at' is null or doc->>'credited_at' is null then raise exception 'Missing milestone or XP credit'; end if;
end $$;
select 'OK: invitador, primer compartido y abono de 400 XP; contacto exclusivo, envío manual y acceso solo de superadmin.' as prueba;
rollback;
