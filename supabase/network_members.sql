-- Somos Misión: private referral attribution and member-uploaded profile pictures.
-- Additive; no backfill, existing accounts cannot claim an inviter after signup.
begin;

create table if not exists public.network_referral_codes (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  code uuid not null unique default gen_random_uuid()
);
create table if not exists public.network_referrals (
  invitee_id uuid primary key references auth.users(id) on delete cascade,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  awarded_at timestamptz,
  check (invitee_id <> inviter_id)
);
create index if not exists network_referrals_inviter_idx on public.network_referrals(inviter_id);
alter table public.network_referral_codes enable row level security;
alter table public.network_referrals enable row level security;
revoke all on public.network_referrals, public.network_referral_codes from public, anon, authenticated;

create or replace function public.my_network_referral()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner uuid := auth.uid();
begin
  if not exists (select from public.profiles where id = owner and cuenta_activa) then
    raise exception 'Se requiere una cuenta activa' using errcode = '42501';
  end if;
  insert into public.network_referral_codes(owner_id) values (owner) on conflict do nothing;
  return jsonb_build_object('code', (select code from public.network_referral_codes where owner_id = owner),
    'confirmed', (select count(*) from public.xp_activities where profile_id = owner and accion = 'uno_trae_uno'));
end $$;
revoke all on function public.my_network_referral() from public, anon;
grant execute on function public.my_network_referral() to authenticated;

create or replace function public.network_signup_referral()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  token text;
  beneficiary uuid;
begin
  if tg_op = 'INSERT' then
    token := new.raw_user_meta_data->>'referral_code';
    if token is null or token !~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$' then return new; end if;
    insert into public.network_referrals(invitee_id, inviter_id)
      select new.id, c.owner_id from public.network_referral_codes c
      join public.profiles p on p.id = c.owner_id and p.cuenta_activa
      where c.code = token::uuid and c.owner_id <> new.id
      on conflict (invitee_id) do nothing;
  end if;
  if new.email_confirmed_at is not null then
    -- Single atomic claim; retries, changing metadata or confirming twice cannot repay.
    update public.network_referrals r set awarded_at = now()
    where r.invitee_id = new.id and r.awarded_at is null and exists
      (select from public.profiles p where p.id = r.inviter_id and p.cuenta_activa)
    returning r.inviter_id into beneficiary;
    if beneficiary is not null then
      perform public.apply_xp(beneficiary, 400, 'uno_trae_uno', 'referral', new.id::text);
      perform public.refresh_profile_badges(beneficiary);
    end if;
  end if;
  return new;
end $$;
revoke all on function public.network_signup_referral() from public, anon, authenticated;
-- This helper awards arbitrary amounts and must only be called by trusted routines.
revoke execute on function public.apply_xp(uuid,integer,text,text,text) from public, anon, authenticated;
create or replace trigger zz_network_referral_at_signup after insert on auth.users
  for each row execute function public.network_signup_referral();
create or replace trigger zz_network_referral_on_confirmation after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.network_signup_referral();

-- Only a single small raster image per account. The public URL can be used
-- as an <img> in conversations; listing and overwriting other files is not allowed.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('network-avatars','network-avatars',true,524288,array['image/jpeg'])
on conflict (id) do nothing;
do $$ begin
  if not exists (select from pg_policies where schemaname='storage' and tablename='objects' and policyname='network avatar owner insert') then
    create policy "network avatar owner insert" on storage.objects for insert to authenticated
      with check (bucket_id='network-avatars' and name=(select auth.uid())::text || '/avatar.jpg');
    create policy "network avatar owner select" on storage.objects for select to authenticated
      using (bucket_id='network-avatars' and name=(select auth.uid())::text || '/avatar.jpg');
    create policy "network avatar owner update" on storage.objects for update to authenticated
      using (bucket_id='network-avatars' and name=(select auth.uid())::text || '/avatar.jpg')
      with check (bucket_id='network-avatars' and name=(select auth.uid())::text || '/avatar.jpg');
  end if;
end $$;
notify pgrst, 'reload schema';
commit;
