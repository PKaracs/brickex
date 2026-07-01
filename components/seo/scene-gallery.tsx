"use client";

import { useState } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { getSignupUrl } from "@/lib/app-url";
import type { IdeaGalleryImage } from "@/lib/constants/idea-pages";

interface SceneGalleryProps {
  images: IdeaGalleryImage[];
  sceneHeadline: string;
}

const ASPECT_CLASSES: Record<string, string> = {
  cinema: "aspect-video",
  portrait: "aspect-[4/5]",
  square: "aspect-square",
};

function getOptimizedUrl(url: string, width: number): string {
  if (url.includes("/storage/v1/object/public/")) {
    return (
      url.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      ) + `?width=${width}&resize=contain&quality=75`
    );
  }
  return url;
}

export function SceneGallery({ images, sceneHeadline }: SceneGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <section className="py-16 sm:py-20 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-8 sm:mb-10">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Galeria
            </span>
          </h2>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 sm:gap-4">
            {images.map((img, i) => (
              <figure
                key={img.id}
                className="relative mb-3 sm:mb-4 block w-full overflow-hidden rounded-xl border border-neutral-800/60 bg-neutral-800 transition-all duration-300 hover:border-neutral-700/80 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] break-inside-avoid group cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              >
                <div className={`relative w-full ${ASPECT_CLASSES[img.aspectRatio] || "aspect-video"} bg-neutral-800`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getOptimizedUrl(img.src, 600)}
                    alt={img.altText}
                    title={img.altText}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
                <figcaption className="px-3 py-3 text-xs text-zinc-400 leading-relaxed space-y-2.5">
                  <div>
                    <p className="text-sm text-zinc-200 font-medium mb-1">{img.title}</p>
                    <p>{img.description || img.altText}</p>
                  </div>
                  <details
                    className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-2.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <summary className="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {img.promptLabel}
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-400 font-sans">
                      {img.prompt}
                    </pre>
                  </details>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-neutral-800/80 border border-neutral-700 text-white hover:bg-neutral-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="relative max-w-6xl max-h-[90vh] w-full flex flex-col lg:flex-row gap-4 lg:gap-6 items-center lg:items-start"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative flex-1 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getOptimizedUrl(images[lightboxIndex].src, 1200)}
                alt={images[lightboxIndex].altText}
                className="w-full h-auto max-h-[70vh] lg:max-h-[85vh] object-contain rounded-lg"
              />
            </div>

            {/* CTA Panel */}
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
              <a
                href={getSignupUrl()}
                className="group relative inline-flex items-center justify-center gap-2.5 w-full px-6 py-4 rounded-xl text-base font-semibold text-black bg-white overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <Sparkles className="w-4 h-4" />
                Generar una version en BrickEx
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="hidden lg:block space-y-3 mt-2">
                <p className="text-sm text-zinc-200 font-medium">
                  {images[lightboxIndex].title}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {images[lightboxIndex].description || images[lightboxIndex].altText}
                </p>
                <details className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
                  <summary className="cursor-pointer select-none text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    {images[lightboxIndex].promptLabel}
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-400 font-sans">
                    {images[lightboxIndex].prompt}
                  </pre>
                </details>
                <div className="text-[10px] text-zinc-600 space-y-1">
                  <p>Referencia conceptual generada con IA para BrickEx</p>
                  <p>Adapta el prompt dentro de tu propio flujo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-800/80 border border-neutral-700 text-white hover:bg-neutral-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + images.length) % images.length
                  );
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-neutral-800/80 border border-neutral-700 text-white hover:bg-neutral-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % images.length);
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
