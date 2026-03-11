import Link from "next/link";
import {
  allSeoPages,
  getPagesByCategory,
  getPageImage,
  PAGE_CATEGORY_ORDER,
  PAGE_CATEGORY_LABELS,
} from "@/lib/constants/seo-pages-loader";

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

export default function SceneIndex() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              {allSeoPages.length}+ AI Photo Ideas
            </span>
          </h2>
          <p className="text-neutral-500 mt-2 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
            Browse every luxury scene. Upload a selfie and our AI generates
            photorealistic images of you — for dating apps, social media, or just
            for fun.
          </p>
        </div>

        {/* Category Sections */}
        {PAGE_CATEGORY_ORDER.map((category) => {
          const pages = getPagesByCategory(category);
          if (pages.length === 0) return null;

          return (
            <div
              key={category}
              className="mb-10 sm:mb-14 last:mb-0"
            >
              <div className="flex items-baseline gap-3 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold">
                  <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                    {PAGE_CATEGORY_LABELS[category]}
                  </span>
                </h3>
                <span className="text-xs text-zinc-500 font-medium">
                  {pages.length} ideas
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {pages.map((page) => {
                  const image = getPageImage(page);
                  return (
                    <Link
                      key={page.slug}
                      href={`/ai-photos/${page.slug}`}
                      className="group relative block overflow-hidden rounded-xl border border-neutral-800/60 bg-neutral-900 transition-all duration-200 hover:border-neutral-700/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
                    >
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
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />
                        </div>
                      )}
                      <div className="p-2.5 sm:p-3">
                        <h4 className="text-xs sm:text-sm font-medium text-white group-hover:text-zinc-100 transition-colors line-clamp-1">
                          {page.content.headline}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 line-clamp-1">
                          {page.content.subheadline}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
