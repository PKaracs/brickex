import { Skeleton } from "@/components/ui/skeleton";

// Content skeleton - navbar is rendered by layout
export default function DashboardLoading() {
  return (
    <div className="h-full w-full bg-black flex flex-col">
      {/* Main content skeleton */}
      <div className="flex-1 flex">
        {/* Preview area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Skeleton className="w-full max-w-md aspect-square rounded-2xl bg-neutral-800" />
        </div>

        {/* Sidebar skeleton - hidden on mobile */}
        <div className="hidden lg:flex w-80 border-l border-neutral-800 flex-col p-4 gap-4">
          <Skeleton className="h-40 w-full rounded-xl bg-neutral-800" />
          <Skeleton className="h-12 w-full rounded-lg bg-neutral-800" />
          <Skeleton className="h-12 w-full rounded-lg bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
