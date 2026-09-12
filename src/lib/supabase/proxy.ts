import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { safeInternalPath } from "@/lib/auth/redirects";
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import type { Database } from "@/types/database";

/** Routes that require a signed-in member. Prefix match. */
const PROTECTED_PREFIXES = ["/dashboard", "/progress", "/profile"];

/** Signed-in members are bounced away from these. */
const AUTH_ONLY_PREFIXES = ["/login", "/register", "/forgot-password"];

function isProtected(pathname: string): boolean {
  if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  // The workout player needs an account; the catalogue pages stay public.
  return /^\/workouts\/[^/]+\/start\/?$/.test(pathname);
}

/**
 * Refreshes the Supabase session on every request and enforces route access.
 *
 * Two rules make this correct rather than subtly broken:
 *
 * 1. `getUser()` must be called — it is what revalidates the token and issues
 *    refreshed cookies. Reading the session without it leaves members logged
 *    out after the access token expires.
 * 2. Whenever a new response is created (including redirects) the refreshed
 *    cookies must be copied onto it, or the refresh is silently discarded.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Without credentials the app is fully public; skip auth entirely.
  if (!isSupabaseConfigured()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  /*
   * Server Actions must never be answered with a proxy redirect.
   *
   * The client expects an RSC action payload; a 307 to a different page is
   * not one, and Next surfaces it as "An unexpected response was received
   * from the server" — even when the action itself succeeded. Sign-up hits
   * this exactly: the action sets the session cookies, and the follow-up
   * action traffic for /register is then eligible for the signed-in bounce
   * below.
   *
   * Actions still get the refreshed cookies; they just handle their own
   * navigation with redirect(), which Next encodes correctly for the client.
   */
  if (request.headers.get("next-action")) return response;

  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    // Remember where they were headed, but only ever an internal path.
    const intended = safeInternalPath(`${pathname}${search}`);
    if (intended && intended !== "/login") url.searchParams.set("next", intended);
    return copyCookies(response, NextResponse.redirect(url));
  }

  if (user && AUTH_ONLY_PREFIXES.some((p) => pathname === p)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return copyCookies(response, NextResponse.redirect(url));
  }

  return response;
}

/** Carries refreshed auth cookies onto a redirect response. */
function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}
