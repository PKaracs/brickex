"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
    src: "/api/static/real-estate-presets/tuscan-hilltop-villa.png",
    label: "Tuscan Hilltop Villa",
  },
  {
    src: "/api/static/real-estate-presets/cape-town-clifftop.png",
    label: "Cape Town Clifftop",
  },
  {
    src: "/api/static/real-estate-presets/miami-penthouse.png",
    label: "Miami Penthouse",
  },
  {
    src: "/api/static/real-estate-presets/mykonos-cycladic.png",
    label: "Mykonos Cycladic",
  },
  {
    src: "/api/static/real-estate-presets/scandinavian-lakehouse.png",
    label: "Scandinavian Lakehouse",
  },
];

const IMAGE_CYCLE_MS = 4000;

interface LoginPageClientProps {
  authError?: string;
}

export default function LoginPageClient({}: LoginPageClientProps) {
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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const villa = VILLA_IMAGES[currentImage];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Left half — transitioning villa images */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
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

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/30 z-10" />

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

        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-1.5">
          {VILLA_IMAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-700 ${
                i === currentImage ? "w-6 bg-white/70" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right half — waitlist form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 w-full max-w-md">
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
              <span className="text-xl font-semibold text-white">BrickEx</span>
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
                    <span className="text-white font-medium">{email}</span> when
                    BrickEx launches. Early access and founding member pricing
                    included.
                  </p>
                </div>
              </div>
            </BlurFade>
          ) : (
            <>
              <BlurFade delay={0.15}>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 backdrop-blur-sm">
                  <div className="space-y-2 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        <span className="text-xs font-medium text-white/60">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl font-semibold text-white">
                      Join the Waitlist
                    </h1>
                    <p className="text-neutral-500 text-sm">
                      Be the first to create AI-powered photorealistic renders
                      from your architectural plans.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0"
                        required
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-400">{error}</p>
                    )}

                    <Button
                      type="submit"
                      variant="white"
                      size="default"
                      className="w-full"
                      isLoading={isLoading}
                    >
                      Join Waitlist
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>

                    <p className="text-xs text-neutral-600 text-center">
                      No spam. We&apos;ll only email when we launch.
                    </p>
                  </form>
                </div>
              </BlurFade>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
