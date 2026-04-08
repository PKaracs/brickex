"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Check, ArrowRight, Star, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { captureMetaTrackingData, generateEventId } from "@/lib/meta-tracking";
import { updateMetaTracking } from "@/lib/actions/update-meta-tracking";
import { seline } from "@/lib/seline";
import { toast } from "sonner";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";
import { SESSION_STORAGE_KEYS } from "@/lib/constants/session-storage-keys";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/subscription-plans";
import type { ABVariant } from "@/lib/ab-test-constants";
import { useSyncVariant } from "@/hooks/use-ab-variant";
import posthog from "posthog-js";
import { assetUrl } from "@/lib/assets";

const BEFORE_IMAGE = assetUrl("real-estate-sketch/modern-white-villa-sketch.png");
const AFTER_IMAGE = assetUrl("real-estate-front/modern-white-villa.png");

const testimonials = [
  {
    quote: "Cut our visualization turnaround from 2 weeks to 20 minutes. Clients love seeing options before we break ground.",
    name: "James O.",
    handle: "Real Estate Developer",
    image: assetUrl("real-estate-front/alpine-chalet-front.png"),
  },
  {
    quote: "We use BrickEx to pre-sell off-plan units. The renders are so realistic buyers can't tell they're AI.",
    name: "Sofia M.",
    handle: "Property Marketing",
    image: assetUrl("real-estate-front/tropical-villa-pool.png"),
  },
  {
    quote: "Finally a tool that understands architectural context. The interior renders alone are worth the subscription.",
    name: "Daniel R.",
    handle: "Architect",
    image: assetUrl("real-estate-front/modern-white-villa.png"),
  },
];

const GALLERY_IMAGES = [
  assetUrl("real-estate-front/modern-white-villa.png"),
  assetUrl("real-estate-front/alpine-chalet-front.png"),
  assetUrl("real-estate-front/tropical-villa-pool.png"),
  assetUrl("real-estate-sketch/modern-white-villa-sketch.png"),
];

interface PricingPageClientProps {
  subscription: SubscriptionData | null;
  variant: ABVariant | null;
}

export default function PricingPageClient({
  subscription,
  variant,
}: PricingPageClientProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">(
    "starter",
  );
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const starterPlan = SUBSCRIPTION_PLANS.STARTER;
  const proPlan = SUBSCRIPTION_PLANS.PRO;

  useSyncVariant(variant);

  useEffect(() => {
    if (searchParams.get("reason") === "credits") {
      toast("You've used all your free bricks. Upgrade to keep creating!", {
        icon: "⚡",
        duration: 5000,
      });
    }
  }, [searchParams]);

  useEffect(() => {
    trackMetaEvent("ViewContent", {
      content_name: "pricing_page",
      content_type: "subscription",
      currency: "USD",
      value: starterPlan.price,
    });

    posthog.capture("pricing_page_viewed", {
      ab_variant: variant,
      source: variant === "B" ? "forced_redirect" : "direct",
    });
  }, [variant, starterPlan.price]);

  const handleUpgrade = async (plan: "starter" | "pro") => {
    setIsLoading(true);

    try {
      const selectedPlanConfig = plan === "pro" ? proPlan : starterPlan;
      const initiateCheckoutEventId = generateEventId();
      const purchaseEventId = generateEventId();

      const trackingData = captureMetaTrackingData();

      // CRITICAL: Must await this! Webhook needs fbp/fbc/eventId for attribution
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
        selectedPlanConfig.price.toString(),
      );

      trackMetaEvent(
        "InitiateCheckout",
        {
          content_type: "subscription",
          currency: "USD",
          value: selectedPlanConfig.price,
        },
        initiateCheckoutEventId,
      );

      seline.checkout.started(selectedPlanConfig.slug, "pricing_page", variant);

      posthog.capture("checkout_initiated", {
        ab_variant: variant,
        plan: plan,
        source: "pricing_page",
        value: selectedPlanConfig.price,
      });

      fetch("/api/checkout/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedPlanConfig.slug,
          eventId: initiateCheckoutEventId,
          purchaseEventId,
          checkoutValue: selectedPlanConfig.price,
          currency: "USD",
          source: "pricing_page",
        }),
      }).catch((err) =>
        console.error("[Abandoned Checkout] Failed to track:", err),
      );

      const result = await authClient.checkout({
        slug: selectedPlanConfig.slug,
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

  return (
    <div className="min-h-full bg-black overflow-y-auto">
      {/* Main Content */}
      <main className="px-4 py-12 sm:py-16">
        {/* 1. HEADLINE */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight">
            People judge you in seconds.
            <br />
            <span className="text-neutral-400">
              Your photos do the talking.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-500 mb-2">
            Same you. Higher status photos. No photoshoot.
          </p>
          <p className="text-sm text-neutral-600">
            Dating. Instagram. Personal brand. All upgraded.{" "}
          </p>
        </div>

        {/* 2. PRICING */}
        {/* Mobile: Plan Toggle */}
        <div className="md:hidden flex gap-2 p-1 bg-neutral-800 rounded-lg max-w-xs mx-auto mb-6">
          <button
            onClick={() => setSelectedPlan("starter")}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
              selectedPlan === "starter"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Starter — $29
          </button>
          <button
            onClick={() => setSelectedPlan("pro")}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all relative ${
              selectedPlan === "pro"
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Pro — $49
            <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[9px] px-1 py-0.5 rounded-full font-bold">
              BEST
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Starter Card */}
          <div
            className={`relative ${selectedPlan !== "starter" ? "hidden md:block" : ""}`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-white text-black text-xs font-medium">
                Great for Getting Started
              </div>
            </div>

            <div
              className={`relative h-full bg-neutral-900 rounded-xl border transition-all ${
                selectedPlan === "starter"
                  ? "border-white/20"
                  : "border-neutral-800/80"
              } shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden`}
            >
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />

              <div className="p-6 pt-8 flex flex-col gap-4 h-full">
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-400 mb-3">
                    Starter
                  </p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                      ${starterPlan.price}
                    </span>
                    <span className="text-zinc-500 text-sm">/month</span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-2">
                    {starterPlan.bricks.toLocaleString()} bricks/month · Cancel
                    anytime
                  </p>
                </div>

                <button
                  onClick={() => handleUpgrade("starter")}
                  disabled={isLoading}
                  className="flex w-full py-3 min-h-[48px] rounded-lg bg-white text-black font-semibold text-center text-sm transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] active:bg-zinc-300 shadow-lg shadow-white/10 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && selectedPlan === "starter" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Get Started"
                  )}
                </button>

                <div className="h-px bg-zinc-800" />

                <ul className="space-y-2 flex-1">
                  {[
                    `${starterPlan.bricks.toLocaleString()} bricks per month`,
                    "Exterior + Interior modes",
                    "All architecture styles",
                    "4K exports, no watermarks",
                  ].map((benefit) => (
                    <li
                      key={benefit}
                      className="text-s text-neutral-300 flex items-start gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pro Card */}
          <div
            className={`relative ${selectedPlan !== "pro" ? "hidden md:block" : ""}`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                Best Value
              </div>
            </div>

            <div
              className={`relative h-full bg-neutral-900 rounded-xl border transition-all ${
                selectedPlan === "pro"
                  ? "border-green-500/40 md:border-green-500/40"
                  : "border-neutral-800/80 md:border-green-500/40"
              } shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden`}
            >
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

              <div className="p-6 pt-8 flex flex-col gap-4 h-full">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-400 mb-3">Pro</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                      ${proPlan.price}
                    </span>
                    <span className="text-zinc-500 text-sm">/month</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="text-[10px] font-semibold text-green-400">
                      3x more bricks
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-2">
                    {proPlan.bricks.toLocaleString()} bricks/month · Cancel
                    anytime
                  </p>
                </div>

                <button
                  onClick={() => handleUpgrade("pro")}
                  disabled={isLoading}
                  className="flex w-full py-3 min-h-[48px] rounded-lg bg-green-500 text-white font-semibold text-center text-sm transition-all hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] active:bg-green-600 shadow-lg shadow-green-500/20 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && selectedPlan === "pro" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Upgrade to Pro"
                  )}
                </button>

                <div className="h-px bg-zinc-800" />

                <ul className="space-y-2 flex-1">
                  {[
                    `${proPlan.bricks.toLocaleString()} bricks/month (3x Starter!)`,
                    "Video generation",
                    "Region editing & refinement",
                    "Priority processing",
                    "All tools included",
                  ].map((benefit) => (
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
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="text-center mb-16">
          <p className="text-xs text-neutral-600">
            Secure payment · Cancel anytime
          </p>
        </div>

        {/* 3. BEFORE / AFTER */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              See the transformation
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            {/* Before */}
            <div className="w-full max-w-[220px] sm:max-w-[260px]">
              <div className="mb-2 text-center">
                <span className="text-sm text-neutral-500">Before</span>
              </div>
              <button
                onClick={() => setLightboxImage(BEFORE_IMAGE)}
                className="rounded-xl overflow-hidden border border-neutral-800 cursor-zoom-in w-full"
              >
                <img
                  src={BEFORE_IMAGE}
                  alt="Before - Regular selfie"
                  className="w-full aspect-[3/4] object-cover"
                />
              </button>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-neutral-600 rotate-90 md:rotate-0" />
            </div>

            {/* After */}
            <div className="w-full max-w-[220px] sm:max-w-[260px]">
              <div className="mb-2 text-center">
                <span className="text-sm text-white">After</span>
              </div>
              <button
                onClick={() => setLightboxImage(AFTER_IMAGE)}
                className="rounded-xl overflow-hidden border border-neutral-700 cursor-zoom-in w-full"
              >
                <img
                  src={AFTER_IMAGE}
                  alt="After - Luxury transformation"
                  className="w-full aspect-[3/4] object-cover"
                />
              </button>
            </div>
          </div>
          {/* Caption */}
          <p className="text-center text-sm text-neutral-500 mt-6">
            Same person. Different perception.
          </p>
        </div>

        {/* 4. TESTIMONIALS */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-white fill-white" />
              ))}
            </div>
            <p className="text-sm text-neutral-500">
              Loved by 10,000+ creators
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-neutral-900 rounded-xl border border-neutral-800 p-5"
              >
                <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-700">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {testimonial.handle}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. GALLERY */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              What you can create
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GALLERY_IMAGES.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightboxImage(src)}
                className="aspect-[3/4] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 cursor-zoom-in"
              >
                <img
                  src={src}
                  alt={`Richflex example ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* CTA break after gallery */}
          <div className="mt-10 text-center">
            <button
              onClick={() => handleUpgrade(selectedPlan)}
              disabled={isLoading}
              className="h-12 px-8 text-sm font-semibold bg-white text-black hover:bg-neutral-200 rounded-lg transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Unlock photos like these
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-xs text-neutral-500 mt-3">
              Starting at ${starterPlan.price}/month
            </p>
          </div>
        </div>

        {/* 6. BOTTOM CTA */}
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
            Ready to upgrade your photos?
          </h2>
          <p className="text-sm text-neutral-400 mb-6">
            Join 10,000+ creators who elevated their online presence.
          </p>
          <button
            onClick={() => handleUpgrade(selectedPlan)}
            disabled={isLoading}
            className="h-12 px-8 text-sm font-semibold bg-white text-black hover:bg-neutral-200 rounded-lg transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Get Started — $
                {selectedPlan === "starter" ? starterPlan.price : proPlan.price}
                /month
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Full size preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-neutral-800 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-600">
              © {new Date().getFullYear()} Richflex
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/legal/privacy"
                className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/legal/terms"
                className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
