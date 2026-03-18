"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { tiktokEvents } from "@/lib/tiktok-pixel";
import { captureMetaTrackingData, generateEventId } from "@/lib/meta-tracking";
import { updateMetaTracking } from "@/lib/actions/update-meta-tracking";
import { seline } from "@/lib/seline";
import { toast } from "sonner";
import { SESSION_STORAGE_KEYS } from "@/lib/constants/session-storage-keys";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/subscription-plans";

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resetDateMessage?: string; // e.g. "in 3 days"
  creationsUsed: number;
  projectId?: string;
}

/**
 * Modal shown to Starter users who hit their brick limit
 * Offers upgrade to Pro plan (12,000 bricks/month for $49)
 */
export function ProUpgradeModal({
  open,
  onOpenChange,
  resetDateMessage,
  creationsUsed,
  projectId,
}: ProUpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proPlan = SUBSCRIPTION_PLANS.PRO;

  // Track ViewContent when modal opens
  useEffect(() => {
    if (open) {
      trackMetaEvent("ViewContent", {
        content_name: "pro_upgrade_modal",
        content_type: "subscription",
        currency: "USD",
        value: proPlan.price,
      });
    }
  }, [open, proPlan.price]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Store project ID for return after checkout
      if (projectId) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEYS.CHECKOUT_RETURN_PROJECT,
          projectId,
        );
      }

      // Generate event IDs for deduplication
      const initiateCheckoutEventId = generateEventId();
      const purchaseEventId = generateEventId();

      // Capture and save Meta tracking data
      const trackingData = captureMetaTrackingData();

      // CRITICAL: Must await this! Webhook needs fbp/fbc/eventId for attribution
      await updateMetaTracking({
        ...trackingData,
        purchaseEventId,
      }).catch((err) =>
        console.error("[Meta Tracking] Failed to save tracking data:", err),
      );

      // Store purchaseEventId in sessionStorage
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_EVENT_ID,
        purchaseEventId,
      );
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_VALUE,
        proPlan.price.toString(),
      );

      // Track InitiateCheckout
      trackMetaEvent(
        "InitiateCheckout",
        {
          content_type: "subscription_upgrade",
          currency: "USD",
          value: proPlan.price,
        },
        initiateCheckoutEventId,
      );

      // Track checkout initiation (TikTok)
      tiktokEvents.initiateCheckout({
        content_type: "subscription_upgrade",
        currency: "USD",
        value: proPlan.price,
      });

      // Track in Seline
      seline.checkout.started(proPlan.slug, "pro_upgrade_modal");

      // Track for abandoned checkout
      fetch("/api/checkout/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: proPlan.slug,
          eventId: initiateCheckoutEventId,
          purchaseEventId,
          checkoutValue: proPlan.price,
          currency: "USD",
          source: "pro_upgrade_modal",
        }),
      }).catch((err) =>
        console.error("[Abandoned Checkout] Failed to track:", err),
      );

      // TODO: Update this when you add the product to Polar
      if (!proPlan.productId) {
        toast.error(
          "Pro plan not yet available. Please contact support or wait until your limit resets.",
        );
        setIsLoading(false);
        return;
      }

      const result = await authClient.checkout({
        slug: proPlan.slug,
        redirect: true,
      });
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

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md w-full md:w-[90vw] bg-neutral-900 border-neutral-800 p-4 md:p-6 max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg md:text-xl text-white text-center">
            You've Used All Your Bricks
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col items-center text-center space-y-4 pt-2 -mx-4 px-4">
          {/* Status message */}
          <div className="w-full space-y-1">
            <div className="flex items-center justify-center gap-2 text-neutral-300">
              <Zap className="w-4 h-4 text-yellow-500" />
              <p className="text-sm">
                You've used {creationsUsed} bricks this period!
              </p>
            </div>
            <p className="text-xs text-neutral-500">
              Resets {resetDateMessage || "soon"}
            </p>
          </div>

          {/* Upgrade offer */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h3 className="text-base font-semibold text-white">
                Upgrade to Pro
              </h3>
            </div>

            <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 space-y-2.5">
              {/* Pricing */}
              <div className="space-y-0.5">
                <p className="text-xl text-white font-bold">
                  ${proPlan.price}/month
                </p>
                <p className="text-xs text-neutral-400">
                  Current plan cancelled automatically
                </p>
              </div>

              {/* Benefits */}
              <ul className="space-y-1.5 text-left">
                {[
                  `${proPlan.bricks.toLocaleString()} bricks/month (3x more!)`,
                  "Video generation",
                  "Region editing & refinement",
                  "Priority processing",
                  "Cancel anytime",
                ].map((benefit) => (
                  <li
                    key={benefit}
                    className="text-xs text-neutral-300 flex items-start gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
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
            data-fast-goal="upgrade_to_monthly"
            data-fast-goal-source="pro_upgrade_modal"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Upgrade to Pro
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full h-9 text-xs text-neutral-500 hover:text-neutral-400"
          >
            I'll wait (resets {resetDateMessage || "soon"})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
