"use client";

import NextImage from "next/image";
import { Sparkles, Instagram, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignupUrl } from "@/lib/app-url";

export default function ThreeStepGuide() {
  return (
    <section className="relative py-10 sm:py-16 lg:py-20">
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />
      
      {/* Subtle separator gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-6 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight px-2">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              3 Steps to Look Like a Billionaire
            </span>
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-4xl mx-auto">

          {/* ─────────────────────────────────────────────────────────────
              STEP 1: Upload Normal Photo
          ───────────────────────────────────────────────────────────── */}
          <div className="group relative">
            {/* Step Number Badge */}
            <div className="absolute -top-1.5 -left-1.5 z-20 w-7 h-7 rounded-full bg-gradient-to-br from-white to-neutral-300 flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-black">1</span>
            </div>

            {/* Card */}
            <div className="relative h-full rounded-lg border border-white/10 bg-zinc-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/50">
              {/* Image Container */}
              <div className="relative w-full aspect-[4/5] bg-zinc-950/50 overflow-hidden">
                {/* Normal person selfie */}
                <NextImage
                  src="https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/landing-chick.png"
                  alt="Upload your normal selfie photo"
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 768px) 85vw, 33vw"
                  className="object-cover"
                  priority
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
              </div>

              {/* Label */}
              <div className="p-2.5 sm:p-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white mb-0.5">
                  Upload Your Selfie
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-500">
                  Any normal phone photo works
                </p>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: Luxury Objects Grid
          ───────────────────────────────────────────────────────────── */}
          <div className="group relative">
            {/* Step Number Badge */}
            <div className="absolute -top-1.5 -left-1.5 z-20 w-7 h-7 rounded-full bg-gradient-to-br from-white to-neutral-300 flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-black">2</span>
            </div>

            {/* Card */}
            <div className="relative h-full rounded-lg border border-white/10 bg-zinc-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/50">
              {/* Image Container - 2x2 Grid of Luxury Objects */}
              <div className="relative w-full aspect-[4/5] bg-zinc-950/50 overflow-hidden">
                <div className="grid grid-cols-2 grid-rows-2 gap-1 p-2 h-full">
                  {/* Hermès Birkin */}
                  <div className="relative rounded-lg bg-zinc-900/80 border border-white/5 overflow-hidden group/item hover:border-white/20 transition-colors">
                    <NextImage
                      src="https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/hermes-birkin.png"
                      alt="Hermès Birkin 30 luxury handbag"
                      fill
                      sizes="150px"
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Rolex Day-Date */}
                  <div className="relative rounded-lg bg-zinc-900/80 border border-white/5 overflow-hidden group/item hover:border-white/20 transition-colors">
                    <NextImage
                      src="https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/rolex-daydate.png"
                      alt="Rolex Day-Date luxury watch"
                      fill
                      sizes="150px"
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Van Cleef & Arpels Alhambra */}
                  <div className="relative rounded-lg bg-zinc-900/80 border border-white/5 overflow-hidden group/item hover:border-white/20 transition-colors">
                    <NextImage
                      src="https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/vca-alhambra.png"
                      alt="Van Cleef & Arpels Alhambra luxury jewelry"
                      fill
                      sizes="150px"
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Chanel Classic Flap */}
                  <div className="relative rounded-lg bg-zinc-900/80 border border-white/5 overflow-hidden group/item hover:border-white/20 transition-colors">
                    <NextImage
                      src="https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/chanel-classic-flap.png"
                      alt="Chanel Classic Flap luxury handbag"
                      fill
                      sizes="150px"
                      className="object-contain p-2"
                    />
                  </div>
                </div>

                {/* AI Sparkle Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-600/20 border border-amber-400/30 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="p-2.5 sm:p-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white mb-0.5">
                  Choose Your Flex
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-500">
                  Birkin, Rolex, Van Cleef & Chanel
                </p>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              STEP 3: Instagram / Share
          ───────────────────────────────────────────────────────────── */}
          <div className="group relative">
            {/* Step Number Badge */}
            <div className="absolute -top-1.5 -left-1.5 z-20 w-7 h-7 rounded-full bg-gradient-to-br from-white to-neutral-300 flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-black">3</span>
            </div>

            {/* Card */}
            <div className="relative h-full rounded-lg border border-white/10 bg-zinc-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/50">
              {/* Image Container - Instagram Post Mock */}
              <div className="relative w-full aspect-[4/5] bg-zinc-950/50 overflow-hidden">
                {/* Instagram UI Mock */}
                <div className="absolute inset-0 flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-zinc-900/60 backdrop-blur-sm border-b border-white/5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">you</p>
                      <p className="text-[10px] text-zinc-500">Just now</p>
                    </div>
                  </div>

                  {/* Post Content - Luxury Photo */}
                  <div className="flex-1 relative">
                    <NextImage
                      src="https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/landing-after.png"
                      alt="Your luxury lifestyle photo on Instagram"
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 768px) 85vw, 33vw"
                      className="object-cover"
                    />
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 to-transparent" />
                  </div>

                  {/* Engagement Icons */}
                  <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-zinc-900/60 backdrop-blur-sm border-t border-white/5">
                    <div className="flex items-center gap-1">
                      <span className="text-base sm:text-lg">❤️</span>
                      <span className="text-xs text-zinc-400">1.2k</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base sm:text-lg">💬</span>
                      <span className="text-xs text-zinc-400">89</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base sm:text-lg">📤</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="p-2.5 sm:p-3">
                <h3 className="text-xs sm:text-sm font-semibold text-white mb-0.5">
                Look Rich Online
                </h3>
                <p className="text-[10px] sm:text-xs text-zinc-500">
                  Instagram-ready instantly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Line */}
        <div className="text-center mt-6 sm:mt-8 lg:mt-10 px-4">
          <p className="text-xs sm:text-sm text-zinc-500">
            No Photoshop. No studio. No skills needed.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-6 sm:mt-8">
          <Button
            asChild
            variant="white"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg"
          >
            <a href={getSignupUrl()}>
              See Your First Image
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

