import Image from "next/image";
import {
  ArrowRight,
  BoxSelect,
  Building2,
  Check,
  ChevronDown,
  Palette,
  Sparkles,
  Wand2,
} from "lucide-react";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
import { Button } from "@/components/ui/button";
import { AutoplayVideo } from "@/components/ui/autoplay-video";
import { getSignupUrl } from "@/lib/app-url";
import { cn } from "@/lib/utils";

const STYLE_OPTIONS = [
  { label: "Moderno", image: "/architecture-styles/modern.jpg", active: true },
  { label: "Mediterraneo", image: "/architecture-styles/mediterranean.jpg" },
  { label: "Brutalista", image: "/architecture-styles/brutalist.jpg" },
  { label: "Japones", image: "/architecture-styles/japanese.jpg" },
  { label: "Lujo", image: "/architecture-styles/luxury.jpg" },
  { label: "Industrial", image: "/architecture-styles/industrial.jpg" },
];

const MATERIAL_OPTIONS = [
  { label: "Marmol", image: "/textures/marble.png", active: true },
  { label: "Madera de roble", image: "/textures/oakwood.png", active: true },
  { label: "Hormigon", image: "/textures/concrete-polished.png" },
  { label: "Ladrillo", image: "/textures/brick.png" },
  { label: "Terracotta", image: "/textures/terracotta.png" },
  { label: "Metal", image: "/textures/polished-metal.png" },
];

const FEATURE_ROWS = [
  {
    eyebrow: "Edicion exterior",
    title: "Decide como se ve, hasta el ultimo detalle.",
    body:
      "Empieza con un boceto o modelo preliminar y define el tipo de toma, estilo arquitectonico, material de fachada, entorno e iluminacion. Obtienes lo que pediste, no una interpretacion aleatoria.",
    icon: Building2,
    media: {
      type: "video" as const,
      src: "/videos/exterior-render.mp4",
      label: "Configuracion de render exterior",
    },
  },
  {
    eyebrow: "Edicion por zona",
    title: "Cambia una cosa y conserva el resto.",
    body:
      "Selecciona una puerta, una fachada o el jardin, describe el cambio y solo se actualiza esa parte. El resto del render queda como estaba.",
    icon: BoxSelect,
    reverse: true,
    media: {
      type: "video" as const,
      src: "/videos/0701.mp4",
      label: "Prompt de zona seleccionada",
    },
  },
  {
    eyebrow: "Controles visuales",
    title: "Elige estilos y materiales visualmente.",
    body:
      "Sin escribir prompts. Explora miniaturas de estilos reales y muestras de materiales, toca las que quieras y se aplican a tu render.",
    icon: Palette,
    media: {
      type: "controls" as const,
      label: "Selector de estilo y materiales",
    },
  },
];

function FeatureCopy({
  eyebrow,
  title,
  body,
  icon: Icon,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  body: string;
  icon: typeof Building2;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col justify-center">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
        <Icon className="h-5 w-5 text-white/70" />
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/35">
        {eyebrow}
      </p>
      <h3 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h3>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base lg:text-lg">
        {body}
      </p>
      <Button
        variant="white"
        size="lg"
        className="mt-7 min-h-[52px] w-full max-w-[230px] px-7 text-base font-semibold sm:w-fit"
        asChild
      >
        <a href={ctaHref}>
          Empezar a crear
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

function VideoPanel({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
      <AutoplayVideo
        src={src}
        aria-label={label}
        controls
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}

function StyleDropdownPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Elige cualquier estilo
        </p>
        <Sparkles className="h-3.5 w-3.5 text-white/35" />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-neutral-700/50 bg-neutral-800/60 p-2">
        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-neutral-700">
          <Image
            src="/architecture-styles/modern.jpg"
            alt=""
            fill
            sizes="40px"
            quality={50}
            loading="lazy"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white">Moderno</p>
          <p className="text-[10px] text-neutral-500">Estilo arquitectonico</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
      </div>

      <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-neutral-800 bg-black/30 p-2">
        {STYLE_OPTIONS.map((option) => (
          <div
            key={option.label}
            className={cn(
              "relative rounded-lg p-1.5 transition-colors",
              option.active ? "bg-white/10 ring-1 ring-white/20" : "bg-neutral-900/70"
            )}
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-800">
              <Image
                src={option.image}
                alt=""
                fill
                sizes="90px"
                quality={50}
                loading="lazy"
                className="object-cover"
              />
            </div>
            <p className="mt-1 truncate text-center text-[10px] font-medium text-neutral-300">
              {option.label}
            </p>
            {option.active ? (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                <Check className="h-2.5 w-2.5 text-black" />
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialDropdownPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Elige cualquier material
        </p>
        <Wand2 className="h-3.5 w-3.5 text-white/35" />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-neutral-700/50 bg-neutral-800/60 p-2">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-neutral-700">
          <div className="flex -space-x-1.5">
            {MATERIAL_OPTIONS.filter((option) => option.active).map((option) => (
              <span
                key={option.label}
                className="relative h-5 w-5 overflow-hidden rounded-full ring-1 ring-neutral-900"
              >
                <Image
                  src={option.image}
                  alt=""
                  fill
                  sizes="20px"
                  quality={45}
                  loading="lazy"
                  className="object-cover"
                />
              </span>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white">
            2 materiales seleccionados
          </p>
          <p className="text-[10px] text-neutral-500">
            Marmol y madera de roble
          </p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-neutral-800 bg-black/30 p-2">
        {MATERIAL_OPTIONS.map((option) => (
          <div
            key={option.label}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-lg p-1.5",
              option.active ? "bg-white/10 ring-1 ring-white/20" : "bg-neutral-900/70"
            )}
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-neutral-800">
              <Image
                src={option.image}
                alt=""
                fill
                sizes="48px"
                quality={45}
                loading="lazy"
                className="object-cover"
              />
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.34),transparent_35%),radial-gradient(circle_at_72%_82%,rgba(0,0,0,0.45),transparent_42%)]" />
            </div>
            <p className="w-full truncate text-center text-[10px] font-medium text-neutral-300">
              {option.label}
            </p>
            {option.active ? (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                <Check className="h-2.5 w-2.5 text-black" />
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ControlsPanel() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.42)] sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-white">Transformacion de estilo</p>
          <p className="text-[10px] text-white/35">Controles de direccion visual</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-white/50">
          Ajustes en vivo
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <StyleDropdownPreview />
          <MaterialDropdownPreview />
        </div>

        <div className="flex min-h-12 items-center justify-between rounded-xl border border-white/10 bg-white px-4 py-3 text-black">
          <span className="text-sm font-semibold">Generar render</span>
          <Sparkles className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function FeatureMedia({
  media,
}: {
  media:
    | { type: "video"; src: string; label: string }
    | { type: "controls"; label: string };
}) {
  if (media.type === "video") {
    return <VideoPanel src={media.src} label={media.label} />;
  }

  return <ControlsPanel />;
}

export default function WorkflowFeatureRows() {
  const signupUrl = getSignupUrl();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:96px_96px]" />

      <div className="relative mx-auto max-w-6xl space-y-20 px-4 sm:px-6 lg:space-y-28 lg:px-8">
        {FEATURE_ROWS.map((row, index) => (
          <BlurFade key={row.eyebrow} inView delay={0.1 + index * 0.08}>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={cn(row.reverse && "lg:order-2")}>
                <FeatureCopy
                  eyebrow={row.eyebrow}
                  title={row.title}
                  body={row.body}
                  icon={row.icon}
                  ctaHref={signupUrl}
                />
              </div>

              <div className={cn(row.reverse && "lg:order-1")}>
                <FeatureMedia media={row.media} />
              </div>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
