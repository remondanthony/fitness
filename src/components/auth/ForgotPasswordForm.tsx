"use client";

import { Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { FormStatus } from "@/components/auth/FormStatus";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import type { AuthResult, FieldErrors } from "@/lib/auth/types";
import { isClean, validateEmail } from "@/lib/auth/validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = { email: validateEmail(email) };
    setErrors(nextErrors);
    setResult(null);
    if (!isClean(nextErrors)) return;

    setPending(true);
    const outcome = await requestPasswordResetAction(email);
    setPending(false);

    if (outcome.status === "success") {
      setSent(true);
      return;
    }

    setResult(outcome);
  }

  if (sent) {
    return (
      <div className="animate-rise flex flex-col items-center text-center">
        <span className="border-accent-500/30 bg-accent-500/12 text-accent-400 motion-safe:animate-check-pop inline-flex h-14 w-14 items-center justify-center rounded-2xl border">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </span>

        <h2 className="font-display text-chalk mt-6 text-3xl">Check Your Email.</h2>

        <p className="text-mist mt-4 text-sm leading-relaxed" role="status">
          If an account exists for{" "}
          <span className="text-chalk font-semibold">{email}</span>, a reset link is on
          its way. Open it to choose a new password.
        </p>

        <p className="text-fog mt-5 text-xs leading-relaxed">
          The link can only be used once and expires after a while.
        </p>

        <Link
          href="/login"
          className="border-chalk/12 bg-chalk/5 text-chalk hover:border-chalk/30 press mt-8 inline-flex h-12 items-center justify-center rounded-xl border px-7 text-sm font-semibold"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
        icon={Mail}
        error={errors.email}
        hint="We'll send a reset link to this address."
        disabled={pending}
      />

      <FormStatus result={result} />

      <SubmitButton pending={pending} pendingLabel="Sending link…">
        Send Reset Link
      </SubmitButton>
    </form>
  );
}
