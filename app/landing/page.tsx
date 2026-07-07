import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import PropertyShowcase from "@/components/landing/PropertyShowcase";
import CompatibilityMarquee from "@/components/landing/CompatibilityMarquee";
import ProblemSection from "@/components/landing/ProblemSection";
import ToolTransformations from "@/components/landing/ToolTransformations";
import ExamplesFromBrickex from "@/components/landing/ExamplesFromBrickex";
import WorkflowFeatureRows from "@/components/landing/WorkflowFeatureRows";
import SketchToRender from "@/components/landing/SketchToRender";
import VideoShowcase from "@/components/landing/VideoShowcase";
import InteriorShowcase from "@/components/landing/InteriorShowcase";
import PricingGrid from "@/components/landing/PricingGrid";
import FAQSection from "@/components/landing/FAQSection";
import CTABanner from "@/components/landing/CTABanner";
import { FAQ_DATA } from "@/components/landing/faq-data";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "BrickEx — Convierte bocetos en renders fotorrealistas en segundos",
  description:
    "Sube un boceto, modelo de SketchUp o plano y consigue renders arquitectonicos de calidad editorial en segundos. Creado para arquitectos, promotores y equipos de marketing inmobiliario. Sube tu archivo gratis y genera con un plan.",
};

export default function LandingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <JsonLd data={faqJsonLd} />
      <Navbar />

      <Hero />

      <CompatibilityMarquee />

      <ProblemSection />

      <WorkflowFeatureRows />

      <ToolTransformations />

      <ExamplesFromBrickex />

      <WorkflowFeatureRows />

      <PropertyShowcase />

      <SketchToRender />

      <VideoShowcase />

      <InteriorShowcase />

      <PricingGrid />

      <FAQSection />

      <CTABanner />

      <Footer />
    </div>
  );
}
