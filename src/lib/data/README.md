# Server-side data access

Thin, typed wrappers over Supabase for user-owned data.

**These modules are server-only.** They import the cookie-based Supabase client
and must not be pulled into a client component.

## Ownership

Every wired helper derives the member from the session with `getSessionUser()`
rather than taking a `userId` from the caller, so a client value can never
decide whose rows are read or written. Row Level Security is the actual
enforcement; the session lookup is what makes each query ask for the right rows
in the first place.

`progress.ts` and `workouts.ts` are the exception: they are unused scaffolding
from the original schema work and still take a `userId` argument. RLS would
still confine them to the caller's own rows, but follow the session-derived
pattern above before wiring either one to a page.

## Results

Helpers return a shape the page can render directly:

- reads return `{ data, error: boolean }` — `data` is `null` when there is no
  row yet, which callers must distinguish from a failed query;
- writes return `{ error: string | null }` — a message fit to show a member,
  never the raw Postgres text.

Nothing here substitutes fallback data for a failed query. A page that cannot
load says so.

## Day-scoped records

`nutrition_logs`, `wellness_logs` and `habit_completions` are keyed by date.
The date always comes from `daily-date.ts` on the server, never from the
request — see that file for why.

Kept deliberately small. Add a helper when a feature needs it, not before.
