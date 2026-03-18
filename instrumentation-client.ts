import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: "/ingest",
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
        password: true,
        email: false,
        text: false,
        textarea: false,
        search: false,
        tel: false,
        url: false,
        number: false,
        color: false,
        date: false,
      },
      blockSelector: null,
    },
    person_profiles: "identified_only",
    capture_performance: true,
  });
}
