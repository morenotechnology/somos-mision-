-- Interacciones sociales de comentarios: respuestas, likes y notificaciones.
-- Ejecutar en el SQL Editor de Supabase. Es idempotente.

alter table public.comments
  add column if not exists parent_comment_id uuid references public.comments(id) on delete cascade;

create index if not exists comments_parent_created_idx
  on public.comments(parent_comment_id, created_at asc);

create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'like',
  created_at timestamptz not null default now(),
  unique (comment_id, user_id, type)
);

create index if not exists comment_reactions_comment_type_idx
  on public.comment_reactions(comment_id, type);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  publication_id bigint references public.publications(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_created_idx
  on public.notifications(recipient_id, created_at desc);

alter table public.comment_reactions enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "authenticated read comment reactions" on public.comment_reactions;
create policy "authenticated read comment reactions"
  on public.comment_reactions for select to authenticated using (true);

drop policy if exists "users insert own comment reactions" on public.comment_reactions;
create policy "users insert own comment reactions"
  on public.comment_reactions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users delete own comment reactions" on public.comment_reactions;
create policy "users delete own comment reactions"
  on public.comment_reactions for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = recipient_id);

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications"
  on public.notifications for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

grant select, insert, delete on public.comment_reactions to authenticated;
grant select, update on public.notifications to authenticated;

create or replace function public.notify_comment_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type <> 'like' then
    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    publication_id,
    comment_id,
    payload
  )
  select
    c.user_id,
    new.user_id,
    'comment_like',
    c.publication_id,
    c.id,
    jsonb_build_object('comment_id', c.id)
  from public.comments c
  where c.id = new.comment_id
    and c.user_id is not null
    and c.user_id <> new.user_id;

  return new;
end;
$$;

drop trigger if exists comment_like_notification on public.comment_reactions;
create trigger comment_like_notification
  after insert on public.comment_reactions
  for each row execute function public.notify_comment_like();

create or replace function public.notify_comment_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.parent_comment_id is null then
    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    publication_id,
    comment_id,
    parent_comment_id,
    payload
  )
  select
    parent_comment.user_id,
    new.user_id,
    'comment_reply',
    new.publication_id,
    new.id,
    parent_comment.id,
    jsonb_build_object(
      'comment_id', new.id,
      'parent_comment_id', parent_comment.id
    )
  from public.comments parent_comment
  where parent_comment.id = new.parent_comment_id
    and parent_comment.user_id is not null
    and parent_comment.user_id <> new.user_id;

  return new;
end;
$$;

drop trigger if exists comment_reply_notification on public.comments;
create trigger comment_reply_notification
  after insert on public.comments
  for each row execute function public.notify_comment_reply();

