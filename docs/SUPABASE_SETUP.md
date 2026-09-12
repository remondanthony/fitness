# Supabase setup

STRONGER's backend is a Supabase (PostgreSQL) project on the **free tier**. This
guide gets a fresh clone connected.

The app runs fine **without** any of this: every page renders from static data
in `src/data`, and nothing calls Supabase yet. Follow these steps when you want
to work on backend features.

---

## 1. Create a project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
2. Pick a region close to your users and set a database password (store it in a
   password manager — it is not needed by this app).
3. Wait for provisioning to finish, usually a minute or two.

The free tier is enough for development and covers everything in this schema.

## 2. Find your project URL and publishable key

In the dashboard, go to **Project Settings → API**:

| Dashboard label                          | Environment variable                     |
| ---------------------------------------- | ---------------------------------------- |
| Project URL                              | `NEXT_PUBLIC_SUPABASE_URL`               |
| Publishable key (older projects: `anon`) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`   |

Both are safe in the browser. They grant nothing on their own — Row Level
Security decides what a request can actually reach.

> **Never use the `service_role` key here.** It bypasses RLS completely. It must
> never appear in a `NEXT_PUBLIC_` variable, in client components, or anywhere
> that reaches the browser. This project does not use one at all.

## 3. Add them to `.env.local`

```bash
cp .env.example .env.local
```

Then fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

`.env.local` is gitignored. `.env.example` is committed and holds no secrets.

Restart `npm run dev` after editing — Next only reads env files at startup.

## 4. Apply the migrations

The schema lives in `supabase/migrations/`, applied in filename order:

| File                                    | What it does                                    |
| --------------------------------------- | ----------------------------------------------- |
| `20260913090000_initial_schema.sql`     | 14 tables, foreign keys, indexes, constraints    |
| `20260913090001_row_level_security.sql` | Enables RLS and adds 56 ownership policies       |
| `20260913090002_profile_provisioning.sql` | Creates a profile row when a user signs up     |

### Option A — SQL Editor (no tooling)

Open **SQL Editor** in the dashboard, paste each file's contents in the order
above, and run them one at a time.

### Option B — Supabase CLI

```bash
npm install -g supabase     # or: brew install supabase/tap/supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

## 5. Verify the tables

In **Table Editor** you should see 14 tables:

```
profiles                    user_goals              user_preferences
workout_sessions            workout_session_exercises
exercise_logs               progress_metrics
wellness_logs               nutrition_logs
habits                      habit_completions
saved_programs              saved_exercises          achievements
```

To confirm RLS is on everywhere, run this in the SQL Editor — it should return
**no rows**:

```sql
select tablename
from pg_tables
where schemaname = 'public' and rowsecurity = false;
```

And this should return **56**:

```sql
select count(*) from pg_policies where schemaname = 'public';
```

## 6. How RLS protects member data

Every table holds one member's private data, so all 14 have RLS enabled with
four policies each (select / insert / update / delete). Each checks ownership:

```sql
using ((select auth.uid()) = user_id)
```

`auth.uid()` is the signed-in user's id, taken from their JWT. Consequences:

- A member reads and writes only their own rows.
- A signed-out request has a null `auth.uid()`, so every policy fails closed and
  returns nothing.
- Even a query that explicitly filters for another user's id comes back empty —
  the filter is applied *after* the policy.
- Inserting a row owned by someone else is rejected outright.

There is no `using (true)` policy anywhere in this schema.

`(select auth.uid())` is used rather than a bare `auth.uid()` so Postgres
evaluates it once per statement instead of once per row, which matters on long
history scans.

## 7. Static content stays in TypeScript

Programs, exercises, coaches and meals are **not** in the database. They are
identical for every member, so they stay as typed static data in `src/data`.
Postgres holds user-generated data only: sessions, logs, goals, preferences,
wellness, nutrition, habits, saved items and achievements.

## 8. What is not built yet

- **Authentication** (sign-up, sign-in, OAuth, middleware) — Part 11.
- **Reading and writing real data from pages** — Part 12 onwards.

Until then the app is fully static, and an unconfigured Supabase project
breaks nothing.
