"use client";

import posthog from "posthog-js";

// Event name constants - use these everywhere for consistency
export const POSTHOG_EVENTS = {
  // Auth events
  LOGIN_STARTED: "login_started",
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  SIGNUP_STARTED: "signup_started",
  SIGNUP_SUCCESS: "signup_success",
  LOGOUT: "logout",
  MAGIC_LINK_SENT: "magic_link_sent",
  OAUTH_STARTED: "oauth_started",

  // Onboarding events
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_PHOTO_ADDED: "onboarding_photo_added",
  ONBOARDING_PHOTO_REMOVED: "onboarding_photo_removed",
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_FAILED: "onboarding_failed",

  // Dashboard events
  DASHBOARD_VIEWED: "dashboard_viewed",
  AVATAR_SOURCE_SELECTED: "avatar_source_selected",
  TEMPLATE_SELECTED: "template_selected",
  TEMPLATE_CLEARED: "template_cleared",
  OBJECTS_SELECTED: "objects_selected",
  SETTINGS_CHANGED: "settings_changed",
  CUSTOM_PROMPT_ENTERED: "custom_prompt_entered",

  // Generation events
  GENERATION_STARTED: "generation_started",
  GENERATION_COMPLETED: "generation_completed",
  GENERATION_FAILED: "generation_failed",
  GENERATION_BLOCKED_LIMIT: "generation_blocked_limit",
  GENERATION_BLOCKED_UPLOADING: "generation_blocked_uploading",

  // Output events
  IMAGE_DOWNLOADED: "image_downloaded",
  IMAGE_SHARED: "image_shared",
  NEW_PROJECT_CREATED: "new_project_created",

  // Gallery events
  GALLERY_VIEWED: "gallery_viewed",
  GALLERY_IMAGE_CLICKED: "gallery_image_clicked",
  GALLERY_IMAGE_DOWNLOADED: "gallery_image_downloaded",
  GALLERY_IMAGE_DELETED: "gallery_image_deleted",
  GALLERY_IMAGE_SHARED: "gallery_image_shared",
  GALLERY_SORT_CHANGED: "gallery_sort_changed",
  GALLERY_VIEW_MODE_CHANGED: "gallery_view_mode_changed",

  // Leaderboard events
  LEADERBOARD_VIEWED: "leaderboard_viewed",
  LEADERBOARD_PERIOD_CHANGED: "leaderboard_period_changed",

  // Subscription events
  UPGRADE_MODAL_OPENED: "upgrade_modal_opened",
  UPGRADE_MODAL_CLOSED: "upgrade_modal_closed",
  CHECKOUT_STARTED: "checkout_started",
  CHECKOUT_COMPLETED: "checkout_completed",
  SUBSCRIPTION_PORTAL_OPENED: "subscription_portal_opened",

  // A/B Test events
  AB_VARIANT_ASSIGNED: "ab_variant_assigned",
  PRICING_PAGE_VIEWED: "pricing_page_viewed",
  SUBSCRIPTION_MODAL_VIEWED: "subscription_modal_viewed",

  // Teaser events - CURRENTLY DISABLED (no blur flow)
  TEASER_SHOWN: "teaser_shown",
  TEASER_BLURRED: "teaser_blurred",
  TEASER_UNLOCK_ATTEMPTED: "teaser_unlock_attempted",

  // Landing page events
  LANDING_CTA_CLICKED: "landing_cta_clicked",
  LANDING_PRICING_VIEWED: "landing_pricing_viewed",
  LANDING_FAQ_EXPANDED: "landing_faq_expanded",

  // Error events
  ERROR_OCCURRED: "error_occurred",
  UPLOAD_FAILED: "upload_failed",
  IMAGES_UPLOADED: "images_uploaded",

  // UI events
  MODAL_OPENED: "modal_opened",
  MODAL_CLOSED: "modal_closed",
  TOAST_SHOWN: "toast_shown",
} as const;

// Type for event names
export type PostHogEventName =
  (typeof POSTHOG_EVENTS)[keyof typeof POSTHOG_EVENTS];

// Helper functions for common tracking patterns
export const analytics = {
  // Track a simple event
  track: (event: PostHogEventName, properties?: Record<string, unknown>) => {
    posthog.capture(event, properties);
  },

  // Identify user (call after login/signup)
  identify: (userId: string, properties?: Record<string, unknown>) => {
    posthog.identify(userId, properties);
  },

  // Reset user (call on logout)
  reset: () => {
    posthog.reset();
  },

  // Set user properties
  setUserProperties: (properties: Record<string, unknown>) => {
    posthog.people.set(properties);
  },

  // Set user properties once (won't overwrite)
  setUserPropertiesOnce: (properties: Record<string, unknown>) => {
    posthog.people.set_once(properties);
  },

  // Increment a numeric property (using set with calculation)
  incrementProperty: (property: string, value: number = 1) => {
    // PostHog JS doesn't have increment, use capture with $set
    posthog.capture("$set", {
      $set: { [property]: value },
    });
  },

  // Auth events
  auth: {
    loginStarted: (method: "magic_link" | "google" | "email") => {
      posthog.capture(POSTHOG_EVENTS.LOGIN_STARTED, { method });
    },
    loginSuccess: (
      method: "magic_link" | "google" | "email",
      userId?: string
    ) => {
      if (userId) {
        posthog.identify(userId);
      }
      posthog.capture(POSTHOG_EVENTS.LOGIN_SUCCESS, { method });
    },
    loginFailed: (
      method: "magic_link" | "google" | "email",
      error?: string
    ) => {
      posthog.capture(POSTHOG_EVENTS.LOGIN_FAILED, { method, error });
    },
    signupStarted: (method: "magic_link" | "google" | "email") => {
      posthog.capture(POSTHOG_EVENTS.SIGNUP_STARTED, { method });
    },
    signupSuccess: (
      method: "magic_link" | "google" | "email",
      userId?: string
    ) => {
      if (userId) {
        posthog.identify(userId);
      }
      posthog.capture(POSTHOG_EVENTS.SIGNUP_SUCCESS, { method });
      posthog.people.set_once({
        signup_date: new Date().toISOString(),
        signup_method: method,
      });
    },
    logout: () => {
      posthog.capture(POSTHOG_EVENTS.LOGOUT);
      posthog.reset();
    },
    magicLinkSent: (email: string) => {
      posthog.capture(POSTHOG_EVENTS.MAGIC_LINK_SENT, {
        email_domain: email.split("@")[1],
      });
    },
    oauthStarted: (provider: string) => {
      posthog.capture(POSTHOG_EVENTS.OAUTH_STARTED, { provider });
    },
  },

  // Onboarding events
  onboarding: {
    started: () => {
      posthog.capture(POSTHOG_EVENTS.ONBOARDING_STARTED);
    },
    photoAdded: (photoCount: number, fileType?: string, fileSize?: number) => {
      posthog.capture(POSTHOG_EVENTS.ONBOARDING_PHOTO_ADDED, {
        photo_count: photoCount,
        file_type: fileType,
        file_size_kb: fileSize ? Math.round(fileSize / 1024) : undefined,
      });
    },
    photoRemoved: (remainingCount: number) => {
      posthog.capture(POSTHOG_EVENTS.ONBOARDING_PHOTO_REMOVED, {
        remaining_count: remainingCount,
      });
    },
    completed: (photoCount: number, uploadMethod: "background" | "direct") => {
      posthog.capture(POSTHOG_EVENTS.ONBOARDING_COMPLETED, {
        photo_count: photoCount,
        upload_method: uploadMethod,
      });
      posthog.people.set({ has_avatar: true, avatar_photo_count: photoCount });
    },
    failed: (error: string, photoCount: number) => {
      posthog.capture(POSTHOG_EVENTS.ONBOARDING_FAILED, {
        error,
        photo_count: photoCount,
      });
    },
  },

  // Dashboard events
  dashboard: {
    viewed: (projectId: string, hasExistingOutput: boolean) => {
      posthog.capture(POSTHOG_EVENTS.DASHBOARD_VIEWED, {
        project_id: projectId,
        has_existing_output: hasExistingOutput,
      });
    },
    avatarSourceSelected: (
      source: "existing" | "upload",
      imageCount?: number
    ) => {
      posthog.capture(POSTHOG_EVENTS.AVATAR_SOURCE_SELECTED, {
        source,
        image_count: imageCount,
      });
    },
    templateSelected: (templateId: string | number, templateName: string) => {
      posthog.capture(POSTHOG_EVENTS.TEMPLATE_SELECTED, {
        template_id: templateId,
        template_name: templateName,
      });
    },
    templateCleared: () => {
      posthog.capture(POSTHOG_EVENTS.TEMPLATE_CLEARED);
    },
    objectsSelected: (objects: string[], count: number) => {
      posthog.capture(POSTHOG_EVENTS.OBJECTS_SELECTED, {
        objects,
        object_count: count,
      });
    },
    settingsChanged: (setting: string, value: string) => {
      posthog.capture(POSTHOG_EVENTS.SETTINGS_CHANGED, { setting, value });
    },
    customPromptEntered: (promptText: string) => {
      posthog.capture(POSTHOG_EVENTS.CUSTOM_PROMPT_ENTERED, {
        prompt_text: promptText,
        prompt_length: promptText.length,
      });
    },
  },

  // Generation events
  generation: {
    started: (
      projectId: string,
      config: {
        avatarSource: "existing" | "upload";
        templateId?: string | number;
        templateName?: string;
        objects?: string[];
        settings?: Record<string, string>;
        customPrompt?: string;
        hasCustomPrompt?: boolean;
      }
    ) => {
      posthog.capture(POSTHOG_EVENTS.GENERATION_STARTED, {
        project_id: projectId,
        avatar_source: config.avatarSource,
        template_id: config.templateId,
        template_name: config.templateName,
        objects: config.objects,
        object_count: config.objects?.length || 0,
        settings: config.settings,
        custom_prompt: config.customPrompt,
        custom_prompt_length: config.customPrompt?.length || 0,
        has_custom_prompt: config.hasCustomPrompt || !!config.customPrompt,
      });
    },
    completed: (
      projectId: string,
      options?: {
        flexWorth?: number;
        duration?: number;
        outputUrl?: string;
        outputKey?: string;
        generationId?: string;
        customPrompt?: string;
        fullPrompt?: string;
      }
    ) => {
      posthog.capture(POSTHOG_EVENTS.GENERATION_COMPLETED, {
        project_id: projectId,
        flex_worth: options?.flexWorth,
        duration_ms: options?.duration,
        output_url: options?.outputUrl,
        output_key: options?.outputKey,
        generation_id: options?.generationId,
        custom_prompt: options?.customPrompt,
        custom_prompt_length: options?.customPrompt?.length || 0,
        full_prompt: options?.fullPrompt,
        full_prompt_length: options?.fullPrompt?.length || 0,
        $set: {
          last_generation_at: new Date().toISOString(),
        },
        $set_once: {
          first_generation_at: new Date().toISOString(),
        },
      });
    },
    failed: (projectId: string, error: string, requiresUpgrade?: boolean) => {
      posthog.capture(POSTHOG_EVENTS.GENERATION_FAILED, {
        project_id: projectId,
        error,
        requires_upgrade: requiresUpgrade,
      });
    },
    blockedByLimit: (creationsUsed: number, creationsLimit: number) => {
      posthog.capture(POSTHOG_EVENTS.GENERATION_BLOCKED_LIMIT, {
        creations_used: creationsUsed,
        creations_limit: creationsLimit,
      });
    },
    blockedByUploading: () => {
      posthog.capture(POSTHOG_EVENTS.GENERATION_BLOCKED_UPLOADING);
    },
  },

  // Output events
  output: {
    downloaded: (projectId: string, isFreeUser: boolean) => {
      posthog.capture(POSTHOG_EVENTS.IMAGE_DOWNLOADED, {
        project_id: projectId,
        is_free_user: isFreeUser,
        has_watermark: isFreeUser,
      });
    },
    shared: (projectId: string) => {
      posthog.capture(POSTHOG_EVENTS.IMAGE_SHARED, { project_id: projectId });
    },
    newProjectCreated: () => {
      posthog.capture(POSTHOG_EVENTS.NEW_PROJECT_CREATED);
    },
  },

  // Gallery events
  gallery: {
    viewed: (imageCount: number) => {
      posthog.capture(POSTHOG_EVENTS.GALLERY_VIEWED, {
        image_count: imageCount,
      });
    },
    imageClicked: (imageId: string, flexWorth?: number) => {
      posthog.capture(POSTHOG_EVENTS.GALLERY_IMAGE_CLICKED, {
        image_id: imageId,
        flex_worth: flexWorth,
      });
    },
    imageDownloaded: (imageId: string) => {
      posthog.capture(POSTHOG_EVENTS.GALLERY_IMAGE_DOWNLOADED, {
        image_id: imageId,
      });
    },
    imageDeleted: (imageId: string) => {
      posthog.capture(POSTHOG_EVENTS.GALLERY_IMAGE_DELETED, {
        image_id: imageId,
      });
    },
    imageShared: (imageId: string) => {
      posthog.capture(POSTHOG_EVENTS.GALLERY_IMAGE_SHARED, {
        image_id: imageId,
      });
    },
    sortChanged: (sortBy: string) => {
      posthog.capture(POSTHOG_EVENTS.GALLERY_SORT_CHANGED, { sort_by: sortBy });
    },
    viewModeChanged: (viewMode: string) => {
      posthog.capture(POSTHOG_EVENTS.GALLERY_VIEW_MODE_CHANGED, {
        view_mode: viewMode,
      });
    },
  },

  // Leaderboard events
  leaderboard: {
    viewed: (userRank: number, period: string) => {
      posthog.capture(POSTHOG_EVENTS.LEADERBOARD_VIEWED, {
        user_rank: userRank,
        period,
      });
    },
    periodChanged: (period: string) => {
      posthog.capture(POSTHOG_EVENTS.LEADERBOARD_PERIOD_CHANGED, { period });
    },
  },

  // Subscription events
  subscription: {
    upgradeModalOpened: (
      trigger: string,
      creationsUsed?: number,
      creationsLimit?: number
    ) => {
      posthog.capture(POSTHOG_EVENTS.UPGRADE_MODAL_OPENED, {
        trigger,
        creations_used: creationsUsed,
        creations_limit: creationsLimit,
      });
    },
    upgradeModalClosed: () => {
      posthog.capture(POSTHOG_EVENTS.UPGRADE_MODAL_CLOSED);
    },
    checkoutStarted: (plan: string, projectId?: string) => {
      posthog.capture(POSTHOG_EVENTS.CHECKOUT_STARTED, {
        plan,
        project_id: projectId,
      });
    },
    checkoutCompleted: (plan: string, value: number, currency: string) => {
      posthog.capture(POSTHOG_EVENTS.CHECKOUT_COMPLETED, {
        plan,
        value,
        currency,
      });
      posthog.people.set({
        subscription_plan: plan,
        subscription_date: new Date().toISOString(),
      });
    },
    portalOpened: () => {
      posthog.capture(POSTHOG_EVENTS.SUBSCRIPTION_PORTAL_OPENED);
    },
  },

  // Teaser events
  teaser: {
    shown: (projectId: string) => {
      posthog.capture(POSTHOG_EVENTS.TEASER_SHOWN, { project_id: projectId });
    },
    blurred: (projectId: string) => {
      posthog.capture(POSTHOG_EVENTS.TEASER_BLURRED, { project_id: projectId });
    },
    unlockAttempted: (projectId: string) => {
      posthog.capture(POSTHOG_EVENTS.TEASER_UNLOCK_ATTEMPTED, {
        project_id: projectId,
      });
    },
  },

  // Landing page events
  landing: {
    ctaClicked: (location: string, ctaText: string) => {
      posthog.capture(POSTHOG_EVENTS.LANDING_CTA_CLICKED, {
        location,
        cta_text: ctaText,
      });
    },
    pricingViewed: () => {
      posthog.capture(POSTHOG_EVENTS.LANDING_PRICING_VIEWED);
    },
    faqExpanded: (question: string) => {
      posthog.capture(POSTHOG_EVENTS.LANDING_FAQ_EXPANDED, { question });
    },
  },

  // Error tracking
  error: (error: string, context?: Record<string, unknown>) => {
    posthog.capture(POSTHOG_EVENTS.ERROR_OCCURRED, { error, ...context });
  },

  // Upload failed
  uploadFailed: (error: string, fileCount?: number, fileType?: string) => {
    posthog.capture(POSTHOG_EVENTS.UPLOAD_FAILED, {
      error,
      file_count: fileCount,
      file_type: fileType,
    });
  },

  // Images uploaded
  imagesUploaded: (
    projectId: string,
    storageKeys: string[],
    imageUrls?: string[]
  ) => {
    posthog.capture(POSTHOG_EVENTS.IMAGES_UPLOADED, {
      project_id: projectId,
      storage_keys: storageKeys,
      image_urls: imageUrls,
      image_count: storageKeys.length,
    });
  },
};

export default analytics;
