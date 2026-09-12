import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

const variants = {
  default: "border-chalk/10 bg-chalk/5 text-mist",
  accent: "border-accent-500/30 bg-accent-500/12 text-accent-400",
  outline: "border-chalk/15 bg-transparent text-mist",
  solid: "border-transparent bg-accent-500 text-white",
} as const;

const sizes = {
  sm: "px-2 py-0.5 text-[10px] tracking-[0.14em]",
  md: "px-3 py-1 text-[11px] tracking-[0.16em]",
} as const;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

/** Small uppercase label for levels, categories and eyebrow chips. */
export function Badge({
  variant = "default",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
