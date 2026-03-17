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

function isAuthRoute(pathname: string | null) {
  if (!pathname) return false;

  return (
    pathname === "/login" ||
    pathname === "/app/login" ||
    pathname === "/register" ||
    pathname === "/app/register" ||
    pathname === "/forgot-password" ||
    pathname === "/app/forgot-password" ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/app/reset-password")
  );
}

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
    if (isAuthRoute(pathname)) return;

    const dismissed = localStorage.getItem("brickex:onboarded");
    if (dismissed === "true") return;

    ensurePlaygroundAndListWorkspaces().then((res) => {
      if ("workspaces" in res) {
        const hasRealProject = res.workspaces.some((w) => !w.isPlayground);
        if (!hasRealProject) {
          setShowOnboarding(true);
        } else {
          localStorage.setItem("brickex:onboarded", "true");
        }
      }
    });
  }, [pathname]);

  useEffect(() => {
    if (isAuthRoute(pathname)) return;

    let cancelled = false;

    getUserSubscription().then((result) => {
      if (!cancelled && !("error" in result)) {
        setSubscription(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (isAuthRoute(pathname)) return;

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

  if (isAuthRoute(pathname)) {
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
