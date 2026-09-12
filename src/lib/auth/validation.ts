import type { FieldErrors } from "@/lib/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateName(value: string): string | undefined {
  if (!value.trim()) return "Enter your name";
  if (value.trim().length < 2) return "That name looks too short";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Enter your email address";
  if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Enter a password";
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return undefined;
}

export function validateConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (!confirmation) return "Confirm your password";
  if (password !== confirmation) return "Passwords do not match";
  return undefined;
}

/** True when every field in the record is free of errors. */
export function isClean(errors: FieldErrors): boolean {
  return Object.values(errors).every((error) => !error);
}

export type PasswordStrength = {
  /** 0–4. */
  score: number;
  label: string;
};

/** Rough strength read-out for the register form. Guidance only. */
export function passwordStrength(value: string): PasswordStrength {
  if (!value) return { score: 0, label: "Empty" };

  let score = 0;
  if (value.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;

  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}
