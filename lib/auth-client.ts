"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

const resolveBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  // Use the runtime origin so sign-in requests hit the same host the app was loaded from.
  baseURL: resolveBaseUrl(),
  plugins: [magicLinkClient(), polarClient()],
});
