"use client";

import { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignupUrl } from "@/lib/app-url";

// Gallery data
const GALLERY_ITEMS = [
  {
    id: 1,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Flux%202%20Multi-Reference%20Image%20Editor%20(1).jpg",
    flexValue: "$4.2M",
    location: "Monaco",
    alt: "AI-generated luxury lifestyle photo: seaside yacht vibe in Monaco",
  },
  {
    id: 2,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(12).png",
    flexValue: "$15.3M",
    location: "St. Tropez",
    alt: "AI-generated luxury lifestyle photo: St. Tropez summer scene with supercar energy",
  },
  {
    id: 3,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Capture-2025-12-04-154731.png",
    flexValue: "$12.8M",
    location: "Beverly Hills",
    alt: "AI-generated luxury lifestyle photo: Beverly Hills mansion driveway and exotic car vibe",
  },
  {
    id: 4,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(13).png",
    flexValue: "$8.7M",
    location: "Mykonos",
    alt: "AI-generated luxury lifestyle photo: Mykonos white-stone villa and sunset terrace",
  },
  {
    id: 5,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(4).png",
    flexValue: "$890K",
    location: "Dubai",
    alt: "AI-generated luxury lifestyle photo: Dubai skyline at night with high-end city flex",
  },
  {
    id: 6,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(14).png",
    flexValue: "$22.1M",
    location: "Aspen",
    alt: "AI-generated luxury lifestyle photo: Aspen winter chalet and luxury ski trip vibe",
  },
  {
    id: 7,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(5).png",
    flexValue: "$2.1M",
    location: "Maldives",
    alt: "AI-generated luxury lifestyle photo: Maldives overwater villa and tropical resort scene",
  },
  {
    id: 8,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(15).png",
    flexValue: "$6.4M",
    location: "Ibiza",
    alt: "AI-generated luxury lifestyle photo: Ibiza nightlife and premium vacation aesthetic",
  },
  {
    id: 9,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/FLUX%202%20Customizable%20Text-to-Image%20AI.jpg",
    flexValue: "$75M",
    location: "Private Jet",
    alt: "AI-generated luxury lifestyle photo: private jet interior and first-class travel vibe",
  },
  {
    id: 10,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(16).png",
    flexValue: "$18.9M",
    location: "Lake Como",
    alt: "AI-generated luxury lifestyle photo: Lake Como villa and classic European luxury scenery",
  },
  {
    id: 11,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(17).png",
    flexValue: "$3.5M",
    location: "Hamptons",
    alt: "AI-generated luxury lifestyle photo: Hamptons estate and old money summer vibe",
  },
  {
    id: 12,
    src: "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(18).png",
    flexValue: "$11.2M",
    location: "Dubai",
    alt: "AI-generated luxury lifestyle photo: Dubai penthouse view with ultra-luxury aesthetic",
  },
];

function GalleryCard({
  item,
  hideOnMobile,
}: {
  item: (typeof GALLERY_ITEMS)[0];
  hideOnMobile?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={`break-inside-avoid mb-2 sm:mb-4 ${hideOnMobile ? "hidden sm:block" : ""}`}
      >
        <Dialog.Trigger asChild>
          <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-800/50 cursor-pointer aspect-[3/4]">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-3 sm:p-4">
              {item.flexValue && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs font-medium text-amber-400/90 tracking-wide">
                    {item.flexValue}
                  </span>
                  <span className="text-neutral-500 text-[10px] sm:text-xs">
                    ·
                  </span>
                  <span className="text-[10px] sm:text-xs text-neutral-400">
                    {item.location}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-4xl sm:max-h-[90vh] flex items-center justify-center outline-none">
          {/* Close button - always visible */}
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 backdrop-blur-sm border border-neutral-700 text-white hover:bg-black/90 active:bg-black transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>

          {/* Mobile: full screen image */}
          <div className="sm:hidden w-full h-full bg-black flex items-center justify-center relative">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {item.flexValue && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-base font-semibold text-white">
                    {item.flexValue}
                  </span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-sm text-neutral-400">
                    {item.location}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: contained modal */}
          <div className="hidden sm:flex relative w-full h-auto max-h-full rounded-2xl overflow-hidden border border-neutral-800/50 bg-neutral-950 flex-col">
            <div className="relative flex-1 flex items-center justify-center overflow-hidden aspect-[4/3]">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="896px"
                className="object-contain"
              />
            </div>
            {item.flexValue && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-lg font-semibold text-white">
                    {item.flexValue}
                  </span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-base text-neutral-400">
                    {item.location}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function SocialProofSection() {
  return (
    <section className="relative py-12 sm:py-24 lg:py-32 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Gallery Header */}
        <div className="text-center mb-6 sm:mb-14 lg:mb-16 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              See what BrickEx can do.
            </span>
          </h2>
          <p className="text-neutral-500 mt-2 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
            Real users. Real AI. Real "who tf is funding your lifestyle?"
          </p>
        </div>

        {/* Masonry Grid - 2 cols mobile, 2 cols tablet, 3 cols desktop */}
        <div className="columns-2 lg:columns-3 gap-2 sm:gap-4 mb-8 sm:mb-16 lg:mb-20">
          {GALLERY_ITEMS.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              hideOnMobile={item.id === 1 || item.id === 9}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            asChild
            variant="white"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg w-full sm:w-auto"
          >
            <a href={getSignupUrl()}>
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
