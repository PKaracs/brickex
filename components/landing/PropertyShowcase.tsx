"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
import {
  Sun,
  Moon,
  Sunrise,
  CloudRain,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { assetUrl } from "@/lib/assets";

type VariationKey = "original" | "night" | "morning" | "overcast" | "lifestyle";

interface PropertyData {
  slug: string;
  label: string;
  location: string;
  baseDir?: string;
  variationsDir?: string;
}

const PROPERTIES: PropertyData[] = [
  { slug: "hollywood-hills-modern", label: "Moderna en Hollywood Hills", location: "Los Angeles, CA", baseDir: "real-estate-presets", variationsDir: "real-estate-variations" },
  { slug: "classic-white-mansion", label: "Mansion neoclasica", location: "Virginia, USA" },
  { slug: "desert-modern-house", label: "Retiro moderno en el desierto", location: "Scottsdale, AZ" },
  { slug: "luxury-glass-skyscraper", label: "Residencia en torre de cristal", location: "Dubai, UAE" },
  { slug: "mediterranean-villa", label: "Villa mediterranea", location: "Santorini, Grecia", baseDir: "real-estate-presets", variationsDir: "real-estate-variations" },
  { slug: "miami-condo-tower", label: "Torre residencial de lujo", location: "Miami, FL" },
  { slug: "maldives-overwater", label: "Villa sobre el agua en Maldivas", location: "Maldivas", baseDir: "real-estate-presets", variationsDir: "real-estate-variations" },
];

const VARIATION_ORDER: VariationKey[] = ["original", "night", "morning", "overcast", "lifestyle"];

const VARIATIONS: { key: VariationKey; label: string; icon: typeof Sun }[] = [
  { key: "original", label: "Dia", icon: Sun },
  { key: "night", label: "Noche", icon: Moon },
  { key: "morning", label: "Amanecer", icon: Sunrise },
  { key: "overcast", label: "Atmosfera", icon: CloudRain },
  { key: "lifestyle", label: "Escenificado", icon: Users },
];

function getImagePath(property: PropertyData, variation: VariationKey): string {
  const base = property.baseDir || "real-estate-full";
  const vars = property.variationsDir || "real-estate-full-variations";
  if (variation === "original") {
    return assetUrl(`${base}/${property.slug}.png`);
  }
  return assetUrl(`${vars}/${property.slug}/${variation}.png`);
}

function getThumbnailPath(property: PropertyData): string {
  const base = property.baseDir || "real-estate-full";
  return assetUrl(`${base}/${property.slug}.png`);
}

export default function PropertyShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [variationIndex, setVariationIndex] = useState(0);

  const activeVariation = VARIATION_ORDER[variationIndex];
  const property = PROPERTIES[currentIndex];

  const goToProperty = useCallback((index: number) => {
    setCurrentIndex(index);
    setVariationIndex(0);
  }, []);

  const goToVariation = useCallback((key: VariationKey) => {
    const idx = VARIATION_ORDER.indexOf(key);
    if (idx !== -1) setVariationIndex(idx);
  }, []);

  const prev = useCallback(() => {
    const newIndex = currentIndex === 0 ? PROPERTIES.length - 1 : currentIndex - 1;
    goToProperty(newIndex);
  }, [currentIndex, goToProperty]);

  const next = useCallback(() => {
    const newIndex = currentIndex === PROPERTIES.length - 1 ? 0 : currentIndex + 1;
    goToProperty(newIndex);
  }, [currentIndex, goToProperty]);

  const imagePath = getImagePath(property, activeVariation);

  const progressPercent = ((variationIndex + 1) / VARIATION_ORDER.length) * 100;

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <BlurFade inView delay={0.1}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Un proyecto. Todos los ambientes.
              </span>
            </h2>
            <p className="text-zinc-400 mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Dia, noche, amanecer, lluvia o una escena completa con personas y
              coches: crea cualquier atmosfera desde un solo dibujo. Dale a cada
              cliente exactamente el mood que pidio, sin volver a fotografiar ni
              esperar a que cambie el clima.
            </p>
          </div>
        </BlurFade>

        {/* Main Showcase */}
        <BlurFade inView delay={0.2}>
          <div className="relative">
            {/* Image Container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
              {/* Top shine line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] z-20">
                <div
                  className="h-full bg-white/40"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Image */}
              <div className="relative aspect-[16/9] w-full">
                <Image
                  key={`${property.slug}-${activeVariation}`}
                  src={imagePath}
                  alt={`${property.label} — vista ${activeVariation}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 1152px"
                  quality={64}
                  loading="lazy"
                  className="object-cover"
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-[1]" />

                {/* Nav arrows */}
                <button
                  onClick={prev}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/60 hover:border-white/20"
                  aria-label="Propiedad anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/60 hover:border-white/20"
                  aria-label="Propiedad siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Property info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 z-[2]">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                        {property.label}
                      </h3>
                      <p className="text-sm text-white/50 mt-0.5">
                        {property.location}
                      </p>
                    </div>

                    {/* Dot indicators */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      {PROPERTIES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goToProperty(i)}
                          className={cn(
                            "h-1.5 rounded-full",
                            i === currentIndex
                              ? "w-6 bg-white"
                              : "w-1.5 bg-white/30 hover:bg-white/50"
                          )}
                          aria-label={`Ir a la propiedad ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Variation Pills */}
            <div className="mt-5 sm:mt-6 flex justify-center">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
                {VARIATIONS.map((v) => {
                  const Icon = v.icon;
                  const isActive = activeVariation === v.key;
                  return (
                    <button
                      key={v.key}
                      onClick={() => goToVariation(v.key)}
                      className={cn(
                        "relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium",
                        isActive
                          ? "text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {isActive && (
                        <span className="absolute inset-0 rounded-full border border-white/20 bg-white/10" />
                      )}
                      <Icon className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="relative z-10">{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="mt-5 sm:mt-6 flex justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {PROPERTIES.map((p, i) => (
                <button
                  key={p.slug}
                  onClick={() => goToProperty(i)}
                  className={cn(
                    "relative flex-shrink-0 w-20 sm:w-24 lg:w-28 aspect-[16/9] rounded-lg overflow-hidden border",
                    i === currentIndex
                      ? "border-white/40 ring-1 ring-white/20"
                      : "border-white/10 opacity-50 hover:opacity-80 hover:border-white/20"
                  )}
                >
                  <Image
                    src={getThumbnailPath(p)}
                    alt={p.label}
                    fill
                    sizes="(max-width: 640px) 80px, 112px"
                    quality={40}
                    loading="lazy"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
