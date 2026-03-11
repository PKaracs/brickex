"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlurFade } from "@/components/ui/blur-fade";
import Link from "next/link";

const VILLA_IMAGES = [
  {
    src: "/api/static/real-estate-presets/maldives-overwater.png",
    label: "Maldives Overwater Villa",
  },
  {
    src: "/api/static/real-estate-presets/hollywood-hills-modern.png",
    label: "Hollywood Hills Modern",
  },
  {
    src: "/api/static/real-estate-presets/lake-como-palazzo.png",
    label: "Lake Como Palazzo",
  },
  {
    src: "/api/static/real-estate-presets/mediterranean-villa.png",
    label: "Mediterranean Villa",
  },
  {
    src: "/api/static/real-estate-presets/swiss-chalet.png",
    label: "Swiss Chalet",
  },
  {
    src: "/api/static/real-estate-presets/malibu-mansion.png",
    label: "Malibu Mansion",
  },
  {
    src: "/api/static/real-estate-presets/japanese-zen-house.png",
    label: "Japanese Zen House",
  },
  {
    src: "/api/static/real-estate-presets/amalfi-coast-villa.png",
    label: "Amalfi Coast Villa",
  },
  {
    src: "/api/static/real-estate-presets/norwegian-fjord-glass.png",
    label: "Norwegian Fjord Glass",
  },
  {
    src: "/api/static/real-estate-presets/bali-resort-villa.png",
    label: "Bali Resort Villa",
  },
];

const IMAGE_CYCLE_MS = 4000;

export default function WaitlistClient() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % VILLA_IMAGES.length);
    }, IMAGE_CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const villa = VILLA_IMAGES[currentImage];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Left half — transitioning villa images */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={villa.src}
              alt={villa.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/30 z-10" />

        {/* Label pill */}
        <div className="absolute bottom-8 left-8 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={villa.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10"
            >
              <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              <span className="text-sm font-medium text-white/80">
                {villa.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress indicators */}
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-1.5">
          {VILLA_IMAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-700 ${
                i === currentImage
                  ? "w-6 bg-white/70"
                  : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Subtle BrickEx branding on image */}
        <div className="absolute top-8 left-8 z-20">
          <p className="text-xs text-white/30 font-medium tracking-widest uppercase">
            AI-Generated Visualization
          </p>
        </div>
      </div>

      {/* Right half — waitlist form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <BlurFade delay={0.1}>
            <Link href="/" className="flex items-center gap-2.5 mb-14">
              <Image
                src="/brickex-logo.png"
                alt="BrickEx"
                width={40}
                height={40}
                className="w-10 h-10"
                priority
              />
              <span className="text-xl font-semibold text-white">
                BrickEx
              </span>
            </Link>
          </BlurFade>

          {isSubmitted ? (
            <BlurFade delay={0.1}>
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold text-white">
                    You&apos;re on the list
                  </h1>
                  <p className="text-neutral-400 text-base leading-relaxed">
                    We&apos;ll notify you at{" "}
                    <span className="text-white font-medium">{email}</span>{" "}
                    when BrickEx launches. You&apos;ll get early access and a
                    special founding member discount.
                  </p>
                </div>
                <div className="pt-4 border-t border-neutral-800">
                  <p className="text-sm text-neutral-500">
                    In the meantime, follow us for sneak peeks and updates.
                  </p>
                </div>
              </div>
            </BlurFade>
          ) : (
            <>
              <BlurFade delay={0.15}>
                <div className="space-y-3 mb-10">
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                      <span className="text-xs font-medium text-white/60">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                    <span className="bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent">
                      See your project before it&apos;s built
                    </span>
                  </h1>
                  <p className="text-neutral-400 text-base sm:text-lg leading-relaxed max-w-sm">
                    AI-powered photorealistic renders from sketches, floor plans,
                    and 3D models. In seconds, not weeks.
                  </p>
                </div>
              </BlurFade>

              <BlurFade delay={0.25}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-white/25 focus:ring-0 rounded-xl"
                      required
                    />
                    <Button
                      type="submit"
                      variant="white"
                      className="h-12 px-6 rounded-xl font-semibold whitespace-nowrap"
                      isLoading={isLoading}
                    >
                      Join Waitlist
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  <p className="text-xs text-neutral-600">
                    No spam. We&apos;ll only email you when we launch.
                  </p>
                </form>
              </BlurFade>

              {/* Social proof */}
              <BlurFade delay={0.35}>
                <div className="mt-12 pt-8 border-t border-neutral-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex -space-x-2">
                      {[
                        "Richflex%20(5)",
                        "Richflex%20(17)",
                        "Richflex%20(18)",
                      ].map((name, i) => (
                        <div
                          key={i}
                          className="relative w-8 h-8 rounded-full border-2 border-[#0a0a0a] overflow-hidden bg-zinc-800"
                        >
                          <Image
                            src={`https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/${name}.png`}
                            alt="User"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-neutral-500">
                      <span className="text-white font-medium">2,400+</span>{" "}
                      architects already on the waitlist
                    </p>
                  </div>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: "sketch",
                        title: "Sketch to Render",
                        desc: "Upload any plan format",
                      },
                      {
                        icon: "lightning",
                        title: "30-Second Renders",
                        desc: "Not hours, seconds",
                      },
                      {
                        icon: "moods",
                        title: "Mood Variations",
                        desc: "Day, night, seasons",
                      },
                      {
                        icon: "video",
                        title: "Video Walkthroughs",
                        desc: "Cinematic flyovers",
                      },
                    ].map((feature) => (
                      <div
                        key={feature.title}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                      >
                        <Sparkles className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-neutral-300">
                            {feature.title}
                          </p>
                          <p className="text-xs text-neutral-600">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BlurFade>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
