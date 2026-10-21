-- CramCards: subjects (folders). Paste into Supabase > SQL Editor > New query > Run.
-- Run AFTER schema.sql. Safe to run on an existing database and safe to re-run:
-- it never deletes cards. Existing cards are moved into each user's "General" subject.

begin;

-- 1. Subjects table ---------------------------------------------------------

create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 40),
  created_at  timestamptz not null default now()
);

-- One subject name per user, case-insensitive ("Marketing" = "marketing").
create unique index if not exists subjects_user_id_name_key
  on public.subjects (user_id, lower(name));

-- Lets cards reference (subject id, owner) so a card can only use its owner's subjects.
create unique index if not exists subjects_id_user_id_key
  on public.subjects (id, user_id);

-- Row Level Security: each user only sees and changes their own subjects.
alter table public.subjects enable row level security;

drop policy if exists "subjects_select_own" on public.subjects;
drop policy if exists "subjects_insert_own" on public.subjects;
drop policy if exists "subjects_update_own" on public.subjects;
drop policy if exists "subjects_delete_own" on public.subjects;

create policy "subjects_select_own" on public.subjects
  for select to authenticated
  using (auth.uid() = user_id);

create policy "subjects_insert_own" on public.subjects
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "subjects_update_own" on public.subjects
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subjects_delete_own" on public.subjects
  for delete to authenticated
  using (auth.uid() = user_id);

-- Logged-out visitors get nothing.
revoke all on public.subjects from anon;
grant select, insert, update, delete on public.subjects to authenticated;

-- 2. Link cards to subjects ------------------------------------------------

alter table public.cards add column if not exists subject_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cards_subject_owner_fkey'
  ) then
    alter table public.cards
      add constraint cards_subject_owner_fkey
      foreign key (subject_id, user_id)
      references public.subjects (id, user_id)
      on delete restrict;
  end if;
end $$;

create index if not exists cards_subject_id_idx on public.cards (subject_id);

-- 3. Move existing cards into a "General" subject (nothing is deleted) ------

insert into public.subjects (user_id, name)
select distinct c.user_id, 'General'
from public.cards c
where c.subject_id is null
on conflict (user_id, lower(name)) do nothing;

update public.cards c
set subject_id = s.id
from public.subjects s
where c.subject_id is null
  and s.user_id = c.user_id
  and lower(s.name) = 'general';

alter table public.cards alter column subject_id set not null;

-- 4. Cards saved without a subject go to "General" (created on first use) ---

create or replace function public.cards_default_subject()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.subject_id is null then
    insert into public.subjects (user_id, name)
    values (new.user_id, 'General')
    on conflict (user_id, lower(name)) do nothing;

    select s.id into new.subject_id
    from public.subjects s
    where s.user_id = new.user_id and lower(s.name) = 'general';
  end if;
  return new;
end;
$$;

drop trigger if exists cards_default_subject on public.cards;
create trigger cards_default_subject
  before insert on public.cards
  for each row execute function public.cards_default_subject();

commit;
