/** Shapes the auth UI works against. */

export type SignInInput = {
  email: string;
  password: string;
  remember: boolean;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

/**
 * Outcome of an auth Server Action, as rendered by the forms.
 * `message` is always member-facing — raw Supabase errors never reach here.
 */
export type AuthResult =
  | { status: "success"; message?: string }
  | { status: "error"; message: string };

export type FieldErrors = Record<string, string | undefined>;
