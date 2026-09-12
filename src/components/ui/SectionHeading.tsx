import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const sizes = {
  md: "text-3xl sm:text-4xl lg:text-5xl",
  lg: "text-4xl sm:text-5xl lg:text-6xl",
  xl: "text-5xl sm:text-6xl lg:text-7xl",
} as const;

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional trailing element, e.g. a "View all" button on desktop. */
  action?: ReactNode;
  align?: "left" | "center";
  size?: keyof typeof sizes;
  as?: "h1" | "h2" | "h3";
  className?: string;
};

/** Eyebrow → heading → description hierarchy shared by every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  size = "lg",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        action && !centered && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "text-accent-400 flex items-center gap-3 text-[11px] font-semibold tracking-[0.32em] uppercase",
              centered && "justify-center",
            )}
          >
            <span className="bg-accent-500/70 h-px w-8" aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}

        <Heading
          className={cn("font-display text-chalk text-balance-tight mt-5", sizes[size])}
        >
          {title}
        </Heading>

        {description ? (
          <p className="text-mist mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className={cn(centered && "mt-2 text-center")}>{action}</div> : null}
    </div>
  );
}
