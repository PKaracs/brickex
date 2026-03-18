import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import { buildBrickexAppUrl } from "@/lib/brickex-url";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { metaServerEvents } from "@/lib/meta-events-api";
import { getMetaRequestContext, splitMetaName } from "@/lib/meta-server";
import { checkoutTrackingSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = checkoutTrackingSchema.parse(body);
    const { userId, organizationId } = await requireWorkspaceContext();
    const requestContext = await getMetaRequestContext();

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {
        id: true,
        email: true,
        name: true,
        metaFbp: true,
        metaFbc: true,
        lastUserAgent: true,
        lastIpAddress: true,
        metaPurchaseEventId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const purchaseEventId = input.purchaseEventId || user.metaPurchaseEventId;
    if (!purchaseEventId) {
      return NextResponse.json(
        { error: "Missing purchase event id for Meta deduplication" },
        { status: 400 },
      );
    }

    const metaFbp = user.metaFbp || requestContext.fbp;
    const metaFbc = user.metaFbc || requestContext.fbc;
    const clientUserAgent =
      requestContext.userAgent || user.lastUserAgent || "";
    const clientIpAddress = requestContext.ip || user.lastIpAddress || "";

    await db.transaction(async (tx) => {
      await tx
        .update(schema.users)
        .set({
          metaFbp: metaFbp ?? user.metaFbp,
          metaFbc: metaFbc ?? user.metaFbc,
          lastUserAgent: clientUserAgent || user.lastUserAgent,
          lastIpAddress: clientIpAddress || user.lastIpAddress,
          metaPurchaseEventId: purchaseEventId,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, userId));

      await tx
        .insert(schema.checkoutAttributions)
        .values({
          userId,
          organizationId,
          provider: "polar",
          status: "initiated",
          planCode: input.productId,
          source: input.source,
          initiateCheckoutEventId: input.eventId,
          purchaseEventId,
          checkoutValue: input.checkoutValue.toFixed(2),
          currency: input.currency.toUpperCase(),
          metaFbp,
          metaFbc,
          clientUserAgent,
          clientIpAddress,
        })
        .onConflictDoUpdate({
          target: schema.checkoutAttributions.initiateCheckoutEventId,
          set: {
            organizationId,
            planCode: input.productId,
            source: input.source,
            purchaseEventId,
            checkoutValue: input.checkoutValue.toFixed(2),
            currency: input.currency.toUpperCase(),
            metaFbp,
            metaFbc,
            clientUserAgent,
            clientIpAddress,
            updatedAt: new Date(),
          },
        });
    });

    const { firstName, lastName } = splitMetaName(user.name);
    const metaResult = await metaServerEvents.initiateCheckout({
      eventId: input.eventId,
      email: user.email,
      externalId: user.id,
      firstName,
      lastName,
      value: input.checkoutValue,
      currency: input.currency.toUpperCase(),
      contentType: "subscription",
      url:
        requestContext.referer ||
        buildBrickexAppUrl(
          env.NEXT_PUBLIC_APP_URL ?? env.BETTER_AUTH_URL,
          "/pricing",
        ),
      fbp: metaFbp ?? undefined,
      fbc: metaFbc ?? undefined,
      clientUserAgent: clientUserAgent || undefined,
      clientIpAddress: clientIpAddress || undefined,
    });

    return NextResponse.json({
      success: true,
      meta: metaResult,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to track checkout";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
