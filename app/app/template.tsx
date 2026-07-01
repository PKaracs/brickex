import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-session";
import { isAppAuthRoute, toCanonicalAppPathname } from "@/lib/app-routes";

export default async function AppTemplate({
  children,
}: {
  children: ReactNode;
}) {
  const requestHeaders = await headers();
  const pathname = toCanonicalAppPathname(requestHeaders.get("x-pathname"));

  if (isAppAuthRoute(pathname)) {
    return <>{children}</>;
  }

  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/app/login");
  }

  return <>{children}</>;
}
