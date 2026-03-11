import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getSignupUrl } from "@/lib/app-url";
import { getPageBySlug, getPageImage } from "@/lib/constants/seo-pages-loader";
import { getGalleryImages } from "@/lib/constants/seo-gallery-manifest";

function getOptimizedUrl(url: string, width: number): string {
  if (url.includes("/storage/v1/object/public/")) {
    return (
      url.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      ) + `?width=${width}&resize=contain&quality=70`
    );
  }
  return url;
}

const FEATURED_SLUGS = [
  "ai-dating-photos",
  "luxury-lifestyle-photos",
  "old-money-aesthetic",
  "ai-instagram-photos",
  "ai-tinder-photos",
  "bugatti-chiron-mansion",
  "dubai-penthouse",
  "yacht-life-aesthetic",
];

export default function PhotoPacksSection() {
  const signupUrl = getSignupUrl();

  const packs = FEATURED_SLUGS.map((slug) => {
    const page = getPageBySlug(slug);
    if (!page) return null;
    const image = getPageImage(page);
    const galleryCount = getGalleryImages(slug).length;
    return { page, image, galleryCount };
  }).filter(Boolean) as { page: NonNullable<ReturnType<typeof getPageBySlug>>; image: string | undefined; galleryCount: number }[];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              🔥 New luxury scenes just dropped
            </span>
          </h2>
          <p className="text-neutral-400 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Luxury scenes are themed collections of AI-generated photos featuring
            you in different luxury settings. All scenes are included in your
            membership. You can try as many as you want.{" "}
            <Link
              href="/ai-photos"
              className="text-white underline underline-offset-2 hover:text-neutral-200"
            >
              See all scenes
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {packs.map(({ page, image, galleryCount }) => (
            <Link
              key={page.slug}
              href={`/ai-photos/${page.slug}`}
              className="group block rounded-2xl border border-neutral-800/60 bg-neutral-900/50 overflow-hidden transition-all duration-200 hover:border-neutral-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
            >
              {/* Image */}
              {image && (
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getOptimizedUrl(image, 400)}
                    alt={page.content.headline}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-1">
                  {page.content.headline}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-4 mb-4">
                  {page.seo.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {galleryCount > 0 && (
                    <span className="inline-block px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-bold text-white/80 uppercase tracking-wider">
                      {galleryCount} photos
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 flex flex-col items-center gap-2">
          <Button
            asChild
            variant="white"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow-lg"
          >
            <a href={signupUrl}>
              Start Looking Rich
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
          <p className="text-xs text-neutral-600">
            All scenes included in your membership
          </p>
        </div>
      </div>
    </section>
  );
}
