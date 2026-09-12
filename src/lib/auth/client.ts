import type { AuthResult, SignInInput, SignUpInput } from "@/lib/auth/types";

/**
 * Client-side auth surface.
 *
 * Every function below is a placeholder that returns `unavailable`. The
 * signatures are the ones the Supabase implementation will have, so connecting
 * it later is a change to this file alone:
 *
 *   signIn              -> supabase.auth.signInWithPassword({ email, password })
 *   signUp              -> supabase.auth.signUp({ email, password, options: { data: { name } } })
 *   signInWithGoogle    -> supabase.auth.signInWithOAuth({ provider: "google" })
 *   requestPasswordReset-> supabase.auth.resetPasswordForEmail(email, { redirectTo })
 *   signOut             -> supabase.auth.signOut()
 *
 * Nothing here stores a session or grants access — the forms are interface only.
 */

export const BACKEND_NOTICE =
  "Accounts are not connected yet. This form is the interface ahead of the backend.";

/** Stands in for network latency so the UI's pending state is exercised. */
function pending(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 700));
}

export async function signIn(input: SignInInput): Promise<AuthResult> {
  void input; // Consumed once Supabase is wired in.
  await pending();
  return { status: "unavailable", message: BACKEND_NOTICE };
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  void input; // Consumed once Supabase is wired in.
  await pending();
  return { status: "unavailable", message: BACKEND_NOTICE };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  await pending();
  return { status: "unavailable", message: BACKEND_NOTICE };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  void email; // Consumed once Supabase is wired in.
  await pending();
  return { status: "unavailable", message: BACKEND_NOTICE };
}

export async function signOut(): Promise<void> {
  await pending();
}
