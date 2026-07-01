import Image from "next/image";
import { AlertTriangle, Check, Clock3, X } from "lucide-react";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
import { cn } from "@/lib/utils";

const COST_COMPARISON = [
  {
    label: "Estudio CGI tradicional",
    tag: "La forma antigua",
    headline: "$500–5K",
    subhead: "por cada render",
    points: [
      "Dias o semanas de idas y vueltas por cada render",
      "Cada ajuste exige un nuevo brief, presupuesto y factura",
      "Dependes del calendario de otra persona",
    ],
    highlight: false,
  },
  {
    label: "BrickEx",
    tag: "La forma mejor",
    headline: "$29/mo",
    subhead: "por hasta 200 renders",
    points: [
      "Resultados fotorrealistas en segundos, no en semanas",
      "Itera tantas veces como quieras, sin coste extra",
      "Sube los archivos que ya tienes y exporta al instante",
    ],
    highlight: true,
  },
];

function CostCard({ item }: { item: (typeof COST_COMPARISON)[number] }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border p-5 sm:p-6",
        item.highlight
          ? "z-10 border-white/15 bg-zinc-900 shadow-[0_24px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/10 lg:scale-[1.04]"
          : "border-white/5 bg-zinc-950/40 opacity-80 grayscale lg:scale-[0.96]",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border",
              item.highlight
                ? "border-emerald-400/20 bg-emerald-400/[0.08]"
                : "border-white/10 bg-white/[0.04]",
            )}
          >
            {item.highlight ? (
              <Image
                src="/brickex-logo.png"
                alt=""
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
            ) : (
              <Clock3 className="h-5 w-5 text-white/50" />
            )}
          </div>
          <p className="text-sm font-semibold text-white">{item.label}</p>
        </div>

        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-medium",
            item.highlight
              ? "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300"
              : "border-white/10 bg-white/[0.03] text-white/40",
          )}
        >
          {item.tag}
        </span>
      </div>

      <div className="mt-7">
        <p className="text-4xl font-semibold text-white sm:text-5xl">
          {item.headline}
        </p>
        <p className="mt-2 text-sm font-medium text-white/50">
          {item.subhead}
        </p>
      </div>

      <div className="mt-6 space-y-2.5 border-t border-white/10 pt-5">
        {item.points.map((point) => (
          <div key={point} className="flex items-start gap-2.5">
            {item.highlight ? (
              <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
            ) : (
              <X className="mt-0.5 h-4 w-4 flex-none text-white/25" />
            )}
            <p
              className={cn(
                "text-sm leading-relaxed",
                item.highlight ? "text-white/75" : "text-white/45",
              )}
            >
              {point}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProblemSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(24,24,27,0.38),transparent)] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <BlurFade inView delay={0.1}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/55">
              <AlertTriangle className="h-3.5 w-3.5 text-white/45" />
              El problema
            </div>

            <h2 className="text-balance text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Un render no deberia costar una semana y una fortuna
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base lg:text-lg">
              Durante anos, conseguir buenos visuales significaba aceptar un
              intercambio brutal: pagar miles a un estudio y esperar semanas, o
              conformarte con una IA generica que ignora tu diseno real. BrickEx
              te da velocidad y precision por una fraccion del precio.
            </p>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.2}>
          <div className="mt-14 grid gap-6 sm:mt-16 lg:grid-cols-2 lg:gap-10">
            <CostCard item={COST_COMPARISON[0]} />
            <CostCard item={COST_COMPARISON[1]} />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
