"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Check,
  ArrowRight,
  Star,
  X,
} from "lucide-react";
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
import type { ABVariant } from "@/lib/ab-test-constants";
import { useSyncVariant } from "@/hooks/use-ab-variant";
import posthog from "posthog-js";

// Before/After images (from TransformationHero)
const BEFORE_IMAGE =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/pricing-before.jpg";
const AFTER_IMAGE =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/pricing-after.png";


// Gallery images from "how to look rich without money" blog
const GALLERY_IMAGES = [
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/blog2-dating-image.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/blog2-ai-luxury-travel-photo-without-travel.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/landing-after.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/blog2-gstaad-traveling.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/blog2-mansion.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/blog2-fake-rich.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/blog2-luxury-dating-profile-photo-ai.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/blog2-fake-rich-ai-private-jet-photo.png",
];

// Testimonials with profile images (2 fun/status + 1 grounded)
const testimonials = [
  {
    quote:
      "Used this for my Hinge profile. Now I get asked which yacht club I'm at.",
    name: "Jake M.",
    handle: "@flexin_jake",
    image: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(17).png",
  },
  {
    quote:
      "I finally have photos I'm confident posting. Saved me hours and a photoshoot.",
    name: "Sarah K.",
    handle: "@sarahkflex",
    image: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(12).png",
  },
  {
    quote:
      "Posted a Richflex pic. Got 3 DMs asking about my lifestyle. Best investment I made.",
    name: "Marcus R.",
    handle: "@marcus_rich",
    image: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(13).png",
  },
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
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly">("weekly");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const weeklyPlan = SUBSCRIPTION_PLANS.PRO_WEEKLY;
  const monthlyPlan = SUBSCRIPTION_PLANS.PRO_MONTHLY;

  useSyncVariant(variant);

  useEffect(() => {
    if (searchParams.get("reason") === "credits") {
      toast("You've used your free generation. Upgrade to keep creating!", {
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
      value: weeklyPlan.price,
    });

    posthog.capture("pricing_page_viewed", {
      ab_variant: variant,
      source: variant === "B" ? "forced_redirect" : "direct",
    });
  }, [variant, weeklyPlan.price]);

  const handleUpgrade = async (plan: "weekly" | "monthly") => {
    setIsLoading(true);

    try {
      const selectedPlanConfig = plan === "monthly" ? monthlyPlan : weeklyPlan;
      const initiateCheckoutEventId = generateEventId();
      const purchaseEventId = generateEventId();

      const trackingData = captureMetaTrackingData();
      
      // CRITICAL: Must await this! Webhook needs fbp/fbc/eventId for attribution
      await updateMetaTracking({
        ...trackingData,
        purchaseEventId,
      }).catch((err) =>
        console.error("[Meta Tracking] Failed to save tracking data:", err)
      );

      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_EVENT_ID,
        purchaseEventId
      );

      trackMetaEvent(
        "InitiateCheckout",
        {
          content_type: "subscription",
          currency: "USD",
          value: selectedPlanConfig.price,
        },
        initiateCheckoutEventId
      );

      tiktokEvents.initiateCheckout({
        content_type: "subscription",
        currency: "USD",
        value: selectedPlanConfig.price,
      });

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
          checkoutValue: selectedPlanConfig.price,
        }),
      }).catch((err) =>
        console.error("[Abandoned Checkout] Failed to track:", err)
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
            <span className="text-neutral-400">Your photos do the talking.</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-500 mb-2">
            Same you. Higher status photos. No photoshoot.
          </p>
          <p className="text-sm text-neutral-600">
          Dating. Instagram. Personal brand. All upgraded.         </p>
        </div>

        {/* 2. PRICING */}
        {/* Mobile: Plan Toggle */}
        <div className="md:hidden flex gap-2 p-1 bg-neutral-800 rounded-lg max-w-xs mx-auto mb-6">
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

        {/* Pricing Cards */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Weekly Card */}
          <div className={`relative ${selectedPlan !== "weekly" ? "hidden md:block" : ""}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-white text-black text-xs font-medium">
                Limited Time Offer
              </div>
            </div>

            <div className={`relative h-full bg-neutral-900 rounded-xl border transition-all ${
              selectedPlan === "weekly" ? "border-white/20" : "border-neutral-800/80"
            } shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden`}>
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
              
              <div className="p-6 pt-8 flex flex-col gap-4 h-full">
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-400 mb-3">Weekly</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-lg text-zinc-500 line-through decoration-red-500/70 decoration-2">
                      $12.90
                    </span>
                    <span className="text-4xl font-bold bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                      ${weeklyPlan.price}
                    </span>
                    <span className="text-zinc-500 text-sm">/week</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] font-semibold text-emerald-400">
                      Save 30%
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-2">
                    {weeklyPlan.creationLimit} creations/week · Cancel anytime
                  </p>
                  <p className="text-zinc-600 text-xs mt-1">
                    Less than one coffee
                  </p>
                </div>

                <button
                  onClick={() => handleUpgrade("weekly")}
                  disabled={isLoading}
                  className="flex w-full py-3 min-h-[48px] rounded-lg bg-white text-black font-semibold text-center text-sm transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] active:bg-zinc-300 shadow-lg shadow-white/10 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && selectedPlan === "weekly" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Upgrade my photos"
                  )}
                </button>

                <div className="h-px bg-zinc-800" />

                <ul className="space-y-2 flex-1">
                  {[
                    "Stronger first impression",
                    "Travel anywhere in the world",
                    "Create realistic couple images",
                    "All luxury templates & objects",
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

          {/* Monthly Card */}
          <div className={`relative ${selectedPlan !== "monthly" ? "hidden md:block" : ""}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                Best Value
              </div>
            </div>

            <div className={`relative h-full bg-neutral-900 rounded-xl border transition-all ${
              selectedPlan === "monthly" ? "border-green-500/40 md:border-green-500/40" : "border-neutral-800/80 md:border-green-500/40"
            } shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden`}>
              <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
              
              <div className="p-6 pt-8 flex flex-col gap-4 h-full">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-400 mb-3">Monthly</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-b from-white to-zinc-300 bg-clip-text text-transparent">
                      ${monthlyPlan.price}
                    </span>
                    <span className="text-zinc-500 text-sm">/month</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="text-[10px] font-semibold text-green-400">
                      5x more creations
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-2">
                    {monthlyPlan.creationLimit} creations/month · Cancel anytime
                  </p>
                  <p className="text-zinc-600 text-xs mt-1">
                    One good photo is worth more than this
                  </p>
                </div>

                <button
                  onClick={() => handleUpgrade("monthly")}
                  disabled={isLoading}
                  className="flex w-full py-3 min-h-[48px] rounded-lg bg-green-500 text-white font-semibold text-center text-sm transition-all hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] active:bg-green-600 shadow-lg shadow-green-500/20 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && selectedPlan === "monthly" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Upgrade my photos"
                  )}
                </button>

                <div className="h-px bg-zinc-800" />

                <ul className="space-y-2 flex-1">
                  {[
                    `${monthlyPlan.creationLimit} creations/month (5x!)`,
                    "Stronger first impression",
                    "Travel anywhere in the world",
                    "Create realistic couple images",
                    "All luxury templates & objects",
                    "Request items/templates free",
                    "Direct access to founder",
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
            Secure payment via Stripe · Cancel anytime
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
                    <div className="font-medium text-white text-sm">{testimonial.name}</div>
                    <div className="text-xs text-neutral-500">{testimonial.handle}</div>
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
              Starting at ${weeklyPlan.price}/week
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
                Get Started — ${selectedPlan === "weekly" ? weeklyPlan.price : monthlyPlan.price}/{selectedPlan === "weekly" ? "week" : "month"}
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
              <Link href="/legal/privacy" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                Privacy
              </Link>
              <Link href="/legal/terms" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
