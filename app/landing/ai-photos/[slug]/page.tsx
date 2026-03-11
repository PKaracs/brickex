import { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ScenePage } from "@/components/seo/scene-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  allSeoPages,
  getPageBySlug,
  getPageImage,
} from "@/lib/constants/seo-pages-loader";
import { getGalleryImages } from "@/lib/constants/seo-gallery-manifest";

const SITE_URL = "https://richflex.co";

interface ScenePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allSeoPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: ScenePageProps): Promise<Metadata> {
  const { slug } = await params;
  const scene = getPageBySlug(slug);

  if (!scene) return {};

  const image = getPageImage(scene);
  const canonicalUrl = `${SITE_URL}/ai-photos/${scene.slug}`;

  return {
    title: scene.seo.title,
    description: scene.seo.description,
    keywords: scene.seo.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: scene.seo.title,
      description: scene.seo.description,
      type: "website",
      url: canonicalUrl,
      siteName: "Richflex",
      locale: "en_US",
      ...(image && {
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: scene.content.headline,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: scene.seo.title,
      description: scene.seo.description,
      ...(image && { images: [image] }),
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
}

export default async function ScenePageRoute({ params }: ScenePageProps) {
  const { slug } = await params;
  const scene = getPageBySlug(slug);

  if (!scene) return notFound();

  const image = getPageImage(scene);
  const canonicalUrl = `${SITE_URL}/ai-photos/${scene.slug}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: scene.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
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
      {
        "@type": "ListItem",
        position: 3,
        name: scene.content.headline,
        item: canonicalUrl,
      },
    ],
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: scene.content.headline,
    description: scene.seo.description,
    ...(image && { image }),
    brand: {
      "@type": "Brand",
      name: "Richflex",
    },
    offers: {
      "@type": "Offer",
      price: "8.90",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
    },
  };

  const galleryImages = getGalleryImages(slug);
  const imageObjectsJsonLd =
    galleryImages.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: `${scene.content.headline} — AI Photo Gallery`,
          url: canonicalUrl,
          image: galleryImages.map((img) => ({
            "@type": "ImageObject",
            url: img.url,
            name: img.altText,
            description: `${img.altText} — AI-generated luxury photo by Richflex`,
            contentUrl: img.url,
            creditText: "Richflex",
            creator: { "@type": "Organization", name: "Richflex" },
            copyrightNotice: "Richflex 2026",
          })),
        }
      : null;

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={productJsonLd} />
      {imageObjectsJsonLd && <JsonLd data={imageObjectsJsonLd} />}
      <Navbar />
      <ScenePage scene={scene} />
      <Footer />
    </>
  );
}
