import type { AuthError } from "@supabase/supabase-js";

/**
 * Turns a Supabase auth error into something a member can act on.
 *
 * Supabase's raw messages leak implementation detail and are sometimes
 * ambiguous, so we map the codes we handle deliberately and fall back to a
 * neutral message for anything else. The original error is never shown.
 */
export function friendlyAuthMessage(error: AuthError): string {
  // Prefer the stable code; older responses only carry a status/message.
  switch (error.code) {
    case "invalid_credentials":
    case "invalid_grant":
      return "Those credentials don't match an account.";
    case "email_not_confirmed":
      return "Please confirm your email before signing in. Check your inbox for the link.";
    case "user_already_exists":
    case "email_exists":
      return "An account with that email already exists. Try signing in instead.";
    case "weak_password":
      return "That password is too weak. Use at least 8 characters.";
    // Supabase rejects reserved and undeliverable domains (example.com, etc.).
    case "email_address_invalid":
      return "Please enter a valid email address we can deliver to.";
    case "email_address_not_authorized":
      return "That email address isn't permitted on this project.";
    case "over_email_send_rate_limit":
      return "We've sent too many emails recently. Please try again in a few minutes.";
    case "over_request_rate_limit":
      return "Too many attempts. Please try again in a few minutes.";
    case "same_password":
      return "That is already your current password. Choose a different one.";
    case "session_expired":
    case "refresh_token_not_found":
      return "Your link has expired. Request a new one and try again.";
    case "signup_disabled":
      return "New accounts are not being accepted right now.";
    case "validation_failed":
      return "Please check the details you entered and try again.";
    default:
      break;
  }

  if (error.status === 429) {
    return "Too many attempts. Please try again in a few minutes.";
  }

  // Network / unreachable backend rather than a rejected request.
  if (error.status === 0 || error.status === undefined) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}

/** Message used when the request never reached Supabase at all. */
export const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";

/** Message used when the project has no Supabase credentials configured. */
export const NOT_CONFIGURED_MESSAGE =
  "Accounts are unavailable right now. Please try again later.";
