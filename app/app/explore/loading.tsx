import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="h-full flex flex-col bg-black overflow-hidden">
      {/* Header skeleton */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-5 sm:pt-6 pb-3 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 bg-neutral-800" />
          <Skeleton className="h-4 w-56 bg-neutral-800/60" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full bg-neutral-800" />
          ))}
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="flex-1 px-2 sm:px-4">
        <div className="columns-2 sm:columns-3 md:columns-4 gap-2 sm:gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`w-full rounded-xl bg-neutral-800/60 animate-pulse break-inside-avoid mb-2 sm:mb-3 ${
                [
                  "aspect-[3/4]",
                  "aspect-[4/5]",
                  "aspect-square",
                  "aspect-[3/4]",
                  "aspect-[2/3]",
                ][i % 5]
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


