-- LifeOS database schema
--
-- IMPORTANT: this file was reconstructed by reading which tables, columns,
-- and storage bucket the client code (src/hooks/data/*, src/lib/supabase.ts)
-- talks to. It was written from the OUTSIDE — no direct access to the live
-- Supabase project — so treat it as a best-effort reference, not a verified
-- dump. Before relying on it:
--
--   1. Reconcile it against the real thing. In the SQL editor of your
--      Supabase project, run:
--        select tablename, rowsecurity from pg_tables where schemaname='public';
--        select tablename, policyname, cmd, qual from pg_policies where schemaname='public';
--      and compare against the CREATE TABLE / CREATE POLICY statements below.
--   2. Once it matches, keep it that way with the Supabase CLI instead of by
--      hand: `supabase link`, then `supabase db pull` to capture drift as a
--      migration, or `supabase db dump --schema public > supabase/schema.sql`
--      to regenerate this file from the real database.
--
-- Every statement below is idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS)
-- so it's safe to run against a database that already has some of this.
--
-- Security model: this is a single-user personal app (see README) — there is
-- no per-row user_id, so RLS here does the one job that matters for a public
-- anon key: only the one specific person who owns this data can read or
-- write it, identified by email via is_owner() below. This is NOT the same
-- as "must be signed in" — Supabase allows public sign-up by default, so
-- being signed in only proves someone has an account, not that it's you.

-- ── Wellness ─────────────────────────────────────────────────────────────

create table if not exists public.water_logs (
  id bigint generated always as identity primary key,
  date date not null,
  amount integer not null check (amount > 0),
  time text not null,
  created_at timestamptz not null default now()
);
create index if not exists water_logs_date_idx on public.water_logs (date);

create table if not exists public.sleep_logs (
  id bigint generated always as identity primary key,
  date date not null unique,
  start_time text not null,
  end_time text not null,
  duration_hours numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cracker_logs (
  id bigint generated always as identity primary key,
  date date not null unique,
  content boolean not null default false,
  act boolean not null default false,
  urge boolean not null default false,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.vitamins (
  id bigint generated always as identity primary key,
  name text not null,
  dose text,
  frequency text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.vitamin_logs (
  id bigint generated always as identity primary key,
  vitamin_id bigint not null references public.vitamins (id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (vitamin_id, date)
);

create table if not exists public.skin_routine_items (
  id bigint generated always as identity primary key,
  routine text not null check (routine in ('morning', 'night')),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.skin_routine_logs (
  id bigint generated always as identity primary key,
  item_id bigint not null references public.skin_routine_items (id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (item_id, date)
);

create table if not exists public.weight_logs (
  id bigint generated always as identity primary key,
  date date not null,
  weight numeric not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists weight_logs_date_idx on public.weight_logs (date);

-- ── Strength / journal ──────────────────────────────────────────────────

create table if not exists public.strength_logs (
  id bigint generated always as identity primary key,
  date date not null,
  type text not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists strength_logs_date_idx on public.strength_logs (date);

create table if not exists public.journal_entries (
  id bigint generated always as identity primary key,
  date date not null unique,
  title text,
  content text not null,
  created_at timestamptz not null default now()
);

-- ── "40+ LPA" prep ───────────────────────────────────────────────────────

create table if not exists public.dsa_problems (
  id bigint generated always as identity primary key,
  date date not null,
  name text not null,
  source text,
  link text,
  tags text[] not null default '{}',
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists dsa_problems_date_idx on public.dsa_problems (date);

create table if not exists public.system_design (
  id bigint generated always as identity primary key,
  topic text not null,
  notes text,
  refs text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id bigint generated always as identity primary key,
  date date not null,
  company text not null,
  type text,
  round text,
  result text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists interviews_date_idx on public.interviews (date);

create table if not exists public.companies (
  id bigint generated always as identity primary key,
  name text not null,
  ctc text,
  role text,
  status text not null default 'Not Applied',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.html_notes (
  id bigint generated always as identity primary key,
  section text not null check (section in ('fundamentals', 'misc')),
  name text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────
-- The anon key in NEXT_PUBLIC_SUPABASE_ANON_KEY ships in the JS bundle, so it
-- is public by design; RLS is the only thing standing between that key and
-- your journal/weight/DSA data.
--
-- An earlier version of this file gated every table on "is someone signed
-- in", not "is this specifically the owner". That is NOT enough on its own:
-- Supabase projects allow public sign-up by default, so anyone who opens the
-- Login screen and enters their own email can create their own authenticated
-- account — and a policy that only checks auth.role() = 'authenticated'
-- treats that stranger exactly like the owner. That gap is what let a friend
-- who was sent the deployed URL sign himself in and see everything.
--
-- Fix: every policy below calls is_owner(), which checks the signed-in
-- session's email against ONE hardcoded address. Change OWNER_EMAIL below to
-- the email you actually sign in with, then anyone else's account — no
-- matter how they got in — reads zero rows and writes nothing.
--
-- Exception: html_notes and the html-notes bucket hold uploaded study notes
-- (OS/DBMS/git/docker HTML pages) — reference material, not personal data —
-- so read access is open to any signed-in account, not just the owner.
-- Uploading, editing, and deleting are still owner-only: a signed-in
-- stranger shouldn't be able to fill your storage with arbitrary files or
-- delete your notes, even if reading them is harmless.

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  -- v-- change this to the email you sign in to LifeOS with --v
  select auth.email() = 'purplewizard0709@gmail.com';
$$;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'water_logs', 'sleep_logs', 'cracker_logs', 'vitamins', 'vitamin_logs',
    'skin_routine_items', 'skin_routine_logs', 'weight_logs', 'strength_logs',
    'journal_entries', 'dsa_problems', 'system_design', 'interviews',
    'companies'
  ])
  loop
    execute format('alter table public.%I enable row level security;', t);
    -- drop the old blanket policy from anyone who applied the earlier version
    execute format('drop policy if exists authenticated_all on public.%I;', t);
    execute format('drop policy if exists owner_only on public.%I;', t);
    execute format(
      'create policy owner_only on public.%I for all to authenticated using (public.is_owner()) with check (public.is_owner());',
      t
    );
  end loop;
end $$;

-- html_notes: anyone signed in can list/read note metadata; only the owner
-- can add, rename, or delete entries. Two permissive policies OR together —
-- the open "select" policy makes reads unconditional, while the "for all"
-- policy is the only one covering insert/update/delete, so those stay
-- owner-gated.
alter table public.html_notes enable row level security;
drop policy if exists authenticated_all on public.html_notes;
drop policy if exists owner_only on public.html_notes;
drop policy if exists html_notes_read on public.html_notes;
drop policy if exists html_notes_owner_write on public.html_notes;
create policy html_notes_read on public.html_notes
  for select to authenticated
  using (true);
create policy html_notes_owner_write on public.html_notes
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- ── Storage: html-notes bucket ──────────────────────────────────────────
-- Create the bucket once via the dashboard (Storage → New bucket → "html-notes",
-- private) or: select storage.create_bucket('html-notes', public := false);
-- Read is open to any signed-in account (see html_notes note above); upload,
-- overwrite, and delete stay owner-only.

drop policy if exists "owner read html-notes" on storage.objects;
drop policy if exists "authenticated read html-notes" on storage.objects;
create policy "authenticated read html-notes" on storage.objects
  for select to authenticated
  using (bucket_id = 'html-notes');

drop policy if exists "authenticated write html-notes" on storage.objects;
drop policy if exists "owner write html-notes" on storage.objects;
create policy "owner write html-notes" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'html-notes' and public.is_owner());

drop policy if exists "authenticated update html-notes" on storage.objects;
drop policy if exists "owner update html-notes" on storage.objects;
create policy "owner update html-notes" on storage.objects
  for update to authenticated
  using (bucket_id = 'html-notes' and public.is_owner());

drop policy if exists "authenticated delete html-notes" on storage.objects;
drop policy if exists "owner delete html-notes" on storage.objects;
create policy "owner delete html-notes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'html-notes' and public.is_owner());
