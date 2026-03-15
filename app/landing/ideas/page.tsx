import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { SceneCard } from "@/components/seo/scene-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getSignupUrl } from "@/lib/app-url";
import {
  allIdeaPages,
  getIdeasByCategory,
  IDEA_CATEGORY_ORDER,
  IDEA_CATEGORY_LABELS,
} from "@/lib/constants/idea-pages";

const SITE_URL = "https://brickex.co";

export const metadata: Metadata = {
  title: "AI Real Estate Render Ideas | BrickEx",
  description:
    "Browse 10 BrickEx render idea packs built for architecture students and real estate marketers. Explore prompts, luxury interiors, styled spaces, and high-intent property visualization references.",
  keywords: [
    "real estate render ideas",
    "architectural render inspiration",
    "exterior visualization ideas",
    "property rendering references",
    "real estate marketing renders",
    "AI architecture prompts",
  ],
  alternates: {
    canonical: `${SITE_URL}/ideas`,
  },
  openGraph: {
    title: "AI Real Estate Render Ideas | BrickEx",
    description:
      "A coherent library of luxury render references, prompts, interiors, and concept packs for architecture students and real estate marketers.",
    type: "website",
    url: `${SITE_URL}/ideas`,
    siteName: "BrickEx",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Real Estate Render Ideas | BrickEx",
    description:
      "Luxury render ideas, prompt packs, interiors, and marketing-ready references for architecture and real estate teams.",
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

export default function IdeasHubPage() {
  const signupUrl = getSignupUrl();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BrickEx Render Ideas",
    description:
      "Curated AI render idea packs with prompts for architecture students and real estate marketers.",
    url: `${SITE_URL}/ideas`,
    numberOfItems: allIdeaPages.length,
    hasPart: allIdeaPages.map((page) => ({
      "@type": "CreativeWork",
      name: page.content.headline,
      url: `${SITE_URL}/ideas/${page.slug}`,
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
        name: "Ideas",
        item: `${SITE_URL}/ideas`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="min-h-screen bg-[#0c0c0c]">
        <Navbar />

        <section className="pt-20 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
              BrickEx Ideas
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Real estate render ideas with prompts
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Browse {allIdeaPages.length} coherent idea packs built around
              actual search intent: penthouses, villa renders, condo towers,
              beach houses, and more. Every topic includes eight images across
              exteriors, interiors, and styled luxury moments plus the prompts
              behind them.
            </p>
            <Button
              size="lg"
              className="gap-2 h-12 px-8 text-base font-semibold"
              asChild
            >
              <a href={signupUrl}>
                Open BrickEx
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>

        {IDEA_CATEGORY_ORDER.map((category) => {
          const pages = getIdeasByCategory(category);
          if (pages.length === 0) return null;

          return (
            <section
              key={category}
              className="py-12 sm:py-16 border-t border-zinc-800/50"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                    {IDEA_CATEGORY_LABELS[category]}
                  </span>
                </h2>
                <p className="text-sm text-zinc-500 mb-8">
                  {pages.length} focused search-intent pages
                </p>
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

        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Need visuals like these?
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
              Use BrickEx to turn sketches, plans, and references into
              marketing-ready renders with faster iteration on lighting,
              composition, and style direction.
            </p>
            <Button
              size="lg"
              className="gap-2 h-12 min-h-[48px] px-8 text-base font-semibold w-full sm:w-auto"
              asChild
            >
              <a href={signupUrl}>
                Start in BrickEx
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
