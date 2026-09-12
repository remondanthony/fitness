import { createBrowserClient } from "@supabase/ssr";

import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  assertSupabaseConfigured,
} from "@/lib/supabase/config";
import type { Database } from "@/types/database";

/**
 * Supabase client for browser/client components.
 *
 * Call this inside a component or event handler rather than at module scope,
 * so a page that never touches Supabase still renders when credentials are
 * absent. Guard with `isSupabaseConfigured()` if the caller should degrade
 * rather than throw.
 */
export function createClient() {
  assertSupabaseConfigured();

  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
