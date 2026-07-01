"use client";

import { useId } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
import { TOOLS } from "@/lib/constants/tools";

function TransformationArrow() {
  const rawId = useId().replace(/:/g, "");
  const gradientId = `tool-arrow-gradient-${rawId}`;
  const glowId = `tool-arrow-glow-${rawId}`;

  return (
    <div className="relative flex min-h-[116px] items-center justify-center overflow-visible px-0.5 sm:min-h-[124px] sm:px-1 md:min-h-[136px]">
      <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.045] blur-xl" />
      <span className="absolute left-1/2 top-1/2 h-px w-9 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-[1px] sm:w-12" />

      <svg
        aria-hidden="true"
        viewBox="0 0 150 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-7 w-10 shrink-0 -rotate-[8deg] overflow-visible drop-shadow-[0_0_14px_rgba(255,255,255,0.22)] sm:h-8 sm:w-14 md:h-10 md:w-[4.5rem]"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="3"
            x2="148"
            y1="76"
            y2="12"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="rgb(161 161 170)" stopOpacity="0.36" />
            <stop offset="0.48" stopColor="white" stopOpacity="0.92" />
            <stop offset="1" stopColor="rgb(244 244 245)" stopOpacity="0.72" />
          </linearGradient>
          <filter
            id={glowId}
            x="-12"
            y="-12"
            width="174"
            height="106"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 1 0 1 0 0 1 0 0 1 0 1 0 0 0 0.36 0"
            />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M67.616 0.147978C57.1498 0.781251 46.3786 4.08834 38.3061 9.10762C31.9231 13.0949 25.4463 19.3807 20.0724 26.7689C15.5199 33.0312 11.249 40.1849 8.76149 45.6967C6.18015 51.4431 4.37323 57.0487 2.26123 65.7738C-0.226243 76.0234 -0.531333 79.0491 0.712402 80.8785C1.1348 81.5118 1.36949 81.6525 2.02656 81.6525H2.84789L3.01215 79.6589C3.15295 77.6887 3.36414 76.774 6.34441 66.0552C8.85535 56.9314 10.7796 51.7714 14.018 45.4152C19.5796 34.4854 27.9103 23.626 35.2554 17.8092C42.5066 12.0629 51.1658 8.5447 61.984 6.90288C63.3216 6.71525 66.1845 6.59798 69.8453 6.59798C76.1813 6.62143 78.9269 6.90288 83.8315 8.09907C93.8987 10.5852 100.352 14.3614 113.259 25.3382C115.817 27.5194 121.003 32.4918 121.003 32.7732C121.003 32.8436 120.346 32.7732 119.548 32.6091C117.389 32.1634 116.286 32.2103 115.136 32.8202C113.939 33.4534 113.024 34.9311 113.024 36.2211C113.024 38.1678 114.291 39.5985 117.131 40.8651C117.905 41.1934 121.918 43.1636 126.048 45.2276C134.332 49.3791 135.857 50.0358 139.494 51.0443C143.906 52.2874 146.511 51.9356 148.271 49.8951C149.82 48.0891 150.031 45.6498 148.858 43.2574C148.506 42.5772 147.027 40.4898 145.549 38.6134C142.404 34.6496 141.7 33.5472 140.433 30.592C139.236 27.8009 138.18 24.0951 136.843 18.0438C134.543 7.44234 134.684 7.95834 134.027 8.61507C133.229 9.41252 132.032 17.8796 132.032 22.7112C132.032 26.1122 132.29 28.1996 133.088 31.4832C133.393 32.7732 133.628 33.8287 133.604 33.8522C133.581 33.8756 132.76 32.8202 131.797 31.5067C127.503 25.69 116.826 16.3551 107.275 10.0927C99.4838 5.00307 92.6784 2.35271 83.4091 0.851615C78.3872 0.0307056 73.248 -0.180385 67.616 0.147978Z"
          fill={`url(#${gradientId})`}
          filter={`url(#${glowId})`}
        />
        <path
          d="M27 35C48 9 85 7 121 34"
          stroke="white"
          strokeLinecap="round"
          strokeWidth="3"
          opacity="0.22"
        />
      </svg>
    </div>
  );
}

function PreviewPane({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 767px) 42vw, (max-width: 1279px) 42vw, 260px"
          quality={55}
          loading="lazy"
          className="object-cover"
        />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
        <span className="absolute left-2 top-2 rounded-md border border-white/10 bg-black/45 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/65 backdrop-blur-md sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.18em]">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function ToolTransformations() {
  const tools = TOOLS.filter((tool) => tool.inputPreview && tool.outputPreview);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <BlurFade inView delay={0.1}>
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/55">
              <Sparkles className="h-3.5 w-3.5 text-white/45" />
              Biblioteca de herramientas
            </div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Una app que reemplaza todo tu kit de herramientas
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:mt-5 sm:text-base lg:text-lg">
              Renders, modelos 3D, diagramas, interiores y paisajes: cada
              trabajo empieza con un archivo que ya tienes y termina con un
              visual listo para presentar. Subelo, elige el resultado y listo.
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const inputPreview = tool.inputPreview ?? tool.sampleInputImage;
            const outputPreview = tool.outputPreview ?? tool.coverImage;

            return (
              <BlurFade key={tool.id} inView delay={0.12 + index * 0.035}>
                <article className="group h-full rounded-2xl border border-white/10 bg-zinc-900/45 p-3 shadow-[0_8px_48px_rgba(0,0,0,0.35)] sm:p-4">
                  <div className="mb-4 flex min-h-[72px] items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                      <Icon className="h-[18px] w-[18px] text-white/70" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                        {tool.label}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                    <PreviewPane
                      src={inputPreview}
                      alt={`${tool.label} input`}
                      label="Entrada"
                    />
                    <TransformationArrow />
                    <PreviewPane
                      src={outputPreview}
                      alt={`${tool.label} output`}
                      label="Salida"
                    />
                  </div>
                </article>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
