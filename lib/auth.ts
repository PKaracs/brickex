import "server-only";

import { eq } from "drizzle-orm";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { toNextJsHandler, nextCookies } from "better-auth/next-js";
import { magicLink, organization, twoFactor, username } from "better-auth/plugins";

import * as schema from "@/db/schema";
import { sendMagicLinkEmail, sendResetPasswordEmail, sendVerificationEmail } from "@/lib/auth-email";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

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

const authPlugins = [
  nextCookies(),
  username(),
  organization(),
  twoFactor(),
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
      [env.BETTER_AUTH_URL, env.NEXT_PUBLIC_APP_URL, ...env.AUTH_TRUSTED_ORIGINS].filter(
        Boolean,
      ) as string[],
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
