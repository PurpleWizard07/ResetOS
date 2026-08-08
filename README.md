# LifeOS

A personal life-tracking dashboard: water, sleep, weight, strength, a "40+ LPA"
interview-prep tracker (DSA, system design, companies, interviews), a journal,
and a couple of habit trackers. Single-user, backed by Supabase (Postgres +
Auth + Storage), built on Next.js.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (the
   free tier is enough for personal use).

3. **Apply the database schema.** Before running it, open
   [`supabase/schema.sql`](supabase/schema.sql) and change `OWNER_EMAIL@example.com`
   inside the `is_owner()` function near the bottom to the email address you
   actually sign in with. Then paste the whole file into your project's SQL
   editor and run it — it creates every table the app expects and locks them
   down with Row Level Security so the public anon key can only be used by
   that one account, not just "someone who is signed in" (see **Security
   model** below for why that distinction matters). It also creates the RLS
   policies for the `html-notes` storage bucket; create that bucket itself
   first (Storage → New bucket → name it `html-notes`, mark it **private**).

4. **Configure environment variables.** Copy `.env.example` to `.env.local`
   and fill in your project's URL and anon key (Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

5. **Enable email auth.** In Authentication → Providers, make sure Email is
   enabled with the magic-link (OTP) flow — this app has no password field,
   only "send me a link". Then, once your own account exists, disable public
   sign-ups (Authentication → Sign In / Providers → turn off "Allow new users
   to sign up"). The RLS policies from step 3 already stop anyone but you from
   reading or writing data even if sign-ups are left open, but there's no
   reason to let strangers create accounts on your project at all.

6. **Run it**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), sign in with your
   email, and click the magic link it sends you.

## Project structure

```
src/
  app/               Next.js App Router entry (layout, root page)
  components/
    LifeOS.jsx        Shell: owns navigation state, wires up every data hook
    Sidebar.jsx        Nav + streaks
    Login.jsx          Magic-link sign-in screen
    views/             One file per section (Water, Sleep, Dsa, Journal, ...)
  hooks/
    data/              One hook per Supabase table (useWaterLogs, useDsa, ...)
    useSupabaseTable.js Generic CRUD-over-a-table hook the data/ hooks build on
  contexts/            ToastContext (surfaces failed requests), ConfirmContext
                        (dialog-based replacement for window.confirm)
  lib/                 supabase client, date utilities
  ui/                  Shared visual primitives (Card, Btn, Modal, Cal, ...)
tests/                 Node's built-in test runner, no extra dependency
supabase/schema.sql    Table definitions + RLS policies (see Setup above)
```

Each view under `src/components/views/` is a self-contained component with
its own hooks and local UI state; `LifeOS.jsx` just decides which one is on
screen and hands it the data hook(s) it needs.

## Testing

```bash
node --test tests/
```

`tests/dateUtils.test.mjs` re-runs the date-arithmetic invariants under seven
timezones (including the one this app is actually used in). Date bugs here
are timezone-dependent by construction — a bug that only reproduces at
UTC+5:30 will pass silently on a CI runner set to UTC — so the suite forces
the check rather than trusting whatever zone happens to run it.

## Security model

This is intentionally single-user: there's no `user_id` column and no
per-row ownership check. The anon key is embedded in the JS bundle and
readable by anyone who opens the deployed site, so RLS is the only real gate.

**"Must be signed in" is not the same as "must be me."** Supabase projects
allow public sign-up by default — anyone who opens the Login screen can enter
their own email, get their own magic link, and become a fully "authenticated"
user. A policy that only checks `auth.role() = 'authenticated'` treats that
stranger identically to the owner.

The policies in `supabase/schema.sql` instead call `is_owner()`, a SQL
function that compares the signed-in session's email against one hardcoded
address (set in step 3 of Setup). Every table requires it, so an account
that isn't that one address reads zero rows and writes nothing — regardless
of whether public sign-up is left open. Disabling sign-ups (step 5) is still
worth doing so strangers can't create accounts at all, but it's not what's
actually protecting the data.

**One deliberate exception:** `html_notes` and the `html-notes` storage
bucket (the uploaded OS/DBMS/git/docker study notes under Fundamentals and
Miscellaneous) allow read access to any signed-in account, not just the
owner — they're reference material, not personal data, so there's no reason
to lock them down. Uploading, renaming, and deleting are still owner-only.

If you ever change your sign-in email, update `OWNER_EMAIL@example.com`
inside `is_owner()` in `supabase/schema.sql` and re-run just that function's
`create or replace function` statement in the SQL editor.
