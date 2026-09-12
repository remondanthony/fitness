import { cn } from "@/lib/cn";

/** Base shimmer block. Compose these into route-shaped placeholders. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-chalk/8 motion-safe:animate-shimmer rounded-lg", className)}
      aria-hidden="true"
    />
  );
}

/** Matches the artwork-over-content shape of the product's cards. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn("border-chalk/8 bg-ink-850 overflow-hidden rounded-2xl border", className)}
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-2.5 h-3 w-4/5" />
        <div className="border-chalk/8 mt-6 flex gap-4 border-t pt-5">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

/** Grid of card skeletons, for list routes. */
export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/** Matches the dashboard's metric tiles. */
export function SkeletonMetric({ className }: { className?: string }) {
  return (
    <div
      className={cn("border-chalk/8 bg-ink-850 rounded-2xl border p-6", className)}
      aria-hidden="true"
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-9 w-20" />
      <Skeleton className="mt-6 h-1.5 w-full rounded-full" />
      <Skeleton className="mt-3 h-3 w-3/4" />
    </div>
  );
}

/** Row of metric skeletons. */
export function SkeletonMetricRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonMetric key={index} />
      ))}
    </div>
  );
}
