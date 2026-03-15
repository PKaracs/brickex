import { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ScenePage } from "@/components/seo/scene-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  allIdeaPages,
  getIdeaBySlug,
  getIdeaHeroImage,
} from "@/lib/constants/idea-pages";

const SITE_URL = "https://brickex.co";

interface IdeaPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return allIdeaPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: IdeaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getIdeaBySlug(slug);

  if (!page) return {};

  const image = getIdeaHeroImage(page);
  const canonicalUrl = `${SITE_URL}/ideas/${page.slug}`;

  return {
    title: page.seo.title,
    description: page.seo.description,
    keywords: page.seo.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.seo.title,
      description: page.seo.description,
      type: "website",
      url: canonicalUrl,
      siteName: "BrickEx",
      locale: "en_US",
      ...(image && {
        images: [
          {
            url: `${SITE_URL}${image}`,
            width: 1200,
            height: 630,
            alt: page.content.headline,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo.title,
      description: page.seo.description,
      ...(image && { images: [`${SITE_URL}${image}`] }),
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

export default async function IdeaPageRoute({ params }: IdeaPageProps) {
  const { slug } = await params;
  const page = getIdeaBySlug(slug);

  if (!page) return notFound();

  const image = getIdeaHeroImage(page);
  const canonicalUrl = `${SITE_URL}/ideas/${page.slug}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
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
        name: "Ideas",
        item: `${SITE_URL}/ideas`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.content.headline,
        item: canonicalUrl,
      },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.content.headline,
    description: page.seo.description,
    url: canonicalUrl,
    ...(image && { primaryImageOfPage: `${SITE_URL}${image}` }),
    about: page.seo.keywords,
  };

  const imageObjectsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `${page.content.headline} Gallery`,
    url: canonicalUrl,
    image: page.gallery.map((img) => ({
      "@type": "ImageObject",
      url: `${SITE_URL}${img.src}`,
      name: img.title,
      description: img.description,
      contentUrl: `${SITE_URL}${img.src}`,
      creditText: "BrickEx",
      creator: { "@type": "Organization", name: "BrickEx" },
      copyrightNotice: "BrickEx 2026",
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={imageObjectsJsonLd} />
      <Navbar />
      <ScenePage scene={page} />
      <Footer />
    </>
  );
}
