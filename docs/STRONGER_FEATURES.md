# STRONGER — Product & Feature Reference

What the application actually does, and — just as important — what it does not.
The guiding rule throughout: **static product content is allowed; fabricated
member data is not.** A recruiter, reviewer or client should be able to read this
document and know exactly which numbers on screen came from the database.

Companion documents: [`../README.md`](../README.md) for architecture,
[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) for database setup.

---

## The two kinds of data

| | Static product content | Real member data |
| --- | --- | --- |
| **Lives in** | `src/data/*.ts` (typed TypeScript) | Supabase Postgres |
| **Examples** | workouts, exercises, programs, coach profiles, meal examples, recovery sessions, plan tiers, macro/wellness targets | sessions, logged sets, nutrition and wellness logs, habits, goals, preferences, avatar |
| **Same for everyone?** | Yes — it is the catalogue | No — scoped to the signed-in member |
| **Costs a query?** | No | Yes, always session-scoped |

A test at `src/data/catalogue.test.ts` fails the build if catalogue data starts
carrying member claims — it was added after an audit found every catalogue
exercise shipping a fabricated "last time: 75 kg × 8".

**Nothing in the app displays sample member history.** Where a member has no
data, the screen says so. Where a read fails, the screen says *that* instead —
the two are never conflated.

---

## What a member gets

### Accounts & authentication

| Capability | Status |
| --- | --- |
| Register with email + password | Real |
| Sign in | Real |
| Google OAuth | Real |
| Password reset by email | Real |
| Sign out | Real |
| Delete account | Real — removes the member's own data |

Sessions are cookie-based (`@supabase/ssr`). The member is resolved with
`getUser()`, which revalidates the token with Supabase, so a tampered cookie
cannot fake an identity.

Account deletion runs a `SECURITY DEFINER` function whose target is always
`auth.uid()` — it cannot be pointed at another account. Avatars are removed
first, then the auth user; every table cascades from there.

### Onboarding

Four questions — primary goal, experience level, equipment access, preferred
training days per week. Stored in `user_goals`, `profiles` and
`user_preferences`. A member who has not answered them is redirected to
onboarding from the dashboard.

Those answers are load-bearing, not decorative: they drive recommendation
ranking and the weekly-workout target on the dashboard.

### Dashboard

| Element | Source |
| --- | --- |
| Date | Real UTC date |
| Greeting | Member's saved first name, or generic. **No time-of-day claim** — no timezone is stored, so "Good morning" would be wrong for most of the world |
| Resume prompt | Real unfinished session started within 48 hours |
| Suggested workout | Top pick from the recommendation engine, labelled a **suggestion** |
| Weekly workouts | Real completed count / the member's own target |
| Streak, personal best, last 7 days | Real, from completed sessions |
| Water, steps, recovery, sleep | Real, from today's wellness log |
| Recommended programs & workouts | Real ranking, with the reasons shown |

There is **no scheduling**. No table in the schema represents a planned session,
so nothing claims a workout is "scheduled for today".

### Workouts

Browse the catalogue, open a workout, start it. The player records each set as
the member completes it:

```
Start        → workout_sessions row (completed = false)
Each set     → exercise_logs upsert (session_id, exercise_slug, set_number)
Complete     → completed = true, completed_at, duration
```

The set upsert is unique on `(session_id, exercise_slug, set_number)`, so a
retry updates a set rather than duplicating it. Local state keeps the UI
responsive; Postgres is the record. Because the session is server-side, a
refresh — or a different device — resumes where the member left off.

**Repeat** starts a *new* session of the current workout with the previous
session's loads offered as starting values in the logger. It never writes a set:
prefilled numbers become history only when the member logs them. The exercises
and set counts come from the current catalogue, so a movement removed from a
workout cannot reappear.

### Progress & history

All real, all recomputed from logged sets:

- Weekly **training volume** and **workout consistency** charts
- **Current** and **longest streak**, and the last seven days
- **Personal records** per exercise — heaviest set, most reps, best single-set
  volume — each with the date achieved
- **Strength trend**: heaviest set per week for the member's most-trained loaded
  lift, named so it is never read as a general score
- **Workout history**: paginated, filterable by date range and workout
- **Session detail**: every exercise, set, load and rep
- **Exercise history**: every session one exercise appears in

```
volume = Σ (weight × reps)
```

`workout_sessions.total_volume` is written by the client at the end of a session
and is **never read** — the analytics layer does not select the column. Three
rules are applied consistently:

- **Null weight** — the load was not recorded. Counts as a set, contributes no
  volume, and the UI says so rather than understating silently.
- **Zero weight** — a real bodyweight set. Counts, contributes zero.
- **Missing duration** — shows `—`, never `0`.

**Nothing is estimated.** There is no one-rep-max formula and no composite
"strength score" anywhere in the codebase.

### Nutrition & wellness

| Area | Real | Static |
| --- | --- | --- |
| Nutrition | Logged calories, protein, carbs, fat per day | Macro targets, example meals |
| Wellness | Logged sleep, water, steps, recovery score; habit completions | Daily goals, habit starter set |
| Recovery | — | Mobility and recovery session content (a content page) |

One row per member per UTC day, so reads and writes cannot disagree about which
day they mean. Unlogged values read "not logged yet"; a failed read says so
separately.

### Recommendations

`src/lib/recommendations/engine.ts` ranks catalogue workouts and programs against
goal, experience level, equipment and recently completed workouts. It returns
both a score and the **reasons** behind it, so the UI explains a pick instead of
asserting it.

The engine is pure — no database, no clock — and fails closed: unrecognised
equipment never unlocks a workout that requires it.

### Profile & settings

Real: display name, email, avatar upload/removal, goal, experience level,
equipment access, preferred training days, unit preference, notification and
privacy toggles. The profile snapshot (workouts, total volume, current streak,
best streak) is computed from completed sessions.

### Coaching

Coach profiles, specialisms, programmes and testimonials are **static catalogue
content**.

**Scheduling is not connected.** The consultation form validates the email and
coach server-side, then returns a message stating that booking is not live. No
appointment is created, nothing is sent, and the UI never says "booked".

### Pricing

Three plan concepts — Free ₹0, Pro ₹499/month, Elite ₹1,499/month — presented as
a **design surface**.

**Payment is not connected.** No payment SDK is installed, no checkout exists, no
webhook endpoint exists, and no subscription state is written. The page states:
*"STRONGER is a portfolio demo… no payment is taken, nothing is charged, and
every feature is available to try."* Clicking a plan shows *"This is a demo"*.

Membership tiers were prototyped in an earlier pass and then removed from the
application. The `user_memberships` table remains in migration history because it
was applied to the production database; deleting an applied migration rewrites
history rather than tidying it. No application code reads it.

---

## Payment gateway status

**NOT CONNECTED.** To be unambiguous:

- No payment gateway is integrated — not Razorpay, not Stripe, not any other
- No payment SDK is in `package.json` or `node_modules`
- No checkout, order, subscription or webhook code exists in this repository
- No payment credentials are configured or required
- No fake success message is ever shown

## Coaching scheduling status

**NOT CONNECTED.** No booking backend, no calendar integration, no notification.
The form validates and explains.

---

## Security model

**Ownership comes from the session.** No exported read helper in
`src/lib/data/` accepts a `userId`. Each calls `getSessionUser()` and filters
`.eq("user_id", user.id)`.

**RLS is the enforcement.** All 15 tables have Row Level Security enabled with
own-row policies. `exercise_logs` additionally requires the parent session to
belong to the caller.

**No service-role key exists in the project.** Browser and server both use the
publishable key. Anything needing more than RLS allows is a `SECURITY DEFINER`
function with a fixed signature and a pinned `search_path`.

**Identifiers from the URL are validated before use.** A session id or
pagination cursor must match a strict pattern, so it can supply values but never
alter a query's shape.

**Redirects are guarded.** `safeInternalPath()` rejects absolute URLs,
protocol-relative paths and backslash tricks.

Protected routes: `/dashboard`, `/progress`, `/profile`, `/onboarding`,
`/workouts/history`, the workout player, and a member's exercise history. The
catalogue stays public.

---

## Deployment

Vercel from `main`. Two environment variables, both publishable:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Nine SQL migrations in `supabase/migrations/`, applied in filename order. See
[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).

---

## Known limitations

| Limitation | Detail |
| --- | --- |
| Units | Weights are stored and shown in kilograms. The imperial setting exists but does not convert. |
| Bodyweight history | Not tracked, so no weight-trend chart is offered. |
| Timezones | Day boundaries are UTC throughout. No member timezone is stored. |
| Abandoned sessions | Retained rather than cleaned up; the resume prompt ignores anything over 48 hours old. |
| Achievements | Table and card component exist; no unlock logic. |
| Exercise history paging | Unpaginated, unlike workout history. |
| Macro/wellness targets | Static product guidance, not personalised to the member. |
| Contrast | Two inherited design tokens sit marginally below WCAG AA for small text. |
