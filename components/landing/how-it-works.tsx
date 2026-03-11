"use client";

import NextImage from "next/image";
import { CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";
import { Upload, Image as ImageIcon, DollarSign } from "lucide-react";

// Luxury objects for the marquee
const luxuryObjects = [
  {
    name: "Private Jet",
    value: "$75M",
    img: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/gulfstream-g700.png",
  },
  {
    name: "Ferrari SF90",
    value: "$625k",
    img: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/ferrari-sf90.png",
  },
  {
    name: "Rolex Daytona",
    value: "$42k",
    img: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/rolex-daytona.png",
  },
  {
    name: "Ace of Spades",
    value: "$400",
    img: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/ace-of-spades.png",
  },

  {
    name: "Patek Philippe",
    value: "$185k",
    img: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/patek-nautilus.png",
  },
  {
    name: "Bugatti Chiron",
    value: "$3.2M",
    img: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/bugatti-chiron.png",
  },
  {
    name: "Lamborghini Revuelto",
    value: "$608k",
    img: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/lamborghini-revuelto.png",
  },
];

// Eyebrow component
function StepEyebrow({ step }: { step: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.25em] uppercase text-zinc-500 mb-4">
      Step {step}
    </span>
  );
}

// Object tile for marquee
function ObjectTile({
  name,
  value,
  img,
}: {
  name: string;
  value: string;
  img: string;
}) {
  return (
    <div className="flex-shrink-0 w-[140px] sm:w-[160px] group mx-1.5 sm:mx-2">
      <div className="relative h-full rounded-xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-2.5 transition-all duration-300 hover:border-white/20 hover:bg-zinc-900 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1">
        {/* Image container */}
        <div className="relative w-full aspect-[4/3] rounded-lg bg-zinc-950/50 mb-2.5 overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors">
          {/* Radial gradient highlight behind object */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

          <NextImage
            src={img}
            alt={`${name} luxury item worth ${value} available in BrickEx AI photo generator`}
            fill
            sizes="160px"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
          />
        </div>

        {/* Object info */}
        <div className="px-1 space-y-1.5">
          <p className="text-xs font-semibold text-zinc-100 truncate tracking-tight">
            {name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-semibold">
              Value
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">
              {value}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32">
      {/* Subtle gradient overlay for section separation */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/30 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-20 lg:mb-24 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              How BrickEx Works
            </span>
          </h2>
          <p className="text-zinc-400 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            From regular selfies to "I inherited a shipping company" energy in
            three steps.
          </p>
        </div>

        {/* Steps Container */}
        <div className="space-y-16 sm:space-y-24 lg:space-y-32">
          {/* ─────────────────────────────────────────────────────────────
              STEP 1: Upload Selfies
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">
            {/* Screenshot Card - Left */}
            <div>
              <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
                <CardContent className="p-8 sm:p-10">
                  <div className="aspect-[4/3] rounded-2xl bg-neutral-900 border border-neutral-800/50 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

                    {/* Upload UI Mock */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-4 shadow-lg">
                        <Upload className="w-7 h-7 text-zinc-400" />
                      </div>
                      <p className="text-zinc-300 font-medium mb-1">
                        Drop selfies here
                      </p>
                      <p className="text-zinc-500 text-sm">
                        or click to browse
                      </p>

                      {/* Fake file pills */}
                      <div className="flex gap-2 mt-6">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/40"
                          >
                            <ImageIcon className="w-3 h-3 text-zinc-500" />
                            <span className="text-xs text-zinc-400">
                              selfie_{i}.jpg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>

            {/* Text - Right */}
            <div>
              <StepEyebrow step={1} />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-3 sm:mb-4">
                Upload your selfies.
              </h3>
              <p className="text-zinc-400 leading-relaxed max-w-md text-sm sm:text-base">
                3–4 regular phone pics. No makeup team, no ring light, no
                stress. We keep them private and only use them to build your
                BrickEx looks.
              </p>
              <p className="text-zinc-500 text-xs sm:text-sm mt-2 sm:mt-3">
                Works with normal phone photos. No studio required.
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: Pick Your Flex
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">
            {/* Text - Left (on desktop) */}
            <div className="order-2 md:order-1">
              <StepEyebrow step={2} />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-3 sm:mb-4">
                Pick your flex.
              </h3>
              <p className="text-zinc-400 leading-relaxed max-w-md text-sm sm:text-base">
                Jets, Ferraris, villas, yachts, private islands, Old Money vibes
                — or mix and match your own objects. We turn your choices into
                the perfect billionaire shot.
              </p>
              <div className="mt-3 sm:mt-5 space-y-1.5 sm:space-y-2">
                <p className="text-zinc-500 text-xs sm:text-sm">
                  <span className="text-zinc-400">Scenes:</span> Private Jet ·
                  Penthouse · Yacht Deck · Old Money Library
                </p>
                <p className="text-zinc-500 text-xs sm:text-sm">
                  <span className="text-zinc-400">Objects:</span> Ferrari ·
                  Bugatti · Rolex · Patek · Mansion…
                </p>
              </div>
            </div>

            {/* Object Catalog Card - Right (on desktop) */}
            <div className="order-1 md:order-2">
              <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />

                <CardContent className="p-6">
                  {/* Marquee Container */}
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-950/90 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950/90 to-transparent z-10 pointer-events-none" />

                    {/* First row */}
                    <Marquee pauseOnHover className="[--duration:35s] mb-2">
                      {luxuryObjects
                        .slice(0, Math.ceil(luxuryObjects.length / 2))
                        .map((obj, idx) => (
                          <ObjectTile
                            key={idx}
                            name={obj.name}
                            value={obj.value}
                            img={obj.img}
                          />
                        ))}
                    </Marquee>

                    {/* Second row - reverse direction */}
                    <Marquee pauseOnHover reverse className="[--duration:40s]">
                      {luxuryObjects
                        .slice(Math.ceil(luxuryObjects.length / 2))
                        .map((obj, idx) => (
                          <ObjectTile
                            key={idx}
                            name={obj.name}
                            value={obj.value}
                            img={obj.img}
                          />
                        ))}
                    </Marquee>
                  </div>
                </CardContent>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              STEP 3: Receive Billionaire Shots
          ───────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">
            {/* Gallery Card - Left */}
            <div>
              <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
                <CardContent className="p-8 sm:p-10">
                  <div className="aspect-[4/3] rounded-2xl bg-neutral-950 border border-neutral-800/50 relative overflow-hidden">
                    {/* Softer background gradient with more subtle fade */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/5 via-zinc-900/60 to-zinc-950/90 pointer-events-none z-10" />
                    <NextImage
                      src="https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/FLUX%202%20Multi-Reference%20Image%20Editor.jpg"
                      alt="Example AI-generated luxury lifestyle photo showing yacht deck with $4.2M flex worth"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-center"
                    />

                    {/* Bottom overlay with flex value */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950/95 via-zinc-950/80 to-transparent z-20">
                      <div className="flex items-center justify-between">
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider">
                            Flex Worth
                          </p>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-zinc-400" />
                            <span className="text-lg font-semibold text-zinc-400">
                              $4.2M
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>

            {/* Text - Right */}
            <div>
              <StepEyebrow step={3} />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-3 sm:mb-4">
                Receive billionaire shots.
              </h3>
              <p className="text-zinc-400 leading-relaxed max-w-md text-sm sm:text-base">
                Photorealistic, Instagram-ready, 4K exports. Every image gets a
                Flex Worth calculated automatically so you can climb the global
                leaderboard.
              </p>
              <p className="text-zinc-500 text-xs sm:text-sm mt-2 sm:mt-3">
                Download and share anywhere. Your friends won't believe it's AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
