import { Skeleton } from "@/components/ui/Skeleton";

/** Shown while the member's saved answers are fetched. */
export default function OnboardingLoading() {
  return (
    <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-3xl pt-16">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-1.5 w-full" />
        <Skeleton className="mt-10 h-3 w-24" />
        <Skeleton className="mt-4 h-12 w-3/4" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
