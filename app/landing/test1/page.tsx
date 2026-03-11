"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TransformationHero from "@/components/landing/TransformationHero";
import HeroQuote from "@/components/landing/HeroQuote";
import HowItWorksSection from "@/components/landing/how-it-works";
import FlexWorthSection from "@/components/landing/FlexWorthSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import GlobeSection from "@/components/landing/GlobeSection";
import PricingGrid from "@/components/landing/PricingGrid";
import FAQSection from "@/components/landing/FAQSection";
import CTABanner from "@/components/landing/CTABanner";

/**
 * Ad Test Variant 1
 * -----------------
 * This page is identical to the main landing page except for the hero headline.
 * Used for short-term ad testing (~$100 spend).
 *
 * URL: /landing/test1
 */

// Change this headline to match your ad copy
const TEST_HEADLINE = "Your Face. Luxury Lifestyle. One Click.";

export default function LandingPageTest1() {
  return (
    <div className="min-h-screen bg-[#0c0c0c]">
      <Navbar />

      {/* 1. HERO - Transformation mockup with floating luxury items */}
      <TransformationHero
        headline={"See Luxury Pieces on Yourself Before You Buy"}
        emoji="👜"
      />
      <HeroQuote />

      {/* 2. HOW IT WORKS */}
      <HowItWorksSection />

      {/* 3. SOCIAL PROOF GALLERY */}
      <SocialProofSection />

      {/* 4. FLEX WORTH & LEADERBOARD */}
      <FlexWorthSection />

      {/* 5. GLOBE - LOCATIONS */}
      <GlobeSection />

      {/* 6. PERSONA CARDS */}

      {/* 7. PRICING GRID */}
      <PricingGrid />

      {/* 8. FAQ */}
      <FAQSection />

      {/* 9. MINI TESTIMONIALS ROW */}
      {/* <Testimonials /> */}

      {/* 9. FINAL CTA BANNER */}
      <CTABanner />

      {/* 10. MINIMAL FOOTER */}
      <Footer />
    </div>
  );
}
