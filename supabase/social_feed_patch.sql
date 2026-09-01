-- Feed social: reacciones, comentarios y contadores sincronizados.
-- No elimina datos existentes. Ejecutar una sola vez en Supabase SQL Editor.

alter table public.publications
  add column if not exists comments_count integer not null default 0;

create index if not exists reactions_publication_type_idx
  on public.reactions(publication_id, type);
create index if not exists comments_publication_created_idx
  on public.comments(publication_id, created_at desc);

alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.followers enable row level security;

drop policy if exists "users insert own reactions" on public.reactions;
create policy "users insert own reactions"
  on public.reactions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users delete own reactions" on public.reactions;
create policy "users delete own reactions"
  on public.reactions for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users insert own comments" on public.comments;
create policy "users insert own comments"
  on public.comments for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users update own comments" on public.comments;
create policy "users update own comments"
  on public.comments for update to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.rol = 'admin' or p.can_publish = true)
    )
  )
  with check (auth.uid() = user_id);

drop policy if exists "users delete own comments" on public.comments;
create policy "users delete own comments"
  on public.comments for delete to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.rol = 'admin' or p.can_publish = true)
    )
  );

drop policy if exists "authenticated read followers" on public.followers;
create policy "authenticated read followers"
  on public.followers for select to authenticated using (true);

drop policy if exists "users insert own followers" on public.followers;
create policy "users insert own followers"
  on public.followers for insert to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "users delete own followers" on public.followers;
create policy "users delete own followers"
  on public.followers for delete to authenticated
  using (auth.uid() = follower_id);

create or replace function public.sync_publication_social_counters()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_publication_id bigint;
begin
  target_publication_id := coalesce(new.publication_id, old.publication_id);

  if tg_table_name = 'reactions' then
    update public.publications
      set likes_count = (
        select count(*)::integer
        from public.reactions
        where publication_id = target_publication_id and type = 'like'
      )
      where id = target_publication_id;
  elsif tg_table_name = 'comments' then
    update public.publications
      set comments_count = (
        select count(*)::integer
        from public.comments
        where publication_id = target_publication_id
      )
      where id = target_publication_id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists reactions_sync_publication_counter on public.reactions;
create trigger reactions_sync_publication_counter
  after insert or delete on public.reactions
  for each row execute function public.sync_publication_social_counters();

drop trigger if exists comments_sync_publication_counter on public.comments;
create trigger comments_sync_publication_counter
  after insert or delete on public.comments
  for each row execute function public.sync_publication_social_counters();

update public.publications p
set comments_count = (
  select count(*)::integer from public.comments c where c.publication_id = p.id
)
where comments_count = 0;
