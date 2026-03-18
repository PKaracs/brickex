"use client";

import { startTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { createProject } from "@/lib/actions/create-project";

interface NewDashboardClientProps {
  checkout?: string;
  fallback: React.ReactNode;
}

export function NewDashboardClient({
  checkout,
  fallback,
}: NewDashboardClientProps) {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    let cancelled = false;

    startTransition(() => {
      void createProject()
        .then((result) => {
          if (cancelled) {
            return;
          }

          if ("error" in result) {
            router.replace("/app/gallery");
            return;
          }

          const checkoutQuery = checkout
            ? `?checkout=${encodeURIComponent(checkout)}`
            : "";

          router.replace(`/app/dashboard/${result.projectId}${checkoutQuery}`);
        })
        .catch(() => {
          if (!cancelled) {
            router.replace("/app/gallery");
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [checkout, router]);

  return <>{fallback}</>;
}
