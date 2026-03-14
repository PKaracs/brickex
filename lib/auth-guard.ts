import "server-only";

import { eq } from "drizzle-orm";

import * as schema from "@/db/schema";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-session";

export async function requireAuth(): Promise<string> {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

export async function getOptionalAuth(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

export async function requireAuthWithSession() {
  const session = await getSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireWorkspaceContext() {
  const session = await requireAuthWithSession();

  let organizationId =
    session.session.activeOrganizationId ?? session.user.defaultOrganizationId ?? null;

  if (!organizationId) {
    const membership = await db.query.members.findFirst({
      where: eq(schema.members.userId, session.user.id),
      columns: {
        organizationId: true,
      },
    });

    organizationId = membership?.organizationId ?? null;
  }

  if (!organizationId) {
    throw new Error("No active workspace found");
  }

  return {
    organizationId,
    userId: session.user.id,
    session,
  };
}
