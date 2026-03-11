"use client";

import { Safari } from "@/components/ui/safari";
import { Compare } from "@/components/ui/compare";
import { BlurFade } from "@/components/ui/blur-fade";

const HERO_IMAGE_URL =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/8fa45743a3429d2f55be146c8f5afb55.png";

const BEFORE_IMAGE =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing/selfie-input.png";

const AFTER_IMAGE =
  "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/explore/landing/selfie-output.png";

export default function TransformationSection() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <BlurFade delay={0.1} inView>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                The First AI Luxury Photo Studio
              </span>
            </h2>
            <p className="text-neutral-500 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Stop messing around with AI image generators that produce broken
              faces and inconsistent results. Start producing photorealistic
              luxury shots instantly with Richflex.
            </p>
          </div>
        </BlurFade>

        {/* Dashboard Screenshot */}
        <BlurFade delay={0.2} inView>
          <div className="relative w-full max-w-4xl mx-auto mb-16 sm:mb-20 bg-neutral-900 rounded-xl sm:rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent" />
            <Safari
              imageSrc={HERO_IMAGE_URL}
              alt="Richflex dashboard — AI luxury photo generator interface"
              className="!bg-transparent !shadow-none"
            />
          </div>
        </BlurFade>

        {/* Before / After Compare */}
        <BlurFade delay={0.3} inView>
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Upload a Selfie. Get Luxury Photos.
              </span>
            </h3>
            <p className="text-neutral-500 mt-2 sm:mt-3 text-sm sm:text-base max-w-lg mx-auto">
              One selfie is all it takes. Our AI places you in any luxury scene
              — photorealistic, scroll-stopping, and ready to post.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.4} inView>
          <div className="flex justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <Compare
                firstImage={BEFORE_IMAGE}
                secondImage={AFTER_IMAGE}
                className="w-[260px] h-[400px] sm:w-[330px] sm:h-[500px] md:w-[400px] md:h-[600px] rounded-2xl"
                firstImageClassName="object-cover"
                secondImageClassname="object-cover"
                slideMode="hover"
                autoplay
                autoplayDuration={4000}
              />
              <div className="absolute bottom-0 left-0 right-0 flex justify-between p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-50">
                <span className="text-xs sm:text-sm font-medium text-neutral-400">
                  Before
                </span>
                <span className="text-xs sm:text-sm font-medium text-white">
                  After ✨
                </span>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
