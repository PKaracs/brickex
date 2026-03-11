import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  ui_host: "https://us.posthog.com",
  defaults: "2025-05-24",
  capture_exceptions: true,
  capture_pageview: true,
  capture_pageleave: true,
  debug: process.env.NODE_ENV === "development",
  // Session Recording enabled (configure min duration in PostHog dashboard)
  disable_session_recording: false,
  session_recording: {
    // Capture cross-origin iframes
    recordCrossOriginIframes: true,
    // Don't mask ANY inputs - we want to see what users type
    maskAllInputs: false,
    maskTextSelector: null,
    // Don't mask specific input types either
    maskInputOptions: {
      password: true, // Only mask passwords for security
      email: false, // Show emails in recordings
      text: false,
      textarea: false,
      search: false,
      tel: false,
      url: false,
      number: false,
      color: false,
      date: false,
    },
    // Block nothing - show all content
    blockSelector: null,
  },
  // Capture emails as person properties for better visibility in recordings list
  person_profiles: "identified_only", // or "always" to create profiles for anonymous users too
  capture_performance: true,
});
