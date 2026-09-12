/**
 * Supabase configuration, read once from the environment.
 *
 * Both values are public by design: the publishable key grants only what Row
 * Level Security permits. A service-role key must never appear here, or in any
 * NEXT_PUBLIC_ variable — it bypasses RLS and belongs server-side only.
 */

/** Project URL, e.g. https://xxxxxxxx.supabase.co */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Publishable (anon) key. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is accepted as a
 * fallback so projects created before Supabase renamed the key still work.
 */
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/**
 * Whether the project has credentials to talk to Supabase.
 *
 * The app is built to run without them: every public page renders from static
 * data, and nothing calls Supabase yet. Check this before any data access so a
 * missing key degrades a feature instead of crashing the page.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;
}

/** Thrown when a Supabase client is requested without configuration. */
export const MISSING_CONFIG_MESSAGE =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local — see docs/SUPABASE_SETUP.md.";

export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) throw new Error(MISSING_CONFIG_MESSAGE);
}
