"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GalleryHorizontalEnd,
  Hotel,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BrickexExampleItem = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  aspectRatio: "cinema" | "portrait" | "square";
  ideaTitle: string;
  href: string;
};

export type BrickexExampleGroup = {
  id: "exteriors" | "interiors" | "amenities";
  label: string;
  description: string;
  items: BrickexExampleItem[];
};

const GROUP_ICONS = {
  exteriors: Building2,
  interiors: Hotel,
  amenities: GalleryHorizontalEnd,
} satisfies Record<BrickexExampleGroup["id"], typeof Building2>;

const GROUP_ACCENTS = {
  exteriors: "text-emerald-200 bg-emerald-400/10 border-emerald-300/20",
  interiors: "text-sky-200 bg-sky-400/10 border-sky-300/20",
  amenities: "text-amber-200 bg-amber-400/10 border-amber-300/20",
} satisfies Record<BrickexExampleGroup["id"], string>;

const ASPECT_CLASSES = {
  cinema: "aspect-[16/11]",
  portrait: "aspect-[4/5]",
  square: "aspect-square",
} satisfies Record<BrickexExampleItem["aspectRatio"], string>;

export default function ExamplesFromBrickexTabs({
  groups,
}: {
  groups: BrickexExampleGroup[];
}) {
  const [activeGroupId, setActiveGroupId] =
    useState<BrickexExampleGroup["id"]>("exteriors");

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId) ?? groups[0],
    [activeGroupId, groups],
  );

  if (!activeGroup) return null;

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/55 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/55">
            <Sparkles className="h-3.5 w-3.5 text-white/45" />
            Biblioteca de ideas
          </div>
          <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Mira lo que puedes crear con BrickEx
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:mt-5 sm:text-base lg:text-lg">
            Direcciones de render de la biblioteca BrickEx, agrupadas en sets
            listos para pitch decks, listings y revisiones de diseno. Cada una
            empezo con una subida sencilla.
          </p>
        </div>

        <div
          className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:mb-10"
          role="tablist"
          aria-label="Grupos de ejemplos de BrickEx"
        >
          {groups.map((group) => {
            const Icon = GROUP_ICONS[group.id];
            const isActive = group.id === activeGroup.id;

            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`brickex-examples-${group.id}`}
                onClick={() => setActiveGroupId(group.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-white/20 bg-white text-zinc-950"
                    : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {group.label}
              </button>
            );
          })}
        </div>

        <div
          id={`brickex-examples-${activeGroup.id}`}
          role="tabpanel"
          aria-label={activeGroup.label}
        >
          <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
              {activeGroup.description}
            </p>
            <Link
              href="/ideas"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Ver todas las ideas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {activeGroup.items.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                className="group block h-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900/55 shadow-[0_8px_48px_rgba(0,0,0,0.35)] hover:border-white/20 hover:bg-zinc-900/75"
              >
                <div
                  className={cn(
                    "relative w-full overflow-hidden bg-zinc-950",
                    ASPECT_CLASSES[item.aspectRatio],
                  )}
                >
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
                    quality={58}
                    loading="lazy"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                  <span
                    className={cn(
                      "absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md",
                      GROUP_ACCENTS[activeGroup.id],
                    )}
                  >
                    {activeGroup.label}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <p className="line-clamp-1 text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-white/55">
                      {item.ideaTitle}
                    </p>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
