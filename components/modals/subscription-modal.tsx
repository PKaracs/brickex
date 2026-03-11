"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Calendar, AlertCircle } from "lucide-react";
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

export function SubscriptionModal({
  open,
  onOpenChange,
  subscription,
  projectId,
}: SubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("weekly");

  const isPro = subscription?.plan === "pro" || subscription?.plan === "unlimited-flex-pro";
  
  const weeklyPlan = SUBSCRIPTION_PLANS.PRO_WEEKLY;
  const monthlyPlan = SUBSCRIPTION_PLANS.PRO_MONTHLY;
  const usagePercent = subscription
    ? Math.min(
        100,
        (subscription.creationsUsed / subscription.creationsLimit) * 100
      )
    : 0;

  // Track ViewContent when modal opens (soft intent signal for Meta)
  useEffect(() => {
    if (open && !isPro) {
      trackMetaEvent("ViewContent", {
        content_name: "subscription_modal",
        content_type: "subscription",
        currency: "USD",
        value: 8.90,
      });

      // Track for PostHog A/B test analytics (Variant A users see this modal)
      posthog.capture("subscription_modal_viewed", {
        ab_variant: "A", // Only Variant A users see the modal
        source: "free_limit_reached",
      });
    }
  }, [open, isPro]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = selectedPlan === "monthly" ? monthlyPlan : weeklyPlan;
      
      // Store project ID for return after checkout
      if (projectId) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEYS.CHECKOUT_RETURN_PROJECT,
          projectId
        );
      }

      // Generate event IDs for deduplication
      // InitiateCheckout: same ID used for browser pixel + server CAPI
      // Purchase: stored now, used later in webhook + success page pixel
      const initiateCheckoutEventId = generateEventId();
      const purchaseEventId = generateEventId();

      // Capture and save Meta tracking data for CAPI enhanced matching
      // Also store purchaseEventId for deduplication in webhook
      const trackingData = captureMetaTrackingData();
      
      // CRITICAL: Must await this! Webhook needs fbp/fbc/eventId for attribution
      await updateMetaTracking({
        ...trackingData,
        purchaseEventId, // Will be used by webhook for Purchase event dedup
      }).catch((err) =>
        console.error("[Meta Tracking] Failed to save tracking data:", err)
      );

      // Store purchaseEventId in sessionStorage for client-side Purchase pixel
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_EVENT_ID,
        purchaseEventId
      );

      // Track InitiateCheckout via browser pixel (with correct price based on selection)
      trackMetaEvent(
        "InitiateCheckout",
        { content_type: "subscription", currency: "USD", value: plan.price },
        initiateCheckoutEventId
      );

      // Track checkout initiation (TikTok client-side)
      tiktokEvents.initiateCheckout({
        content_type: "subscription",
        currency: "USD",
        value: plan.price,
      });

      // Track checkout started in Seline
      seline.checkout.started(plan.slug, "subscription_modal");

      // Track for abandoned checkout email recovery + Meta CAPI InitiateCheckout (with same eventId)
      fetch("/api/checkout/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: plan.slug,
          eventId: initiateCheckoutEventId,
          checkoutValue: plan.price, // Include price for Meta CAPI
        }),
      }).catch((err) =>
        console.error("[Abandoned Checkout] Failed to track:", err)
      );

      const result = await authClient.checkout({ slug: plan.slug, redirect: true });
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else if (result?.error) {
        console.error("Checkout returned error:", result.error);
        toast.error("Unable to start checkout. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
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

  // Pro user view - manage subscription (UNCHANGED from original)
  if (isPro) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-md w-full md:w-[90vw] bg-neutral-900 border-neutral-800 flex flex-col p-4 md:p-6 overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg md:text-xl text-white flex items-center justify-between pr-10 md:pr-0">
              <span>Pro Plan</span>
              <span className="text-xs md:text-sm font-normal text-neutral-400">
                {subscription?.creationsUsed ?? 0} /{" "}
                {subscription?.creationsLimit ?? 50} used
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 md:py-6 space-y-5">
            {/* Usage Section */}
            <div className="space-y-3">
              <div className="relative h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 bg-white"
                  style={{ width: `${Math.max(usagePercent, 2)}%` }}
                />
              </div>
              <p className="text-sm text-neutral-400">
                {subscription?.creationsRemaining === 0
                  ? "No creations remaining this period"
                  : `${subscription?.creationsRemaining} creation${subscription?.creationsRemaining !== 1 ? "s" : ""} remaining`}
              </p>
            </div>

            {/* Subscription Info */}
            {subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span>
                  {subscription.subscriptionStatus === "canceled"
                    ? "Access until"
                    : subscription.creationsRemaining === 0
                      ? "Limit resets"
                      : "Renews"}{" "}
                  {subscription.resetDateMessage || formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
            )}

            {/* Error */}
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

  // Free user view - outcome-driven upgrade prompt
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md w-full md:w-[90vw] bg-neutral-900 border-neutral-800 p-4 md:p-6 max-h-[90vh] flex flex-col">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">Upgrade to Pro</DialogTitle>
        <div className="flex-1 overflow-y-auto flex flex-col items-center text-center space-y-4 -mx-4 px-4">
          {/* Title */}
          <h2 className="text-lg md:text-xl font-medium text-white leading-tight pt-2">
            Continue generating photos of you
          </h2>

          {/* Outcome reminder - THE MOST IMPORTANT LINE */}
          <p className="text-xs md:text-sm text-neutral-400">
            Use them for dating, Instagram, or your personal brand.
          </p>

          {/* Plan Toggle */}
          <div className="w-full space-y-2">
            <div className="flex gap-2 p-1 bg-neutral-800 rounded-lg">
              <button
                onClick={() => setSelectedPlan("weekly")}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  selectedPlan === "weekly"
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all relative ${
                  selectedPlan === "monthly"
                    ? "bg-white text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Monthly
                <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[9px] px-1 py-0.5 rounded-full font-bold">
                  SAVE
                </span>
              </button>
            </div>
          </div>

          {/* Price - dynamically based on selection */}
          <div className="space-y-0.5">
            {selectedPlan === "weekly" ? (
              <>
                <p className="text-base md:text-lg text-white font-semibold">
                  ${weeklyPlan.price}/week{" "}
                  <span className="text-xs md:text-sm font-normal text-neutral-400">
                    · Cancel anytime
                  </span>
                </p>
                <p className="text-xs text-neutral-500">
                  {weeklyPlan.creationLimit} creations/week
                </p>
              </>
            ) : (
              <>
                <p className="text-base md:text-lg text-white font-semibold">
                  ${monthlyPlan.price}/month{" "}
                  <span className="text-xs md:text-sm font-normal text-neutral-400">
                    · Cancel anytime
                  </span>
                </p>
                <p className="text-xs text-neutral-500">
                  {monthlyPlan.creationLimit} creations/month
                </p>
              </>
            )}
          </div>

          {/* Preview complete section with progress bar */}
          <div className="w-full space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium text-left">
              Preview limit reached
            </p>
            {/* Progress bar - full */}
            <div className="relative h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-500"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Benefits section - dynamic based on selection */}
          <div className="w-full space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium text-left">
              {selectedPlan === "monthly" ? "Monthly Includes" : "Includes"}
            </p>
            <ul className="space-y-2 text-left">
              {(selectedPlan === "monthly"
                ? [
                    `${monthlyPlan.creationLimit} creations/month (5x!)`,
                    "Request items/templates free",
                    "Direct access to founder",
                    "Stronger first impression",
                  ]
                : [
                    `${weeklyPlan.creationLimit} creations per week`,
                    "Stronger first impression",
                    "Travel anywhere in photos",
                    "Create realistic couples",
                  ]
              ).map((benefit) => (
                <li
                  key={benefit}
                  className="text-xs text-neutral-300 flex items-start gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="w-full p-2 rounded-lg bg-neutral-800 border border-neutral-700">
              <p className="text-xs text-neutral-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}
        </div>

        {/* CTA - Fixed at bottom */}
        <div className="flex-shrink-0 pt-3 border-t border-neutral-800 space-y-2">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full h-11 text-sm font-semibold"
            data-fast-goal="checkout_initiated"
            data-fast-goal-plan={selectedPlan}
            data-fast-goal-source="subscription_modal"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Upgrade Now
          </Button>
          <button
            onClick={handleClose}
            className="w-full text-xs text-neutral-600 hover:text-neutral-500 transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
