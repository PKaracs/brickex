"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
import { Compare } from "@/components/ui/compare";
import { assetUrl } from "@/lib/assets";

interface Pair {
  label: string;
  before: string;
  after: string;
}

const PAIRS: Pair[] = [
  {
    label: "Villa blanca moderna",
    before: assetUrl("real-estate-sketch/modern-white-villa-sketch.png"),
    after: assetUrl("real-estate-front/modern-white-villa.png"),
  },
  {
    label: "Chalet alpino",
    before: assetUrl("real-estate-sketch/alpine-chalet-front-sketch.png"),
    after: assetUrl("real-estate-front/alpine-chalet-front.png"),
  },
  {
    label: "Villa tropical",
    before: assetUrl("real-estate-sketch/tropical-villa-pool-sketch.png"),
    after: assetUrl("real-estate-front/tropical-villa-pool.png"),
  },
];

const CYCLE_MS = 6000;

export default function SketchToRender() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pair = PAIRS[activeIndex];

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % PAIRS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(advance, CYCLE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, advance]);

  const selectPair = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    window.setTimeout(() => setIsPaused(false), 8000);
  }, []);

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade inView delay={0.1}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                De boceto rapido a fotorrealismo
              </span>
            </h2>
            <p className="text-zinc-400 mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Arrastra el control y compruebalo. Cualquier modelo de SketchUp,
              plano CAD o boceto en servilleta se convierte en un render listo
              para revista en segundos, no en semanas.
            </p>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.2}>
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Compare container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Compare
                    firstImage={pair.before}
                    secondImage={pair.after}
                    className="w-full aspect-[16/9] rounded-2xl"
                    firstImageClassName="object-cover"
                    secondImageClassname="object-cover"
                    slideMode="hover"
                    autoplay
                    autoplayDuration={4000}
                    initialSliderPercentage={30}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Labels */}
              <div className="absolute top-4 left-4 z-30 px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.2em] text-white/70 bg-black/40 backdrop-blur-md rounded">
                SketchUp
              </div>
              <div className="absolute top-4 right-4 z-30 px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.2em] text-white/70 bg-black/40 backdrop-blur-md rounded">
                Render BrickEx
              </div>
            </div>

            {/* Dot indicators + label */}
            <div className="mt-5 sm:mt-6 flex flex-col items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.p
                  key={pair.label}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-zinc-500"
                >
                  {pair.label}
                </motion.p>
              </AnimatePresence>

              <div className="flex items-center gap-2">
                {PAIRS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => selectPair(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === activeIndex ? "w-8 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Ver ${PAIRS[i].label}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
