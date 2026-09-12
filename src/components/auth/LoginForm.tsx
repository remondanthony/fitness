"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { FormStatus } from "@/components/auth/FormStatus";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { signIn, signInWithGoogle } from "@/lib/auth/client";
import type { AuthResult, FieldErrors } from "@/lib/auth/types";
import { isClean, validateEmail, validatePassword } from "@/lib/auth/validation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState<"form" | "google" | null>(null);
  const [result, setResult] = useState<AuthResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setResult(null);
    if (!isClean(nextErrors)) return;

    setPending("form");
    setResult(await signIn({ email, password, remember }));
    setPending(null);
  }

  async function handleGoogle() {
    setErrors({});
    setResult(null);
    setPending("google");
    setResult(await signInWithGoogle());
    setPending(null);
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
        disabled={pending !== null}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        autoComplete="current-password"
        icon={Lock}
        error={errors.password}
        disabled={pending !== null}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-mist hover:text-chalk flex cursor-pointer items-center gap-2.5 text-xs transition-colors select-none has-[:focus-visible]:outline-accent-500 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="sr-only"
          />
          <span
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded border transition-colors",
              remember ? "border-accent-500 bg-accent-500" : "border-chalk/25",
            )}
            aria-hidden="true"
          >
            {remember ? (
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none">
                <path
                  d="M2 6.2 4.6 8.8 10 3.4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
          Remember me
        </label>

        <Link
          href="/forgot-password"
          className="text-accent-400 hover:text-accent-300 text-xs font-semibold transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <FormStatus result={result} />

      <SubmitButton pending={pending === "form"}>Log In</SubmitButton>

      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="bg-chalk/10 h-px flex-1" />
        <span className="text-fog text-[10px] font-semibold tracking-[0.2em] uppercase">
          or
        </span>
        <span className="bg-chalk/10 h-px flex-1" />
      </div>

      <GoogleButton
        onClick={handleGoogle}
        pending={pending === "google"}
        disabled={pending !== null}
      />
    </form>
  );
}
