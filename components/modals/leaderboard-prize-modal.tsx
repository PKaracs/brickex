"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { tiktokEvents } from "@/lib/tiktok-pixel";
import { captureMetaTrackingData, generateEventId } from "@/lib/meta-tracking";
import { updateMetaTracking } from "@/lib/actions/update-meta-tracking";
import { seline } from "@/lib/seline";
import { toast } from "sonner";
import { SESSION_STORAGE_KEYS } from "@/lib/constants/session-storage-keys";

interface LeaderboardPrizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaderboardPrizeModal({
  open,
  onOpenChange,
}: LeaderboardPrizeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Track ViewContent when modal opens (soft intent signal for Meta)
  useEffect(() => {
    if (open) {
      trackMetaEvent("ViewContent", {
        content_name: "leaderboard_prize_modal",
        content_type: "subscription",
        currency: "USD",
        value: 8.9,
      });
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Generate event IDs for deduplication
      const initiateCheckoutEventId = generateEventId();
      const purchaseEventId = generateEventId();

      // Capture Meta tracking data for CAPI enhanced matching
      const trackingData = captureMetaTrackingData();

      // CRITICAL: Must await this! Webhook needs fbp/fbc/eventId for attribution
      await updateMetaTracking({
        ...trackingData,
        purchaseEventId,
      }).catch((err) => console.error("[Meta Tracking] Failed to save:", err));

      // Store purchaseEventId for client-side Purchase pixel
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_EVENT_ID,
        purchaseEventId,
      );
      sessionStorage.setItem(SESSION_STORAGE_KEYS.META_PURCHASE_VALUE, "8.9");

      // Track InitiateCheckout via browser pixel (with event_id for dedup)
      trackMetaEvent(
        "InitiateCheckout",
        { content_type: "subscription", currency: "USD", value: 8.9 },
        initiateCheckoutEventId,
      );

      // Track checkout initiation (TikTok client-side)
      tiktokEvents.initiateCheckout({
        content_type: "subscription",
        currency: "USD",
      });

      // Track checkout started in Seline
      seline.checkout.started("pro", "leaderboard_prize_modal");

      // Track for abandoned checkout email recovery + Meta CAPI InitiateCheckout (with same eventId)
      fetch("/api/checkout/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "pro",
          eventId: initiateCheckoutEventId,
          purchaseEventId,
          checkoutValue: 8.9,
          currency: "USD",
          source: "leaderboard_prize_modal",
        }),
      }).catch((err) =>
        console.error("[Abandoned Checkout] Failed to track:", err),
      );

      const result = await authClient.checkout({ slug: "pro", redirect: true });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full md:w-[90vw] bg-neutral-900 border-neutral-800 p-5 md:p-6 max-h-[85vh] overflow-y-auto">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">Community Leaderboard</DialogTitle>

        <div className="flex flex-col items-center text-center space-y-5">
          {/* Title */}
          <div className="space-y-2 pt-2">
            <h2 className="text-2xl font-medium text-neutral-200">
              Community Leaderboard
            </h2>
            <p className="text-sm text-neutral-500">
              Top creators ranked by Flex Score
            </p>
          </div>

          {/* Value explanation */}
          <div className="w-full space-y-3 text-left bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
              Perks for top creators
            </p>
            <ul className="space-y-2">
              {[
                "Win cash prizes every week",
                "Request new items & scenes",
                "Shape the product roadmap",
                "Direct access to the founder",
              ].map((benefit) => (
                <li
                  key={benefit}
                  className="text-sm text-neutral-300 flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <p className="text-sm text-neutral-400">
            $8.90/week · Cancel anytime
          </p>

          {/* CTA */}
          <div className="w-full space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold"
              data-fast-goal="checkout_initiated"
              data-fast-goal-plan="pro"
              data-fast-goal-source="leaderboard_prize"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Unlock Leaderboard
            </Button>

            <button
              onClick={handleClose}
              className="text-sm text-neutral-600 hover:text-neutral-500 transition-colors opacity-50 hover:opacity-70"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
