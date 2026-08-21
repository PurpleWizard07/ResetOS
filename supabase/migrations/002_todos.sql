-- Run this once, in the Supabase SQL editor, before opening the To-Do view.
--
-- Same statements as the `todos` block now in supabase/schema.sql — pulled out
-- on its own so there is one short thing to paste. Every statement is
-- idempotent, so running it twice is safe.
--
-- What it is: a capture list. The point of the table is that a thought stops
-- costing you attention the moment it is written down, so the insert path is
-- deliberately cheap — `text` is the only column you must supply. Everything
-- else has a default, which is what lets the UI add a row from a bare
-- "type and press Enter" with no decisions attached.

create table if not exists public.todos (
  id bigint generated always as identity primary key,
  text text not null check (length(trim(text)) > 0),
  done boolean not null default false,
  -- Opt-in, not a required field at capture time. 'normal' is the default so
  -- that adding something never asks you to rank it; you bump it to 'high'
  -- later, if and when it actually matters.
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  created_at timestamptz not null default now(),
  -- NULL while open; set to the moment you ticked it. Kept as its own column
  -- rather than derived from `done` so the completed list can be ordered
  -- "most recently finished first" — which is the only order that makes a
  -- done pile feel like progress instead of a second backlog.
  completed_at timestamptz
);

-- Open items are the only rows read on every mount, and they are the small
-- slice of a list that grows forever. Partial index so the lookup cost stays
-- flat as completed rows accumulate.
create index if not exists todos_open_idx
  on public.todos (created_at desc) where not done;

-- ── Row Level Security ───────────────────────────────────────────────────
-- Identical to every other personal table: owner-only, gated on the email in
-- public.is_owner(). See the long note in supabase/schema.sql for why being
-- signed in is NOT sufficient on its own.
alter table public.todos enable row level security;
drop policy if exists owner_only on public.todos;
create policy owner_only on public.todos
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- Verify: both should come back true.
select
  (select count(*) = 6 from information_schema.columns
    where table_name = 'todos'
      and column_name in ('id', 'text', 'done', 'priority',
                          'created_at', 'completed_at')) as columns_present,
  (select rowsecurity from pg_tables
    where schemaname = 'public' and tablename = 'todos') as rls_enabled;
