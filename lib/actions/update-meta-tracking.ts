"use server";

import { eq } from "drizzle-orm";

import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { getMetaRequestContext } from "@/lib/meta-server";
import { metaTrackingSchema } from "@/lib/validation/schemas";

function pickLatestText(
  ...values: Array<string | null | undefined>
): string | null {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return null;
}

export async function updateMetaTracking(
  data: unknown,
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireAuth();
    const input = metaTrackingSchema.parse(data);
    const requestContext = await getMetaRequestContext();

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {
        id: true,
        metaFbp: true,
        metaFbc: true,
        lastUserAgent: true,
        lastIpAddress: true,
        metaPurchaseEventId: true,
      },
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    await db
      .update(schema.users)
      .set({
        metaFbp: pickLatestText(input.fbp, requestContext.fbp, user.metaFbp),
        metaFbc: pickLatestText(input.fbc, requestContext.fbc, user.metaFbc),
        lastUserAgent: pickLatestText(
          input.userAgent,
          requestContext.userAgent,
          user.lastUserAgent,
        ),
        lastIpAddress: pickLatestText(requestContext.ip, user.lastIpAddress),
        metaPurchaseEventId: pickLatestText(
          input.purchaseEventId,
          user.metaPurchaseEventId,
        ),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el tracking de Meta",
    };
  }
}
