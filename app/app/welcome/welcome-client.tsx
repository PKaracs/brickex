"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  X,
  Check,
  ChevronDown,
  Star,
  Loader2,
  Gem,
  Crown,
  Flame,
  Sparkles,
  Heart,
  Camera,
  Briefcase,
  Zap,
  PartyPopper,
  ScanFace,
  Wand2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  saveOnboardingProfile,
  skipOnboarding,
} from "@/lib/actions/onboarding-profile";
import type {
  OnboardingGoal,
  OnboardingContentType,
  OnboardingCreatorType,
} from "@/lib/actions/onboarding-profile";
import { authClient } from "@/lib/auth-client";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/subscription-plans";
import { captureMetaTrackingData, generateEventId } from "@/lib/meta-tracking";
import { updateMetaTracking } from "@/lib/actions/update-meta-tracking";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { SESSION_STORAGE_KEYS } from "@/lib/constants/session-storage-keys";
import { MagicCard } from "@/components/ui/magic-card";
import { SparklesCore } from "@/components/ui/sparkles";
import { StripedPattern } from "@/components/magicui/striped-pattern";
import { openCrisp } from "@/lib/crisp";
import { seline } from "@/lib/seline";
import posthog from "posthog-js";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const TOTAL_STEPS = 4;

interface GoalOption {
  id: OnboardingGoal;
  label: string;
  icon: React.ReactNode;
  gradientBg: string;
  gradientFrom: string;
  gradientTo: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: "flex_harder",
    label: "Flex harder",
    icon: <Gem className="w-6 h-6" />,
    gradientBg: "from-amber-500/25 to-yellow-600/10 border-amber-500/20",
    gradientFrom: "#f59e0b50",
    gradientTo: "#d9740050",
  },
  {
    id: "look_wealthier",
    label: "Look wealthier",
    icon: <Crown className="w-6 h-6" />,
    gradientBg: "from-violet-500/25 to-purple-600/10 border-violet-500/20",
    gradientFrom: "#8b5cf650",
    gradientTo: "#7c3aed50",
  },
  {
    id: "impress_everyone",
    label: "Impress everyone",
    icon: <Flame className="w-6 h-6" />,
    gradientBg: "from-rose-500/25 to-red-600/10 border-rose-500/20",
    gradientFrom: "#f4364450",
    gradientTo: "#dc262650",
  },
  {
    id: "just_exploring",
    label: "Just exploring",
    icon: <Sparkles className="w-6 h-6" />,
    gradientBg: "from-sky-500/25 to-blue-600/10 border-sky-500/20",
    gradientFrom: "#0ea5e950",
    gradientTo: "#2563eb50",
  },
];

interface ContentOption {
  id: OnboardingContentType;
  label: string;
  icon: React.ReactNode;
}

const CONTENT_OPTIONS: ContentOption[] = [
  {
    id: "dating",
    label: "Dating profiles",
    icon: <Heart className="w-4 h-4" />,
  },
  {
    id: "instagram",
    label: "Instagram / Social",
    icon: <Camera className="w-4 h-4" />,
  },
  {
    id: "business",
    label: "Business / LinkedIn",
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    id: "personal_brand",
    label: "Personal brand",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: "just_for_fun",
    label: "Just for fun",
    icon: <PartyPopper className="w-4 h-4" />,
  },
];

interface CreatorOption {
  id: OnboardingCreatorType;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradientBg: string;
  gradientFrom: string;
  gradientTo: string;
}

const CREATOR_OPTIONS: CreatorOption[] = [
  {
    id: "myself",
    label: "Myself",
    description: "Transform your own selfies into luxury photos",
    icon: <ScanFace className="w-7 h-7" />,
    gradientBg: "from-violet-500/20 to-indigo-600/10 border-violet-500/15",
    gradientFrom: "#8b5cf650",
    gradientTo: "#6366f150",
  },
  {
    id: "ai_character",
    label: "An AI character",
    description: "Create a luxury persona from scratch",
    icon: <Wand2 className="w-7 h-7" />,
    gradientBg: "from-emerald-500/20 to-teal-600/10 border-emerald-500/15",
    gradientFrom: "#10b98150",
    gradientTo: "#059b6950",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Used this for my Hinge profile. Now I get asked which yacht club I'm at.",
    name: "Jake M.",
    stars: 5,
    image:
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(17).png",
  },
  {
    quote:
      "I finally have photos I'm confident posting. Saved me hours and a photoshoot.",
    name: "Sarah K.",
    stars: 5,
    image:
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(12).png",
  },
  {
    quote:
      "Posted a Richflex pic. Got 3 DMs asking about my lifestyle. Best investment.",
    name: "Marcus R.",
    stars: 5,
    image:
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(13).png",
  },
];

const FAQ_ITEMS = [
  {
    q: "What happens after I subscribe?",
    a: "You get instant access to all luxury templates, objects, and locations. Upload a selfie and start creating stunning photos in seconds.",
  },
  {
    q: "Can I cancel, downgrade, or upgrade anytime?",
    a: "Absolutely. Cancel with one click from your dashboard — no hidden fees, no hassle. Upgrade or downgrade whenever you want.",
  },
  {
    q: "What if I don't like the results?",
    a: "We're constantly improving. If you're not happy, reach out to our support and we'll help you get the perfect shot.",
  },
  {
    q: "Do I get support if I have issues?",
    a: "Yes! We offer priority support for all subscribers. Reach us via chat or email anytime.",
  },
  {
    q: "Can anybody else see my photos?",
    a: "No. Your photos are private by default. Only you can see and download your creations.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface WelcomeClientProps {
  subscription: SubscriptionData | null;
  isPreview?: boolean;
}

export default function WelcomeClient({
  subscription,
  isPreview,
}: WelcomeClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [goal, setGoal] = useState<OnboardingGoal | null>(null);
  const [contentTypes, setContentTypes] = useState<OnboardingContentType[]>([]);
  const [creatorType, setCreatorType] = useState<OnboardingCreatorType | null>(
    null,
  );
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">(
    "starter",
  );
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const starterPlan = SUBSCRIPTION_PLANS.STARTER;
  const proPlan = SUBSCRIPTION_PLANS.PRO;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);
  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleSaveAndContinue = useCallback(async () => {
    setIsSaving(true);
    try {
      if (isPreview) {
        toast.success("Preview — would save & go to explore");
        setIsSaving(false);
        setStep(0);
        return;
      }
      // Save in background — don't block navigation
      const savePromise =
        goal && contentTypes.length > 0 && creatorType
          ? saveOnboardingProfile({ goal, contentTypes, creatorType }).then(
              () => {
                posthog.capture("onboarding_completed", {
                  goal,
                  content_types: contentTypes,
                  creator_type: creatorType,
                });
                seline.welcome.completed({
                  goal,
                  content_types: contentTypes,
                  creator_type: creatorType,
                });
              },
            )
          : skipOnboarding().then(() => {
              posthog.capture("onboarding_skipped", {
                step,
                reason: "skip_for_now",
              });
              seline.welcome.skipped(step);
            });
      savePromise.catch((err) =>
        console.error("[onboarding save] failed:", err),
      );
      // Navigate immediately — don't wait for DB
      router.push("/app/explore");
      router.refresh();
    } catch {
      window.location.href = "/app/explore";
    } finally {
      setIsSaving(false);
    }
  }, [goal, contentTypes, creatorType, step, router, isPreview]);

  const handleSkip = useCallback(async () => {
    setIsSaving(true);
    try {
      if (isPreview) {
        toast.success("Preview — would skip to explore");
        setIsSaving(false);
        setStep(0);
        return;
      }
      // Save in background — don't block navigation
      const savePromise =
        goal && contentTypes.length > 0 && creatorType
          ? saveOnboardingProfile({ goal, contentTypes, creatorType })
          : skipOnboarding();
      savePromise.catch((err) =>
        console.error("[onboarding skip] save failed:", err),
      );
      posthog.capture("onboarding_skipped", { step });
      seline.welcome.skipped(step);
      // Navigate immediately — don't wait for DB
      router.push("/app/explore");
      router.refresh();
    } catch {
      // Even if everything fails, get them out of here
      window.location.href = "/app/explore";
    } finally {
      setIsSaving(false);
    }
  }, [goal, contentTypes, creatorType, step, router, isPreview]);

  const handleUpgrade = async (plan: "starter" | "pro") => {
    if (isPreview) {
      toast.success(`Preview — would start ${plan} checkout`);
      return;
    }
    setIsCheckoutLoading(true);
    try {
      const cfg = plan === "pro" ? proPlan : starterPlan;
      const initId = generateEventId();
      const purchId = generateEventId();
      const td = captureMetaTrackingData();
      await updateMetaTracking({ ...td, purchaseEventId: purchId }).catch(
        () => {},
      );
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_EVENT_ID,
        purchId,
      );
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.META_PURCHASE_VALUE,
        cfg.price.toString(),
      );
      trackMetaEvent(
        "InitiateCheckout",
        { content_type: "subscription", currency: "USD", value: cfg.price },
        initId,
      );
      fetch("/api/checkout/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: cfg.slug,
          eventId: initId,
          purchaseEventId: purchId,
          checkoutValue: cfg.price,
          currency: "USD",
          source: "welcome_pricing",
        }),
      }).catch((err) =>
        console.error("[Abandoned Checkout] Failed to track:", err),
      );
      posthog.capture("checkout_initiated", {
        plan,
        source: "onboarding_pricing",
        value: cfg.price,
      });
      if (goal && contentTypes.length > 0 && creatorType) {
        await saveOnboardingProfile({ goal, contentTypes, creatorType });
      } else {
        await skipOnboarding();
      }
      const result = await authClient.checkout({
        slug: cfg.slug,
        redirect: true,
      });
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else {
        toast.error("Unable to start checkout.");
        setIsCheckoutLoading(false);
      }
    } catch {
      toast.error("Something went wrong.");
      setIsCheckoutLoading(false);
    }
  };

  const handleGoalSelect = (g: OnboardingGoal) => {
    setGoal(g);
    seline.welcome.stepCompleted(0, "goal", { goal: g });
    setTimeout(() => goNext(), 350);
  };
  const toggleContentType = (ct: OnboardingContentType) => {
    setContentTypes((prev) =>
      prev.includes(ct) ? prev.filter((c) => c !== ct) : [...prev, ct],
    );
  };
  const handleContentContinue = () => {
    seline.welcome.stepCompleted(1, "content_types", {
      content_types: contentTypes,
    });
    goNext();
  };
  const handleCreatorSelect = (ct: OnboardingCreatorType) => {
    setCreatorType(ct);
    seline.welcome.stepCompleted(2, "creator_type", { creator_type: ct });
    setTimeout(() => goNext(), 350);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 280 : -280, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -280 : 280, opacity: 0 }),
  };

  const isPricing = step === 3;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
      {/* Background */}
      {isPricing ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Striped pattern — solo for testing */}
          <StripedPattern
            className="text-white/[0.07]"
            width={10}
            height={10}
          />
          {/* Radial glow center */}
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-white/[0.03] blur-[120px]" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <SparklesCore
            id="onboarding-dots"
            background="transparent"
            minSize={0.2}
            maxSize={0.5}
            particleDensity={25}
            particleColor="#ffffff"
            className="w-full h-full"
            speed={0.12}
          />
        </div>
      )}

      {/* Top bar */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-4 pb-2">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={step === 3 ? goBack : goBack}
              className="p-1.5 -ml-1 text-neutral-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 h-1.5 bg-neutral-800/80 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-white/90 to-neutral-400/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          {step === 3 && (
            <button
              onClick={handleSkip}
              disabled={isSaving}
              className="p-1.5 -mr-1 text-neutral-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              aria-label="Skip"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col min-h-full">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ==================== STEP 0: Goal ==================== */}
            {step === 0 && (
              <motion.div
                key="s0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1 flex flex-col"
              >
                <div className="bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-800/60 p-6 sm:p-8 shadow-2xl shadow-black/50 flex-1 flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 leading-tight">
                    What do you want to get out of Richflex?
                  </h1>
                  <p className="text-neutral-500 text-sm mb-7">
                    Let&apos;s personalize your experience
                  </p>

                  <div className="grid grid-cols-2 gap-3 flex-1 content-center">
                    {GOAL_OPTIONS.map((opt) => (
                      <MagicCard
                        key={opt.id}
                        className="rounded-2xl cursor-pointer"
                        gradientColor="#1a1a1a"
                        gradientOpacity={0.6}
                        gradientFrom={opt.gradientFrom}
                        gradientTo={opt.gradientTo}
                      >
                        <button
                          onClick={() => handleGoalSelect(opt.id)}
                          className={`relative flex flex-col items-center justify-center gap-3 p-5 sm:p-6 w-full min-h-[140px] rounded-2xl border transition-all duration-200 ${goal === opt.id ? "border-white/25 bg-white/[0.03]" : "border-transparent hover:border-neutral-700/50"}`}
                        >
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${opt.gradientBg} text-white`}
                          >
                            {opt.icon}
                          </div>
                          <span className="text-white text-sm font-medium text-center">
                            {opt.label}
                          </span>
                          {goal === opt.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-black" />
                            </motion.div>
                          )}
                        </button>
                      </MagicCard>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== STEP 1: Content ==================== */}
            {step === 1 && (
              <motion.div
                key="s1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1 flex flex-col"
              >
                <div className="bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-800/60 p-6 sm:p-8 shadow-2xl shadow-black/50 flex-1 flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 leading-tight">
                    What will you use Richflex for?
                  </h1>
                  <p className="text-neutral-500 text-sm mb-7">
                    Tap all that apply
                  </p>

                  <div className="flex flex-col gap-2.5 flex-1 justify-center">
                    {CONTENT_OPTIONS.map((opt) => {
                      const selected = contentTypes.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleContentType(opt.id)}
                          className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all duration-200 ${selected ? "bg-white/[0.04] border-white/20" : "bg-white/[0.02] border-neutral-800/60 hover:border-neutral-700/60 hover:bg-white/[0.03]"}`}
                        >
                          <span className="text-white text-sm font-medium">
                            {opt.label}
                          </span>
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${selected ? "bg-white text-black scale-95" : "bg-neutral-800/80 text-neutral-400"}`}
                          >
                            {selected ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              opt.icon
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleContentContinue}
                      disabled={contentTypes.length === 0}
                      className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                    <p className="text-center text-neutral-600 text-xs mt-3">
                      Select at least one
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== STEP 2: Creator Type ==================== */}
            {step === 2 && (
              <motion.div
                key="s2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1 flex flex-col"
              >
                <div className="bg-neutral-900/70 backdrop-blur-xl rounded-3xl border border-neutral-800/60 p-6 sm:p-8 shadow-2xl shadow-black/50 flex-1 flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 leading-tight">
                    Who do you want to create photos of?
                  </h1>
                  <p className="text-neutral-500 text-sm mb-7">
                    You can change this anytime
                  </p>

                  <div className="flex flex-col gap-3 flex-1 justify-center">
                    {CREATOR_OPTIONS.map((opt) => {
                      const selected = creatorType === opt.id;
                      return (
                        <MagicCard
                          key={opt.id}
                          className="rounded-2xl cursor-pointer"
                          gradientColor="#1a1a1a"
                          gradientOpacity={0.5}
                          gradientFrom={opt.gradientFrom}
                          gradientTo={opt.gradientTo}
                        >
                          <button
                            onClick={() => handleCreatorSelect(opt.id)}
                            className={`flex items-center gap-4 px-5 py-5 w-full rounded-2xl border transition-all duration-200 ${selected ? "border-white/20 bg-white/[0.02]" : "border-transparent hover:border-neutral-700/50"}`}
                          >
                            <div className="flex-1 text-left">
                              <h3 className="text-white font-semibold text-base">
                                {opt.label}
                              </h3>
                              <p className="text-neutral-500 text-sm mt-0.5">
                                {opt.description}
                              </p>
                            </div>
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${opt.gradientBg} text-white transition-all ${selected ? "scale-95 border border-white/15" : ""}`}
                            >
                              {opt.icon}
                            </div>
                          </button>
                        </MagicCard>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================== STEP 3: Pricing ==================== */}
            {step === 3 && (
              <motion.div
                key="s3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Main pricing card */}
                <div className="bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-neutral-800/60 p-6 sm:p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
                  {/* Subtle radial glow inside card */}
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-white/[0.03] blur-[80px] pointer-events-none" />

                  <div className="relative">
                    {/* Hero */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] mb-4">
                        <Star className="w-3 h-3 text-white fill-white" />
                        <span className="text-[11px] text-neutral-300 font-medium">
                          Trusted by 10,000+ creators
                        </span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
                        START CREATING
                      </h1>
                      <p className="text-neutral-500 text-sm mt-2">
                        Same you. Higher status photos. No photoshoot.
                      </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex gap-1 p-1 bg-neutral-800/60 rounded-xl mx-auto max-w-[260px] mb-5 border border-neutral-700/30">
                      <button
                        onClick={() => setSelectedPlan("starter")}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedPlan === "starter" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"}`}
                      >
                        Starter
                      </button>
                      <button
                        onClick={() => setSelectedPlan("pro")}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${selectedPlan === "pro" ? "bg-white text-black shadow-sm" : "text-neutral-400 hover:text-white"}`}
                      >
                        Pro
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold leading-none">
                          BEST
                        </span>
                      </button>
                    </div>

                    {/* Plan cards */}
                    <div className="space-y-2.5 mb-5">
                      <button
                        onClick={() => setSelectedPlan("starter")}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedPlan === "starter" ? "bg-white/[0.04] border-white/15 ring-1 ring-white/[0.06]" : "bg-white/[0.02] border-neutral-800/60 hover:border-neutral-700"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm">
                                Starter
                              </span>
                            </div>
                            <p className="text-neutral-500 text-xs mt-1">
                              {starterPlan.bricks.toLocaleString()} bricks/month
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-white text-xl font-bold">
                              ${starterPlan.price}
                            </span>
                            <p className="text-neutral-600 text-[10px]">
                              /month
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800/40">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === "starter" ? "border-white bg-white" : "border-neutral-600"}`}
                          >
                            {selectedPlan === "starter" && (
                              <Check className="w-2.5 h-2.5 text-black" />
                            )}
                          </div>
                          <span className="text-neutral-500 text-xs flex-1">
                            Cancel anytime
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedPlan("pro")}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedPlan === "pro" ? "bg-emerald-500/[0.04] border-emerald-500/20 ring-1 ring-emerald-500/[0.08]" : "bg-white/[0.02] border-neutral-800/60 hover:border-neutral-700"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm">
                                Pro
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/15">
                                Best Value
                              </span>
                            </div>
                            <p className="text-neutral-500 text-xs mt-1">
                              {proPlan.bricks.toLocaleString()} bricks/month
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-white text-xl font-bold">
                              ${proPlan.price}
                            </span>
                            <p className="text-neutral-600 text-[10px]">
                              /month
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800/40">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === "pro" ? "border-emerald-500 bg-emerald-500" : "border-neutral-600"}`}
                          >
                            {selectedPlan === "pro" && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                          <span className="text-neutral-500 text-xs">
                            Cancel anytime · 3x more bricks
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleUpgrade(selectedPlan)}
                      disabled={isCheckoutLoading}
                      className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.08)] flex items-center justify-center gap-2"
                    >
                      {isCheckoutLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Continue
                          <span className="text-neutral-500 font-normal">
                            $
                            {selectedPlan === "starter"
                              ? starterPlan.price
                              : proPlan.price}
                            /month
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSaveAndContinue}
                      disabled={isSaving}
                      className="w-full text-center mt-3 text-neutral-600 text-xs hover:text-neutral-400 transition-colors py-2"
                    >
                      {isSaving
                        ? "Saving..."
                        : "Skip for now — start with 100 free bricks"}
                    </button>
                    <p className="text-center text-neutral-700 text-[10px] mt-1">
                      Secure payment via Stripe · Cancel anytime
                    </p>
                  </div>
                </div>

                {/* Testimonials */}
                <div className="mt-5 bg-neutral-900/60 backdrop-blur-xl rounded-3xl border border-neutral-800/50 p-6">
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 text-white fill-white"
                      />
                    ))}
                  </div>
                  <p className="text-center text-neutral-500 text-xs mb-5">
                    Loved by 10,000+ creators
                  </p>
                  <div className="space-y-3">
                    {TESTIMONIALS.map((t, i) => (
                      <div
                        key={i}
                        className="bg-white/[0.02] rounded-xl border border-neutral-800/40 p-4"
                      >
                        <div className="flex items-center gap-0.5 mb-2">
                          {Array.from({ length: t.stars }).map((_, s) => (
                            <Star
                              key={s}
                              className="w-3 h-3 text-white/70 fill-white/70"
                            />
                          ))}
                        </div>
                        <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                          &quot;{t.quote}&quot;
                        </p>
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-700/50">
                            <img
                              src={t.image}
                              alt={t.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-neutral-300 text-xs font-medium">
                            {t.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div className="mt-4 bg-neutral-900/60 backdrop-blur-xl rounded-3xl border border-neutral-800/50 p-6 mb-8">
                  <h2 className="text-center text-base font-bold text-white mb-0.5">
                    Got Questions?
                  </h2>
                  <p className="text-center text-neutral-500 text-xs mb-5">
                    We&apos;ve Got Answers
                  </p>
                  <div className="space-y-0">
                    {FAQ_ITEMS.map((faq, i) => (
                      <div
                        key={i}
                        className="border-b border-neutral-800/40 last:border-0"
                      >
                        <button
                          onClick={() =>
                            setExpandedFaq(expandedFaq === i ? null : i)
                          }
                          className="w-full flex items-center justify-between py-3.5 text-left"
                        >
                          <span className="text-neutral-200 text-sm pr-4">
                            {faq.q}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-neutral-500 flex-shrink-0 transition-transform duration-200 ${expandedFaq === i ? "rotate-180" : ""}`}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedFaq === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-neutral-500 text-sm pb-4 leading-relaxed">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-800/30 text-center">
                    <p className="text-neutral-700 text-[10px] leading-relaxed">
                      By continuing, you agree to Richflex&apos;s{" "}
                      <a
                        href="/legal/terms"
                        className="underline hover:text-neutral-500"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/legal/privacy"
                        className="underline hover:text-neutral-500"
                      >
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Crisp chat button — bottom right corner */}
      <button
        onClick={openCrisp}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700/80 transition-all shadow-lg shadow-black/30"
        aria-label="Chat with us"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
