import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { SceneCard } from "@/components/seo/scene-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getSignupUrl } from "@/lib/app-url";
import {
  allSeoPages,
  getPagesByCategory,
  PAGE_CATEGORY_ORDER,
  PAGE_CATEGORY_LABELS,
} from "@/lib/constants/seo-pages-loader";

const SITE_URL = "https://richflex.co";

export const metadata: Metadata = {
  title: "AI Photo Ideas | Dating, Luxury, Social Media Photos | Richflex",
  description:
    "Browse 100+ AI photo ideas — dating profile shots, luxury lifestyle, Instagram content, and more. Upload a selfie and generate photorealistic photos in seconds.",
  keywords: [
    "AI photo generator",
    "AI dating photos",
    "AI luxury photo generator",
    "AI Instagram photos",
    "AI headshots",
    "AI lifestyle photos",
    "photo ideas AI",
  ],
  alternates: {
    canonical: `${SITE_URL}/ai-photos`,
  },
  openGraph: {
    title: "AI Luxury Photo Generator | Browse All Scenes",
    description:
      "Browse 15+ AI-powered luxury photo scenes — supercars, private jets, yachts, penthouses, and more.",
    type: "website",
    url: `${SITE_URL}/ai-photos`,
    siteName: "Richflex",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Luxury Photo Generator | Browse All Scenes",
    description:
      "Browse 15+ AI-powered luxury photo scenes — supercars, private jets, yachts, penthouses, and more.",
    creator: "@richflexco",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function AIPhotosHubPage() {
  const signupUrl = getSignupUrl();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Luxury Photo Scenes",
    description:
      "Browse all AI-powered luxury photo scenes available on Richflex.",
    url: `${SITE_URL}/ai-photos`,
    numberOfItems: allSeoPages.length,
    hasPart: allSeoPages.map((scene) => ({
      "@type": "CreativeWork",
      name: scene.content.headline,
      url: `${SITE_URL}/ai-photos/${scene.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "AI Photos",
        item: `${SITE_URL}/ai-photos`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="min-h-screen bg-[#0c0c0c]">
        <Navbar />

        {/* Hero */}
        <section className="pt-20 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
              AI Photo Ideas
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Take photos like these
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Browse {allSeoPages.length}+ photo ideas. Upload a selfie
              and our AI generates photorealistic images of you — for dating
              apps, social media, or just for fun.
            </p>
            <Button
              size="lg"
              className="gap-2 h-12 px-8 text-base font-semibold"
              asChild
            >
              <a href={signupUrl}>
                Try It Free
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* Category Sections */}
        {PAGE_CATEGORY_ORDER.map((category) => {
          const pages = getPagesByCategory(category);
          if (pages.length === 0) return null;

          return (
            <section
              key={category}
              className="py-12 sm:py-16 border-t border-zinc-800/50"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                    {PAGE_CATEGORY_LABELS[category]}
                  </span>
                </h2>
                <p className="text-sm text-zinc-500 mb-8">{pages.length} ideas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {pages.map((page, i) => (
                    <SceneCard
                      key={page.slug}
                      scene={page}
                      priority={i === 0}
                    />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Bottom CTA */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Want photos like these?
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
              Upload a selfie and generate AI photos of yourself in
              seconds. No photographer, no studio, no travel.
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

        <Footer />
      </div>
    </>
  );
}
