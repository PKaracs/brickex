"use client";

import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  organizationClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";
import { normalizeBrickexSiteOrigin } from "@/lib/brickex-url";

const resolveBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeBrickexSiteOrigin(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: resolveBaseUrl(),
  plugins: [
    usernameClient(),
    organizationClient(),
    twoFactorClient(),
    polarClient(),
    ...(process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK_ENABLED === "false"
      ? []
      : [magicLinkClient()]),
  ],
});
