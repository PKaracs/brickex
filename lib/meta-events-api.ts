import crypto from "crypto";

import { getMetaRequestContext } from "@/lib/meta-server";

function getEnvString(key: string): string | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const PIXEL_ID = getEnvString("NEXT_PUBLIC_META_PIXEL_ID") || "26452206291101030";
const ACCESS_TOKEN = getEnvString("META_ACCESS_TOKEN");
const API_VERSION = "v21.0";

const META_CONVERSIONS_API_URL = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

// Hash function for PII (email, phone) - SHA256 as required by Meta
function hashSHA256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

// Generate unique event ID for deduplication with pixel
function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

interface MetaEventParams {
  eventName: string;
  eventId?: string;
  email?: string;
  phone?: string;
  externalId?: string;
  firstName?: string; // For better match quality
  lastName?: string; // For better match quality
  value?: number;
  currency?: string;
  contentName?: string;
  contentType?: string;
  contentIds?: string[];
  url?: string;
  // Enhanced matching parameters (stored from client-side capture)
  fbp?: string; // _fbp cookie - Facebook browser ID
  fbc?: string; // _fbc cookie - Facebook click ID
  clientUserAgent?: string; // Override user agent (from stored value)
  clientIpAddress?: string; // Override IP address (from stored value)
}

interface MetaEventResponse {
  success: boolean;
  error?: string;
  eventId: string;
}

/**
 * Send an event to Meta Conversions API (server-side)
 * This should be called from server actions or API routes
 */
export async function sendMetaEvent(
  params: MetaEventParams,
): Promise<MetaEventResponse> {
  const eventId = params.eventId || generateEventId();

  if (!ACCESS_TOKEN) {
    console.warn("[Meta Conversions API] No access token configured");
    return { success: false, error: "No access token", eventId };
  }

  try {
    const requestContext = await getMetaRequestContext();

    // Use stored values if provided (better for webhook calls), otherwise use headers
    const userAgent = params.clientUserAgent || requestContext.userAgent;
    const clientIp = params.clientIpAddress || requestContext.ip;
    const fbp = params.fbp || requestContext.fbp;
    const fbc = params.fbc || requestContext.fbc;

    // Build user_data object with hashed PII
    const userData: Record<string, unknown> = {};
    if (params.email) {
      userData.em = [hashSHA256(params.email)];
    }
    if (params.phone) {
      userData.ph = [hashSHA256(params.phone)];
    }
    if (params.externalId) {
      userData.external_id = [hashSHA256(params.externalId)];
    }
    // First name and last name for better match quality
    if (params.firstName) {
      userData.fn = [hashSHA256(params.firstName)];
    }
    if (params.lastName) {
      userData.ln = [hashSHA256(params.lastName)];
    }
    if (clientIp) {
      userData.client_ip_address = clientIp;
    }
    if (userAgent) {
      userData.client_user_agent = userAgent;
    }
    // Facebook browser/click identifiers for enhanced matching
    if (fbp) {
      userData.fbp = fbp;
    }
    if (fbc) {
      userData.fbc = fbc;
    }

    // Build custom_data object
    const customData: Record<string, unknown> = {};
    if (params.value !== undefined) {
      customData.value = params.value.toString();
    }
    if (params.currency) {
      customData.currency = params.currency;
    }
    if (params.contentName) {
      customData.content_name = params.contentName;
    }
    if (params.contentType) {
      customData.content_type = params.contentType;
    }
    if (params.contentIds && params.contentIds.length > 0) {
      customData.content_ids = params.contentIds;
    }

    // Build the event payload
    const eventTime = Math.floor(Date.now() / 1000);
    const payload = {
      data: [
        {
          event_name: params.eventName,
          event_time: eventTime,
          event_id: eventId,
          action_source: "website",
          event_source_url: params.url || requestContext.referer || "",
          user_data: userData,
          custom_data:
            Object.keys(customData).length > 0 ? customData : undefined,
        },
      ],
    };

    const response = await fetch(
      `${META_CONVERSIONS_API_URL}?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error("[Meta Conversions API] Error:", result);
      return {
        success: false,
        error: result.error?.message || "API error",
        eventId,
      };
    }

    console.log(`[Meta Conversions API] ${params.eventName} sent successfully`);
    return { success: true, eventId };
  } catch (error) {
    console.error("[Meta Conversions API] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      eventId,
    };
  }
}

// Pre-defined server-side event senders
export const metaServerEvents = {
  /**
   * Track when user completes registration (server-side)
   */
  completeRegistration: async (params: {
    eventId?: string; // For deduplication with browser pixel
    email?: string;
    externalId?: string;
    firstName?: string;
    lastName?: string;
    contentName?: string;
    url?: string;
    fbp?: string;
    fbc?: string;
    clientUserAgent?: string;
    clientIpAddress?: string;
  }) => {
    return sendMetaEvent({
      eventName: "CompleteRegistration",
      eventId: params.eventId,
      email: params.email,
      externalId: params.externalId,
      firstName: params.firstName,
      lastName: params.lastName,
      contentName: params.contentName,
      url: params.url,
      fbp: params.fbp,
      fbc: params.fbc,
      clientUserAgent: params.clientUserAgent,
      clientIpAddress: params.clientIpAddress,
    });
  },

  /**
   * Track when user initiates checkout (server-side)
   */
  initiateCheckout: async (params: {
    eventId?: string; // For deduplication with browser pixel
    email?: string;
    externalId?: string;
    firstName?: string;
    lastName?: string;
    value?: number;
    currency?: string;
    contentType?: string;
    url?: string;
    // Enhanced matching (from stored user data)
    fbp?: string;
    fbc?: string;
    clientUserAgent?: string;
    clientIpAddress?: string;
  }) => {
    return sendMetaEvent({
      eventName: "InitiateCheckout",
      eventId: params.eventId,
      email: params.email,
      externalId: params.externalId,
      firstName: params.firstName,
      lastName: params.lastName,
      value: params.value,
      currency: params.currency,
      contentType: params.contentType,
      url: params.url,
      fbp: params.fbp,
      fbc: params.fbc,
      clientUserAgent: params.clientUserAgent,
      clientIpAddress: params.clientIpAddress,
    });
  },

  /**
   * Track when user completes purchase (server-side)
   */
  purchase: async (params: {
    eventId?: string; // For deduplication with browser pixel
    email?: string;
    externalId?: string;
    firstName?: string;
    lastName?: string;
    value: number;
    currency: string;
    contentName?: string;
    contentType?: string;
    contentIds?: string[];
    url?: string;
    // Enhanced matching (from stored user data)
    fbp?: string;
    fbc?: string;
    clientUserAgent?: string;
    clientIpAddress?: string;
  }) => {
    return sendMetaEvent({
      eventName: "Purchase",
      eventId: params.eventId,
      email: params.email,
      externalId: params.externalId,
      firstName: params.firstName,
      lastName: params.lastName,
      value: params.value,
      currency: params.currency,
      contentName: params.contentName,
      contentType: params.contentType,
      contentIds: params.contentIds,
      url: params.url,
      fbp: params.fbp,
      fbc: params.fbc,
      clientUserAgent: params.clientUserAgent,
      clientIpAddress: params.clientIpAddress,
    });
  },
};
