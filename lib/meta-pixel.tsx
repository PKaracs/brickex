"use client";

import Script from "next/script";

// Extend Window interface for fbq
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "26452206291101030";

// Generate unique event ID for deduplication with Conversions API
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Set Advanced Matching user data after login
 * Call this ONCE per session when user data is available
 * Meta automatically hashes all values using SHA-256
 *
 * Only use verified data: email + externalId are most reliable
 */
export function setMetaUserData(userData: {
  email?: string;
  externalId?: string;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    const matchData: Record<string, string> = {};

    if (userData.email) {
      matchData.em = userData.email.toLowerCase().trim();
    }
    if (userData.externalId) {
      matchData.external_id = userData.externalId;
    }

    // Only set if we have data
    if (Object.keys(matchData).length > 0) {
      // Re-init with user data for Advanced Matching
      // This is the Meta-recommended approach for SPAs
      window.fbq("init", PIXEL_ID, matchData);
      console.log("[Meta Pixel] Advanced Matching data set");
    }
  }
}

export function MetaPixel() {
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}', {});
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Helper function to track custom events with deduplication
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window !== "undefined" && window.fbq) {
    const id = eventId || generateEventId();
    // eventID goes in the options object (4th param) for deduplication
    // See: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events
    window.fbq("track", eventName, params || {}, { eventID: id });
    return id;
  }
  return eventId || generateEventId();
}

// Pre-defined event trackers for common conversions
export const metaEvents = {
  // Track when user completes registration
  completeRegistration: (params?: {
    content_name?: string;
    currency?: string;
    value?: number;
    status?: string;
  }) => {
    trackMetaEvent("CompleteRegistration", params);
  },

  // Track when user initiates checkout
  // Returns event_id for deduplication with server-side CAPI
  initiateCheckout: (params?: {
    content_ids?: string[];
    content_type?: string;
    currency?: string;
    value?: number;
  }): string => {
    const eventId = generateEventId();
    trackMetaEvent("InitiateCheckout", params, eventId);
    return eventId;
  },

  // Track when user completes purchase
  purchase: (params: {
    currency: string;
    value: number;
    content_ids?: string[];
    content_type?: string;
  }) => {
    trackMetaEvent("Purchase", params);
  },

  // Track page view (automatic, but can be called manually for SPA navigation)
  pageView: () => {
    trackMetaEvent("PageView");
  },
};
