"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Plus, Minus, Upload, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SceneCard } from "@/components/seo/scene-card";
import { SceneGallery } from "@/components/seo/scene-gallery";
import { getSignupUrl } from "@/lib/app-url";
import {
  type SeoPage,
  getPageImage,
  getPageBySlug,
  PAGE_CATEGORY_LABELS,
} from "@/lib/constants/seo-pages-loader";
import { getGalleryImages } from "@/lib/constants/seo-gallery-manifest";

interface ScenePageProps {
  scene: SeoPage;
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group relative">
      <div className="relative bg-neutral-900 rounded-2xl border border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)] overflow-hidden transition-all duration-200 hover:border-neutral-700/80">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 text-left min-h-[56px] active:bg-zinc-800/30 transition-colors"
        >
          <span className="text-xs sm:text-sm font-medium text-zinc-200">
            {question}
          </span>
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-950/50 border border-zinc-800 flex items-center justify-center transition-colors group-hover:bg-zinc-900 group-hover:border-zinc-700">
            {isOpen ? (
              <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            ) : (
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
            )}
          </div>
        </button>
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-zinc-500 leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    icon: Upload,
    title: "Upload a selfie",
    description: "Any clear photo of your face. Takes 5 seconds.",
  },
  {
    icon: Sparkles,
    title: "AI generates your photo",
    description: "Our AI places you in the scene — photorealistic results.",
  },
  {
    icon: ImageIcon,
    title: "Download & share",
    description: "Get your photo instantly. Use it anywhere.",
  },
];

export function ScenePage({ scene }: ScenePageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const signupUrl = getSignupUrl();
  const image = getPageImage(scene);
  const galleryImages = getGalleryImages(scene.slug);

  const relatedScenes = scene.relatedSlugs
    .map((slug) => getPageBySlug(slug))
    .filter((s): s is SeoPage => s != null);

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {image && (
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[520px]">
            <Image
              src={image}
              alt={scene.content.headline}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c]/40 to-transparent" />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-40 pb-12 sm:pb-16 z-10">
          <span className="mb-3 inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {PAGE_CATEGORY_LABELS[scene.category] || scene.category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              {scene.content.headline}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mb-6 sm:mb-8 leading-relaxed">
            {scene.content.subheadline}
          </p>
          <Button size="lg" className="gap-2 h-12 px-8 text-base font-semibold" asChild>
            <a href={signupUrl}>
              Generate Photos Like These
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
          <p className="text-zinc-600 text-xs mt-3">
            Free to try. No credit card needed.
          </p>
        </div>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <SceneGallery images={galleryImages} sceneHeadline={scene.content.headline} />
      )}

      {/* 3-Step Guide */}
      <section className="py-16 sm:py-20 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-10 sm:mb-12">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              How it works
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800">
                  <step.icon className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Step {i + 1}
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About This Scene */}
      <section className="py-16 sm:py-20 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            <div className="lg:col-span-3">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6">
                <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                  About these photos
                </span>
              </h2>
              <div className="space-y-4">
                {scene.content.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                What&apos;s in the photo
              </h3>
              <ul className="space-y-2.5">
                {scene.content.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related Scenes */}
      {relatedScenes.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-zinc-800/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-8 sm:mb-10">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                You might also like
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedScenes.map((related) => (
                <SceneCard key={related.slug} scene={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {scene.faq.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-zinc-800/50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-center mb-8 sm:mb-10">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Frequently asked questions
              </span>
            </h2>
            <div className="space-y-3">
              {scene.faq.map((item, i) => (
                <FAQItem
                  key={i}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFaqIndex === i}
                  onToggle={() =>
                    setOpenFaqIndex(openFaqIndex === i ? null : i)
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Want photos like these?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
            Upload a selfie and our AI generates photos of you in seconds. No photographer, no studio, no travel.
          </p>
          <Button
            size="lg"
            className="gap-2 h-12 min-h-[48px] px-8 text-base font-semibold w-full sm:w-auto"
            asChild
          >
            <a href={signupUrl}>
              Try It Free
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
          <p className="text-zinc-600 text-xs mt-3">
            Your first photo is free. No credit card needed.
          </p>
        </div>
      </section>
    </div>
  );
}
