"use client";

import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  organizationClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
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

const baseAuthClient = createAuthClient({
  baseURL: resolveBaseUrl(),
  plugins: [
    usernameClient(),
    organizationClient(),
    twoFactorClient(),
    ...(process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK_ENABLED === "false"
      ? []
      : [magicLinkClient()]),
  ],
});

type AuthClientResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: {
        message?: string;
        status?: number;
        statusText?: string;
      };
    };

type CheckoutInput = {
  products?: string | string[];
  slug?: string;
  referenceId?: string;
  customFieldData?: Record<string, string | number | boolean>;
  metadata?: Record<string, string | number | boolean>;
  allowDiscountCodes?: boolean;
  discountId?: string;
  redirect?: boolean;
};

type RedirectResponse = {
  url: string;
  redirect: boolean;
};

const billingActions = {
  checkout: (body: CheckoutInput) =>
    baseAuthClient.$fetch("/checkout", {
      method: "POST",
      body,
    }) as Promise<AuthClientResult<RedirectResponse>>,
  customer: {
    portal: () =>
      baseAuthClient.$fetch("/customer/portal", {
        method: "GET",
      }) as Promise<AuthClientResult<RedirectResponse>>,
  },
};

export const authClient = Object.assign(baseAuthClient, billingActions);
