"use server";

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

export async function getUserSubscription(): Promise<
  SubscriptionData | { error: string }
> {
  return {
    plan: "free",
    creationsUsed: 0,
    creationsLimit: 999,
    creationsRemaining: 999,
    canGenerate: true,
    subscriptionStatus: null,
    currentPeriodEnd: null,
    isPastDue: false,
  };
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
  return {
    canGenerate: true,
    creationsRemaining: 999,
  };
}

export async function incrementCreationCount(): Promise<
  { success: boolean } | { error: string }
> {
  return { success: true };
}

export async function resetCreationsForUser(
  polarCustomerId: string
): Promise<void> {}
