"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  Building2,
  ChevronRight,
  Zap,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Marquee } from "@/components/ui/marquee";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
import { getSignupUrl } from "@/lib/app-url";
import { assetUrl } from "@/lib/assets";

const HERO_BG = assetUrl("real-estate-presets/hollywood-hills-modern.png");

const SHOWCASE_PAIRS = [
  {
    sketch: assetUrl("real-estate-sketch/modern-white-villa-sketch.png"),
    render: assetUrl("real-estate-front/modern-white-villa.png"),
    label: "Villa blanca moderna",
  },
  {
    sketch: assetUrl("real-estate-sketch/alpine-chalet-front-sketch.png"),
    render: assetUrl("real-estate-front/alpine-chalet-front.png"),
    label: "Chalet alpino",
  },
  {
    sketch: assetUrl("real-estate-sketch/tropical-villa-pool-sketch.png"),
    render: assetUrl("real-estate-front/tropical-villa-pool.png"),
    label: "Villa tropical",
  },
];

const GALLERY_IMAGES = [
  {
    src: assetUrl("real-estate-presets/hollywood-hills-modern.png"),
    label: "Hollywood Hills",
  },
  {
    src: assetUrl("real-estate-presets/maldives-overwater.png"),
    label: "Villa en Maldivas",
  },
  {
    src: assetUrl("real-estate-presets/mediterranean-villa.png"),
    label: "Mediterranea",
  },
  {
    src: assetUrl("real-estate-full/classic-white-mansion.png"),
    label: "Neoclasica",
  },
  {
    src: assetUrl("real-estate-full/luxury-glass-skyscraper.png"),
    label: "Torre de cristal",
  },
  {
    src: assetUrl("real-estate-full/desert-modern-house.png"),
    label: "Moderna en el desierto",
  },
  {
    src: assetUrl("real-estate-presets/japanese-zen-house.png"),
    label: "Casa zen",
  },
  {
    src: assetUrl("real-estate-full/miami-condo-tower.png"),
    label: "Torre en Miami",
  },
];

const MOCK_SETTINGS = [
  { label: "Estilo arquitectonico", value: "Moderno" },
  { label: "Hora del dia", value: "Hora dorada" },
  { label: "Clima", value: "Cielo despejado" },
  { label: "Paisajismo", value: "Verde exuberante" },
];

const DEFAULT_HEADLINE = "Convierte cualquier boceto en un render fotorrealista";

interface HeroProps {
  headline?: string;
  emoji?: string;
}

export default function Hero({ headline = DEFAULT_HEADLINE }: HeroProps) {
  const signupUrl = getSignupUrl();
  const [pairIndex, setPairIndex] = useState(0);
  const [showRender, setShowRender] = useState(false);

  useEffect(() => {
    const cycle = () => {
      setShowRender(false);
      const showTimer = window.setTimeout(() => setShowRender(true), 1500);
      const nextTimer = window.setTimeout(() => {
        setPairIndex((prev) => (prev + 1) % SHOWCASE_PAIRS.length);
      }, 5000);
      return [showTimer, nextTimer];
    };

    const timers = cycle();
    const interval = window.setInterval(() => {
      cycle();
    }, 5000);

    return () => {
      timers.forEach(window.clearTimeout);
      window.clearInterval(interval);
    };
  }, []);

  const pair = SHOWCASE_PAIRS[pairIndex];

  return (
    <section className="relative">
      {/* Layer 1: Full-bleed background + headline */}
      <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={HERO_BG}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={70}
            className="object-cover"
          />
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
              Sube un plano, modelo de SketchUp o boceto a mano y consigue un
              render listo para portada en segundos. Sin estudio 3D, sin esperas
              de semanas y sin facturas enormes: solo los visuales que tus
              clientes esperan.
            </p>
          </BlurFade>

          <BlurFade inView delay={0.3}>
            <div className="mt-7 sm:mt-8 flex flex-col items-center gap-3">
              <a
                href={signupUrl}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/20 bg-white px-8 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-zinc-100 sm:text-base"
              >
                Empieza a renderizar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <p className="text-xs sm:text-sm text-white/40">
                Sin tarjeta · 100 bricks gratis para empezar
              </p>
            </div>
          </BlurFade>

          <BlurFade inView delay={0.4}>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {["Richflex%20(5)", "Richflex%20(17)", "Richflex%20(18)"].map(
                  (name, i) => (
                    <div
                      key={i}
                      className="relative w-8 h-8 rounded-full border-2 border-black/50 overflow-hidden bg-zinc-800"
                    >
                      <Image
                        src={`https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/${name}.png`}
                        alt="Usuario"
                        fill
                        className="object-cover"
                        sizes="32px"
                        quality={50}
                      />
                    </div>
                  ),
                )}
                <div className="w-8 h-8 rounded-full border-2 border-black/50 bg-zinc-800 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-neutral-400">
                    10K+
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/40">
                Usado por arquitectos, promotores y equipos inmobiliarios
              </p>
            </div>
          </BlurFade>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/30" />
        </div>
      </div>

      {/* Layer 2: Dashboard mockup */}
      <div className="relative -mt-20 sm:-mt-32 z-20 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Dashboard navbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                  <Image
                    src="/brickex-logo.png"
                    alt=""
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </div>
                <span className="text-xs font-bold text-white/80 tracking-tight">
                  BrickEx
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                {["Explorar", "Crear", "Galeria"].map((tab) => (
                  <span
                    key={tab}
                    className={`text-[10px] font-medium ${tab === "Crear" ? "text-white" : "text-white/30"}`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10">
                  <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span className="text-[9px] font-bold text-amber-400">
                    47
                  </span>
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
                      className={`relative w-10 h-7 rounded overflow-hidden border transition-all ${
                        i === pairIndex
                          ? "border-white/40"
                          : "border-white/10 opacity-40"
                      }`}
                    >
                      <Image
                        src={p.sketch}
                        alt=""
                        fill
                        sizes="40px"
                        quality={45}
                        className="object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded border border-dashed border-white/15 flex items-center justify-center">
                    <Upload className="w-2.5 h-2.5 text-white/20" />
                  </div>
                </div>

                {/* Main canvas with transition */}
                <div className="flex-1 relative overflow-hidden bg-zinc-950">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`sketch-${pairIndex}`}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Image
                        src={pair.sketch}
                        alt={`${pair.label} sketch`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 720px"
                        quality={65}
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  <motion.div
                    key={`render-${pairIndex}-${showRender}`}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showRender ? 1 : 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  >
                    <Image
                      src={pair.render}
                      alt={`${pair.label} render`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 720px"
                      quality={70}
                      className="object-cover"
                    />
                  </motion.div>

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
                            <span className="text-[9px] font-medium text-white/80">
                              Render BrickEx
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            <span className="text-[9px] font-medium text-white/50">
                              Entrada SketchUp
                            </span>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Progress dots */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
                    {SHOWCASE_PAIRS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${i === pairIndex ? "w-5 bg-white/60" : "w-1 bg-white/15"}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom toolbar */}
                <div className="flex items-center justify-center gap-0.5 px-3 py-2 border-t border-white/5">
                  {[
                    "Seleccionar",
                    "Comentar",
                    "Forma",
                    "Borrar",
                    "|",
                    "Deshacer",
                    "Rehacer",
                    "|",
                    "Pantalla completa",
                    "Comparar",
                    "Descargar",
                  ].map((tool, i) =>
                    tool === "|" ? (
                      <div key={i} className="w-px h-4 bg-white/10 mx-1" />
                    ) : (
                      <div
                        key={i}
                    className={`w-6 h-6 rounded flex items-center justify-center ${tool === "Seleccionar" ? "bg-white/10" : ""}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-sm bg-white/20" />
                      </div>
                    ),
                  )}
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
                      <div className="text-[10px] font-semibold text-white/80">
                        Render exterior
                      </div>
                      <div className="text-[8px] text-white/30">
                        Exterior fotorrealista
                      </div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-white/20" />
                  </button>

                  {/* Settings */}
                  {MOCK_SETTINGS.map((s) => (
                    <div key={s.label} className="space-y-1">
                      <span className="text-[8px] font-medium text-white/30 uppercase tracking-wider">
                        {s.label}
                      </span>
                      <div className="flex items-center gap-2 p-1.5 rounded-md border border-white/5 bg-white/[0.02]">
                        <div className="w-5 h-5 rounded bg-white/5" />
                        <span className="text-[9px] text-white/60 font-medium">
                          {s.value}
                        </span>
                        <ChevronDown className="w-2.5 h-2.5 text-white/20 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generate button */}
                <div className="p-3 border-t border-white/5">
                  <div className="w-full h-8 rounded-lg bg-white flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-black" />
                    <span className="text-[10px] font-semibold text-black">
                      Generar
                    </span>
                  </div>
                  <p className="text-[7px] text-white/20 text-center mt-1.5">
                    1 render gratis incluido
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 3: Scrolling thumbnail gallery */}
      <div className="relative pb-8 sm:pb-16">
        <BlurFade inView delay={0.1}>
          <div className="relative">
            <Marquee
              className="max-w-full [--duration:45s] [--gap:0.75rem]"
              pauseOnHover
            >
              {GALLERY_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative flex-shrink-0 w-64 sm:w-80 aspect-[16/10] rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                >
                  <Image
                    src={img.src}
                    alt={img.label}
                    fill
                    sizes="(max-width: 640px) 16rem, 20rem"
                    quality={65}
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute bottom-3 left-3 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {img.label}
                  </span>
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
