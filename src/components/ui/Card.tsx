import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

const tones = {
  /** Default charcoal panel. */
  default: "border-chalk/8 bg-ink-850",
  /** Slightly lifted panel for cards sitting on top of other cards. */
  raised: "border-chalk/10 bg-ink-800",
  /** Translucent panel for floating overlays on imagery. */
  glass: "border-chalk/10 bg-ink-900/70 backdrop-blur-xl",
} as const;

type CardOwnProps = {
  tone?: keyof typeof tones;
  /** Adds hover lift, border highlight and an accent border wash. */
  interactive?: boolean;
  /** Removes the built-in padding so media can bleed to the edges. */
  flush?: boolean;
  className?: string;
  children?: ReactNode;
};

export type CardProps<E extends ElementType> = CardOwnProps & {
  /** Element to render — `div` by default, `button`/`article`/`li` as needed. */
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof CardOwnProps | "as">;

/** Premium dark surface: subtle border, top-light gradient, soft shadow. */
export function Card<E extends ElementType = "div">({
  as,
  tone = "default",
  interactive = false,
  flush = false,
  className,
  children,
  ...props
}: CardProps<E>) {
  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      className={cn(
        "shadow-card relative isolate overflow-hidden rounded-2xl border",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-40",
        "before:from-chalk/[0.05] before:bg-gradient-to-b before:to-transparent",
        tones[tone],
        !flush && "p-6 sm:p-7",
        interactive &&
          "hover:border-accent-500/35 hover:shadow-lift focus-within:border-accent-500/35 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
