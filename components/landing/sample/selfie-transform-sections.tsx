"use client";

import React from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { X, Heart, ArrowRight } from "lucide-react";
import { getSignupUrl } from "@/lib/app-url";

const OBJ =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/render/image/public/objects";
const SEO =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/render/image/public/objects/seo-gallery";
const EXPLORE =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing";
const TINDER = `${EXPLORE}/tinder`;

function opt(file: string) {
  return `${OBJ}/${file}?width=400&resize=contain&quality=80`;
}

function seoImg(slug: string, file: string) {
  return `${SEO}/${slug}/${file}.png?width=400&resize=contain&quality=80`;
}

const SELFIE_BEFORE = opt("landing-chick.png");

const SELFIE_GRID = [
  opt("Richflex%20(5).png"),
  opt("Richflex%20(17).png"),
  opt("Richflex%20(4).png"),
  opt("Richflex%20(18).png"),
];

const RESULT_IMAGES = [
  opt("Richflex%20(12).png"),
  opt("Richflex%20(13).png"),
  opt("Richflex%20(14).png"),
  opt("Richflex%20(15).png"),
];

const INPUT_SELFIE = `${EXPLORE}/input.jpg`;
const OUTPUT_IMAGES = [
  `${EXPLORE}/output1.png`,
  `${EXPLORE}/output2.png`,
  `${EXPLORE}/output3.png`,
  `${EXPLORE}/output4.png`,
  `${EXPLORE}/output5.png`,
];

// Dating swipe: explore/tinder — input1–3 are .png, input4–6 are .jpg
const REJECTED_PHOTOS = [
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing/tinder/input1.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing/tinder/input2.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing/tinder/input3.png",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing/tinder/input4.jpg",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing/tinder/input5.jpg",
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing/tinder/input6.jpg",
];
const REJECTED_ALTS = [
  "Regular dating selfie, casual photo",
  "Regular dating selfie, everyday look",
  "Regular dating selfie, typical profile photo",
  "Regular dating selfie, standard photo",
  "Regular dating selfie, plain background",
  "Regular dating selfie, before AI upgrade",
];
const LIKED_PHOTOS = [1, 2, 3, 4, 5, 6].map((i) => `${TINDER}/output${i}.png`);

function DatingSwipeSection() {
  const signupUrl = getSignupUrl();
  const [leftIdx, setLeftIdx] = React.useState(0);
  const [rightIdx, setRightIdx] = React.useState(0);
  const [leftExiting, setLeftExiting] = React.useState(false);
  const [rightExiting, setRightExiting] = React.useState(false);

  const swipe = React.useCallback(() => {
    if (leftExiting || rightExiting) return;
    setLeftExiting(true);
    setRightExiting(true);

    setTimeout(() => {
      setLeftIdx((p) => (p + 1) % REJECTED_PHOTOS.length);
      setRightIdx((p) => (p + 1) % LIKED_PHOTOS.length);
      setLeftExiting(false);
      setRightExiting(false);
    }, 500);
  }, [leftExiting, rightExiting]);

  React.useEffect(() => {
    const timer = setInterval(swipe, 2800);
    return () => clearInterval(timer);
  }, [swipe]);

  const leftStack = Array.from(
    { length: 3 },
    (_, i) => (leftIdx + i) % REJECTED_PHOTOS.length,
  );
  const rightStack = Array.from(
    { length: 3 },
    (_, i) => (rightIdx + i) % LIKED_PHOTOS.length,
  );

  return (
    <section className="relative py-14 sm:py-20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade delay={0.15} inView>
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                ❤️ Get more right swipes on dating apps
              </span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
              Regular selfies get left-swiped. Luxury AI photos get
              right-swiped. Stand out on Tinder, Bumble & Hinge.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.25} inView>
          <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-16">
            {/* Left stack — rejected */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-[160px] sm:w-[200px] lg:w-[220px] h-[220px] sm:h-[275px] lg:h-[300px] cursor-pointer"
                onClick={swipe}
              >
                {[...leftStack].reverse().map((imgIdx, stackPos) => {
                  const realStackPos = 2 - stackPos;
                  const isFront = realStackPos === 0;
                  const isExiting = isFront && leftExiting;
                  const offset = realStackPos * 4;
                  const rotation = realStackPos * 1.2;
                  const scale = 1 - realStackPos * 0.03;
                  const zIndex = 3 - realStackPos;

                  return (
                    <motion.div
                      key={`left-${imgIdx}`}
                      className="absolute inset-0 rounded-2xl overflow-hidden border border-neutral-700/40 bg-neutral-800"
                      animate={{
                        x: isExiting ? -260 : offset,
                        y: isExiting ? -20 : offset * 0.4,
                        rotate: isExiting ? -22 : rotation,
                        scale: isExiting ? 0.88 : scale,
                        opacity: isExiting ? 0 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 24,
                        mass: 0.7,
                      }}
                      style={{
                        zIndex: isExiting ? 10 : zIndex,
                        boxShadow:
                          isFront && !isExiting
                            ? "0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
                            : "0 8px 24px -6px rgba(0,0,0,0.35)",
                      }}
                    >
                      <img
                        src={REJECTED_PHOTOS[imgIdx]}
                        alt={REJECTED_ALTS[imgIdx]}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      {isFront && !isExiting && (
                        <motion.div
                          className="absolute top-3 left-3 rounded-full p-1.5 sm:p-2 backdrop-blur-sm bg-red-500/20 border border-red-500/40"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.15,
                            type: "spring",
                            stiffness: 400,
                          }}
                        >
                          <X
                            className="w-4 h-4 sm:w-5 sm:h-5 text-red-400"
                            strokeWidth={2.5}
                          />
                        </motion.div>
                      )}
                      {isExiting && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span
                            className="text-5xl sm:text-6xl font-black text-red-500/70 -rotate-12 select-none"
                            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
                          >
                            NOPE
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <span className="text-xs sm:text-sm font-medium text-red-400/80 tracking-wide">
                Regular selfies
              </span>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-800 border border-neutral-700/60 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-neutral-400">
                  VS
                </span>
              </div>
            </div>

            {/* Right stack — liked */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative w-[160px] sm:w-[200px] lg:w-[220px] h-[220px] sm:h-[275px] lg:h-[300px] cursor-pointer"
                onClick={swipe}
              >
                {[...rightStack].reverse().map((imgIdx, stackPos) => {
                  const realStackPos = 2 - stackPos;
                  const isFront = realStackPos === 0;
                  const isExiting = isFront && rightExiting;
                  const offset = realStackPos * 4;
                  const rotation = realStackPos * -1.2;
                  const scale = 1 - realStackPos * 0.03;
                  const zIndex = 3 - realStackPos;

                  return (
                    <motion.div
                      key={`right-${imgIdx}`}
                      className="absolute inset-0 rounded-2xl overflow-hidden border border-neutral-700/40 bg-neutral-800"
                      animate={{
                        x: isExiting ? 260 : -offset,
                        y: isExiting ? -20 : offset * 0.4,
                        rotate: isExiting ? 22 : rotation,
                        scale: isExiting ? 0.88 : scale,
                        opacity: isExiting ? 0 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 24,
                        mass: 0.7,
                      }}
                      style={{
                        zIndex: isExiting ? 10 : zIndex,
                        boxShadow:
                          isFront && !isExiting
                            ? "0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
                            : "0 8px 24px -6px rgba(0,0,0,0.35)",
                      }}
                    >
                      <img
                        src={LIKED_PHOTOS[imgIdx]}
                        alt="Richflex AI dating photo"
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      {isFront && !isExiting && (
                        <motion.div
                          className="absolute top-3 right-3 rounded-full p-1.5 sm:p-2 backdrop-blur-sm bg-emerald-500/20 border border-emerald-500/40"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.15,
                            type: "spring",
                            stiffness: 400,
                          }}
                        >
                          <Heart
                            className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 fill-emerald-400"
                            strokeWidth={2}
                          />
                        </motion.div>
                      )}
                      {isExiting && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span
                            className="text-5xl sm:text-6xl font-black text-emerald-500/70 rotate-12 select-none"
                            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
                          >
                            LIKE
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <span className="text-xs sm:text-sm font-medium text-emerald-400/80 tracking-wide">
                Richflex AI photos
              </span>
            </div>
          </div>
        </BlurFade>

        <div className="mt-12 flex justify-center">
          <Button
            asChild
            variant="white"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg"
          >
            <a href={signupUrl}>
              Create Dating Photos Now
              <Heart className="h-4 w-4 ml-2 fill-current" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SelfieToOutputs() {
  const signupUrl = getSignupUrl();
  const [order, setOrder] = React.useState([0, 1, 2, 3, 4]);
  const [isLeaving, setIsLeaving] = React.useState(false);

  const cycle = React.useCallback(() => {
    if (isLeaving) return;
    setIsLeaving(true);
    setTimeout(() => {
      setOrder((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setIsLeaving(false);
    }, 350);
  }, [isLeaving]);

  React.useEffect(() => {
    const timer = setInterval(cycle, 2500);
    return () => clearInterval(timer);
  }, [cycle]);

  return (
    <section className="relative py-14 sm:py-20 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade delay={0.15} inView>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Upload 1 selfie, get unlimited luxury photos
              </span>
            </h2>
          </div>
        </BlurFade>

        <div className="flex flex-row items-center justify-center gap-3 sm:gap-8 lg:gap-14">
          {/* Left: Input selfie */}
          <div className="relative w-[130px] sm:w-[220px] shrink-0">
            <div className="absolute -top-2.5 left-2 sm:left-3 z-10 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-neutral-800 border border-neutral-700 text-[7px] sm:text-[9px] font-bold text-neutral-300 uppercase tracking-wider">
              Your selfie
            </div>
            <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-neutral-700/50 shadow-xl shadow-black/30 bg-neutral-800">
              <img
                src={INPUT_SELFIE}
                alt="Upload your selfie"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center shrink-0 text-neutral-500">
            <ArrowRight
              className="w-6 h-6 sm:w-12 sm:h-12"
              strokeWidth={1.5}
            />
          </div>

          {/* Right: Auto-cycling stacked cards */}
          <div
            className="relative w-[150px] sm:w-[260px] h-[200px] sm:h-[350px] shrink-0 cursor-pointer"
            onClick={cycle}
          >
            <div className="absolute -top-2.5 right-2 sm:right-3 z-30 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-white text-[7px] sm:text-[9px] font-bold text-black uppercase tracking-wider shadow-lg">
              Richflex Generated
            </div>
            {order.map((imgIndex, stackPos) => {
              const isFront = stackPos === 0;
              const isExiting = isFront && isLeaving;
              const offset = stackPos * 5;
              const rotation = stackPos * 1.5 - 3;
              const scale = 1 - stackPos * 0.025;
              const zIndex = OUTPUT_IMAGES.length - stackPos;

              return (
                <motion.div
                  key={imgIndex}
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-neutral-700/40 bg-neutral-800"
                  animate={{
                    x: isExiting ? 280 : offset,
                    y: isExiting ? -60 : -offset * 0.5,
                    rotate: isExiting ? 18 : rotation,
                    scale: isExiting ? 0.9 : scale,
                    opacity: isExiting ? 0 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 22,
                    mass: 0.8,
                  }}
                  style={{
                    zIndex: isExiting ? OUTPUT_IMAGES.length + 1 : zIndex,
                    boxShadow:
                      isFront && !isExiting
                        ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
                        : "0 10px 30px -8px rgba(0,0,0,0.4)",
                  }}
                >
                  <img
                    src={OUTPUT_IMAGES[imgIndex]}
                    alt={`AI generated luxury photo ${imgIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              );
            })}
            <div className="absolute -bottom-7 inset-x-0 text-center">
              <span className="text-[10px] text-neutral-500 tracking-wide">
                Click or wait to browse
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <Button
            asChild
            variant="white"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg"
          >
            <a href={signupUrl}>
              Start Taking AI Photos Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TransformBlock({
  headline,
  selfies,
  result,
  resultLabel,
}: {
  headline: string;
  selfies: string[];
  result: string;
  resultLabel: string;
}) {
  return (
    <BlurFade delay={0.15} inView>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            {headline}
          </span>
        </h2>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-10">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-[220px] sm:w-[260px] shrink-0">
          {selfies.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden bg-neutral-800"
            >
              <img
                src={src}
                alt={`Selfie ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center shrink-0 mx-2 sm:mx-0 text-neutral-500">
          <ArrowRight className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
        </div>

        <div className="relative w-[240px] sm:w-[280px] shrink-0">
          <div className="absolute -top-2.5 -right-2 z-10 px-2.5 py-1 rounded-md bg-white text-[9px] font-bold text-black uppercase tracking-wider shadow-lg">
            {resultLabel}
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-neutral-700/50 shadow-2xl shadow-black/50">
            <img
              src={result}
              alt="AI-generated luxury result"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </BlurFade>
  );
}

export default function SelfieTransformSections() {
  return (
    <>
      {/* Section 1: Upload 1 selfie -> 5 outputs with stacked card fan */}
      <SelfieToOutputs />

      {/* Section 2: Couples -- photo gallery */}
      <section className="relative py-14 sm:py-20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlurFade delay={0.15} inView>
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                  Create photos couple photos
                </span>
              </h2>
            </div>
          </BlurFade>

          <BlurFade delay={0.25} inView>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
              {[
                seoImg("ai-couples-photos", "luxury-yacht-couple-sunset"),
                seoImg("ai-couples-photos", "private-jet-romance-afternoon"),
                seoImg("ai-couples-photos", "romantic-penthouse-terrace"),
                seoImg("ai-couples-photos", "michelin-star-dinner"),
                seoImg("ai-couples-photos", "sunset-yacht-cruise"),
                seoImg("ai-couples-photos", "morning-poolside-villa"),
              ].map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-800/50 bg-neutral-900"
                >
                  <img
                    src={src}
                    alt={`AI couples photo ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Section 3: Dating swipe — Tinder style */}
      <DatingSwipeSection />

      {/* Section 4: Generate anywhere */}
      {/* <section className="relative py-14 sm:py-20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TransformBlock
            headline="🌍 Generate luxury photos of yourself anywhere"
            selfies={[
              SELFIE_GRID[2],
              SELFIE_GRID[3],
              SELFIE_GRID[0],
              SELFIE_GRID[1],
            ]}
            result={SELFIE_BEFORE}
            resultLabel="Richflex Generated"
          />

          <BlurFade delay={0.25} inView>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              {RESULT_IMAGES.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-800/50 bg-neutral-900"
                >
                  <img
                    src={src}
                    alt={`AI result ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      </section> */}
    </>
  );
}
