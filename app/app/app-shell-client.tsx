"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { AppSidebarLayout } from "@/components/dashboard/app-sidebar";
import { CreateProjectDialog } from "@/components/modals/create-project-dialog";
import { ensurePlaygroundAndListWorkspaces } from "@/lib/actions/workspaces";
import {
  getUserSubscription,
  type SubscriptionData,
} from "@/lib/actions/get-user-subscription";
import { isAppAuthRoute } from "@/lib/app-routes";

export default function AppShellClient({
  initialSubscription,
  children,
}: {
  initialSubscription?: SubscriptionData | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    initialSubscription ?? null
  );

  useEffect(() => {
    setSubscription(initialSubscription ?? null);
  }, [initialSubscription]);

  useEffect(() => {
    if (isAppAuthRoute(pathname)) return;

    const dismissed = localStorage.getItem("brickex:onboarded");
    if (dismissed === "true") return;

    let cancelled = false;

    void ensurePlaygroundAndListWorkspaces()
      .then((res) => {
        if (cancelled || !("workspaces" in res)) {
          return;
        }

        const hasRealProject = res.workspaces.some((w) => !w.isPlayground);
        if (!hasRealProject) {
          setShowOnboarding(true);
        } else {
          localStorage.setItem("brickex:onboarded", "true");
        }
      })
      .catch(() => {
        // Ignore transient client fetch failures in the shell.
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (isAppAuthRoute(pathname)) return;

    let cancelled = false;

    void getUserSubscription()
      .then((result) => {
        if (!cancelled && !("error" in result)) {
          setSubscription(result);
        }
      })
      .catch(() => {
        // Keep the current subscription snapshot if refresh fails.
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (isAppAuthRoute(pathname)) return;

    const handleSubscriptionUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<SubscriptionData>;
      if (customEvent.detail) {
        setSubscription(customEvent.detail);
      }
    };

    window.addEventListener("brickex:subscription-updated", handleSubscriptionUpdated);
    return () => {
      window.removeEventListener(
        "brickex:subscription-updated",
        handleSubscriptionUpdated
      );
    };
  }, [pathname]);

  if (isAppAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <AppSidebarLayout subscription={subscription}>
      {children}
      <CreateProjectDialog
        open={showOnboarding}
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) {
            localStorage.setItem("brickex:onboarded", "true");
          }
        }}
      />
    </AppSidebarLayout>
  );
}
