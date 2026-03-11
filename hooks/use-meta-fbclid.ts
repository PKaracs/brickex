"use client";

import { useEffect } from "react";
import {
  captureFbclidFromUrl,
  storeFbclidInSession,
} from "@/lib/meta-tracking";

/**
 * Hook to capture fbclid from URL on page load
 *
 * This runs on every page load to ensure we capture the fbclid
 * from Meta ad clicks, even if:
 * - Meta Pixel is blocked by ad blockers
 * - Safari ITP limits cookie lifetime
 * - There's a timing issue with pixel loading
 *
 * The fbclid is stored in:
 * 1. _fbc cookie (persists across sessions)
 * 2. sessionStorage (backup for same-session use)
 */
export function useMetaFbclid() {
  useEffect(() => {
    // Capture fbclid from URL and create _fbc cookie
    captureFbclidFromUrl();

    // Also store in sessionStorage as backup
    storeFbclidInSession();
  }, []);
}


