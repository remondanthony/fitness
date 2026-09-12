/** Skeleton shown while a site route streams in. Mirrors the page rhythm. */
export default function Loading() {
  return (
    <div className="animate-pulse px-5 py-14 sm:px-8 lg:py-20" aria-hidden="true">
      <div className="mx-auto w-full max-w-7xl">
        <div className="bg-chalk/8 h-3 w-24 rounded-full" />
        <div className="bg-chalk/10 mt-6 h-12 w-3/4 rounded-xl sm:h-16 sm:w-1/2" />
        <div className="bg-chalk/8 mt-5 h-4 w-full max-w-xl rounded-full" />
        <div className="bg-chalk/8 mt-3 h-4 w-2/3 max-w-md rounded-full" />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="border-chalk/8 bg-ink-850 rounded-2xl border">
              <div className="bg-chalk/5 aspect-[4/3] rounded-t-2xl" />
              <div className="p-6">
                <div className="bg-chalk/10 h-6 w-2/3 rounded-lg" />
                <div className="bg-chalk/8 mt-4 h-3 w-full rounded-full" />
                <div className="bg-chalk/8 mt-2.5 h-3 w-4/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
