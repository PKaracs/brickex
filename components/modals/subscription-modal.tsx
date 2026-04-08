"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Check,
  Calendar,
  AlertCircle,
  Crown,
  Zap,
  Building2,
  X,
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

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionData | null;
  projectId?: string;
}

type PaidPlan = "starter" | "pro" | "studio";

const PLAN_TIERS: {
  key: PaidPlan;
  config: (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];
  icon: React.ReactNode;
  badge: string | null;
  featured: boolean;
  buttonVariant: "default" | "white";
  benefits: string[];
}[] = [
  {
    key: "starter",
    config: SUBSCRIPTION_PLANS.STARTER,
    icon: <Zap className="w-4 h-4" />,
    badge: null,
    featured: false,
    buttonVariant: "default",
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
    buttonVariant: "white",
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
    buttonVariant: "default",
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

export function SubscriptionModal({
  open,
  onOpenChange,
  subscription,
  projectId,
}: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPaidUser =
    subscription?.plan === "starter" ||
    subscription?.plan === "pro" ||
    subscription?.plan === "studio";

  const usagePercent = subscription
    ? Math.min(
        100,
        (subscription.creationsUsed / subscription.creationsLimit) * 100,
      )
    : 0;

  useEffect(() => {
    if (open && !isPaidUser) {
      trackMetaEvent("ViewContent", {
        content_name: "subscription_modal",
        content_type: "subscription",
        currency: "USD",
        value: 29,
      });

      posthog.capture("subscription_modal_viewed", {
        source: "bricks_click",
      });
    }
  }, [open, isPaidUser]);

  const handleUpgrade = async (plan: PaidPlan) => {
    setIsLoading(true);
    setLoadingPlan(plan);
    setError(null);

    try {
      const planConfig =
        plan === "studio"
          ? SUBSCRIPTION_PLANS.STUDIO
          : plan === "pro"
            ? SUBSCRIPTION_PLANS.PRO
            : SUBSCRIPTION_PLANS.STARTER;

      if (projectId) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEYS.CHECKOUT_RETURN_PROJECT,
          projectId,
        );
      }

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

      seline.checkout.started(planConfig.slug, "subscription_modal");

      posthog.capture("checkout_initiated", {
        plan,
        source: "pricing_modal",
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
          source: "subscription_modal",
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
    setError(null);
    try {
      const result = await authClient.customer.portal();
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else {
        setError("Could not get portal URL. Please try again.");
      }
    } catch (err) {
      console.error("Portal error:", err);
      setError("Failed to open subscription portal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  if (isPaidUser) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-md w-full md:w-[90vw] bg-neutral-950 border-neutral-800/60 flex flex-col p-5 md:p-6 overflow-hidden rounded-2xl">
          <DialogTitle className="text-lg text-white flex items-center justify-between pr-10 md:pr-0">
            <span className="font-semibold tracking-tight">Your Plan</span>
            <span className="text-[11px] font-normal text-neutral-500 tracking-wide">
              {subscription?.creationsUsed ?? 0} /{" "}
              {subscription?.creationsLimit ?? 4000} bricks used
            </span>
          </DialogTitle>

          <div className="flex-1 overflow-y-auto py-4 md:py-5 space-y-4">
            <div className="space-y-3">
              <div className="relative h-1 bg-neutral-800/80 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-neutral-300"
                  style={{ width: `${Math.max(usagePercent, 2)}%` }}
                />
              </div>
              <p className="text-[13px] text-neutral-500">
                {subscription?.creationsRemaining === 0
                  ? "No bricks remaining this period"
                  : `${subscription?.creationsRemaining} brick${subscription?.creationsRemaining !== 1 ? "s" : ""} remaining`}
              </p>
            </div>

            {subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-2 text-[13px] text-neutral-500">
                <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                <span>
                  {subscription.subscriptionStatus === "canceled"
                    ? "Access until"
                    : subscription.creationsRemaining === 0
                      ? "Limit resets"
                      : "Renews"}{" "}
                  {subscription.resetDateMessage ||
                    formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-neutral-900 ring-1 ring-neutral-800">
                <p className="text-sm text-neutral-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-neutral-500" />
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 pt-4 border-t border-neutral-800/40 flex flex-col gap-2">
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              variant="default"
              className="w-full"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Manage Subscription
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-neutral-500 hover:text-neutral-300"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className="w-full max-w-[880px] bg-neutral-950 border-neutral-800/60 p-0 max-h-[92vh] flex flex-col overflow-hidden rounded-2xl"
        showXIcon={false}
      >
        <DialogTitle className="sr-only">Choose Your Plan</DialogTitle>

        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  Upgrade your plan
                </h2>
              </div>
              <p className="text-sm text-neutral-500">
                Unlock more bricks and premium features.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 -m-2 rounded-xl text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="flex-1 overflow-y-auto px-8 pt-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PLAN_TIERS.map((tier) => (
              <div
                key={tier.key}
                className={cn(
                  "relative flex flex-col rounded-xl p-5 transition-all",
                  tier.featured
                    ? "bg-neutral-800/50 ring-1 ring-neutral-700/80"
                    : "bg-neutral-900/50 ring-1 ring-neutral-800/60 hover:ring-neutral-700/60",
                )}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-2.5 left-5">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-neutral-800 text-neutral-300 ring-1 ring-neutral-700/50">
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Plan header */}
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

                {/* Price */}
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

                {/* CTA */}
                <Button
                  onClick={() => handleUpgrade(tier.key)}
                  disabled={isLoading}
                  variant={tier.buttonVariant}
                  className="w-full mb-5"
                >
                  {isLoading && loadingPlan === tier.key ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Get ${tier.config.name}`
                  )}
                </Button>

                {/* Benefits */}
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
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-neutral-900 ring-1 ring-neutral-800">
              <p className="text-sm text-neutral-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-neutral-500" />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-8 py-4 border-t border-neutral-800/40 flex items-center justify-between">
          <p className="text-[11px] text-neutral-600 tracking-wide">
            Secure payment &middot; Cancel anytime
          </p>
          <button
            onClick={handleClose}
            className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors py-1.5 px-3 rounded-lg hover:bg-neutral-800/50"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
