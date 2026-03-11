"use client";

import { Button } from "@/components/ui/button";
import { getSignupUrl } from "@/lib/app-url";
import { ArrowRight } from "lucide-react";

// Image URLs
const BEFORE_IMAGE =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Google%20Nano%20Banana%202%20(15).png";
const AFTER_IMAGE =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Richflex%20(50).png";

// Floating luxury items from lib/constants/object.ts
const FLOATING_ITEMS = [
  {
    name: "Van Cleef Alhambra",
    image:
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/vca-alhambra.png",
    animation: "float-1",
  },
  {
    name: "Hermès Birkin",
    image:
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/hermes-birkin.png",
    animation: "float-2",
  },
  {
    name: "Rolex Lady-Datejust",
    image:
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/rolex-lady-datejust.png",
    animation: "float-3",
  },
  {
    name: "Rimowa Classic Cabin",
    image:
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/rimowa.png",
    animation: "float-4",
  },
  {
    name: "Saint Laurent Sunglasses",
    image:
      "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/ysl-sunglasses.png",
    animation: "float-5",
  },
];

// Uniform size for all floating items - responsive
const ITEM_SIZE = "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28";

interface TransformationHeroProps {
  headline?: string;
  emoji?: string;
}

export default function TransformationHero({
  headline = "See Luxury Pieces on Yourself Before You Buy",
  emoji = "👜",
}: TransformationHeroProps) {
  const signupUrl = getSignupUrl();

  return (
    <section className="relative px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8 lg:pt-32 lg:pb-20 overflow-hidden">
      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(2deg); }
          50% { transform: translateY(-4px) rotate(-1deg); }
          75% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(-2deg); }
          66% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-7px) scale(1.02); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          40% { transform: translateY(-9px) rotate(1deg); }
          80% { transform: translateY(-5px) rotate(-1deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-6px) rotate(-2deg); }
          70% { transform: translateY(-11px) rotate(2deg); }
        }
        .animate-float-1 { animation: float-1 6s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 7s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 5s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 8s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 6.5s ease-in-out infinite; }
      `}</style>

      {/* Cinematic glow behind headline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_30%,rgba(255,255,255,0.02),transparent_60%)]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
        {/* Headline */}
        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
          <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent">
            {headline}
          </span>
          <span className="inline-block ml-2 sm:ml-3 align-middle text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-none">
            {emoji}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 max-w-md sm:max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-neutral-500 px-2">
          Upload a selfie. Choose the pieces you're considering. See how they actually look on you — before you spend.
        </p>

        {/* CTA */}
        <div className="mt-6 space-y-2">
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

        {/* Before / After Mockup Section */}
        {/* Mobile: After on top, Before below. Desktop: Before left, After right */}
        <div className="mt-10 sm:mt-16 lg:mt-20 w-full max-w-5xl px-4 sm:px-8 md:px-4">
          <div className="relative flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-6 lg:gap-12">
            
            {/* Before Image */}
            <div className="relative flex-shrink-0 w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px]">
              {/* Before label - above image */}
              <div className="mb-3 text-center">
                <span className="text-sm sm:text-base font-light italic text-neutral-400 tracking-wide">
                  Before
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-neutral-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <img
                  src={BEFORE_IMAGE}
                  alt="Before - Original selfie"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
            </div>

            {/* Arrow Indicator */}
            <div className="flex items-center justify-center py-2 md:py-0">
              {/* Mobile: upward arrow (Before is below, After is above) */}
              <svg 
                width="30" 
                height="40" 
                viewBox="0 0 30 40" 
                fill="none" 
                className="text-neutral-400 md:hidden"
              >
                {/* Vertical line */}
                <path 
                  d="M15 36 L15 10" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Arrow head pointing up */}
                <path 
                  d="M8 16 L15 8 L22 16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              {/* Desktop: horizontal arrow pointing right */}
              <svg 
                width="50" 
                height="20" 
                viewBox="0 0 50 20" 
                fill="none" 
                className="text-neutral-400 hidden md:block"
              >
                {/* Horizontal line */}
                <path 
                  d="M4 10 L40 10" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Arrow head */}
                <path 
                  d="M34 4 L42 10 L34 16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* After Image with Floating Items */}
            <div className="relative flex-shrink-0 w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px] mx-6 sm:mx-8 md:mx-0">
              {/* After label - above image */}
              <div className="mb-3 text-center">
                <span className="text-sm sm:text-base font-light italic text-neutral-300 tracking-wide">
                  After
                </span>
              </div>
              
              {/* Floating luxury items - all same size, scattered around */}
              
              {/* Van Cleef - top left corner (moved down a bit on mobile) */}
              <div className="absolute top-2 -left-4 sm:-top-2 sm:-left-8 md:-top-8 md:-left-10 z-10 animate-float-1">
                <div className={`${ITEM_SIZE} rounded-xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]`}>
                  <img
                    src={FLOATING_ITEMS[0].image}
                    alt={FLOATING_ITEMS[0].name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Birkin - right side, mid-height */}
              <div className="absolute top-1/4 -right-4 sm:-right-10 md:-right-14 z-10 animate-float-2">
                <div className={`${ITEM_SIZE} rounded-xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]`}>
                  <img
                    src={FLOATING_ITEMS[1].image}
                    alt={FLOATING_ITEMS[1].name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Rolex - bottom right corner */}
              <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 md:-bottom-8 md:-right-10 z-10 animate-float-3">
                <div className={`${ITEM_SIZE} rounded-xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]`}>
                  <img
                    src={FLOATING_ITEMS[2].image}
                    alt={FLOATING_ITEMS[2].name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Rimowa - bottom, more to the left */}
              <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-10 md:-bottom-10 md:-left-14 z-10 animate-float-4">
                <div className={`${ITEM_SIZE} rounded-xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]`}>
                  <img
                    src={FLOATING_ITEMS[3].image}
                    alt={FLOATING_ITEMS[3].name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* YSL Sunglasses - top right (moved down a bit on mobile) */}
              <div className="absolute top-2 right-4 sm:-top-2 sm:right-2 md:-top-8 md:right-0 z-10 animate-float-5">
                <div className={`${ITEM_SIZE} rounded-xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]`}>
                  <img
                    src={FLOATING_ITEMS[4].image}
                    alt={FLOATING_ITEMS[4].name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Main After Image */}
              <div className="relative rounded-2xl overflow-hidden border border-neutral-700/60 shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]">
                <img
                  src={AFTER_IMAGE}
                  alt="After - Luxury transformation"
                  className="w-full aspect-[3/4] object-cover"
                />
                {/* Subtle inner glow on after image */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-white/[0.02]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

