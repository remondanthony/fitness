"use client";

import { Lock, Mail, User } from "lucide-react";
import { useState } from "react";

import { FormStatus } from "@/components/auth/FormStatus";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { signInWithGoogle, signUp } from "@/lib/auth/client";
import type { AuthResult, FieldErrors } from "@/lib/auth/types";
import {
  MIN_PASSWORD_LENGTH,
  isClean,
  passwordStrength,
  validateConfirmation,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/auth/validation";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState<"form" | "google" | null>(null);
  const [result, setResult] = useState<AuthResult | null>(null);

  const strength = passwordStrength(password);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmation: validateConfirmation(password, confirmation),
    };
    setErrors(nextErrors);
    setResult(null);
    if (!isClean(nextErrors)) return;

    setPending("form");
    setResult(await signUp({ name, email, password }));
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
        label="Name"
        value={name}
        onChange={setName}
        placeholder="Riley Chen"
        autoComplete="name"
        icon={User}
        error={errors.name}
        disabled={pending !== null}
      />

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

      <div>
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="new-password"
          icon={Lock}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
          disabled={pending !== null}
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
        label="Confirm Password"
        type="password"
        value={confirmation}
        onChange={setConfirmation}
        placeholder="••••••••"
        autoComplete="new-password"
        icon={Lock}
        error={errors.confirmation}
        disabled={pending !== null}
      />

      <FormStatus result={result} />

      <SubmitButton pending={pending === "form"}>Create Account</SubmitButton>

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
        label="Sign up with Google"
      />
    </form>
  );
}
