"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Check,
  Crown,
  Zap,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { captureMetaTrackingData, generateEventId } from "@/lib/meta-tracking";
import { updateMetaTracking } from "@/lib/actions/update-meta-tracking";
import { seline } from "@/lib/seline";
import { toast } from "sonner";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";
import { SESSION_STORAGE_KEYS } from "@/lib/constants/session-storage-keys";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/subscription-plans";
import posthog from "posthog-js";

type PaidPlan = "starter" | "pro" | "studio";

const PLAN_TIERS: {
  key: PaidPlan;
  config: (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];
  icon: React.ReactNode;
  badge: string | null;
  featured: boolean;
  benefits: string[];
}[] = [
  {
    key: "starter",
    config: SUBSCRIPTION_PLANS.STARTER,
    icon: <Zap className="w-4 h-4" />,
    badge: null,
    featured: false,
    benefits: [
      `${SUBSCRIPTION_PLANS.STARTER.bricks.toLocaleString()} bricks per month`,
      "Exterior + Interior modes",
      "All architecture styles",
      "4K exports, no watermarks",
      "Cancel anytime",
    ],
  },
  {
    key: "pro",
    config: SUBSCRIPTION_PLANS.PRO,
    icon: <Crown className="w-4 h-4" />,
    badge: "Popular",
    featured: true,
    benefits: [
      `${SUBSCRIPTION_PLANS.PRO.bricks.toLocaleString()} bricks per month`,
      "Everything in Starter",
      "Video generation",
      "Region editing & refinement",
      "Priority processing",
      "Cancel anytime",
    ],
  },
  {
    key: "studio",
    config: SUBSCRIPTION_PLANS.STUDIO,
    icon: <Building2 className="w-4 h-4" />,
    badge: "Teams",
    featured: false,
    benefits: [
      `${SUBSCRIPTION_PLANS.STUDIO.bricks.toLocaleString()} bricks per month`,
      "Everything in Pro",
      "Batch rendering",
      "API access",
      "Dedicated account manager",
      "Cancel anytime",
    ],
  },
];

interface PricingPageClientProps {
  subscription: SubscriptionData | null;
  variant: string | null;
}

export default function PricingPageClient({
  subscription,
}: PricingPageClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);

  const isPaidUser =
    subscription?.plan === "starter" ||
    subscription?.plan === "pro" ||
    subscription?.plan === "studio";

  const handleUpgrade = async (plan: PaidPlan) => {
    setIsLoading(true);
    setLoadingPlan(plan);

    try {
      const planConfig =
        plan === "studio"
          ? SUBSCRIPTION_PLANS.STUDIO
          : plan === "pro"
            ? SUBSCRIPTION_PLANS.PRO
            : SUBSCRIPTION_PLANS.STARTER;

      const initiateCheckoutEventId = generateEventId();
      const purchaseEventId = generateEventId();

      const trackingData = captureMetaTrackingData();

      await updateMetaTracking({
        ...trackingData,
        purchaseEventId,
      }).catch((err) =>
        console.error("[Meta Tracking] Failed to save tracking data:", err),
      );

      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_EVENT_ID,
        purchaseEventId,
      );
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_VALUE,
        planConfig.price.toString(),
      );

      trackMetaEvent(
        "InitiateCheckout",
        {
          content_type: "subscription",
          currency: "USD",
          value: planConfig.price,
        },
        initiateCheckoutEventId,
      );

      seline.checkout.started(planConfig.slug, "pricing_page");

      posthog.capture("checkout_initiated", {
        plan,
        source: "pricing_page",
        value: planConfig.price,
      });

      fetch("/api/checkout/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: planConfig.slug,
          eventId: initiateCheckoutEventId,
          purchaseEventId,
          checkoutValue: planConfig.price,
          currency: "USD",
          source: "pricing_page",
        }),
      }).catch((err) =>
        console.error("[Abandoned Checkout] Failed to track:", err),
      );

      const result = await authClient.checkout({
        slug: planConfig.slug,
        redirect: true,
      });
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else if (result?.error) {
        console.error("Checkout returned error:", result.error);
        toast.error("Unable to start checkout. Please try again.");
        setIsLoading(false);
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.customer.portal();
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error("Could not open subscription portal.");
      }
    } catch (err) {
      console.error("Portal error:", err);
      toast.error("Failed to open subscription portal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center px-4 py-16 sm:py-24">
      <div className="text-center mb-12 max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
          {isPaidUser ? "Manage your plan" : "Choose your plan"}
        </h1>
        <p className="text-sm text-neutral-500">
          {isPaidUser
            ? `You're on the ${subscription?.plan} plan with ${subscription?.creationsRemaining} bricks remaining.`
            : "Unlock more bricks and premium features to power your renders."}
        </p>
      </div>

      {isPaidUser && (
        <div className="mb-10">
          <Button
            onClick={handleManageSubscription}
            disabled={isLoading}
            variant="default"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Manage Subscription
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {PLAN_TIERS.map((tier) => {
          const isCurrentPlan = subscription?.plan === tier.key;

          return (
            <div
              key={tier.key}
              className={cn(
                "relative flex flex-col rounded-xl p-5 transition-all",
                tier.featured
                  ? "bg-neutral-800/50 ring-1 ring-neutral-700/80"
                  : "bg-neutral-900/50 ring-1 ring-neutral-800/60 hover:ring-neutral-700/60",
              )}
            >
              {tier.badge && (
                <div className="absolute -top-2.5 left-5">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-neutral-800 text-neutral-300 ring-1 ring-neutral-700/50">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div
                className={cn(
                  "flex items-center gap-2 mb-4",
                  tier.badge && "mt-1",
                )}
              >
                <span className="text-neutral-400">{tier.icon}</span>
                <span className="text-sm font-semibold text-white">
                  {tier.config.name}
                </span>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[28px] font-bold text-white tracking-tight">
                    ${tier.config.price}
                  </span>
                  <span className="text-xs text-neutral-500 ml-1">/mo</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5 tracking-wide">
                  {tier.config.bricks.toLocaleString()} bricks included
                </p>
              </div>

              <Button
                onClick={() => handleUpgrade(tier.key)}
                disabled={isLoading || isCurrentPlan}
                variant={tier.featured ? "white" : "default"}
                className="w-full mb-5"
              >
                {isLoading && loadingPlan === tier.key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : (
                  `Get ${tier.config.name}`
                )}
              </Button>

              <ul className="space-y-2.5 flex-1">
                {tier.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2 text-[13px] text-neutral-400"
                  >
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-neutral-600" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-neutral-600 tracking-wide mt-8">
        Secure payment &middot; Cancel anytime
      </p>
    </div>
  );
}
