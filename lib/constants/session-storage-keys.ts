/**
 * Session storage keys used across the application
 * Centralized to prevent typos and ensure consistency
 */
export const SESSION_STORAGE_KEYS = {
  META_PURCHASE_EVENT_ID: "meta_purchase_event_id",
  META_TRACKING_DATA: "meta_tracking_data",
  CHECKOUT_RETURN_PROJECT: "checkout_return_project",
} as const;
