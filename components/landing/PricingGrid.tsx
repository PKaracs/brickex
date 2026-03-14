"use client";

import { cn } from "@/lib/utils";
import { PricingCard, type Plan } from "@/components/ui/pricing-card";
import { BlurFade } from "@/components/ui/blur-fade";

export default function PricingGrid() {
  const navigate = () => {
    window.location.href = "/waitlist";
  };

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      currency: "$",
      features: [
        "100 bricks to try BrickEx",
        "Exterior render mode",
        "2K resolution output",
        "SketchUp, AutoCAD & PDF support",
        "Basic architecture styles",
      ],
      buttonText: "Try Free",
      onClick: navigate,
    },
    {
      id: "starter",
      name: "Starter",
      price: "29",
      subText: "/month",
      currency: "$",
      features: [
        "4,000 bricks per month",
        "Exterior + Interior modes",
        "All architecture styles",
        "All lighting & weather variations",
        "4K exports, no watermarks",
        "30-second generation",
      ],
      additionalFeatures: ["Everything in Free"],
      buttonText: "Get Started",
      onClick: navigate,
    },
    {
      id: "pro",
      name: "Pro",
      price: "49",
      subText: "/month",
      currency: "$",
      featured: true,
      features: [
        "12,000 bricks per month",
        "Video generation (walkthroughs, timelapses)",
        "Region editing & refinement",
        "Priority processing",
        "All tools included",
      ],
      additionalFeatures: ["Everything in Starter"],
      buttonText: "Start Creating",
      onClick: navigate,
    },
    {
      id: "studio",
      name: "Studio",
      price: "99",
      subText: "/month",
      currency: "$",
      features: [
        "30,000 bricks per month",
        "Team collaboration (up to 5 seats)",
        "Batch rendering (up to 20 at once)",
        "Custom brand presets",
        "API access for integrations",
        "White-label exports",
      ],
      additionalFeatures: ["Everything in Pro"],
      buttonText: "Contact Sales",
      onClick: navigate,
    },
  ];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade inView delay={0.1}>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Simple pricing for every project
              </span>
            </h2>
            <p className="text-zinc-500 mt-3 text-sm sm:text-base max-w-lg mx-auto">
              Start free with 100 bricks. Upgrade when your clients start asking
              "who's your 3D studio?"
            </p>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.2}>
          <div className={cn(
            "mx-auto grid grid-cols-1 gap-4",
            "max-w-7xl md:grid-cols-2 xl:grid-cols-4",
          )}>
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} onClick={plan.onClick} />
            ))}
          </div>
        </BlurFade>

        <BlurFade inView delay={0.3}>
          <p className="text-center text-xs text-zinc-600 mt-8">
            All plans include SSL encryption, GDPR compliance, and 99.9% uptime. Cancel anytime.
          </p>
        </BlurFade>
      </div>
    </section>
  );
}
