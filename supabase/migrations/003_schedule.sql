-- Run this once, in the Supabase SQL editor, before opening the Schedule view.
--
-- What it is: a day-by-day time-block planner. Every row belongs to one
-- specific date and is fully independent of every other row — even entries
-- created by "replicate" (copying one day's blocks onto other dates) are
-- plain inserted copies, not linked back to their source, so editing one day
-- never touches another.

create table if not exists public.schedule_entries (
  id bigint generated always as identity primary key,
  date date not null,
  start_time text not null,
  end_time text,
  activity text not null check (length(trim(activity)) > 0),
  created_at timestamptz not null default now()
);
create index if not exists schedule_entries_date_idx on public.schedule_entries (date);

-- ── Row Level Security ───────────────────────────────────────────────────
-- Identical to every other personal table: owner-only, gated on the email in
-- public.is_owner(). See the long note in supabase/schema.sql for why being
-- signed in is NOT sufficient on its own.
alter table public.schedule_entries enable row level security;
drop policy if exists owner_only on public.schedule_entries;
create policy owner_only on public.schedule_entries
  for all to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- Verify: both should come back true.
select
  (select count(*) = 6 from information_schema.columns
    where table_name = 'schedule_entries'
      and column_name in ('id', 'date', 'start_time', 'end_time',
                          'activity', 'created_at')) as columns_present,
  (select rowsecurity from pg_tables
    where schemaname = 'public' and tablename = 'schedule_entries') as rls_enabled;
