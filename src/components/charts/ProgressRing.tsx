import { cn } from "@/lib/cn";

type ProgressRingProps = {
  /** 0–1 completion. */
  value: number;
  /** Rendered inside the ring. */
  label: string;
  size?: number;
  className?: string;
};

/** Compact circular gauge used for percentage metrics like recovery. */
export function ProgressRing({ value, label, size = 88, className }: ProgressRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-chalk/8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          className="text-accent-500"
        />
      </svg>
      <span className="font-display text-chalk absolute inset-0 flex items-center justify-center text-lg">
        {label}
      </span>
    </div>
  );
}
