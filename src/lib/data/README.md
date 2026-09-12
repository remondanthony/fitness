# Server-side data access

Thin, typed wrappers over Supabase for user-owned data.

**These modules are server-only.** They import the cookie-based Supabase client
and must not be pulled into a client component.

Every function returns Supabase's `{ data, error }` result unchanged. Nothing
here swallows an error or substitutes fallback data — callers decide what to do
when a query fails.

Row Level Security scopes each query to the signed-in user, so these helpers
take a `userId` only where it makes the call site clearer; the database is what
actually enforces ownership.

Kept deliberately small. Add a helper when a feature needs it, not before.
