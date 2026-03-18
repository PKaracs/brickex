import "server-only";

import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { toNextJsHandler, nextCookies } from "better-auth/next-js";
import {
  magicLink,
  organization,
  twoFactor,
  username,
} from "better-auth/plugins";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import type { CustomerState } from "@polar-sh/sdk/models/components/customerstate";
import type { CustomerStateSubscription } from "@polar-sh/sdk/models/components/customerstatesubscription";

import * as schema from "@/db/schema";
import {
  sendMagicLinkEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "@/lib/auth-email";
import { buildBrickexAppUrl } from "@/lib/brickex-url";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/subscription-plans";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { metaServerEvents } from "@/lib/meta-events-api";
import { getMetaRequestContext, splitMetaName } from "@/lib/meta-server";

async function createWorkspaceForUser(user: {
  id: string;
  email: string;
  name?: string | null;
}) {
  const existingMembership = await db.query.members.findFirst({
    where: eq(schema.members.userId, user.id),
  });

  if (existingMembership) {
    await db
      .update(schema.users)
      .set({
        defaultOrganizationId: existingMembership.organizationId,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));
    return existingMembership.organizationId;
  }

  const baseName = "Playground";
  const baseSlug = "playground";

  let slug = baseSlug;
  let suffix = 1;

  while (
    await db.query.organizations.findFirst({
      where: eq(schema.organizations.slug, slug),
      columns: { id: true },
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const [workspace] = await db
    .insert(schema.organizations)
    .values({
      name: baseName,
      slug,
      metadata: {
        provisionedBy: "better-auth",
        createdForUserId: user.id,
        isPlayground: true,
      },
    })
    .returning();

  await db.insert(schema.members).values({
    organizationId: workspace.id,
    userId: user.id,
    role: "owner",
  });

  await db.insert(schema.workspaceSettings).values({
    organizationId: workspace.id,
    companyName: "Playground",
    metadata: {
      onboardingState: "provisioned",
    },
  });

  await db
    .update(schema.users)
    .set({
      defaultOrganizationId: workspace.id,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  return workspace.id;
}

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV === "sandbox" ? "sandbox" : "production",
});

type SubscriptionStatusValue =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "paused";

function resolvePlanFromProductId(productId: string): {
  slug: string;
  creationLimit: number;
  price: number;
} | null {
  if (productId === SUBSCRIPTION_PLANS.STARTER.productId) {
    return {
      slug: "starter",
      creationLimit: SUBSCRIPTION_PLANS.STARTER.creationLimit,
      price: SUBSCRIPTION_PLANS.STARTER.price,
    };
  }
  if (productId === SUBSCRIPTION_PLANS.PRO.productId) {
    return {
      slug: "pro",
      creationLimit: SUBSCRIPTION_PLANS.PRO.creationLimit,
      price: SUBSCRIPTION_PLANS.PRO.price,
    };
  }
  if (
    SUBSCRIPTION_PLANS.STUDIO.productId &&
    productId === SUBSCRIPTION_PLANS.STUDIO.productId
  ) {
    return {
      slug: "studio",
      creationLimit: SUBSCRIPTION_PLANS.STUDIO.creationLimit,
      price: SUBSCRIPTION_PLANS.STUDIO.price,
    };
  }
  return null;
}

type ResolvedPolarSubscription = {
  plan: {
    slug: string;
    creationLimit: number;
    price: number;
  };
  subscription: CustomerStateSubscription;
};

type BillingSyncUser = {
  id: string;
  subscriptionPlan: string | null;
  subscriptionCurrentPeriodEnd: Date | null;
};

function resolvePlanConfigFromSlug(planCode: string | null | undefined) {
  switch (planCode) {
    case SUBSCRIPTION_PLANS.STARTER.slug:
      return SUBSCRIPTION_PLANS.STARTER;
    case SUBSCRIPTION_PLANS.PRO.slug:
      return SUBSCRIPTION_PLANS.PRO;
    case SUBSCRIPTION_PLANS.STUDIO.slug:
      return SUBSCRIPTION_PLANS.STUDIO;
    default:
      return null;
  }
}

function buildMetaEventSourceUrl(pathname: string) {
  return buildBrickexAppUrl(
    env.NEXT_PUBLIC_APP_URL ?? env.BETTER_AUTH_URL,
    pathname,
  );
}

function selectPrimaryPolarSubscription(
  subscriptions: CustomerStateSubscription[],
): ResolvedPolarSubscription | null {
  const knownSubscriptions = subscriptions
    .map((subscription) => {
      const plan = resolvePlanFromProductId(subscription.productId);
      return plan ? { plan, subscription } : null;
    })
    .filter((entry): entry is ResolvedPolarSubscription => entry !== null)
    .sort((left, right) => right.plan.creationLimit - left.plan.creationLimit);

  return knownSubscriptions[0] ?? null;
}

function getEffectiveSubscriptionStatus(
  subscription: CustomerStateSubscription,
): SubscriptionStatusValue {
  return subscription.cancelAtPeriodEnd ? "canceled" : subscription.status;
}

function shouldResetUsageForSubscription(
  user: BillingSyncUser,
  nextSubscription: ResolvedPolarSubscription,
): boolean {
  const wasPaid =
    user.subscriptionPlan === "starter" ||
    user.subscriptionPlan === "pro" ||
    user.subscriptionPlan === "studio";
  const previousPeriodEnd =
    user.subscriptionCurrentPeriodEnd?.toISOString() ?? null;
  const nextPeriodEnd =
    nextSubscription.subscription.currentPeriodEnd?.toISOString() ??
    nextSubscription.subscription.endsAt?.toISOString() ??
    null;

  return (
    !wasPaid ||
    user.subscriptionPlan !== nextSubscription.plan.slug ||
    previousPeriodEnd !== nextPeriodEnd
  );
}

async function syncUserBillingFromPolarState(customerState: CustomerState) {
  if (!customerState.externalId) {
    return;
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, customerState.externalId),
    columns: {
      id: true,
      subscriptionPlan: true,
      subscriptionCurrentPeriodEnd: true,
    },
  });

  if (!user) {
    return;
  }

  const primarySubscription = selectPrimaryPolarSubscription(
    customerState.activeSubscriptions,
  );

  if (!primarySubscription) {
    await db
      .update(schema.users)
      .set({
        billingCustomerId: customerState.deletedAt ? null : customerState.id,
        subscriptionProvider: customerState.deletedAt ? "none" : "polar",
        subscriptionPlan: null,
        subscriptionStatus: null,
        subscriptionCurrentPeriodEnd: null,
        creationsLimit: SUBSCRIPTION_PLANS.FREE.creationLimit,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id));

    return;
  }

  const nextPeriodEnd =
    primarySubscription.subscription.currentPeriodEnd ??
    primarySubscription.subscription.endsAt ??
    null;
  const shouldResetUsage = shouldResetUsageForSubscription(
    user,
    primarySubscription,
  );

  await db
    .update(schema.users)
    .set({
      billingCustomerId: customerState.id,
      subscriptionProvider: "polar",
      subscriptionPlan: primarySubscription.plan.slug,
      subscriptionStatus: getEffectiveSubscriptionStatus(
        primarySubscription.subscription,
      ),
      subscriptionCurrentPeriodEnd: nextPeriodEnd,
      creationsLimit: primarySubscription.plan.creationLimit,
      ...(shouldResetUsage ? { creationsUsed: 0 } : {}),
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));
}

async function sendMetaCompleteRegistrationForUser(user: {
  id: string;
  email: string;
  name?: string | null;
}) {
  const requestContext = await getMetaRequestContext();
  const { firstName, lastName } = splitMetaName(user.name);

  const result = await metaServerEvents.completeRegistration({
    email: user.email,
    externalId: user.id,
    firstName,
    lastName,
    contentName: "signup",
    url: buildMetaEventSourceUrl("/welcome"),
    fbp: requestContext.fbp ?? undefined,
    fbc: requestContext.fbc ?? undefined,
    clientUserAgent: requestContext.userAgent || undefined,
    clientIpAddress: requestContext.ip || undefined,
  });

  if (!result.success) {
    console.error(
      "[Meta CAPI] CompleteRegistration failed for:",
      user.email,
      result.error,
    );
  }

  return requestContext;
}

async function sendMetaPurchaseForSubscription(
  userId: string,
  subscriptionId: string,
) {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      metaFbp: true,
      metaFbc: true,
      lastUserAgent: true,
      lastIpAddress: true,
      metaPurchaseEventId: true,
    },
  });

  if (!user?.metaPurchaseEventId) {
    return;
  }

  const attribution = await db.query.checkoutAttributions.findFirst({
    where: eq(
      schema.checkoutAttributions.purchaseEventId,
      user.metaPurchaseEventId,
    ),
    columns: {
      id: true,
      planCode: true,
      checkoutValue: true,
      currency: true,
      metaFbp: true,
      metaFbc: true,
      clientUserAgent: true,
      clientIpAddress: true,
      status: true,
    },
  });

  if (!attribution) {
    console.warn(
      "[Meta CAPI] Missing checkout attribution for purchase event:",
      user.metaPurchaseEventId,
    );
    return;
  }

  if (attribution.status === "purchased") {
    console.log(
      "[Meta CAPI] Purchase already sent (webhook retry), skipping for:",
      user.email,
    );
    return;
  }

  const { firstName, lastName } = splitMetaName(user.name);
  const planConfig = resolvePlanConfigFromSlug(attribution.planCode);
  const fallbackPrice = planConfig?.price ?? 0;
  const parsedPurchaseValue = Number(attribution.checkoutValue);
  const purchaseValue =
    Number.isFinite(parsedPurchaseValue) && parsedPurchaseValue > 0
      ? parsedPurchaseValue
      : fallbackPrice;

  if (purchaseValue <= 0) {
    await db
      .update(schema.checkoutAttributions)
      .set({
        status: "purchase_failed",
        providerSubscriptionId: subscriptionId,
        lastErrorMessage: "Missing purchase value for Meta purchase event",
        updatedAt: new Date(),
      })
      .where(eq(schema.checkoutAttributions.id, attribution.id));

    console.error(
      "[Meta CAPI] Missing purchase value for:",
      user.email,
      attribution.planCode,
    );
    return;
  }

  const result = await metaServerEvents.purchase({
    eventId: user.metaPurchaseEventId,
    email: user.email,
    externalId: user.id,
    firstName,
    lastName,
    value: purchaseValue,
    currency: attribution.currency || "USD",
    contentName: attribution.planCode,
    contentType: "subscription",
    url: env.POLAR_SUCCESS_URL,
    fbp: user.metaFbp || attribution.metaFbp || undefined,
    fbc: user.metaFbc || attribution.metaFbc || undefined,
    clientUserAgent:
      user.lastUserAgent || attribution.clientUserAgent || undefined,
    clientIpAddress:
      user.lastIpAddress || attribution.clientIpAddress || undefined,
  });

  await db.transaction(async (tx) => {
    await tx
      .update(schema.checkoutAttributions)
      .set({
        status: result.success ? "purchased" : "purchase_failed",
        providerSubscriptionId: subscriptionId,
        completedAt: result.success ? new Date() : null,
        lastErrorMessage: result.success
          ? null
          : result.error || "Meta purchase request failed",
        updatedAt: new Date(),
      })
      .where(eq(schema.checkoutAttributions.id, attribution.id));

    if (result.success) {
      await tx
        .update(schema.users)
        .set({
          metaPurchaseEventId: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, user.id));
    }
  });

  if (!result.success) {
    console.error("[Meta CAPI] Purchase failed for:", user.email, result.error);
  }
}

const checkoutProducts = [
  {
    productId: SUBSCRIPTION_PLANS.STARTER.productId,
    slug: SUBSCRIPTION_PLANS.STARTER.slug,
  },
  {
    productId: SUBSCRIPTION_PLANS.PRO.productId,
    slug: SUBSCRIPTION_PLANS.PRO.slug,
  },
  ...(SUBSCRIPTION_PLANS.STUDIO.productId
    ? [
        {
          productId: SUBSCRIPTION_PLANS.STUDIO.productId,
          slug: SUBSCRIPTION_PLANS.STUDIO.slug,
        },
      ]
    : []),
];

const authPlugins = [
  nextCookies(),
  username(),
  organization(),
  twoFactor(),
  polar({
    client: polarClient,
    createCustomerOnSignUp: true,
    use: [
      checkout({
        products: checkoutProducts,
        successUrl: env.POLAR_SUCCESS_URL,
        authenticatedUsersOnly: true,
      }),
      portal(),
      webhooks({
        secret: env.POLAR_WEBHOOK_SECRET,
        onCustomerStateChanged: async (payload) => {
          await syncUserBillingFromPolarState(payload.data);
        },
        onSubscriptionActive: async (payload) => {
          const externalId = payload.data.customer.externalId;
          if (!externalId) {
            return;
          }

          await sendMetaPurchaseForSubscription(externalId, payload.data.id);
        },
      }),
    ],
  }),
  ...(env.authEmailEnabled
    ? [
        magicLink({
          expiresIn: 60 * 15,
          sendMagicLink: async ({ email, url }) => {
            await sendMagicLinkEmail(email, url);
          },
        }),
      ]
    : []),
];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      organization: schema.organizations,
      member: schema.members,
      invitation: schema.invitations,
      twoFactor: schema.twoFactors,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: Array.from(
    new Set(
      [
        env.BETTER_AUTH_URL,
        env.NEXT_PUBLIC_APP_URL,
        ...env.AUTH_TRUSTED_ORIGINS,
      ].filter(Boolean) as string[],
    ),
  ),
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 12,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      defaultOrganizationId: {
        type: "string",
        required: false,
        input: false,
      },
      marketingOptIn: {
        type: "boolean",
        required: false,
        input: false,
      },
      billingCustomerId: {
        type: "string",
        required: false,
        input: false,
      },
      subscriptionPlan: {
        type: "string",
        required: false,
        input: false,
      },
      subscriptionStatus: {
        type: "string",
        required: false,
        input: false,
      },
      subscriptionCurrentPeriodEnd: {
        type: "date",
        required: false,
        input: false,
      },
      creationsUsed: {
        type: "number",
        required: false,
        input: false,
      },
      creationsLimit: {
        type: "number",
        required: false,
        input: false,
      },
      creditsBalance: {
        type: "number",
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification:
      env.AUTH_REQUIRE_EMAIL_VERIFICATION && env.authEmailEnabled,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: env.authEmailEnabled
      ? async ({ user, url }) => {
          await sendResetPasswordEmail(user.email, url);
        }
      : undefined,
  },
  emailVerification: env.authEmailEnabled
    ? {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
          await sendVerificationEmail(user.email, url);
        },
      }
    : undefined,
  socialProviders: env.googleOAuthEnabled
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
  plugins: authPlugins,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (!user.email) {
            return;
          }

          const requestContext = await sendMetaCompleteRegistrationForUser({
            id: user.id,
            email: user.email,
            name: user.name,
          });

          await db
            .update(schema.users)
            .set({
              creationsLimit: SUBSCRIPTION_PLANS.FREE.creationLimit,
              metaFbp: requestContext.fbp,
              metaFbc: requestContext.fbc,
              lastUserAgent: requestContext.userAgent || null,
              lastIpAddress: requestContext.ip || null,
              updatedAt: new Date(),
            })
            .where(eq(schema.users.id, user.id));

          await createWorkspaceForUser({
            id: user.id,
            email: user.email,
            name: user.name,
          });
        },
      },
      update: {
        after: async (user) => {
          await db
            .update(schema.users)
            .set({ lastSeenAt: new Date() })
            .where(eq(schema.users.id, user.id));
        },
      },
    },
  },
});

export const authHandler = toNextJsHandler(auth);
