"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getSignupUrl } from "@/lib/app-url";
import { BlurFade } from "@/components/ui/blur-fade";

const TRANSFORM =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/render/image/public/objects/seo-gallery";

function opt(slug: string, file: string) {
  return `${TRANSFORM}/${slug}/${file}.png?width=480&resize=contain&quality=70`;
}

const GALLERY_CARDS = [
  {
    title: "Yacht Life",
    src: opt("yacht-life-aesthetic", "champagne-toast-sunset"),
    flexValue: "$4.2M",
    location: "Monaco",
  },
  {
    title: "St. Tropez Summer",
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(12).png",
    flexValue: "$15.3M",
    location: "St. Tropez",
  },
  {
    title: "Dubai Penthouse",
    src: opt("dubai-penthouse", "daylight-living-room-loro-piana"),
    flexValue: "$12.8M",
    location: "Dubai",
  },
  {
    title: "Private Jet",
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/FLUX%202%20Customizable%20Text-to-Image%20AI.jpg",
    flexValue: "$75M",
    location: "30,000ft",
  },
  {
    title: "Maldives Villa",
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(5).png",
    flexValue: "$2.1M",
    location: "Maldives",
  },
  {
    title: "Aspen Chalet",
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(14).png",
    flexValue: "$22.1M",
    location: "Aspen",
  },
  {
    title: "Ferrari SF90",
    src: opt("ferrari-sf90-stradale", "ferrari-sunset-penthouse-terrace"),
    flexValue: "$890K",
    location: "Monaco",
  },
  {
    title: "Ibiza Nightlife",
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(15).png",
    flexValue: "$6.4M",
    location: "Ibiza",
  },
  {
    title: "Lake Como Villa",
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(16).png",
    flexValue: "$18.9M",
    location: "Lake Como",
  },
  {
    title: "Rolls Royce",
    src: opt("rolls-royce-phantom", "cigar-and-cognac-in-phantom"),
    flexValue: "$3.5M",
    location: "London",
  },
  {
    title: "Hamptons Estate",
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(17).png",
    flexValue: "$11.2M",
    location: "Hamptons",
  },
  {
    title: "Monaco Seaside",
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Flux%202%20Multi-Reference%20Image%20Editor%20(1).jpg",
    flexValue: "$4.2M",
    location: "Monaco",
  },
];

function GalleryCard({
  card,
  index,
  hovered,
  setHovered,
}: {
  card: (typeof GALLERY_CARDS)[0];
  index: number;
  hovered: number | null;
  setHovered: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-xl sm:rounded-2xl relative bg-neutral-900 overflow-hidden h-60 sm:h-72 md:h-80 lg:h-96 w-full transition-all duration-300 ease-out border border-neutral-800/50",
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        className="object-cover absolute inset-0 w-full h-full"
        loading="lazy"
        decoding="async"
        width={480}
        height={384}
      />
      {/* Always-visible gradient on mobile, hover on desktop */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-4 transition-opacity duration-300",
          "sm:opacity-0",
          hovered === index && "sm:opacity-100",
        )}
      >
        <div className="text-base sm:text-lg md:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          {card.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs sm:text-sm font-medium text-white/80">
            {card.flexValue}
          </span>
          <span className="text-neutral-600 text-xs">·</span>
          <span className="text-xs sm:text-sm text-neutral-400">
            {card.location}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PhotoGallery() {
  const [hovered, setHovered] = useState<number | null>(null);
  const signupUrl = getSignupUrl();

  return (
    <section className="relative py-12 sm:py-24 lg:py-32 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-6 sm:mb-14 lg:mb-16 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                See What Richflex Can Do
              </span>
            </h2>
            <p className="text-neutral-500 mt-2 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
              Real users. Real AI. Real "who tf is funding your lifestyle?"
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-8 sm:mb-16">
          {GALLERY_CARDS.map((card, index) => (
            <BlurFade key={card.title} delay={0.05 * index} inView>
              <GalleryCard
                card={card}
                index={index}
                hovered={hovered}
                setHovered={setHovered}
              />
            </BlurFade>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <Button
            asChild
            variant="white"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg w-full sm:w-auto"
          >
            <a href={signupUrl}>
              Create Your Free Photos
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
          <p className="text-sm text-neutral-600">
            No credit card needed. Takes 10 seconds.
          </p>
        </div>
      </div>
    </section>
  );
}
