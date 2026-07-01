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

const SITE_URL = "https://www.brickex.co";

export const metadata: Metadata = {
  title: "Ideas de renders inmobiliarios con IA | BrickEx",
  description:
    "Explora 10 packs de ideas de render BrickEx para estudiantes de arquitectura y marketers inmobiliarios. Revisa prompts, interiores de lujo, espacios estilizados y referencias de visualizacion de alta intencion.",
  keywords: [
    "ideas de renders inmobiliarios",
    "inspiracion de render arquitectonico",
    "ideas de visualizacion exterior",
    "referencias de render de propiedades",
    "renders para marketing inmobiliario",
    "prompts de arquitectura con IA",
  ],
  alternates: {
    canonical: `${SITE_URL}/ideas`,
  },
  openGraph: {
    title: "Ideas de renders inmobiliarios con IA | BrickEx",
    description:
      "Una biblioteca coherente de referencias de render de lujo, prompts, interiores y packs conceptuales para estudiantes de arquitectura y marketers inmobiliarios.",
    type: "website",
    url: `${SITE_URL}/ideas`,
    siteName: "BrickEx",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ideas de renders inmobiliarios con IA | BrickEx",
    description:
      "Ideas de render de lujo, packs de prompts, interiores y referencias listas para marketing para equipos de arquitectura e inmobiliaria.",
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
    name: "Ideas de render BrickEx",
    description:
      "Packs curados de ideas de render con IA y prompts para estudiantes de arquitectura y marketers inmobiliarios.",
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
        name: "Inicio",
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
              Ideas BrickEx
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Ideas de renders inmobiliarios con prompts
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Explora {allIdeaPages.length} packs de ideas coherentes creados
              alrededor de intencion de busqueda real: penthouses, renders de
              villas, torres residenciales, casas de playa y mas. Cada tema
              incluye ocho imagenes entre exteriores, interiores y momentos de
              lujo estilizados, junto con los prompts detras de ellas.
            </p>
            <Button
              size="lg"
              className="gap-2 h-12 px-8 text-base font-semibold"
              asChild
            >
              <a href={signupUrl}>
                Abrir BrickEx
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
                  {pages.length} paginas enfocadas en intencion de busqueda
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
              Necesitas visuales como estos?
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
              Usa BrickEx para convertir bocetos, planos y referencias en
              renders listos para marketing, con iteracion mas rapida en luz,
              composicion y direccion de estilo.
            </p>
            <Button
              size="lg"
              className="gap-2 h-12 min-h-[48px] px-8 text-base font-semibold w-full sm:w-auto"
              asChild
            >
              <a href={signupUrl}>
                Empezar en BrickEx
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
