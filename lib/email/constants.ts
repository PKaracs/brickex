/**
 * Email configuration constants
 */

// Sender info
export const EMAIL_FROM = {
  TRANSACTIONAL: "Richflex <noreply@richflex.co>",
  MARKETING: "Ace from Richflex <hello@richflex.co>",
  ONBOARDING: "Ace from Richflex <hello@getrichflex.com>",
} as const;

// Abandoned checkout email timing (in hours)
export const ABANDONED_CHECKOUT_TIMING = {
  EMAIL_1_DELAY_HOURS: 1, // ~45-90 min
  EMAIL_2_DELAY_HOURS: 22, // ~20-24 hours
  EMAIL_3_DELAY_HOURS: 72, // ~3 days
} as const;

// Discount codes
export const DISCOUNT_CODES = {
  ABANDONED_CHECKOUT: "EARLY30", // 30% off for abandoned checkout recovery
} as const;

// Onboarding email timing (hours after signup)
export const ONBOARDING_TIMING = {
  EMAIL_0_DELAY_MIN: 5, // Sent immediately on signup
  EMAIL_1_DELAY_HOURS: 4, // 4 hours
  EMAIL_2_DELAY_HOURS: 24, // 24 hours (1 day)
  EMAIL_3_DELAY_HOURS: 72, // 72 hours (3 days)
  EMAIL_4_DELAY_HOURS: 120, // 120 hours (5 days)
} as const;

// URLs
export const EMAIL_URLS = {
  APP: "https://app.richflex.co",
  UNSUBSCRIBE: "https://app.richflex.co/api/email/unsubscribe",
} as const;
