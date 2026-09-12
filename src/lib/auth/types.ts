/** Shapes the auth UI works against. These mirror what Supabase returns. */

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

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

export type AuthResult =
  | { status: "success"; user: AuthUser }
  /** A real failure the member can act on, e.g. wrong password. */
  | { status: "error"; message: string }
  /** The backend is not wired up yet — informational, not a failure. */
  | { status: "unavailable"; message: string };

export type FieldErrors = Record<string, string | undefined>;
