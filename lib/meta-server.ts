import "server-only";

import { headers } from "next/headers";

function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.trim().split("=");
    if (rawName === name) {
      const value = rest.join("=").trim();
      return value.length > 0 ? decodeURIComponent(value) : null;
    }
  }

  return null;
}

function extractClientIp(
  forwardedFor: string | null,
  realIp: string | null,
): string {
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    return firstIp?.trim() ?? "";
  }

  return realIp?.trim() ?? "";
}

export type MetaRequestContext = {
  ip: string;
  userAgent: string;
  referer: string;
  fbp: string | null;
  fbc: string | null;
};

export async function getMetaRequestContext(): Promise<MetaRequestContext> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");

    return {
      ip: extractClientIp(
        headersList.get("x-forwarded-for"),
        headersList.get("x-real-ip"),
      ),
      userAgent: headersList.get("user-agent") || "",
      referer: headersList.get("referer") || "",
      fbp: getCookieValue(cookieHeader, "_fbp"),
      fbc: getCookieValue(cookieHeader, "_fbc"),
    };
  } catch {
    return {
      ip: "",
      userAgent: "",
      referer: "",
      fbp: null,
      fbc: null,
    };
  }
}

export function splitMetaName(name: string | null | undefined): {
  firstName?: string;
  lastName?: string;
} {
  const normalized = name?.trim();
  if (!normalized) {
    return {};
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return {};
  }

  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;

  return {
    firstName,
    lastName,
  };
}
