"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/cn";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  hint?: string;
  className?: string;
  /**
   * Label for the empty value. Without one a `value` of "" would silently
   * display the first option, which reads as an answer the member never gave.
   */
  placeholder?: string;
  disabled?: boolean;
};

/** Native select, restyled for the dark system so it stays keyboard friendly. */
export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  className,
  placeholder,
  disabled,
}: SelectFieldProps) {
  const id = useId();

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-fog block text-[10px] font-semibold tracking-[0.2em] uppercase"
      >
        {label}
      </label>

      <div className="relative mt-2.5">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={cn(
            "bg-ink-850 text-chalk border-chalk/10 hover:border-chalk/20 focus:border-accent-500/60 h-12 w-full appearance-none rounded-xl border pr-11 pl-4 text-sm transition-colors duration-200 ",
            "focus-visible:outline-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {placeholder !== undefined && value === "" ? (
            <option value="" className="bg-ink-850">
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-ink-850">
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="text-fog pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
      </div>

      {hint ? <p className="text-fog mt-2 text-xs">{hint}</p> : null}
    </div>
  );
}
