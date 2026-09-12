import { Star } from "lucide-react";

import { cn } from "@/lib/cn";

type StarRatingProps = {
  /** Rating out of 5. Partial values fill part of a star. */
  value: number;
  size?: "sm" | "md";
  className?: string;
};

const sizes = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
} as const;

/** Five stars with an accurate partial fill for values like 4.8. */
export function StarRating({ value, size = "sm", className }: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, value));
  const stars = Array.from({ length: 5 }, (_, index) => index);

  return (
    <span
      className={cn("relative inline-block leading-none", className)}
      role="img"
      aria-label={`${clamped} out of 5`}
    >
      <span className="flex gap-0.5">
        {stars.map((index) => (
          <Star
            key={index}
            className={cn("text-chalk/15 shrink-0 fill-current", sizes[size])}
            aria-hidden="true"
          />
        ))}
      </span>

      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${(clamped / 5) * 100}%` }}
        aria-hidden="true"
      >
        <span className="flex gap-0.5">
          {stars.map((index) => (
            <Star
              key={index}
              className={cn("text-accent-500 shrink-0 fill-current", sizes[size])}
            />
          ))}
        </span>
      </span>
    </span>
  );
}
