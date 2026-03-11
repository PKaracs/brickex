import { headers } from "next/headers";
import crypto from "crypto";

function getEnvString(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * TikTok "Events API" may require `event_source_id` (pixel / event source id).
 * Prefer server-only env var, fall back to NEXT_PUBLIC pixel id.
 */
const DEFAULT_PIXEL_ID = "D50NGD3C77UB63ORBUK0";
const EVENT_SOURCE_ID =
  getEnvString("TIKTOK_EVENT_SOURCE_ID") ??
  getEnvString("TIKTOK_PIXEL_ID") ??
  getEnvString("NEXT_PUBLIC_TIKTOK_PIXEL_ID") ??
  DEFAULT_PIXEL_ID;
const ACCESS_TOKEN = getEnvString("TIKTOK_ACCESS_TOKEN");
const DEFAULT_TEST_EVENT_CODE = getEnvString("TIKTOK_TEST_EVENT_CODE");

const TIKTOK_EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

// Hash function for PII (email, phone)
function hashSHA256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

// Generate unique event ID for deduplication
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

interface TikTokEventParams {
  event: string;
  eventId?: string;
  /**
   * TikTok Test Events tool support.
   * If omitted, we’ll use `TIKTOK_TEST_EVENT_CODE` (if set).
   */
  testEventCode?: string;
  email?: string;
  phone?: string;
  externalId?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentType?: string;
  url?: string;
}

interface TikTokEventResponse {
  success: boolean;
  error?: string;
  eventId: string;
}

/**
 * Send an event to TikTok Events API (server-side)
 * This should be called from server actions or API routes
 */
export async function sendTikTokEvent(
  params: TikTokEventParams
): Promise<TikTokEventResponse> {
  const eventId = params.eventId || generateEventId();
  const testEventCode = params.testEventCode ?? DEFAULT_TEST_EVENT_CODE;

  if (!ACCESS_TOKEN) {
    console.warn("[TikTok Events API] No access token configured");
    return { success: false, error: "No access token", eventId };
  }

  // EVENT_SOURCE_ID always has a default, but keep this guard for safety.
  if (!EVENT_SOURCE_ID || EVENT_SOURCE_ID.trim().length === 0) {
    console.warn("[TikTok Events API] Missing event source id");
    return { success: false, error: "No event source id", eventId };
  }

  try {
    // Get request headers for user info (best-effort; may run outside a request)
    let userAgent = "";
    let referer = "";
    let ip = "";
    try {
      const headersList = await headers();
      userAgent = headersList.get("user-agent") || "";
      referer = headersList.get("referer") || "";
      ip =
        headersList.get("x-forwarded-for")?.split(",")[0] ||
        headersList.get("x-real-ip") ||
        "";
    } catch {
      // no-op
    }

    // Build user object with hashed PII
    const user: Record<string, string> = {};
    if (params.email) {
      user.email = hashSHA256(params.email);
    }
    if (params.phone) {
      user.phone = hashSHA256(params.phone);
    }
    if (params.externalId) {
      user.external_id = hashSHA256(params.externalId);
    }
    if (ip) {
      user.ip = ip;
    }
    if (userAgent) {
      user.user_agent = userAgent;
    }

    // Build properties object
    const properties: Record<string, unknown> = {};
    if (params.value !== undefined) {
      properties.value = params.value;
    }
    if (params.currency) {
      properties.currency = params.currency;
    }
    if (params.contentName) {
      properties.content_name = params.contentName;
    }
    if (params.contentType) {
      properties.content_type = params.contentType;
    }

    // Build the event payload
    const url = params.url || referer || "";
    const payload = {
      // Keep `pixel_code` for backwards compatibility with older payload formats.
      // Newer API validation may expect `event_source_id` at the request root.
      pixel_code: EVENT_SOURCE_ID,
      event: params.event,
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
      url,
      context: {
        user_agent: userAgent,
        ip,
        page: {
          url,
        },
      },
      user,
      properties,
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
    };

    if (testEventCode) {
      console.log(
        `[TikTok Events API] Sending test event (${params.event}) with code: ${testEventCode}`
      );
    }

    const response = await fetch(TIKTOK_EVENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": ACCESS_TOKEN,
      },
      body: JSON.stringify({
        event_source: "web",
        event_source_id: EVENT_SOURCE_ID,
        data: [payload],
      }),
    });

    const result = await response.json();

    if (!response.ok || result.code !== 0) {
      console.error("[TikTok Events API] Error:", {
        status: response.status,
        code: result?.code,
        message: result?.message,
        request_id: result?.request_id,
        result,
      });
      return {
        success: false,
        error:
          result?.message ||
          (typeof result?.error === "string" ? result.error : undefined) ||
          "API error",
        eventId,
      };
    }

    console.log(`[TikTok Events API] ${params.event} sent successfully`);
    return { success: true, eventId };
  } catch (error) {
    console.error("[TikTok Events API] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      eventId,
    };
  }
}

// Pre-defined server-side event senders
export const tiktokServerEvents = {
  /**
   * Track when user completes registration (server-side)
   */
  completeRegistration: async (params: {
    email?: string;
    externalId?: string;
    contentName?: string;
    url?: string;
  }) => {
    return sendTikTokEvent({
      event: "CompleteRegistration",
      email: params.email,
      externalId: params.externalId,
      contentName: params.contentName,
      url: params.url,
    });
  },

  /**
   * Track when user initiates checkout (server-side)
   */
  initiateCheckout: async (params: {
    email?: string;
    externalId?: string;
    value?: number;
    currency?: string;
    contentType?: string;
    url?: string;
  }) => {
    return sendTikTokEvent({
      event: "InitiateCheckout",
      email: params.email,
      externalId: params.externalId,
      value: params.value,
      currency: params.currency,
      contentType: params.contentType,
      url: params.url,
    });
  },

  /**
   * Track when user completes purchase (server-side)
   */
  completePayment: async (params: {
    email?: string;
    externalId?: string;
    value: number;
    currency: string;
    contentName?: string;
    contentType?: string;
    url?: string;
  }) => {
    return sendTikTokEvent({
      event: "CompletePayment",
      email: params.email,
      externalId: params.externalId,
      value: params.value,
      currency: params.currency,
      contentName: params.contentName,
      contentType: params.contentType,
      url: params.url,
    });
  },
};
