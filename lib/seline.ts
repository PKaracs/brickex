"use client";

// Seline event name constants - use these everywhere for consistency
export const SELINE_EVENTS = {
  // Auth events
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN_COMPLETED: "login_completed",

  // Onboarding events (photo upload)
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Welcome flow events (in-app onboarding)
  WELCOME_STEP_COMPLETED: "welcome_step_completed",
  WELCOME_COMPLETED: "welcome_completed",
  WELCOME_SKIPPED: "welcome_skipped",

  // Generation events
  GENERATION_STARTED: "generation_started",
  GENERATION_COMPLETED: "generation_completed",
  GENERATION_FAILED: "generation_failed",

  // Checkout events
  CHECKOUT_STARTED: "checkout_started",
  PURCHASE_COMPLETED: "purchase_completed",

  // Engagement events
  IMAGE_DOWNLOADED: "image_downloaded",
  UPGRADE_MODAL_VIEWED: "upgrade_modal_viewed",
  GALLERY_VIEWED: "gallery_viewed",
  CTA_CLICKED: "cta_clicked",
} as const;

// Type for event names
export type SelineEventName =
  (typeof SELINE_EVENTS)[keyof typeof SELINE_EVENTS];

// Declare seline on window
declare global {
  interface Window {
    seline?: {
      setUser: (user: {
        userId: string;
        email?: string;
        name?: string;
        plan?: string;
        [key: string]: unknown;
      }) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Track an event in Seline
 */
function track(event: SelineEventName, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.seline) {
    window.seline.track(event, properties);
    console.log(`[Seline] Tracked: ${event}`, properties);
  }
}

/**
 * Set user identity in Seline
 */
function setUser(user: {
  userId: string;
  email?: string;
  name?: string;
  plan?: string;
  [key: string]: unknown;
}) {
  if (typeof window !== "undefined" && window.seline) {
    window.seline.setUser(user);
    console.log(`[Seline] User set:`, user.userId);
  }
}

/**
 * Get UTM parameters from URL
 */
export function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  for (const key of utmKeys) {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  }

  return utmParams;
}

/**
 * Store UTM params in localStorage for attribution
 */
export function storeUtmParams(): void {
  if (typeof window === "undefined") return;

  const utmParams = getUtmParams();
  if (Object.keys(utmParams).length > 0) {
    // Store with timestamp for first-touch attribution
    const stored = localStorage.getItem("seline_utm");
    if (!stored) {
      localStorage.setItem(
        "seline_utm",
        JSON.stringify({
          ...utmParams,
          captured_at: new Date().toISOString(),
        })
      );
    }
  }
}

/**
 * Get stored UTM params for attribution
 */
export function getStoredUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem("seline_utm");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

// Pre-defined event trackers with proper typing
export const seline = {
  track,
  setUser,
  getUtmParams,
  storeUtmParams,
  getStoredUtmParams,

  // Auth events
  auth: {
    signupCompleted: (method: "magic_link" | "google") => {
      const utmParams = getStoredUtmParams();
      track(SELINE_EVENTS.SIGNUP_COMPLETED, {
        method,
        ...utmParams,
      });
    },
    loginCompleted: (method: "magic_link" | "google") => {
      track(SELINE_EVENTS.LOGIN_COMPLETED, { method });
    },
  },

  // Onboarding events (photo upload)
  onboarding: {
    completed: (photoCount: number) => {
      track(SELINE_EVENTS.ONBOARDING_COMPLETED, {
        photo_count: photoCount,
      });
    },
  },

  // Welcome flow events (in-app onboarding)
  welcome: {
    stepCompleted: (step: number, stepName: string, data?: Record<string, unknown>) => {
      track(SELINE_EVENTS.WELCOME_STEP_COMPLETED, {
        step,
        step_name: stepName,
        ...data,
      });
    },
    completed: (data: { goal?: string; content_types?: string[]; creator_type?: string }) => {
      track(SELINE_EVENTS.WELCOME_COMPLETED, data);
    },
    skipped: (step: number) => {
      track(SELINE_EVENTS.WELCOME_SKIPPED, { skipped_at_step: step });
    },
  },

  // Generation events
  generation: {
    started: (projectId: string) => {
      track(SELINE_EVENTS.GENERATION_STARTED, {
        project_id: projectId,
      });
    },
    completed: (
      projectId: string,
      generationId: string,
      flexWorth?: number
    ) => {
      track(SELINE_EVENTS.GENERATION_COMPLETED, {
        project_id: projectId,
        generation_id: generationId,
        flex_worth: flexWorth,
      });
    },
    failed: (projectId: string, error: string) => {
      track(SELINE_EVENTS.GENERATION_FAILED, {
        project_id: projectId,
        error,
      });
    },
  },

  // Checkout events
  checkout: {
    started: (plan: string, trigger?: string, abVariant?: string | null) => {
      track(SELINE_EVENTS.CHECKOUT_STARTED, {
        plan,
        trigger,
        ab_variant: abVariant || undefined,
      });
    },
    purchaseCompleted: (plan: string, value: number, currency: string, abVariant?: string | null) => {
      track(SELINE_EVENTS.PURCHASE_COMPLETED, {
        plan,
        value,
        currency,
        ab_variant: abVariant || undefined,
      });
    },
  },

  // Engagement events
  engagement: {
    imageDownloaded: (projectId: string) => {
      track(SELINE_EVENTS.IMAGE_DOWNLOADED, {
        project_id: projectId,
      });
    },
    upgradeModalViewed: (trigger: string) => {
      track(SELINE_EVENTS.UPGRADE_MODAL_VIEWED, {
        trigger,
      });
    },
    galleryViewed: (imageCount: number) => {
      track(SELINE_EVENTS.GALLERY_VIEWED, {
        image_count: imageCount,
      });
    },
    ctaClicked: (location: string, ctaText: string) => {
      track(SELINE_EVENTS.CTA_CLICKED, {
        location,
        cta_text: ctaText,
      });
    },
  },
};

export default seline;
