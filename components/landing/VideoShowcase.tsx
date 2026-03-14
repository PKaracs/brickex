"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";
import { Building2, Sunrise, Plane, Snowflake } from "lucide-react";

interface VideoPreset {
  key: string;
  label: string;
  tagline: string;
  description: string;
  icon: typeof Building2;
  video: string;
}

const SUPABASE_VIDEOS = "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/videos";

const PRESETS: VideoPreset[] = [
  {
    key: "construction",
    label: "Construction Rise",
    tagline: "From plot to skyline",
    description: "Watch the entire construction process unfold — foundation, framing, facade, landscaping — compressed into a cinematic timelapse.",
    icon: Building2,
    video: `${SUPABASE_VIDEOS}/construction.mp4`,
  },
  {
    key: "day-to-night",
    label: "Day to Night",
    tagline: "Golden hour to city lights",
    description: "Transition seamlessly from warm afternoon light through golden hour into a dramatic nighttime scene with architectural lighting.",
    icon: Sunrise,
    video: `${SUPABASE_VIDEOS}/timelapse.mp4`,
  },
  {
    key: "flyover",
    label: "Aerial Flyover",
    tagline: "Bird's-eye cinematic reveal",
    description: "A drone-style aerial sweep that reveals the full property, surrounding landscape, and architectural context from above.",
    icon: Plane,
    video: `${SUPABASE_VIDEOS}/flyover.mp4`,
  },
  {
    key: "seasons",
    label: "Four Seasons",
    tagline: "Spring bloom to winter frost",
    description: "Experience your project across all four seasons — cherry blossoms, summer sun, autumn leaves, and a blanket of snow.",
    icon: Snowflake,
    video: `${SUPABASE_VIDEOS}/fourseasons.mp4`,
  },
];

export default function VideoShowcase() {
  const [activePreset, setActivePreset] = useState(0);
  const preset = PRESETS[activePreset];
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectPreset = useCallback((index: number) => {
    setActivePreset(index);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [activePreset]);

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade inView delay={0.1}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Watch Your Project Come to Life
              </span>
            </h2>
            <p className="text-zinc-400 mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Generate cinematic walkthroughs, construction timelapses,
              and day-to-night transitions from a single render.
            </p>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Video player — large */}
            <div className="lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

                <div className="relative aspect-[16/9] w-full">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={preset.key}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0"
                    >
                      <video
                        ref={videoRef}
                        src={preset.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-[2] bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={preset.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{preset.tagline}</p>
                        <h3 className="text-lg sm:text-xl font-semibold text-white">{preset.label}</h3>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Preset cards — right side */}
            <div className="lg:col-span-2 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {PRESETS.map((p, i) => {
                const Icon = p.icon;
                const isActive = i === activePreset;
                return (
                  <button
                    key={p.key}
                    onClick={() => selectPreset(i)}
                    className={cn(
                      "relative flex-shrink-0 lg:flex-shrink text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 w-52 lg:w-full",
                      isActive
                        ? "bg-zinc-800/60 border-white/20 shadow-lg"
                        : "bg-zinc-900/40 border-white/5 hover:border-white/15 hover:bg-zinc-800/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors",
                        isActive ? "bg-white/10" : "bg-white/5"
                      )}>
                        <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-zinc-500")} />
                      </div>
                      <div className="min-w-0">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          isActive ? "text-white" : "text-zinc-400"
                        )}>
                          {p.label}
                        </h4>
                        <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2 hidden lg:block">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
