"use server";

import { eq } from "drizzle-orm";

import * as schema from "@/db/schema";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth-session";
import type { PlanSlug } from "@/lib/constants/subscription-plans";

export type SubscriptionData = {
  plan: PlanSlug;
  creationsUsed: number;
  creationsLimit: number;
  creationsRemaining: number;
  canGenerate: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  resetDateMessage?: string;
  isPastDue?: boolean;
};

function normalizePlan(plan: string | null | undefined): PlanSlug {
  if (!plan) return "free";
  if (plan === "starter") return "starter";
  if (plan === "pro") return "pro";
  if (plan === "studio") return "studio";
  // Legacy plan slug mappings
  if (plan.includes("week")) return "starter";
  if (plan.includes("month") || plan === "unlimited-flex-pro") return "pro";
  return "free";
}

export async function getUserSubscription(): Promise<
  SubscriptionData | { error: string }
> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {
        creationsUsed: true,
        creationsLimit: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionCurrentPeriodEnd: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    const creationsRemaining = Math.max(user.creationsLimit - user.creationsUsed, 0);
    const canGenerate =
      user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing"
        ? true
        : creationsRemaining > 0;

    return {
      plan: normalizePlan(user.subscriptionPlan),
      creationsUsed: user.creationsUsed,
      creationsLimit: user.creationsLimit,
      creationsRemaining,
      canGenerate,
      subscriptionStatus: user.subscriptionStatus ?? null,
      currentPeriodEnd: user.subscriptionCurrentPeriodEnd ?? null,
      isPastDue: user.subscriptionStatus === "past_due",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load subscription";
    return { error: message };
  }
}

export async function checkCanGenerate(): Promise<{
  canGenerate: boolean;
  reason?: string;
  creationsRemaining: number;
  resetAt?: Date;
  isProUser?: boolean;
  planSlug?: PlanSlug;
  redirectToPricing?: boolean;
}> {
  const subscription = await getUserSubscription();

  if ("error" in subscription) {
    return {
      canGenerate: false,
      reason: subscription.error,
      creationsRemaining: 0,
    };
  }

  return {
    canGenerate: subscription.canGenerate,
    reason: subscription.canGenerate ? undefined : "Generation limit reached",
    creationsRemaining: subscription.creationsRemaining,
    resetAt: subscription.currentPeriodEnd ?? undefined,
    isProUser:
      subscription.subscriptionStatus === "active" ||
      subscription.subscriptionStatus === "trialing",
    planSlug: subscription.plan,
    redirectToPricing: !subscription.canGenerate,
  };
}

export async function incrementCreationCount(): Promise<
  { success: boolean } | { error: string }
> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {
        creationsUsed: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    await db
      .update(schema.users)
      .set({
        creationsUsed: user.creationsUsed + 1,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to increment usage";
    return { error: message };
  }
}

export async function resetCreationsForUser(
  billingCustomerId: string,
): Promise<void> {
  if (!billingCustomerId) {
    return;
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.billingCustomerId, billingCustomerId),
    columns: {
      id: true,
    },
  });

  if (!user) {
    return;
  }

  await db
    .update(schema.users)
    .set({
      creationsUsed: 0,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));
}
