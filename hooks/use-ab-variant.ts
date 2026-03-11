"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AB_VARIANT_COOKIE,
  AB_VARIANT_STORAGE_KEY,
  AB_VARIANTS,
  isValidVariant,
  type ABVariant,
} from "@/lib/ab-test-constants";

// Cookie utilities
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

// LocalStorage utilities
function getStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage might be unavailable in some contexts
  }
}

/**
 * Client-side hook for accessing and persisting A/B variant
 * 
 * This provides a fallback mechanism if the database lookup fails.
 * The variant is stored in both cookie and localStorage for redundancy.
 * 
 * Usage:
 * ```tsx
 * const { variant, setVariantLocally } = useABVariant();
 * ```
 */
export function useABVariant() {
  const [variant, setVariant] = useState<ABVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load variant from client storage on mount
  useEffect(() => {
    const loadVariant = () => {
      // Try cookie first, then localStorage
      const cookieVariant = getCookie(AB_VARIANT_COOKIE);
      const storageVariant = getStorage(AB_VARIANT_STORAGE_KEY);
      
      // Use cookie if valid, otherwise try localStorage
      if (cookieVariant && isValidVariant(cookieVariant)) {
        setVariant(cookieVariant);
        // Sync to localStorage if not present
        if (!storageVariant) {
          setStorage(AB_VARIANT_STORAGE_KEY, cookieVariant);
        }
      } else if (storageVariant && isValidVariant(storageVariant)) {
        setVariant(storageVariant);
        // Sync to cookie if not present
        setCookie(AB_VARIANT_COOKIE, storageVariant);
      }
      
      setIsLoading(false);
    };

    loadVariant();
  }, []);

  // Persist variant locally (called when we get variant from server)
  const setVariantLocally = useCallback((newVariant: ABVariant) => {
    setVariant(newVariant);
    setCookie(AB_VARIANT_COOKIE, newVariant);
    setStorage(AB_VARIANT_STORAGE_KEY, newVariant);
  }, []);

  // Clear variant from local storage (for testing/debugging)
  const clearVariantLocally = useCallback(() => {
    setVariant(null);
    if (typeof document !== "undefined") {
      document.cookie = `${AB_VARIANT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(AB_VARIANT_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  }, []);

  return {
    variant,
    isLoading,
    setVariantLocally,
    clearVariantLocally,
    isVariantA: variant === AB_VARIANTS.A,
    isVariantB: variant === AB_VARIANTS.B,
  };
}

/**
 * Sync server-side variant to client storage
 * Call this when you have the variant from the server (e.g., in a layout or page)
 * 
 * Usage:
 * ```tsx
 * // In a client component that receives variant from server
 * useSyncVariant(serverVariant);
 * ```
 */
export function useSyncVariant(serverVariant: ABVariant | null) {
  useEffect(() => {
    if (serverVariant && isValidVariant(serverVariant)) {
      setCookie(AB_VARIANT_COOKIE, serverVariant);
      setStorage(AB_VARIANT_STORAGE_KEY, serverVariant);
    }
  }, [serverVariant]);
}

