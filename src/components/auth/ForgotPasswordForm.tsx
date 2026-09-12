"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

import { FormStatus } from "@/components/auth/FormStatus";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { requestPasswordReset } from "@/lib/auth/client";
import type { AuthResult, FieldErrors } from "@/lib/auth/types";
import { isClean, validateEmail } from "@/lib/auth/validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = { email: validateEmail(email) };
    setErrors(nextErrors);
    setResult(null);
    if (!isClean(nextErrors)) return;

    setPending(true);
    setResult(await requestPasswordReset(email));
    setPending(false);
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

      <SubmitButton pending={pending}>Send Reset Link</SubmitButton>
    </form>
  );
}
