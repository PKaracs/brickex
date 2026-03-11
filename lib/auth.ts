import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { polar, checkout, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { Resend } from "resend";
import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { tiktokServerEvents } from "@/lib/tiktok-events-api";
import { metaServerEvents } from "@/lib/meta-events-api";
import { getOnboardingEmail0, EMAIL_FROM } from "@/lib/email";
import { assignAndSaveVariant } from "@/lib/ab-test";

// Initialize Polar SDK client
const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.POLAR_ENV === "production" ? "production" : "sandbox",
});

// Helper to find user by Polar customer ID or external ID
async function findUserByCustomerId(customerId: string) {
  // First try to find by polarCustomerId
  let user = await db.query.users.findFirst({
    where: eq(schema.users.polarCustomerId, customerId),
  });

  if (user) return user;

  // If not found, fetch customer from Polar to get externalId (our user ID)
  try {
    const customer = await polarClient.customers.get({ id: customerId });
    if (customer.externalId) {
      user = await db.query.users.findFirst({
        where: eq(schema.users.id, customer.externalId),
      });
      // Also update polarCustomerId for future lookups
      if (user) {
        await db
          .update(schema.users)
          .set({ polarCustomerId: customerId })
          .where(eq(schema.users.id, user.id));
      }
    }
  } catch (error) {
    console.error("[Polar] Failed to fetch customer:", error);
  }

  return user;
}

// Initialize Resend for magic link emails
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate random flex names for magic link users
const FLEX_NAMES = [
  "GuyFlexing",
  "TheDon",
  "BigBoss",
  "FlexKing",
  "MoneyMoves",
  "RichVibes",
  "LuxLife",
  "BossMode",
  "FlexGod",
  "TopG",
  "AlphaFlex",
  "CashFlow",
  "DrippinG",
  "HighRoller",
  "VIPStatus",
];

function generateFlexName(): string {
  const randomName = FLEX_NAMES[Math.floor(Math.random() * FLEX_NAMES.length)];
  const randomNumber = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  return `${randomName}${randomNumber}`;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Disable signup, only allow sign-in for existing users
    signUp: {
      enabled: false,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update session if older than 1 day
    // NOTE: Cookie cache disabled - was causing TimeoutNegativeWarning errors
    // when calculating timeouts for expired/old sessions
    cookieCache: {
      enabled: false,
    },
  },
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://app.richflex.co"
      : "http://app.localhost:3000"),
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "",
  // Trust all richflex origins to prevent state mismatch on OAuth callbacks
  trustedOrigins: [
    "https://app.richflex.co",
    "https://richflex.co",
    "http://app.localhost:3000",
    "http://localhost:3000",
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    // Disable CSRF check for OAuth callbacks to prevent state mismatch issues
    // OAuth has its own state parameter for security
    disableCSRFCheck: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Generate a flex name if user doesn't have a name (magic link signup)
          if (!user.name || user.name.trim() === "") {
            return {
              data: {
                ...user,
                name: generateFlexName(),
              },
            };
          }
          return { data: user };
        },
        after: async (user) => {
          console.log("[Auth] user.create.after fired for:", {
            id: user.id,
            email: user.email,
          });

          // Track signup via TikTok Events API (server-side)
          tiktokServerEvents
            .completeRegistration({
              email: user.email || undefined,
              externalId: user.id,
              contentName: "signup",
              url: "https://richflex.co/app/login",
            })
            .then((res) =>
              console.log(
                "[TikTok Events API] completeRegistration result:",
                res,
              ),
            )
            .catch((err) =>
              console.error(
                "[TikTok Events API] completeRegistration threw:",
                err,
              ),
            );

          // Track signup via Meta Conversions API (server-side)
          // Get IP address from most recent session
          const recentSession = await db.query.sessions.findFirst({
            where: eq(schema.sessions.userId, user.id),
            columns: { ipAddress: true },
            orderBy: (sessions: any, { desc }: any) => [desc(sessions.createdAt)],
          });

          // Only send name if user signed up via Google OAuth (has real name)
          const hasGoogleAccount = await db.query.accounts.findFirst({
            where: and(
              eq(schema.accounts.userId, user.id),
              eq(schema.accounts.providerId, "google"),
            ),
            columns: { id: true },
          });

          let firstName: string | undefined;
          let lastName: string | undefined;

          if (hasGoogleAccount && user.name) {
            const nameParts = user.name.trim().split(/\s+/);
            firstName = nameParts[0] || undefined;
            lastName =
              nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;
          }

          metaServerEvents
            .completeRegistration({
              email: user.email || undefined,
              externalId: user.id,
              firstName,
              lastName,
              contentName: "signup",
              url: "https://richflex.co/app/login",
              clientIpAddress: recentSession?.ipAddress || undefined,
            })
            .then((res) =>
              console.log(
                "[Meta Conversions API] completeRegistration result:",
                res,
              ),
            )
            .catch((err) =>
              console.error(
                "[Meta Conversions API] completeRegistration threw:",
                err,
              ),
            );

          // Start onboarding email flow
          // Create onboarding record and send email 0 immediately
          if (user.email) {
            try {
              // Create onboarding record
              await db.insert(schema.userOnboarding).values({
                userId: user.id,
                email: user.email,
                currentStage: 0,
                email0SentAt: new Date(),
              });

              // Send email 0 immediately
              const { subject, html } = getOnboardingEmail0(user.email);
              await resend.emails.send({
                from: EMAIL_FROM.ONBOARDING,
                to: user.email,
                subject,
                html,
              });

              console.log("[Onboarding] Email 0 sent to:", user.email);
            } catch (err) {
              console.error("[Onboarding] Failed to start onboarding:", err);
            }
          }

          // Assign initial paywall variant for pricing experience.
          // New users always start on A; server logic promotes free users to B after 10 minutes.
          try {
            const variant = await assignAndSaveVariant(
              user.id,
              user.email || undefined,
            );
            console.log(
              "[AB Test] Assigned variant",
              variant,
              "to user:",
              user.email,
            );
          } catch (err) {
            console.error("[AB Test] Failed to assign variant:", err);
          }
        },
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        console.log("[Magic Link] Sending to:", email);
        try {
          const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "noreply@richflex.co",
            to: email,
            subject: "Your Richflex login link",
            text: `Sign in to Richflex\n\nClick the link below to securely sign in. This link expires in 5 minutes.\n\n${url}\n\nIf you didn't request this link, you can safely ignore this email.\n\n© Richflex - Transform your photos into luxury`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="x-apple-disable-message-reformatting">
  <title>Your Richflex login link</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #141414; border-radius: 16px; border: 1px solid #262626;">
          <tr>
            <td style="padding: 48px 40px; text-align: center;">
              <!-- Logo with fallback text -->
              <div style="margin: 0 auto 24px auto; width: 56px; height: 56px; background-color: #262626; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <img src="https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/logo.png" alt="Richflex" width="56" height="56" style="display: block; max-width: 56px; height: auto;">
              </div>
              
              <!-- Heading -->
              <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">
                Sign in to Richflex
              </h1>
              
              <!-- Subtext -->
              <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #a3a3a3;">
                Click the button below to securely sign in.<br>This link expires in 5 minutes.
              </p>
              
              <!-- Button -->
              <a href="${url}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; border: none;">
                Continue to Richflex →
              </a>
              
              <!-- Fallback link for email clients that don't support buttons -->
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #737373; word-break: break-all;">
                Or copy and paste this link:<br>
                <a href="${url}" style="color: #737373; text-decoration: underline;">${url}</a>
              </p>
              
              <!-- Footer -->
              <p style="margin: 40px 0 0 0; font-size: 13px; color: #525252; line-height: 1.5;">
                If you didn't request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Bottom text -->
        <p style="margin: 24px 0 0 0; font-size: 12px; color: #404040; text-align: center;">
          © Richflex · Transform your photos into luxury
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
            `,
          });
          console.log("[Magic Link] Resend response:", result);
        } catch (error) {
          console.error("[Magic Link] Failed to send email:", error);
          throw error;
        }
      },
      expiresIn: 60 * 5, // 5 minutes
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "656b0fb0-9bb2-4b87-b654-5145da063d0d",
              slug: "pro",
            },
            {
              productId: "2c6e7350-bd42-4ed2-ac9e-02caf675afa1",
              slug: "unlimited-flex-pro",
            },
          ],
          successUrl: "/app/dashboard?checkout=success",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onSubscriptionActive: async (payload) => {
            console.log("[Webhook] onSubscriptionActive:", payload.data.id);
            const customerId = payload.data.customerId;
            const user = await findUserByCustomerId(customerId);

            if (!user) {
              console.error(
                "[Webhook] User not found for customer:",
                customerId,
              );
              return;
            }

            await db
              .update(schema.users)
              .set({
                subscriptionStatus: "active",
                subscriptionId: payload.data.id,
                subscriptionProductId: payload.data.productId, // Store product ID to differentiate plans
                subscriptionCurrentPeriodEnd: payload.data.currentPeriodEnd
                  ? new Date(payload.data.currentPeriodEnd)
                  : null,
                creationsUsed: 0,
                creationsResetAt: new Date(),
                polarCustomerId: customerId,
              })
              .where(eq(schema.users.id, user.id));

            // Mark any abandoned checkouts as converted
            await db
              .update(schema.abandonedCheckouts)
              .set({ convertedAt: new Date() })
              .where(eq(schema.abandonedCheckouts.userId, user.id));

            // Complete onboarding flow (user purchased)
            // Note: If no onboarding record exists, no action needed
            const completedOnboarding = await db
              .update(schema.userOnboarding)
              .set({ completedAt: new Date() })
              .where(eq(schema.userOnboarding.userId, user.id))
              .returning({ id: schema.userOnboarding.id });

            console.log("[Webhook] Updated user:", user.email, "to active");
            if (completedOnboarding.length > 0) {
              console.log("[Webhook] Onboarding completed for:", user.email);
            }

            // Track purchase via TikTok Events API (server-side)
            tiktokServerEvents
              .completePayment({
                email: user.email || undefined,
                externalId: user.id,
                value: 8.9, // Weekly plan price
                currency: "USD",
                contentType: "subscription",
                url: "https://richflex.co/app/dashboard",
              })
              .catch((err) =>
                console.error(
                  "[TikTok Events API] completePayment error:",
                  err,
                ),
              );

            // Track purchase via Meta Conversions API (server-side)
            // Uses stored eventId for deduplication with browser pixel
            // Uses stored fbp/fbc/userAgent/IP for enhanced matching (captured at checkout)

            // Only send Purchase if we haven't already (protects against webhook retries)
            if (user.metaPurchaseEventId) {
              // Only use name if user signed up via Google OAuth (has real name)
              // Email signups have generated placeholder names - don't send those
              const hasGoogleAccount = await db.query.accounts.findFirst({
                where: and(
                  eq(schema.accounts.userId, user.id),
                  eq(schema.accounts.providerId, "google"),
                ),
                columns: { id: true },
              });

              let firstName: string | undefined;
              let lastName: string | undefined;

              if (hasGoogleAccount && user.name) {
                const nameParts = user.name.trim().split(/\s+/);
                firstName = nameParts[0] || undefined;
                lastName =
                  nameParts.length > 1
                    ? nameParts.slice(1).join(" ")
                    : undefined;
              }

              const result = await metaServerEvents.purchase({
                eventId: user.metaPurchaseEventId, // Same ID as browser pixel for dedup
                email: user.email || undefined,
                externalId: user.id,
                firstName,
                lastName,
                value: 8.9,
                currency: "USD",
                contentType: "subscription",
                url: "https://richflex.co/app/dashboard",
                // Enhanced matching from stored client data
                fbp: user.metaFbp || undefined,
                fbc: user.metaFbc || undefined,
                clientUserAgent: user.lastUserAgent || undefined,
                clientIpAddress: user.lastIpAddress || undefined,
              });

              // Only clear eventId if Meta API call succeeded
              // If failed, keep it so webhook retry can send again
              if (result.success) {
                await db
                  .update(schema.users)
                  .set({ metaPurchaseEventId: null })
                  .where(eq(schema.users.id, user.id));

                console.log("[Meta CAPI] Purchase event sent for:", user.email);
              } else {
                console.error(
                  "[Meta CAPI] Purchase failed, keeping eventId for retry:",
                  result.error,
                );
              }
            } else {
              console.log(
                "[Meta CAPI] Purchase already sent (webhook retry), skipping for:",
                user.email,
              );
            }
          },
          onSubscriptionCanceled: async (payload) => {
            console.log("[Webhook] onSubscriptionCanceled:", payload.data.id);
            const customerId = payload.data.customerId;
            const user = await findUserByCustomerId(customerId);

            if (!user) {
              console.error(
                "[Webhook] User not found for customer:",
                customerId,
              );
              return;
            }

            // When a subscription is canceled, Polar automatically handles:
            // - If upgrading: cancels old sub, activates new one
            // - If user cancels: marks as canceled but keeps access until period end
            // So we just update the status
            await db
              .update(schema.users)
              .set({ subscriptionStatus: "canceled" })
              .where(eq(schema.users.id, user.id));

            console.log("[Webhook] Updated user:", user.email, "to canceled");
          },
          onSubscriptionRevoked: async (payload) => {
            console.log("[Webhook] onSubscriptionRevoked:", payload.data.id);
            const customerId = payload.data.customerId;
            const user = await findUserByCustomerId(customerId);

            if (!user) {
              console.error(
                "[Webhook] User not found for customer:",
                customerId,
              );
              return;
            }

            // Set to "past_due" instead of clearing — this means payment failed
            // (e.g. disposable card, insufficient funds). The user is blocked from
            // using the app until they resolve payment via the Polar customer portal.
            // If the user later re-subscribes, onSubscriptionActive will set status
            // back to "active" and restore full access.
            await db
              .update(schema.users)
              .set({
                subscriptionStatus: "past_due",
              })
              .where(eq(schema.users.id, user.id));

            console.log(
              "[Webhook] Subscription revoked (past_due) for user:",
              user.email,
            );
          },
          onOrderPaid: async (payload) => {
            console.log("[Webhook] onOrderPaid:", payload.data.id);
            const customerId = payload.data.customerId;

            // Reset creations on subscription renewal
            if (payload.data.billingReason === "subscription_cycle") {
              const user = await findUserByCustomerId(customerId);
              if (user) {
                await db
                  .update(schema.users)
                  .set({
                    creationsUsed: 0,
                    creationsResetAt: new Date(),
                  })
                  .where(eq(schema.users.id, user.id));
                console.log("[Webhook] Reset creations for user:", user.email);
              }
            }
          },
          onCustomerCreated: async (payload) => {
            console.log("[Webhook] onCustomerCreated:", payload.data.id);
            const externalId = payload.data.externalId;
            if (externalId) {
              await db
                .update(schema.users)
                .set({ polarCustomerId: payload.data.id })
                .where(eq(schema.users.id, externalId));
              console.log("[Webhook] Linked customer to user:", externalId);
            }
          },
        }),
      ],
    }),
  ],
});

// Export types
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
