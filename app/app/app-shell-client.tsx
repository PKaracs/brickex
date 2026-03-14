"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { AppSidebarLayout } from "@/components/dashboard/app-sidebar";
import { CreateProjectDialog } from "@/components/modals/create-project-dialog";
import { ensurePlaygroundAndListWorkspaces } from "@/lib/actions/workspaces";

function isAuthRoute(pathname: string | null) {
  if (!pathname) return false;

  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password")
  );
}

export default function AppShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <AppSidebarLayout subscription={null}>
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
