"use server";

import { eq, sql } from "drizzle-orm";

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
    const canGenerate = creationsRemaining > 0;

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

/**
 * Deduct bricks from the authenticated user's balance.
 * Uses an atomic SQL update with a floor of 0 to prevent races.
 * Returns the new remaining balance, or an error.
 */
export async function deductBricks(
  amount: number,
): Promise<{ success: true; remaining: number } | { success: false; error: string }> {
  if (amount <= 0) {
    return { success: false, error: "Invalid deduction amount" };
  }

  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: {
      creationsUsed: true,
      creationsLimit: true,
    },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const remaining = user.creationsLimit - user.creationsUsed;
  if (remaining < amount) {
    return {
      success: false,
      error: `Not enough bricks. Need ${amount}, have ${remaining}.`,
    };
  }

  const [updated] = await db
    .update(schema.users)
    .set({
      creationsUsed: sql`LEAST(${schema.users.creationsUsed} + ${amount}, ${schema.users.creationsLimit})`,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, userId))
    .returning({
      creationsUsed: schema.users.creationsUsed,
      creationsLimit: schema.users.creationsLimit,
    });

  return {
    success: true,
    remaining: updated.creationsLimit - updated.creationsUsed,
  };
}

/**
 * @deprecated Use deductBricks() instead
 */
export async function incrementCreationCount(): Promise<
  { success: boolean } | { error: string }
> {
  const result = await deductBricks(1);
  if (!result.success) return { error: result.error };
  return { success: true };
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
