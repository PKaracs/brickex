/**
 * Storage configuration constants
 *
 * Signed URL expiry times (in seconds):
 * - Longer expiry = fewer URL regenerations = less egress
 * - 24 hours is a good balance between security and efficiency
 */
export const STORAGE_CONFIG = {
  // Signed URL expiry: 7 days (604800 seconds)
  // Increased from 24h to allow PostHog replays to load images
  SIGNED_URL_EXPIRY: 7 * 24 * 60 * 60, // 604800 seconds = 7 days

  // Bucket name for user-generated media
  USER_MEDIA_BUCKET: "richflex-user-media",

  // Bucket name for public static assets (objects, templates, etc.)
  PUBLIC_ASSETS_BUCKET: "objects",

  // Bucket name for explore page images (public)
  EXPLORE_BUCKET: "explore",
} as const;
