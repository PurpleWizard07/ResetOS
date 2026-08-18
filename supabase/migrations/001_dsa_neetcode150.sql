-- Run this once, in the Supabase SQL editor, before opening the DSA view.
--
-- It is the same set of statements already folded into supabase/schema.sql —
-- pulled out on its own so there is one short thing to paste rather than a
-- 350-line file. Every statement is idempotent, so running it twice is safe.
--
-- What it does: turns `dsa_problems` into a NeetCode 150 catalog table. The
-- 150 problem rows themselves are NOT created here — they are seeded from
-- src/lib/neetcode150.js by the "Import NeetCode 150" button in the app,
-- which runs as your signed-in account and therefore satisfies RLS.

-- Solved state. A row now exists before you have solved it, so `date` becomes
-- nullable and means "the day you marked it solved" (NULL = not solved yet).
-- One column, so there is no boolean that can disagree with it.
alter table public.dsa_problems alter column date drop not null;

-- Catalog identity and ordering. `slug` is the LeetCode URL slug, which is
-- what makes the seed idempotent. Partial unique index: your own hand-added
-- problems have no slug, and several NULLs must stay legal.
alter table public.dsa_problems
  add column if not exists slug text,
  add column if not exists category text,
  add column if not exists category_order smallint,
  add column if not exists problem_order smallint;

create unique index if not exists dsa_problems_slug_key
  on public.dsa_problems (slug) where slug is not null;
create index if not exists dsa_problems_order_idx
  on public.dsa_problems (problem_order);

-- The three "Understanding" prompts the detail view asks, replacing the older
-- single `understanding` column (left in place, unread — dropping a column is
-- irreversible and an unused one costs nothing).
alter table public.dsa_problems
  add column if not exists restated text,
  add column if not exists key_insight text,
  add column if not exists why_it_works text;

-- Verify: all of these should come back true.
select
  (select count(*) = 0 from information_schema.columns
    where table_name = 'dsa_problems' and column_name = 'date' and is_nullable = 'NO') as date_is_nullable,
  (select count(*) = 7 from information_schema.columns
    where table_name = 'dsa_problems'
      and column_name in ('slug', 'category', 'category_order', 'problem_order',
                          'restated', 'key_insight', 'why_it_works')) as new_columns_present;
