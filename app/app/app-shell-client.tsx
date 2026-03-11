"use client";

import { AppSidebarLayout } from "@/components/dashboard/app-sidebar";

export default function AppShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSidebarLayout subscription={null}>
      {children}
    </AppSidebarLayout>
  );
}
