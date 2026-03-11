"use client";

import Script from "next/script";

// Extend Window interface for ttq
declare global {
  interface Window {
    TiktokAnalyticsObject: string;
    ttq: {
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      identify: (...args: unknown[]) => void;
      instances: (...args: unknown[]) => void;
      debug: (...args: unknown[]) => void;
      on: (...args: unknown[]) => void;
      off: (...args: unknown[]) => void;
      once: (...args: unknown[]) => void;
      ready: (...args: unknown[]) => void;
      alias: (...args: unknown[]) => void;
      group: (...args: unknown[]) => void;
      enableCookie: (...args: unknown[]) => void;
      disableCookie: (...args: unknown[]) => void;
      holdConsent: (...args: unknown[]) => void;
      revokeConsent: (...args: unknown[]) => void;
      grantConsent: (...args: unknown[]) => void;
      load: (pixelId: string, options?: Record<string, unknown>) => void;
      _i: Record<string, unknown[]>;
      _t: Record<string, number>;
      _o: Record<string, Record<string, unknown>>;
      methods: string[];
      setAndDefer: (target: unknown, method: string) => void;
      instance: (id: string) => unknown;
      push: (...args: unknown[]) => void;
    };
  }
}

const PIXEL_ID =
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "D50NGD3C77UB63ORBUK0";

// Generate unique event ID for deduplication
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function TikTokPixel() {
  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
            var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
            ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

            ttq.load('${PIXEL_ID}');
            ttq.page();
          }(window, document, 'ttq');
        `,
      }}
    />
  );
}

// Helper function to track custom events
export function trackTikTokEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.ttq) {
    const eventId = generateEventId();
    // Include event_id for deduplication with Events API
    window.ttq.track(eventName, { ...params, event_id: eventId });
  }
}

// Pre-defined event trackers for common conversions
export const tiktokEvents = {
  // Track when user completes registration
  completeRegistration: (params?: {
    content_name?: string;
    currency?: string;
    value?: number;
    status?: string;
  }) => {
    trackTikTokEvent("CompleteRegistration", params);
  },

  // Track when user initiates checkout
  initiateCheckout: (params?: {
    content_ids?: string[];
    content_type?: string;
    currency?: string;
    value?: number;
  }) => {
    trackTikTokEvent("InitiateCheckout", params);
  },

  // Track when user completes purchase (TikTok uses "CompletePayment")
  completePayment: (params: {
    currency: string;
    value: number;
    content_ids?: string[];
    content_type?: string;
  }) => {
    trackTikTokEvent("CompletePayment", params);
  },

  // Track page view (automatic on init, but can be called manually for SPA navigation)
  pageView: () => {
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.page();
    }
  },
};

