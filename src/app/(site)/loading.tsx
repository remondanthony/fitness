import { Skeleton, SkeletonCardGrid } from "@/components/ui/Skeleton";

/** Skeleton shown while a site route streams in. Mirrors the page rhythm. */
export default function Loading() {
  return (
    <div className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="mt-6 h-12 w-3/4 rounded-xl sm:h-16 sm:w-1/2" />
        <Skeleton className="mt-5 h-4 w-full max-w-xl rounded-full" />
        <Skeleton className="mt-3 h-4 w-2/3 max-w-md rounded-full" />

        <div className="mt-14">
          <SkeletonCardGrid />
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
