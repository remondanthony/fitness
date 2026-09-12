import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { safeInternalPath } from "@/lib/auth/redirects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Lands every Supabase email link: sign-up confirmation and password
 * recovery.
 *
 * Supports both link formats so it keeps working whichever email template the
 * project uses:
 *   - `?code=...`                 the PKCE code exchange (Supabase defaults)
 *   - `?token_hash=...&type=...`  the OTP form used by customised templates
 *
 * On success the member is sent to an internal path; failures land on /login
 * with a short reason. No token is ever echoed back into the page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const next = safeInternalPath(searchParams.get("next")) ?? "/dashboard";
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const failure = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  if (!isSupabaseConfigured()) return failure("unavailable");

  // Supabase reports its own failures (expired or reused link) on the URL.
  if (searchParams.get("error")) return failure("link_invalid");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return failure("link_invalid");
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return failure("link_invalid");
    return NextResponse.redirect(`${origin}${next}`);
  }

  return failure("link_invalid");
}
