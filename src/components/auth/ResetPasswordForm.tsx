"use client";

import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { FormStatus } from "@/components/auth/FormStatus";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { updatePasswordAction } from "@/lib/auth/actions";
import type { AuthResult, FieldErrors } from "@/lib/auth/types";
import {
  MIN_PASSWORD_LENGTH,
  isClean,
  passwordStrength,
  validateConfirmation,
  validatePassword,
} from "@/lib/auth/validation";

/**
 * Sets a new password using the recovery session established by the email
 * link. `hasSession` is resolved on the server, so an expired or reused link
 * shows an honest dead end instead of a form that cannot work.
 */
export function ResetPasswordForm({ hasSession }: { hasSession: boolean }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [done, setDone] = useState(false);

  const strength = passwordStrength(password);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      password: validatePassword(password),
      confirmation: validateConfirmation(password, confirmation),
    };
    setErrors(nextErrors);
    setResult(null);
    if (!isClean(nextErrors)) return;

    setPending(true);
    const outcome = await updatePasswordAction(password);
    setPending(false);

    if (outcome.status === "success") {
      setDone(true);
      return;
    }

    setResult(outcome);
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-400">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="font-display text-chalk mt-6 text-3xl">Link Expired.</h2>
        <p className="text-mist mt-4 text-sm leading-relaxed">
          This reset link has expired or was already used. Request a new one and it
          will arrive in a moment.
        </p>
        <Link
          href="/forgot-password"
          className="bg-accent-500 hover:bg-accent-400 shadow-glow press mt-8 inline-flex h-12 items-center justify-center rounded-xl px-7 text-sm font-semibold text-white"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="animate-rise flex flex-col items-center text-center">
        <span className="border-accent-500/30 bg-accent-500/12 text-accent-400 motion-safe:animate-check-pop inline-flex h-14 w-14 items-center justify-center rounded-2xl border">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="font-display text-chalk mt-6 text-3xl">Password Updated.</h2>
        <p className="text-mist mt-4 text-sm leading-relaxed" role="status">
          Your password has been changed. You can sign in with it now.
        </p>
        <Link
          href="/dashboard"
          className="bg-accent-500 hover:bg-accent-400 shadow-glow press mt-8 inline-flex h-12 items-center justify-center rounded-xl px-7 text-sm font-semibold text-white"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <TextField
          label="New Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="new-password"
          icon={Lock}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
          disabled={pending}
        />

        {password ? (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    index < strength.score ? "bg-accent-500" : "bg-chalk/10",
                  )}
                />
              ))}
            </div>
            <span className="text-fog text-[10px] font-semibold tracking-[0.14em] uppercase">
              {strength.label}
            </span>
          </div>
        ) : null}
      </div>

      <TextField
        label="Confirm New Password"
        type="password"
        value={confirmation}
        onChange={setConfirmation}
        placeholder="••••••••"
        autoComplete="new-password"
        icon={Lock}
        error={errors.confirmation}
        disabled={pending}
      />

      <FormStatus result={result} />

      <SubmitButton pending={pending} pendingLabel="Updating password…">
        Update Password
      </SubmitButton>
    </form>
  );
}
