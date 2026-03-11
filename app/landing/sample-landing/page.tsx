import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HeroQuote from "@/components/landing/HeroQuote";
import ThreeStepGuide from "@/components/landing/three-step-guide";
import PlatformMarquee from "@/components/landing/platform-marquee";
import HowItWorksSection from "@/components/landing/how-it-works";
import FlexWorthSection from "@/components/landing/FlexWorthSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import GlobeSection from "@/components/landing/GlobeSection";
import PricingGrid from "@/components/landing/PricingGrid";
import FAQSection from "@/components/landing/FAQSection";
import CTABanner from "@/components/landing/CTABanner";
import { FAQ_DATA } from "@/components/landing/faq-data";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Richflex — Previous Landing",
  description: "Previous landing page design (archived).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SampleLandingPage() {
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

      {/* 1. HERO */}
      <Hero />

      {/* 2. PLATFORM MARQUEE */}
      <PlatformMarquee />

      {/* 3. 3-STEP GUIDE */}
      <ThreeStepGuide />

      <HeroQuote />

      <SocialProofSection />

      {/* 3. HOW IT WORKS (DETAILED) */}
      <HowItWorksSection />

      {/* 4. FLEX WORTH & LEADERBOARD */}
      <FlexWorthSection />

      {/* 5. GLOBE - LOCATIONS */}
      <GlobeSection />

      {/* 7. PRICING GRID */}
      <PricingGrid />

      {/* 8. FAQ */}
      <FAQSection />

      {/* 9. FINAL CTA BANNER */}
      <CTABanner />

      {/* 10. MINIMAL FOOTER */}
      <Footer />
    </div>
  );
}
