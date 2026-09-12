import { Info } from "lucide-react";

/** Inline Google mark — drawn as SVG so no external image is needed. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 opacity-60" aria-hidden="true">
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
 * Google sign-in placeholder.
 *
 * The OAuth provider is not configured on the Supabase project, so the control
 * is genuinely disabled and says so. It never pretends to sign anyone in.
 * Enabling it later means adding the provider in Supabase and swapping this
 * for a button that calls `signInWithOAuth({ provider: "google" })`.
 */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        disabled
        aria-describedby="google-unavailable"
        className="border-chalk/10 bg-chalk/[0.03] text-fog inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border text-sm font-semibold"
      >
        <GoogleMark />
        {label}
      </button>

      <p
        id="google-unavailable"
        className="text-fog flex items-start gap-2 text-xs leading-relaxed"
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Google sign-in isn&apos;t configured yet — use your email and password.
      </p>
    </div>
  );
}
