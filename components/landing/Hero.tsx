"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, ChevronDown, Sparkles, Building2, ChevronRight, Zap, Upload } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Marquee } from "@/components/ui/marquee";
import { BlurFade } from "@/components/ui/blur-fade";
import { getSignupUrl } from "@/lib/app-url";
import { useRef } from "react";

const HERO_BG = "/api/static/real-estate-presets/hollywood-hills-modern.png";

const SHOWCASE_PAIRS = [
  {
    sketch: "/api/static/real-estate-sketch/modern-white-villa-sketch.png",
    render: "/api/static/real-estate-front/modern-white-villa.png",
    label: "Modern White Villa",
  },
  {
    sketch: "/api/static/real-estate-sketch/alpine-chalet-front-sketch.png",
    render: "/api/static/real-estate-front/alpine-chalet-front.png",
    label: "Alpine Chalet",
  },
  {
    sketch: "/api/static/real-estate-sketch/tropical-villa-pool-sketch.png",
    render: "/api/static/real-estate-front/tropical-villa-pool.png",
    label: "Tropical Villa",
  },
];

const GALLERY_IMAGES = [
  { src: "/api/static/real-estate-presets/hollywood-hills-modern.png", label: "Hollywood Hills" },
  { src: "/api/static/real-estate-presets/maldives-overwater.png", label: "Maldives Villa" },
  { src: "/api/static/real-estate-presets/mediterranean-villa.png", label: "Mediterranean" },
  { src: "/api/static/real-estate-full/classic-white-mansion.png", label: "Neoclassical" },
  { src: "/api/static/real-estate-full/luxury-glass-skyscraper.png", label: "Glass Tower" },
  { src: "/api/static/real-estate-full/desert-modern-house.png", label: "Desert Modern" },
  { src: "/api/static/real-estate-presets/japanese-zen-house.png", label: "Zen House" },
  { src: "/api/static/real-estate-full/miami-condo-tower.png", label: "Miami Tower" },
];

const MOCK_SETTINGS = [
  { label: "Architecture Style", value: "Modern" },
  { label: "Time of Day", value: "Golden Hour" },
  { label: "Weather", value: "Clear Sky" },
  { label: "Landscaping", value: "Lush Green" },
];

const DEFAULT_HEADLINE = "See Your Project Before It\u2019s Built";

interface HeroProps {
  headline?: string;
  emoji?: string;
}

export default function Hero({ headline = DEFAULT_HEADLINE }: HeroProps) {
  const signupUrl = getSignupUrl();
  const [pairIndex, setPairIndex] = useState(0);
  const [showRender, setShowRender] = useState(false);
  const mockupRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: mockupRef,
    offset: ["start end", "center center"],
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const mockupOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  useEffect(() => {
    const cycle = () => {
      setShowRender(false);
      const showTimer = setTimeout(() => setShowRender(true), 1500);
      const nextTimer = setTimeout(() => {
        setPairIndex((prev) => (prev + 1) % SHOWCASE_PAIRS.length);
      }, 5000);
      return [showTimer, nextTimer];
    };

    const timers = cycle();
    const interval = setInterval(() => { cycle(); }, 5000);
    return () => { timers.forEach(clearTimeout); clearInterval(interval); };
  }, []);

  const pair = SHOWCASE_PAIRS[pairIndex];

  return (
    <section className="relative">
      {/* Layer 1: Full-bleed background + headline */}
      <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_BG} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0c0c0c]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto pt-24 sm:pt-32">
          <BlurFade inView delay={0.1}>
            <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent">
                {headline}
              </span>
            </h1>
          </BlurFade>

          <BlurFade inView delay={0.2}>
            <p className="mt-5 sm:mt-6 max-w-md sm:max-w-2xl text-sm sm:text-base lg:text-lg leading-relaxed text-white/60 px-2">
              Upload floor plans, SketchUp models, or hand sketches — get
              magazine-ready photorealistic renders in seconds. Built for
              architects, developers, and real estate marketers.
            </p>
          </BlurFade>

          <BlurFade inView delay={0.3}>
            <div className="mt-7 sm:mt-8 flex flex-col items-center gap-3">
              <a href="/waitlist">
                <ShimmerButton shimmerColor="#ffffff" shimmerSize="0.05em" background="rgba(255,255,255,0.1)" className="px-8 py-3.5 text-sm sm:text-base font-semibold">
                  Join the Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </ShimmerButton>
              </a>
              <p className="text-xs sm:text-sm text-white/40">Be the first to try BrickEx when we launch.</p>
            </div>
          </BlurFade>

          <BlurFade inView delay={0.4}>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {["Richflex%20(5)", "Richflex%20(17)", "Richflex%20(18)"].map((name, i) => (
                  <div key={i} className="relative w-8 h-8 rounded-full border-2 border-black/50 overflow-hidden bg-zinc-800">
                    <Image src={`https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/${name}.png`} alt="User" fill className="object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-black/50 bg-zinc-800 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-neutral-400">10K+</span>
                </div>
              </div>
              <p className="text-xs text-white/40">Used by architects, developers & agencies</p>
            </div>
          </BlurFade>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/30" />
        </div>
      </div>

      {/* Layer 2: Dashboard mockup */}
      <motion.div
        ref={mockupRef}
        style={{ y: mockupY, opacity: mockupOpacity }}
        className="relative -mt-20 sm:-mt-32 z-20 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24"
      >
        <div className="max-w-5xl mx-auto">
          <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">

            {/* Dashboard navbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                  <img src="/brickex-logo.png" alt="" className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white/80 tracking-tight">BrickEx</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                {["Explore", "Create", "Gallery"].map((tab) => (
                  <span key={tab} className={`text-[10px] font-medium ${tab === "Create" ? "text-white" : "text-white/30"}`}>{tab}</span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10">
                  <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span className="text-[9px] font-bold text-amber-400">47</span>
                </div>
                <div className="w-5 h-5 rounded-full bg-zinc-700" />
              </div>
            </div>

            {/* Dashboard body: canvas + sidebar */}
            <div className="flex min-h-[320px] sm:min-h-[400px] lg:min-h-[460px]">

              {/* Canvas area (left) */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Image thumbnails strip */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
                  {SHOWCASE_PAIRS.map((p, i) => (
                    <div
                      key={i}
                      className={`w-10 h-7 rounded overflow-hidden border transition-all ${
                        i === pairIndex ? "border-white/40" : "border-white/10 opacity-40"
                      }`}
                    >
                      <img src={p.sketch} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded border border-dashed border-white/15 flex items-center justify-center">
                    <Upload className="w-2.5 h-2.5 text-white/20" />
                  </div>
                </div>

                {/* Main canvas with transition */}
                <div className="flex-1 relative overflow-hidden bg-zinc-950">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`sketch-${pairIndex}`}
                      src={pair.sketch}
                      alt={`${pair.label} sketch`}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  </AnimatePresence>

                  <motion.img
                    key={`render-${pairIndex}-${showRender}`}
                    src={pair.render}
                    alt={`${pair.label} render`}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showRender ? 1 : 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />

                  {/* Status pill */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showRender ? "render" : "sketch"}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10"
                      >
                        {showRender ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[9px] font-medium text-white/80">BrickEx Render</span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            <span className="text-[9px] font-medium text-white/50">SketchUp Input</span>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Progress dots */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
                    {SHOWCASE_PAIRS.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === pairIndex ? "w-5 bg-white/60" : "w-1 bg-white/15"}`} />
                    ))}
                  </div>
                </div>

                {/* Bottom toolbar */}
                <div className="flex items-center justify-center gap-0.5 px-3 py-2 border-t border-white/5">
                  {["Select", "Comment", "Shape", "Eraser", "|", "Undo", "Redo", "|", "Fullscreen", "Compare", "Download"].map((tool, i) => (
                    tool === "|" ? (
                      <div key={i} className="w-px h-4 bg-white/10 mx-1" />
                    ) : (
                      <div key={i} className={`w-6 h-6 rounded flex items-center justify-center ${tool === "Select" ? "bg-white/10" : ""}`}>
                        <div className="w-2.5 h-2.5 rounded-sm bg-white/20" />
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Sidebar (right) — hidden on small screens */}
              <div className="hidden sm:flex w-52 lg:w-64 border-l border-white/5 bg-zinc-950/80 flex-col">
                <div className="p-3 space-y-3 flex-1 overflow-hidden">
                  {/* Mode selector */}
                  <button className="w-full flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                      <Building2 className="w-3.5 h-3.5 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[10px] font-semibold text-white/80">Exterior Render</div>
                      <div className="text-[8px] text-white/30">Photorealistic exterior</div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-white/20" />
                  </button>

                  {/* Settings */}
                  {MOCK_SETTINGS.map((s) => (
                    <div key={s.label} className="space-y-1">
                      <span className="text-[8px] font-medium text-white/30 uppercase tracking-wider">{s.label}</span>
                      <div className="flex items-center gap-2 p-1.5 rounded-md border border-white/5 bg-white/[0.02]">
                        <div className="w-5 h-5 rounded bg-white/5" />
                        <span className="text-[9px] text-white/60 font-medium">{s.value}</span>
                        <ChevronDown className="w-2.5 h-2.5 text-white/20 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generate button */}
                <div className="p-3 border-t border-white/5">
                  <div className="w-full h-8 rounded-lg bg-white flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-black" />
                    <span className="text-[10px] font-semibold text-black">Generate</span>
                  </div>
                  <p className="text-[7px] text-white/20 text-center mt-1.5">1 free render included</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Layer 3: Scrolling thumbnail gallery */}
      <div className="relative pb-8 sm:pb-16">
        <BlurFade inView delay={0.1}>
          <div className="relative">
            <Marquee className="max-w-full [--duration:45s] [--gap:0.75rem]" pauseOnHover>
              {GALLERY_IMAGES.map((img, idx) => (
                <div key={idx} className="group relative flex-shrink-0 w-64 sm:w-80 aspect-[16/10] rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                  <img src={img.src} alt={img.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute bottom-3 left-3 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">{img.label}</span>
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#0c0c0c] z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#0c0c0c] z-10" />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
