import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export const getSession = cache(async () => {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  return session ?? null;
});

export async function getAuthUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}
