"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
import { ImageCompare } from "@/components/ui/image-compare";
import { Paintbrush, Gem, Armchair, Factory } from "lucide-react";
import { assetUrl } from "@/lib/assets";

interface Style {
  key: string;
  label: string;
  icon: typeof Paintbrush;
  image: string;
}

const EMPTY_ROOM = assetUrl("interior-variations/empty-room.png");

const STYLES: Style[] = [
  { key: "modern", label: "Moderno minimal", icon: Paintbrush, image: assetUrl("interior-variations/modern-minimalist.png") },
  { key: "artdeco", label: "Art Deco", icon: Gem, image: assetUrl("interior-variations/art-deco.png") },
  { key: "scandi", label: "Escandinavo", icon: Armchair, image: assetUrl("interior-variations/scandinavian.png") },
  { key: "industrial", label: "Industrial", icon: Factory, image: assetUrl("interior-variations/industrial.png") },
];

export default function InteriorShowcase() {
  const [activeStyle, setActiveStyle] = useState(0);
  const style = STYLES[activeStyle];

  const selectStyle = useCallback((index: number) => {
    setActiveStyle(index);
  }, []);

  return (
    <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade inView delay={0.1}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Redisena cualquier habitacion al instante.
              </span>
            </h2>
            <p className="text-zinc-400 mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Cambia muebles, prueba tapicerias o ensaya un estilo nuevo, y
              muestra a tus clientes la habitacion terminada antes de invertir
              un euro. Arrastra para comparar.
            </p>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.2}>
          <div className="relative">
            {/* Compare viewer */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={style.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ImageCompare
                    beforeImage={EMPTY_ROOM}
                    afterImage={style.image}
                    beforeLabel="Habitacion vacia"
                    afterLabel={style.label}
                    className="aspect-[16/9] rounded-2xl"
                    initialPosition={35}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Style pills */}
            <div className="mt-5 sm:mt-6 flex justify-center">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
                {STYLES.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = i === activeStyle;
                  return (
                    <button
                      key={s.key}
                      onClick={() => selectStyle(i)}
                      className={cn(
                        "relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300",
                        isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeInteriorStyle"
                          className="absolute inset-0 rounded-full border border-white/20 bg-white/10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <Icon className="relative z-10 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="relative z-10">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
