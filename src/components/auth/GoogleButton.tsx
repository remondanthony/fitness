"use client";

import { Info, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { safeInternalPath } from "@/lib/auth/redirects";

/** Inline Google mark — drawn as SVG so no external image is needed. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.8-2 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.4z"
      />
      <path
        fill="#34A853"
        d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.7 0-10.6-3.9-12.3-9.1H4.3v5.7C7.9 41 15.3 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.7 28.1c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.7H4.3A22 22 0 0 0 2 24c0 3.5.8 6.9 2.3 9.8l7.4-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.3 2 7.9 7 4.3 14.2l7.4 5.7c1.7-5.2 6.6-9.1 12.3-9.1z"
      />
    </svg>
  );
}

/**
 * Starts Supabase's Google OAuth flow.
 *
 * The Supabase Google provider must be enabled/configured in the Supabase
 * dashboard. This button intentionally does not fake a successful login when
 * the provider is unavailable; it reports the returned Auth error instead.
 */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const next = safeInternalPath(searchParams.get("next")) ?? "/dashboard";
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (authError) {
        setError(authError.message);
        setPending(false);
      }
      // On success Supabase redirects the browser to Google, so no manual
      // navigation is needed here.
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start Google sign-in.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={pending}
        aria-describedby={error ? "google-error" : undefined}
        className="border-chalk/15 bg-chalk/[0.03] text-chalk hover:bg-chalk/[0.06] inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <GoogleMark />}
        {pending ? "Connecting to Google…" : label}
      </button>

      {error ? (
        <p id="google-error" className="text-red-300 flex items-start gap-2 text-xs leading-relaxed" role="alert">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
