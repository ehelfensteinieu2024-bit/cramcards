-- CramCards schema. Paste into Supabase > SQL Editor > New query > Run.

create table if not exists public.cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question    text not null check (char_length(question) between 1 and 500),
  answer      text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists cards_user_id_created_at_idx
  on public.cards (user_id, created_at desc);

-- Row Level Security: each user only sees and changes their own cards.
alter table public.cards enable row level security;

drop policy if exists "cards_select_own" on public.cards;
drop policy if exists "cards_insert_own" on public.cards;
drop policy if exists "cards_update_own" on public.cards;
drop policy if exists "cards_delete_own" on public.cards;

create policy "cards_select_own" on public.cards
  for select to authenticated
  using (auth.uid() = user_id);

create policy "cards_insert_own" on public.cards
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "cards_update_own" on public.cards
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cards_delete_own" on public.cards
  for delete to authenticated
  using (auth.uid() = user_id);

-- Logged-out visitors get nothing.
revoke all on public.cards from anon;
grant select, insert, update, delete on public.cards to authenticated;
