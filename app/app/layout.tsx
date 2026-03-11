import { Suspense } from "react";
import AppShellClient from "./app-shell-client";
import { Skeleton } from "@/components/ui/skeleton";

function LayoutSkeleton() {
  return (
    <div className="h-screen bg-neutral-900 flex overflow-hidden">
      <div className="hidden md:flex w-[68px] flex-shrink-0 bg-neutral-800 flex-col p-3 gap-3">
        <Skeleton className="h-7 w-7 bg-neutral-900 rounded-lg" />
        <div className="flex flex-col gap-2 mt-4">
          <Skeleton className="h-8 w-8 bg-neutral-900 rounded-lg mx-auto" />
          <Skeleton className="h-8 w-8 bg-neutral-900 rounded-lg mx-auto" />
          <Skeleton className="h-8 w-8 bg-neutral-900 rounded-lg mx-auto" />
        </div>
      </div>
      <div className="m-1.5 flex-1 rounded-xl border border-neutral-700 bg-neutral-900 overflow-hidden" />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <AppShellClient>{children}</AppShellClient>
    </Suspense>
  );
}
