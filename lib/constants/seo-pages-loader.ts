import { templates } from "./templates";

// All page categories — expanded beyond the original 5
export type PageCategory =
  | "cars"
  | "jets"
  | "yachts"
  | "locations"
  | "lifestyle"
  | "dating"
  | "social-media"
  | "professional"
  | "aesthetic";

export const PAGE_CATEGORY_LABELS: Record<PageCategory, string> = {
  dating: "Dating App Photos",
  "social-media": "Social Media",
  professional: "Professional & Headshots",
  cars: "Luxury Cars",
  jets: "Private Jets",
  yachts: "Yachts & Maritime",
  locations: "Iconic Locations",
  lifestyle: "Lifestyle & Interiors",
  aesthetic: "Aesthetics & Styles",
};

export const PAGE_CATEGORY_ORDER: PageCategory[] = [
  "dating",
  "social-media",
  "professional",
  "lifestyle",
  "aesthetic",
  "cars",
  "jets",
  "yachts",
  "locations",
];

export interface SeoPage {
  slug: string;
  category: PageCategory;
  templateId?: number;
  image?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  content: {
    headline: string;
    subheadline: string;
    paragraphs: string[];
    highlights: string[];
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  relatedSlugs: string[];
}

import carsData from "@/data/seo-pages/cars.json";
import jetsData from "@/data/seo-pages/jets.json";
import yachtsData from "@/data/seo-pages/yachts.json";
import locationsData from "@/data/seo-pages/locations.json";
import lifestyleData from "@/data/seo-pages/lifestyle.json";
import datingData from "@/data/seo-pages/dating.json";
import socialMediaData from "@/data/seo-pages/social-media.json";
import professionalData from "@/data/seo-pages/professional.json";
import aestheticData from "@/data/seo-pages/aesthetic.json";

export const allSeoPages: SeoPage[] = [
  ...(carsData as unknown as SeoPage[]),
  ...(jetsData as unknown as SeoPage[]),
  ...(yachtsData as unknown as SeoPage[]),
  ...(locationsData as unknown as SeoPage[]),
  ...(lifestyleData as unknown as SeoPage[]),
  ...(datingData as unknown as SeoPage[]),
  ...(socialMediaData as unknown as SeoPage[]),
  ...(professionalData as unknown as SeoPage[]),
  ...(aestheticData as unknown as SeoPage[]),
];

export function getPageBySlug(slug: string): SeoPage | undefined {
  return allSeoPages.find((p) => p.slug === slug);
}

export function getPagesByCategory(category: PageCategory): SeoPage[] {
  return allSeoPages.filter((p) => p.category === category);
}

import { getGalleryImages } from "./seo-gallery-manifest";

export function getPageImage(page: SeoPage): string | undefined {
  if (page.image) return page.image;
  if (page.templateId != null) {
    const template = templates.find((t) => t.id === page.templateId);
    if (template?.image) return template.image;
  }
  // Fall back to the first gallery image if one has been generated
  const gallery = getGalleryImages(page.slug);
  if (gallery.length > 0) return gallery[0].url;
  return undefined;
}
