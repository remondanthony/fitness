"use client";

import { Search, X } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/cn";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
};

/** Labelled search field with a clear button that appears once typing starts. */
export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
  className,
}: SearchInputProps) {
  const id = useId();

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="text-fog pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="border-chalk/10 bg-ink-850 text-chalk placeholder:text-fog hover:border-chalk/20 focus:border-accent-500/50 focus-visible:outline-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 h-12 w-full rounded-xl border pr-11 pl-11 text-sm transition-colors duration-200  [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-fog hover:bg-chalk/10 hover:text-chalk absolute top-1/2 right-3 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
