/**
 * Subscription plan constants for BrickEx
 * Centralized configuration for all subscription tiers
 *
 * Currency: "bricks" (displayed as a coin-like unit in the UI)
 */

export const SUBSCRIPTION_PLANS = {
  FREE: {
    slug: "free",
    name: "Gratis",
    creationLimit: 100,
    bricks: 100,
    price: 0,
    billingPeriod: null,
    resetPeriod: null,
  },
  STARTER: {
    slug: "starter",
    name: "Starter",
    creationLimit: 4000,
    bricks: 4000,
    price: 29,
    billingPeriod: "month" as const,
    productId: "12577231-5566-4444-bdcb-a595db7e248d",
    resetPeriod: "monthly" as const,
  },
  PRO: {
    slug: "pro",
    name: "Pro",
    creationLimit: 12000,
    bricks: 12000,
    price: 49,
    billingPeriod: "month" as const,
    productId: "d085f940-134d-4871-9321-4da9de1e5cd0",
    resetPeriod: "monthly" as const,
    perks: [
      "12,000 bricks al mes",
      "Todos los modos y estilos de render",
      "Generacion de video",
      "Procesamiento prioritario",
    ],
  },
  STUDIO: {
    slug: "studio",
    name: "Studio",
    creationLimit: 30000,
    bricks: 30000,
    price: 99,
    billingPeriod: "month" as const,
    productId: "29aa4751-1992-4e53-92d3-8f4c513936e7",
    resetPeriod: "monthly" as const,
    perks: [
      "30,000 bricks al mes",
      "Todo lo de Pro",
      "Renderizado por lotes",
      "Acceso API",
      "Account manager dedicado",
    ],
  },
} as const;

export type PlanSlug = "free" | "starter" | "pro" | "studio";

// Keep previous product IDs valid so existing paid users retain access.
const LEGACY_PRODUCT_IDS = [
  "96094503-2b61-405c-a32b-364219ee21ba",
  "397c0bc4-f749-4110-b794-82960f2e437f",
  "656b0fb0-9bb2-4b87-b654-5145da063d0d",
  "2c6e7350-bd42-4ed2-ac9e-02caf675afa1",
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

  if (subscriptionProductId === SUBSCRIPTION_PLANS.STUDIO.productId && SUBSCRIPTION_PLANS.STUDIO.productId) {
    return { plan: "studio", config: SUBSCRIPTION_PLANS.STUDIO };
  }

  if (subscriptionProductId === SUBSCRIPTION_PLANS.PRO.productId) {
    return { plan: "pro", config: SUBSCRIPTION_PLANS.PRO };
  }

  if (
    subscriptionProductId === SUBSCRIPTION_PLANS.STARTER.productId ||
    LEGACY_PRODUCT_IDS.includes(subscriptionProductId as (typeof LEGACY_PRODUCT_IDS)[number])
  ) {
    return { plan: "starter", config: SUBSCRIPTION_PLANS.STARTER };
  }

  // Default to starter (includes legacy subscriptions)
  return { plan: "starter", config: SUBSCRIPTION_PLANS.STARTER };
}

/**
 * Calculate when the limit resets based on period end
 */
export function getResetDateMessage(
  currentPeriodEnd: Date | null,
  resetPeriod: "weekly" | "monthly"
): string {
  if (!currentPeriodEnd) return "Desconocido";

  const resetDate = new Date(currentPeriodEnd);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Pronto (esperando sincronizacion)";
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Manana";
  if (diffDays <= 7) return `En ${diffDays} dias`;

  return resetDate.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: resetDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
