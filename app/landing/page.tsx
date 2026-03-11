import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import PropertyShowcase from "@/components/landing/PropertyShowcase";
import CompatibilityMarquee from "@/components/landing/CompatibilityMarquee";
import SketchToRender from "@/components/landing/SketchToRender";
import VideoShowcase from "@/components/landing/VideoShowcase";
import InteriorShowcase from "@/components/landing/InteriorShowcase";
import PricingGrid from "@/components/landing/PricingGrid";
import FAQSection from "@/components/landing/FAQSection";
import CTABanner from "@/components/landing/CTABanner";
import { FAQ_DATA } from "@/components/landing/faq-data";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "BrickEx — AI Visualization for Real Estate Projects",
  description:
    "Transform architectural plans, sketches, and 3D models into photorealistic renders with AI. Create marketing-ready visualizations in minutes, not weeks.",
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
