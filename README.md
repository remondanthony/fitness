# STRONGER

A full-stack fitness training platform: members answer a short onboarding
questionnaire, get workouts ranked against their goal, equipment and recent
training, run those workouts in a live player that records every set, and see
their real progress build up — volume, consistency, streaks and personal
records, all recomputed from the sets they actually logged. Nothing on a
member's screen is sample data.

**Live demo:** https://tavolo-omega.vercel.app
**Repository:** https://github.com/remondanthony/fitness

> **Portfolio status.** STRONGER is a portfolio project, not a commercial
> service. Two areas are intentionally not connected, and the app says so
> wherever a member could be misled:
>
> - **Payment gateway is not connected.** The pricing page presents plan
>   concepts; no payment is taken, no subscription exists, and no gateway
>   (Razorpay, Stripe or otherwise) is integrated. There is no checkout code in
>   this repository.
> - **Coaching scheduling is not connected.** The consultation form validates
>   input and then states plainly that booking is not live. No appointment is
>   created.

---

## Features

**Accounts**

- Email/password registration and sign-in
- Google OAuth
- Password reset by email
- Route protection via Next.js proxy (middleware)
- Self-service account deletion that removes the member's own data

**Onboarding & personalization**

- Goal, experience level, equipment access and preferred training days
- Answers drive recommendations and the weekly-workout target

**Workouts**

- Workout and exercise catalogue with instructions, common mistakes and
  alternatives
- Live workout player: per-set weight/reps logging, rest timer, resumable
- Sessions and every set persist to Postgres, so a refresh or a different
  device picks up where the member left off
- Resume prompt on the dashboard for a session started in the last 48 hours
- Repeat a past workout with the previous session's loads prefilled

**Progress & history**

- Weekly training volume and workout consistency charts
- Current and longest streak, last seven days
- Personal records per exercise: heaviest set, most reps, best single-set volume
- Strength trend for the member's most-trained loaded lift
- Paginated workout history with date-range and workout filters
- Per-session detail: every exercise, set, load and rep
- Per-exercise history across every session it appears in

**Daily logging**

- Nutrition: calories and macros against targets
- Wellness: sleep, water, steps, recovery score, habits
- Recovery: mobility and recovery session content

**Product surfaces**

- Personalized recommendations with the reasons behind each pick
- Profile and settings, avatar upload, preference management
- Coaching profiles and consultation form (scheduling not connected)
- Pricing page (payment not connected)

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Database | Supabase Postgres with Row Level Security |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Supabase Storage (avatars) |
| Hosting | Vercel |
| Tests | Node's built-in test runner (`node:test`) — no test framework dependency |

Eight production dependencies: `next`, `react`, `react-dom`,
`@supabase/supabase-js`, `@supabase/ssr`, `clsx`, `tailwind-merge`,
`lucide-react`. No state library, no data-fetching library, no charting library
— the charts are hand-built SVG and CSS.

---

## Architecture

```
src/
  app/                 routes (App Router)
    (site)/            main application shell
    (auth)/            sign-in, register, password reset
    (focus)/           full-screen flows: onboarding, workout player
    auth/callback/      OAuth and email-link landing
  components/          UI, grouped by feature
  data/                static product catalogue (TypeScript, no queries)
  lib/
    actions/           Server Actions (all writes)
    data/              server-only read helpers
    progress/          pure analytics — no I/O, no clock of their own
    recommendations/   pure ranking engine
    supabase/          client factories + proxy session refresh
  types/               generated database types
supabase/migrations/   9 SQL migrations
```

Three rules shape the codebase:

**1. The catalogue is code; member data is in Postgres.** Workouts, exercises,
programs, coaches and meal examples live in `src/data/` as typed TypeScript, so
browsing costs no queries. Everything about a *member* — sessions, sets, logs,
preferences — is in Postgres. A test (`src/data/catalogue.test.ts`) enforces the
boundary by failing if catalogue data starts claiming someone trained something.

**2. Calculations are pure and separate from I/O.** `src/lib/progress/` and
`src/lib/recommendations/` contain no database access and no `Date.now()` — any
function that needs the time takes it as an argument. That is what makes the
analytics exhaustively testable without a database.

**3. Reads are server-side and session-scoped.** No read helper accepts a user
id. See below.

---

## Authentication

Supabase Auth with the `@supabase/ssr` cookie strategy. `src/proxy.ts` runs on
every request to refresh the session and enforce access; `src/lib/auth/session.ts`
resolves the member with `getUser()` rather than `getSession()`, so a tampered
cookie cannot fake an identity — the token is revalidated with Supabase.

Protected: `/dashboard`, `/progress`, `/profile`, `/onboarding`,
`/workouts/history`, the workout player, and a member's own exercise history.
The public catalogue (`/workouts`, `/exercises`, `/programs`) stays public.

Post-login redirects pass through `safeInternalPath()`, which rejects absolute
URLs, protocol-relative paths and backslash tricks, so a crafted `?next=`
cannot bounce a member to another site.

---

## Security model

**Ownership is derived from the session, never from the request.** No exported
read helper in `src/lib/data/` takes a `userId`. Each one calls
`getSessionUser()` and filters `.eq("user_id", user.id)`.

**Row Level Security is the enforcement.** All 15 tables have RLS enabled with
own-row policies. `exercise_logs` additionally requires the parent session to
belong to the caller, so a log cannot be attached to somebody else's workout.

**No service-role key anywhere.** The browser and the server both use the
publishable (anon) key; every privileged operation that needs more than RLS
allows is a `SECURITY DEFINER` function with a fixed signature and a pinned
`search_path`. Account deletion always targets `auth.uid()` and cannot be
pointed at another account.

**Defence in depth on identifiers from the URL.** A session id or pagination
cursor is validated against a strict pattern before it reaches a query, so it
can contribute values but never change a filter's shape.

---

## Workout persistence

```
Start        → workout_sessions row (completed = false)
Each set     → exercise_logs upsert, unique on (session_id, exercise_slug, set_number)
Complete     → completed = true, completed_at, duration
```

The player keeps local state for responsiveness and mirrors every event to
Postgres in the background, reporting failures rather than losing a set. The set
upsert is idempotent, so a retry updates a set instead of duplicating it.
Because the session lives server-side, resuming works across devices.

---

## Progress & history

Every displayed figure is recomputed from `exercise_logs`:

```
volume = Σ (weight × reps)
```

`workout_sessions.total_volume` is written by the client at the end of a session
and is deliberately **never read** — the analytics layer does not even select
the column. Three rules are applied consistently and covered by tests:

- A **null** weight means the load was not recorded: the set counts as a set but
  contributes no volume, and the UI says so rather than understating silently.
- A **zero** weight is a real bodyweight set: it counts and contributes zero.
- A missing duration shows as `—`, never as `0`.

Days and weeks are UTC throughout — logging, streaks, weekly buckets and history
windows all agree. History pages use keyset pagination on
`(completed_at, id)`, so no session can be skipped or repeated between pages.

---

## Recommendation engine

`src/lib/recommendations/engine.ts` ranks the catalogue against the member's
goal, experience, equipment and recently completed workouts, returning both a
score and the reasons that produced it — so the UI can explain a pick instead of
asserting it. The engine is pure and fails closed: unknown equipment never
unlocks a workout that requires it. Weights and rules live in `rules.ts`, tested
independently.

The dashboard shows the top pick as a **suggestion**. There is no scheduling
table in the schema, so nothing claims a workout is "scheduled for today".

---

## Nutrition & wellness

Daily logs are keyed by a UTC date with one row per member per day, so reads and
writes cannot disagree about which day they mean. Members log calories/macros
and sleep, water, steps, recovery score and habits; targets are static product
guidance, and unlogged values read as "not logged yet" — distinctly from a
failed read.

---

## Deployment

Vercel, deploying from `main`. Two environment variables are required:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Both are publishable by design; there is no secret to configure, because there
is no service-role path. See `docs/SUPABASE_SETUP.md` for database setup and
migration order.

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project values
npm run dev
```

---

## Testing & validation

```bash
npm run build                                              # production build + typecheck
npx tsc --noEmit                                           # types
npx eslint . --max-warnings 0                              # lint
node --experimental-strip-types --test $(find src -name "*.test.ts")
```

Tests target the pure layers — analytics, records, streaks, pagination cursors,
prefill, view mapping — where the rules that matter actually live. They run on
Node's built-in runner with no framework dependency and no database.

Beyond the automated suite, each development pass was verified against a local
Postgres with the real migrations applied (including RLS behaviour under two
different members) and in a headless browser across 320–1920px for layout,
console errors and accessibility.

---

## Payment gateway status

**Not connected.** No payment SDK is installed, no checkout exists, no webhook
endpoint exists, and no subscription state is written. The pricing page is a
design surface and labels itself as one. Membership tiers were prototyped and
then removed from the application; the table remains in migration history
because it was applied to the production database, and deleting applied
migrations rewrites history rather than tidying it.

## Coaching status

**Not connected.** The consultation form validates the input server-side and
returns a message stating that scheduling is not live. No booking is created and
nothing is sent.

---

## Known limitations

- Weights are stored and displayed in kilograms; the imperial preference in
  settings does not yet convert them.
- Bodyweight history is not tracked, so no weight-trend chart is shown.
- Day boundaries are UTC. No member timezone is stored, so a member far from UTC
  sees the boundary shift for a few hours around midnight.
- Abandoned workout sessions are retained rather than cleaned up; the resume
  prompt simply ignores anything older than 48 hours.
- Achievements exist as a table and a card component but no unlock logic.
