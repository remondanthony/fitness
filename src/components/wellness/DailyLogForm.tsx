"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import type { SaveResult } from "@/lib/actions/daily";

export type LogField = {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  step?: string;
  max?: number;
};

/**
 * Compact editor for a day's figures.
 *
 * Deliberately small: the existing metric cards stay the display surface, and
 * this only supplies the numbers behind them. Empty means "not logged" rather
 * than zero, so a member can fill in one figure and leave the rest blank.
 */
export function DailyLogForm({
  title,
  description,
  fields,
  initial,
  onSave,
}: {
  title: string;
  description: string;
  fields: LogField[];
  initial: Record<string, string>;
  onSave: (values: Record<string, string>) => Promise<SaveResult>;
}) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);

    const result = await onSave(values);

    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    notify({ tone: "success", title: result.message });
  }

  return (
    <Card tone="raised" className="p-6 sm:p-7">
      <h3 className="text-chalk text-[11px] font-semibold tracking-[0.24em] uppercase">
        {title}
      </h3>
      <p className="text-fog mt-2 text-xs leading-relaxed">{description}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        {/* auto-fit rather than a fixed column count: four macros and five
            wellness readings then each fill their row instead of leaving a
            ragged remainder. */}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          {fields.map((field) => (
            <div key={field.key}>
              <label
                htmlFor={`log-${field.key}`}
                className="text-fog block text-[10px] font-semibold tracking-[0.2em] uppercase"
              >
                {field.label}
              </label>
              <div className="relative mt-2">
                <input
                  id={`log-${field.key}`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={field.max}
                  step={field.step ?? "1"}
                  value={values[field.key] ?? ""}
                  placeholder={field.placeholder}
                  disabled={pending}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className="bg-ink-850 text-chalk placeholder:text-fog/70 border-chalk/10 hover:border-chalk/20 focus:border-accent-500/60 focus-visible:outline-accent-500 h-12 w-full rounded-xl border pr-14 pl-4 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span
                  className="text-fog pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[10px] font-semibold tracking-[0.12em] uppercase"
                  aria-hidden="true"
                >
                  {field.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-chalk/8 mt-6 flex flex-wrap items-center gap-4 border-t pt-6">
          <button
            type="submit"
            disabled={pending}
            className="bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow press inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            {pending ? "Saving…" : "Save Today"}
          </button>
          <p className="text-fog text-xs">Leave a field blank to skip it.</p>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
