"use client";

/**
 * Meta CAPI Enhanced Matching - Client-side cookie capture
 *
 * Captures _fbp (browser ID) and _fbc (click ID) cookies from the Meta Pixel
 * for use in server-side Conversions API calls to improve match quality.
 *
 * _fbp: Always present when pixel is loaded - identifies browser
 * _fbc: Only present when user came from a Facebook ad click
 *
 * IMPORTANT: We also manually capture fbclid from URL because:
 * - Safari ITP limits cookie lifetime
 * - Ad blockers might block Meta Pixel
 * - Cookie might not be created before we need it
 */

export interface MetaTrackingData {
  fbp: string | null;
  fbc: string | null;
  userAgent: string;
}

/**
 * Get a specific cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue || null;
  }

  return null;
}

/**
 * Set a cookie with proper attributes
 */
function setCookie(name: string, value: string, days: number = 90): void {
  if (typeof document === "undefined") return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // Set as first-party cookie with SameSite=Lax for better persistence
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get fbclid from URL parameters
 * This is the click ID from Meta ads
 */
function getFbclidFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("fbclid");
}

/**
 * Create _fbc cookie value from fbclid
 * Format: fb.1.{timestamp_ms}.{fbclid}
 * See: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
 */
function createFbcValue(fbclid: string): string {
  const timestamp = Date.now();
  return `fb.1.${timestamp}.${fbclid}`;
}

/**
 * Generate a unique event ID for Meta pixel + CAPI deduplication
 * Must be the same format used by both client and server
 */
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Capture and persist fbclid from URL if present
 * Call this on landing page load to ensure we capture the click ID
 * even if Meta Pixel is blocked or slow to load
 *
 * Returns the fbc value if captured/created
 */
export function captureFbclidFromUrl(): string | null {
  const fbclid = getFbclidFromUrl();

  if (!fbclid) return null;

  // Check if _fbc cookie already exists
  const existingFbc = getCookie("_fbc");
  if (existingFbc) return existingFbc;

  // Create and set _fbc cookie
  const fbcValue = createFbcValue(fbclid);
  setCookie("_fbc", fbcValue, 90); // 90 days, same as Meta's default

  console.log("[Meta Tracking] Captured fbclid from URL, created _fbc cookie");
  return fbcValue;
}

/**
 * Store fbclid in sessionStorage as backup
 * This survives page refreshes but not browser close
 */
export function storeFbclidInSession(): void {
  const fbclid = getFbclidFromUrl();
  if (fbclid && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("meta_fbclid", fbclid);
    sessionStorage.setItem("meta_fbclid_time", Date.now().toString());
  }
}

/**
 * Get fbc from sessionStorage backup
 */
function getFbcFromSession(): string | null {
  if (typeof sessionStorage === "undefined") return null;

  const fbclid = sessionStorage.getItem("meta_fbclid");
  const time = sessionStorage.getItem("meta_fbclid_time");

  if (fbclid && time) {
    return `fb.1.${time}.${fbclid}`;
  }
  return null;
}

/**
 * Capture Meta tracking data from cookies
 * Call this before checkout or any conversion event
 *
 * Now also checks sessionStorage backup for fbc
 */
export function captureMetaTrackingData(): MetaTrackingData {
  // First try to capture from URL (in case user just landed)
  captureFbclidFromUrl();

  // Get _fbc from cookie, or fall back to sessionStorage
  let fbc = getCookie("_fbc");
  if (!fbc) {
    fbc = getFbcFromSession();
  }

  return {
    fbp: getCookie("_fbp"),
    fbc: fbc,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
}

/**
 * Check if we have valid Meta tracking data
 * At minimum, we should have fbp if pixel is installed
 */
export function hasMetaTrackingData(data: MetaTrackingData): boolean {
  return !!data.fbp || !!data.fbc;
}
