"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import {
  NETWORK_ERROR_MESSAGE,
  NOT_CONFIGURED_MESSAGE,
  friendlyAuthMessage,
} from "@/lib/auth/errors";
import { safeInternalPath } from "@/lib/auth/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for authentication.
 *
 * Everything runs server-side so @supabase/ssr can write the session cookies;
 * no token ever touches localStorage. Each action returns a plain, serialisable
 * result the forms render — errors are mapped to member-facing language and the
 * raw Supabase error is never surfaced.
 */

export type ActionResult =
  | { status: "error"; message: string }
  | { status: "success"; message?: string };

/** Where Supabase should send members back to after an email link. */
async function siteOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;

  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function signInAction(input: {
  email: string;
  password: string;
  next?: string;
}): Promise<ActionResult> {
  // Note: the login form's "Remember me" control is not wired to anything.
  // Supabase's cookie session already survives a browser restart, and making
  // the unchecked case behave differently means rewriting the auth cookies
  // without their max-age — which risks breaking refresh. Left for a later
  // part; see the Part 11 report.
  if (!isSupabaseConfigured()) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();

  let error;
  try {
    ({ error } = await supabase.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    }));
  } catch {
    return { status: "error", message: NETWORK_ERROR_MESSAGE };
  }

  if (error) return { status: "error", message: friendlyAuthMessage(error) };

  // Server-side redirect so the router picks up the new session cookies.
  redirect(safeInternalPath(input.next) ?? "/dashboard");
}

export async function signUpAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<ActionResult & { needsConfirmation?: boolean }> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();

  let data;
  let error;
  try {
    ({ data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        // Read by the handle_new_user trigger to seed the profile row.
        data: { display_name: input.name.trim() },
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    }));
  } catch {
    return { status: "error", message: NETWORK_ERROR_MESSAGE };
  }

  if (error) return { status: "error", message: friendlyAuthMessage(error) };

  // With email confirmation on, Supabase returns a user but no session.
  const needsConfirmation = Boolean(data?.user) && !data?.session;

  if (needsConfirmation) return { status: "success", needsConfirmation: true };

  return { status: "success" };
}

export async function requestPasswordResetAction(
  email: string,
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();
  const origin = await siteOrigin();

  let error;
  try {
    ({ error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    }));
  } catch {
    return { status: "error", message: NETWORK_ERROR_MESSAGE };
  }

  if (error) return { status: "error", message: friendlyAuthMessage(error) };

  return { status: "success" };
}

/** Sets a new password. Requires the recovery session from the email link. */
export async function updatePasswordAction(password: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: NOT_CONFIGURED_MESSAGE };
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      status: "error",
      message: "Your reset link has expired. Request a new one and try again.",
    };
  }

  let error;
  try {
    ({ error } = await supabase.auth.updateUser({ password }));
  } catch {
    return { status: "error", message: NETWORK_ERROR_MESSAGE };
  }

  if (error) return { status: "error", message: friendlyAuthMessage(error) };

  return { status: "success" };
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
