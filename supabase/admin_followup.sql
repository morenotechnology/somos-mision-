-- Apply after network_members.sql. This migration never awards or adjusts XP.
begin;
set local lock_timeout = '5s';

alter table public.network_referrals add column if not exists first_shared_at timestamptz;
-- Keep the milestone even if the editor later removes the shared publication.
create or replace function public.remember_first_referral_share()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.network_referrals set first_shared_at = coalesce(new.opened_at,new.created_at,now())
    where invitee_id=new.user_id and first_shared_at is null;
  return new;
end $$;
revoke all on function public.remember_first_referral_share() from public, anon, authenticated;
create or replace trigger network_referral_share_history after insert or update of verification_status on public.shares
  for each row when (new.verification_status in ('opened','verified'))
  execute function public.remember_first_referral_share();
update public.network_referrals r set first_shared_at=s.first_at
from (select user_id,min(coalesce(opened_at,created_at)) as first_at from public.shares
      where verification_status in ('opened','verified') group by user_id) s
where r.invitee_id=s.user_id and r.first_shared_at is null;

create table if not exists public.community_outreach (
  member_id uuid primary key references public.profiles(id) on delete cascade,
  opened_by uuid references public.profiles(id) on delete set null,
  opened_at timestamptz not null default now(),
  sent_at timestamptz
);
alter table public.community_outreach enable row level security;
revoke all on public.community_outreach from public, anon, authenticated;

create or replace function public.require_followup_admin()
returns uuid language plpgsql stable security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if not exists(select from public.profiles where id=actor and rol='admin' and cuenta_activa) then
    raise exception 'Solo el superadmin activo puede consultar el seguimiento.' using errcode='42501';
  end if;
  return actor;
end $$;
revoke all on function public.require_followup_admin() from public, anon, authenticated;

create or replace function public.admin_followup_page(p_kind text,p_offset integer default 0,p_limit integer default 500)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.require_followup_admin();
  if p_kind='contacts' then
    return query select to_jsonb(o) from public.community_outreach o order by o.member_id
      limit greatest(1,least(p_limit,500)) offset greatest(0,p_offset);
  elsif p_kind='referrals' then
    return query select jsonb_build_object('invitee_id',r.invitee_id,'inviter_id',r.inviter_id,
      'registered_at',p.created_at,'first_shared_at',r.first_shared_at,'credited_at',
      (select min(x.fecha) from public.xp_activities x where x.profile_id=r.inviter_id
        and x.accion='uno_trae_uno' and x.reference_type='referral'
        and x.reference_id=r.invitee_id::text and x.puntos_ganados=400))
      from public.network_referrals r left join public.profiles p on p.id=r.invitee_id
      order by p.created_at desc nulls last,r.invitee_id
      limit greatest(1,least(p_limit,500)) offset greatest(0,p_offset);
  else raise exception 'Seguimiento desconocido'; end if;
end $$;

create or replace function public.admin_whatsapp_contact(p_member uuid,p_action text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := public.require_followup_admin(); rec public.community_outreach; may_open boolean := false;
begin
  if p_action='open' then
    -- Only one winner, including concurrent clicks from the same admin.
    insert into public.community_outreach(member_id,opened_by) values (p_member,actor)
      on conflict (member_id) do update set opened_by=actor,opened_at=now()
      where community_outreach.sent_at is null and not exists(select from public.profiles p
        where p.id=community_outreach.opened_by and p.rol='admin' and p.cuenta_activa)
      returning * into rec;
    may_open := found;
  elsif p_action='resume' then
    select * into rec from public.community_outreach where member_id=p_member and opened_by=actor and sent_at is null for update;
    may_open := found;
  elsif p_action='sent' then
    update public.community_outreach set sent_at=coalesce(sent_at,now())
      where member_id=p_member and opened_by=actor returning * into rec;
    if not found then raise exception 'Esta conversación no está a tu cargo.' using errcode='42501'; end if;
  elsif p_action='release' then
    delete from public.community_outreach where member_id=p_member and opened_by=actor and sent_at is null;
    if not found then raise exception 'Solo puedes liberar un chat tuyo sin envío confirmado.' using errcode='42501'; end if;
  else raise exception 'Acción desconocida'; end if;
  select * into rec from public.community_outreach where member_id=p_member;
  return jsonb_build_object('may_open',may_open,'contact',case when found then to_jsonb(rec) end);
end $$;
revoke all on function public.admin_followup_page(text,integer,integer), public.admin_whatsapp_contact(uuid,text) from public, anon;
grant execute on function public.admin_followup_page(text,integer,integer), public.admin_whatsapp_contact(uuid,text) to authenticated;
notify pgrst, 'reload schema';
commit;
