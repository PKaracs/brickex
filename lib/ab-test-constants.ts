/**
 * A/B Test constants and types - safe for client-side use
 * 
 * This file contains only the constants and types that can be safely
 * imported in both client and server components.
 * 
 * For server-side functions (DB operations), import from @/lib/ab-test
 */

// A/B test variant types
export const AB_VARIANTS = {
  A: "A", // Control: 1 free generation, then modal
  B: "B", // Test: pricing page first, no free generation
} as const;

export type ABVariant = (typeof AB_VARIANTS)[keyof typeof AB_VARIANTS];

// Cookie name for client-side fallback
export const AB_VARIANT_COOKIE = "rf_ab_variant";

// LocalStorage key for client-side persistence
export const AB_VARIANT_STORAGE_KEY = "rf_ab_variant";

/**
 * Check if a variant value is valid
 */
export function isValidVariant(variant: unknown): variant is ABVariant {
  return variant === AB_VARIANTS.A || variant === AB_VARIANTS.B;
}

