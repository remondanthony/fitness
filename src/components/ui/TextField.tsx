"use client";

import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  icon?: LucideIcon;
  error?: string;
  /** Extra guidance rendered under the field when there is no error. */
  hint?: string;
  disabled?: boolean;
  className?: string;
};

/** Labelled input with an optional icon, error state and password reveal. */
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  icon: Icon,
  error,
  hint,
  disabled,
  className,
}: TextFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-fog block text-[10px] font-semibold tracking-[0.2em] uppercase"
      >
        {label}
      </label>

      <div className="relative mt-2.5">
        {Icon ? (
          <Icon
            className="text-fog pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
        ) : null}

        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "bg-ink-850 text-chalk placeholder:text-fog/70 h-12 w-full rounded-xl border text-sm transition-colors duration-200  disabled:opacity-50",
            "focus-visible:outline-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2",
            Icon ? "pl-11" : "pl-4",
            isPassword ? "pr-11" : "pr-4",
            error
              ? "border-red-500/50 focus:border-red-500"
              : "border-chalk/10 hover:border-chalk/20 focus:border-accent-500/60",
          )}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="text-fog hover:bg-chalk/10 hover:text-chalk absolute top-1/2 right-2.5 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition-colors"
          >
            {revealed ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-fog mt-2 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
