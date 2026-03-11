/**
 * Subscription plan constants for RichFlex
 * Centralized configuration for all subscription tiers
 */

export const SUBSCRIPTION_PLANS = {
  FREE: {
    slug: "free",
    name: "Free",
    creationLimit: 1,
    price: 0,
    billingPeriod: null,
    resetPeriod: null,
  },
  PRO_WEEKLY: {
    slug: "pro",
    name: "Pro (Weekly)",
    creationLimit: 50,
    price: 8.99,
    billingPeriod: "week" as const,
    productId: "656b0fb0-9bb2-4b87-b654-5145da063d0d", // Current Polar product ID
    resetPeriod: "weekly" as const,
  },
  PRO_MONTHLY: {
    slug: "unlimited-flex-pro",
    name: "Unlimited Flex Pro",
    creationLimit: 250, // 5x weekly (250 per month)
    price: 28.99,
    billingPeriod: "month" as const,
    productId: "2c6e7350-bd42-4ed2-ac9e-02caf675afa1",
    resetPeriod: "monthly" as const,
    perks: [
      "250 creations per month",
      "Request any item or template for free",
      "Direct access to founder",
      "Priority support",
    ],
  },
} as const;

export type PlanSlug = "free" | "pro" | "unlimited-flex-pro";

// Keep previous weekly product IDs valid so existing paid users retain access.
const LEGACY_WEEKLY_PRODUCT_IDS = [
  "96094503-2b61-405c-a32b-364219ee21ba",
  "397c0bc4-f749-4110-b794-82960f2e437f",
] as const;

/**
 * Helper to determine which plan a user is on based on subscription data
 */
export function getUserPlan(
  subscriptionStatus: string | null,
  subscriptionProductId: string | null
): { plan: PlanSlug; config: (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS] } {
  if (subscriptionStatus !== "active") {
    return { plan: "free", config: SUBSCRIPTION_PLANS.FREE };
  }

  // Check product ID to differentiate between weekly and monthly plans
  if (subscriptionProductId === SUBSCRIPTION_PLANS.PRO_MONTHLY.productId) {
    return { plan: "unlimited-flex-pro", config: SUBSCRIPTION_PLANS.PRO_MONTHLY };
  }

  // Accept both current and legacy weekly product IDs.
  if (
    subscriptionProductId === SUBSCRIPTION_PLANS.PRO_WEEKLY.productId ||
    LEGACY_WEEKLY_PRODUCT_IDS.includes(subscriptionProductId as (typeof LEGACY_WEEKLY_PRODUCT_IDS)[number])
  ) {
    return { plan: "pro", config: SUBSCRIPTION_PLANS.PRO_WEEKLY };
  }

  // Default to weekly (includes legacy subscriptions before monthly was added)
  return { plan: "pro", config: SUBSCRIPTION_PLANS.PRO_WEEKLY };
}

/**
 * Calculate when the limit resets based on period end
 */
export function getResetDateMessage(
  currentPeriodEnd: Date | null,
  resetPeriod: "weekly" | "monthly"
): string {
  if (!currentPeriodEnd) return "Unknown";

  const resetDate = new Date(currentPeriodEnd);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Soon (waiting for sync)";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;

  return resetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: resetDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

