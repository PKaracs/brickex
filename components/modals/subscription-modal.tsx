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
import { tiktokEvents } from "@/lib/tiktok-pixel";
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
  badgeColor: string;
  accentColor: string;
  buttonClass: string;
  benefits: string[];
}[] = [
  {
    key: "starter",
    config: SUBSCRIPTION_PLANS.STARTER,
    icon: <Zap className="w-5 h-5" />,
    badge: null,
    badgeColor: "",
    accentColor: "text-white",
    buttonClass:
      "bg-white text-black hover:bg-neutral-200 active:bg-neutral-300",
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
    icon: <Crown className="w-5 h-5" />,
    badge: "Most Popular",
    badgeColor: "bg-green-500/15 text-green-400 border-green-500/25",
    accentColor: "text-green-400",
    buttonClass:
      "bg-green-500 text-white hover:bg-green-400 active:bg-green-600 shadow-lg shadow-green-500/20",
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
    icon: <Building2 className="w-5 h-5" />,
    badge: "For Teams",
    badgeColor: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    accentColor: "text-violet-400",
    buttonClass:
      "bg-violet-500 text-white hover:bg-violet-400 active:bg-violet-600 shadow-lg shadow-violet-500/20",
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

      tiktokEvents.initiateCheckout({
        content_type: "subscription",
        currency: "USD",
        value: planConfig.price,
      });

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
        <DialogContent className="max-w-md w-full md:w-[90vw] bg-neutral-900 border-neutral-800 flex flex-col p-4 md:p-6 overflow-hidden">
          <DialogTitle className="text-lg md:text-xl text-white flex items-center justify-between pr-10 md:pr-0">
            <span>Your Plan</span>
            <span className="text-xs md:text-sm font-normal text-neutral-400">
              {subscription?.creationsUsed ?? 0} /{" "}
              {subscription?.creationsLimit ?? 4000} bricks used
            </span>
          </DialogTitle>

          <div className="flex-1 overflow-y-auto py-4 md:py-6 space-y-5">
            <div className="space-y-3">
              <div className="relative h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-white"
                  style={{ width: `${Math.max(usagePercent, 2)}%` }}
                />
              </div>
              <p className="text-sm text-neutral-400">
                {subscription?.creationsRemaining === 0
                  ? "No bricks remaining this period"
                  : `${subscription?.creationsRemaining} brick${subscription?.creationsRemaining !== 1 ? "s" : ""} remaining`}
              </p>
            </div>

            {subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Calendar className="w-4 h-4 text-neutral-500" />
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
              <div className="p-3 rounded-lg bg-neutral-800 border border-neutral-700">
                <p className="text-sm text-neutral-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 pt-4 border-t border-neutral-800 flex flex-col gap-2">
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              variant="default"
              className="w-full h-12 md:h-10"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Manage Subscription
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full h-12 md:h-10 text-neutral-400"
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
        className="w-full max-w-4xl bg-neutral-900 border-neutral-800 p-0 max-h-[92vh] flex flex-col overflow-hidden"
        showXIcon={false}
      >
        <DialogTitle className="sr-only">Choose Your Plan</DialogTitle>

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Choose your plan
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Upgrade to unlock more bricks and premium features.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLAN_TIERS.map((tier) => {
              const isPopular = tier.key === "pro";

              return (
                <div
                  key={tier.key}
                  className={cn(
                    "relative flex flex-col rounded-xl border p-5 transition-all",
                    isPopular
                      ? "border-green-500/40 bg-green-500/[0.03] shadow-[0_0_24px_rgba(34,197,94,0.06)]"
                      : "border-neutral-800 bg-neutral-800/30 hover:border-neutral-700",
                  )}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className={cn(
                          "inline-block px-3 py-1 rounded-full text-[11px] font-semibold border",
                          tier.badgeColor,
                        )}
                      >
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
                    <div className={cn(tier.accentColor)}>{tier.icon}</div>
                    <span className="text-base font-semibold text-white">
                      {tier.config.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        ${tier.config.price}
                      </span>
                      <span className="text-sm text-neutral-500">/month</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {tier.config.bricks.toLocaleString()} bricks included
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleUpgrade(tier.key)}
                    disabled={isLoading}
                    className={cn(
                      "w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-5",
                      tier.buttonClass,
                    )}
                  >
                    {isLoading && loadingPlan === tier.key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      `Get ${tier.config.name}`
                    )}
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-neutral-700/50 mb-4" />

                  {/* Benefits */}
                  <ul className="space-y-2.5 flex-1">
                    {tier.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 text-sm text-neutral-300"
                      >
                        <Check
                          className={cn(
                            "w-4 h-4 flex-shrink-0 mt-0.5",
                            isPopular
                              ? "text-green-500"
                              : tier.key === "studio"
                                ? "text-violet-400"
                                : "text-neutral-500",
                          )}
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-neutral-800 border border-neutral-700">
              <p className="text-sm text-neutral-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
          <p className="text-xs text-neutral-600">
            Secure payment &middot; Cancel anytime
          </p>
          <button
            onClick={handleClose}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-1 px-3 rounded-md hover:bg-neutral-800"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
