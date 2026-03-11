// Content skeleton - navbar is rendered by layout
export default function GalleryLoading() {
  return (
    <div className="h-full w-full bg-black text-white flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filter bar skeleton */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-neutral-800">
          <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-9 w-32 bg-neutral-800 rounded animate-pulse" />
            <div className="h-9 w-20 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* List card skeletons */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-8 p-5 rounded-xl border border-neutral-800/80 bg-neutral-900/30"
              >
                {/* Image skeleton */}
                <div className="w-40 h-40 bg-neutral-800 rounded-lg animate-pulse" />
                {/* Ring skeleton */}
                <div className="w-20 h-20 bg-neutral-800 rounded-full animate-pulse" />
                {/* Breakdown skeleton */}
                <div className="hidden sm:flex flex-col gap-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neutral-700 rounded-full" />
                      <div className="w-16 h-3 bg-neutral-800 rounded animate-pulse" />
                      <div className="w-12 h-3 bg-neutral-800 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
