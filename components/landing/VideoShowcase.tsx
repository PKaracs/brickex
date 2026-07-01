"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
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
    label: "Construccion en ascenso",
    tagline: "Del terreno al skyline",
    description: "Muestra a inversores toda la obra — cimentacion, estructura, fachada y paisajismo — en un timelapse cinematico que hace que la vision parezca inevitable.",
    icon: Building2,
    video: `${SUPABASE_VIDEOS}/construction.mp4`,
  },
  {
    key: "day-to-night",
    label: "Del dia a la noche",
    tagline: "De hora dorada a luces urbanas",
    description: "Pasa de la luz calida de la tarde a la hora dorada y una escena nocturna dramatica: el tipo de video que detiene el scroll.",
    icon: Sunrise,
    video: `${SUPABASE_VIDEOS}/timelapse.mp4`,
  },
  {
    key: "flyover",
    label: "Sobrevuelo aereo",
    tagline: "Revelacion cinematica desde arriba",
    description: "Un movimiento estilo drone que revela la propiedad y su entorno desde arriba, sin piloto, permisos ni drone.",
    icon: Plane,
    video: `${SUPABASE_VIDEOS}/flyover.mp4`,
  },
  {
    key: "seasons",
    label: "Cuatro estaciones",
    tagline: "De flores de primavera a hielo invernal",
    description: "Ve tu proyecto entre flores, sol de verano, hojas de otono y nieve fresca: prueba de que luce increible todo el ano.",
    icon: Snowflake,
    video: `${SUPABASE_VIDEOS}/fourseasons.mp4`,
  },
];

export default function VideoShowcase() {
  const [activePreset, setActivePreset] = useState(0);
  const preset = PRESETS[activePreset];

  const selectPreset = useCallback((index: number) => {
    setActivePreset(index);
  }, []);

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade inView delay={0.1}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                No solo lo muestres: dale vida
              </span>
            </h2>
            <p className="text-zinc-400 mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Convierte un solo render en recorridos cinematicos, timelapses de
              construccion y revelaciones de dia a noche: el tipo de video que
              gana el pitch y acumula vistas.
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
                  <video
                    key={preset.key}
                    src={preset.video}
                    controls
                    muted
                    playsInline
                    preload="none"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-[2] bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                    <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{preset.tagline}</p>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{preset.label}</h3>
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
                      "relative flex-shrink-0 lg:flex-shrink text-left p-4 sm:p-5 rounded-xl border w-52 lg:w-full",
                      isActive
                        ? "bg-zinc-800/60 border-white/20 shadow-lg"
                        : "bg-zinc-900/40 border-white/5 hover:border-white/15 hover:bg-zinc-800/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
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
