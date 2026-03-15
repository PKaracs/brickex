export type IdeaCategory =
  | "luxury-residential"
  | "towers-penthouses"
  | "coastal-retreats"
  | "regional-styles";

export const IDEA_CATEGORY_LABELS: Record<IdeaCategory, string> = {
  "luxury-residential": "Luxury Residential",
  "towers-penthouses": "Towers & Penthouses",
  "coastal-retreats": "Coastal & Hospitality",
  "regional-styles": "Regional & Style Studies",
};

export const IDEA_CATEGORY_ORDER: IdeaCategory[] = [
  "towers-penthouses",
  "luxury-residential",
  "coastal-retreats",
  "regional-styles",
];

export type IdeaImageVariant = "morning" | "night" | "overcast" | "lifestyle";

export type IdeaAssetRef =
  | { kind: "full"; name: string }
  | { kind: "fullVariation"; name: string; variant: IdeaImageVariant }
  | { kind: "preset"; name: string }
  | { kind: "presetVariation"; name: string; variant: IdeaImageVariant }
  | { kind: "front"; name: string }
  | { kind: "style"; name: string };

export interface IdeaTopicSeed {
  slug: string;
  category: IdeaCategory;
  titleSeed: string;
  primaryKeyword: string;
  supportingKeywords: string[];
  searchAudience: string[];
  angle: string;
  gallery: IdeaAssetRef[];
  relatedSlugs: string[];
}

const full = (name: string): IdeaAssetRef => ({ kind: "full", name });
const fullVariation = (
  name: string,
  variant: IdeaImageVariant,
): IdeaAssetRef => ({
  kind: "fullVariation",
  name,
  variant,
});
const preset = (name: string): IdeaAssetRef => ({ kind: "preset", name });
const presetVariation = (
  name: string,
  variant: IdeaImageVariant,
): IdeaAssetRef => ({
  kind: "presetVariation",
  name,
  variant,
});
const front = (name: string): IdeaAssetRef => ({ kind: "front", name });
const style = (name: string): IdeaAssetRef => ({ kind: "style", name });

export const ideaTopicSeeds: IdeaTopicSeed[] = [
  {
    slug: "luxury-penthouse-render-ideas",
    category: "towers-penthouses",
    titleSeed: "Luxury Penthouse Render Ideas",
    primaryKeyword: "luxury penthouse render ideas",
    supportingKeywords: [
      "penthouse exterior render",
      "rooftop terrace render ideas",
      "real estate penthouse visualization",
      "architectural penthouse inspiration",
    ],
    searchAudience: [
      "architecture students building presentation boards",
      "real estate marketers planning listing visuals",
    ],
    angle:
      "Focus on skyline-facing terraces, glass towers, rooftop pools, and luxury interior moments like living rooms, sculptural decor, stone tables, rugs, art walls, and styled amenity spaces.",
    gallery: [
      preset("miami-penthouse"),
      presetVariation("miami-penthouse", "morning"),
      presetVariation("miami-penthouse", "night"),
      presetVariation("miami-penthouse", "overcast"),
      presetVariation("miami-penthouse", "lifestyle"),
      front("glass-skyscraper-penthouse"),
      full("luxury-glass-skyscraper"),
      fullVariation("luxury-glass-skyscraper", "night"),
    ],
    relatedSlugs: [
      "luxury-condo-tower-render-ideas",
      "modern-villa-render-ideas",
      "luxury-mansion-render-ideas",
    ],
  },
  {
    slug: "modern-villa-render-ideas",
    category: "luxury-residential",
    titleSeed: "Modern Villa Render Ideas",
    primaryKeyword: "modern villa render ideas",
    supportingKeywords: [
      "villa exterior rendering ideas",
      "luxury villa visualization",
      "modern house render inspiration",
      "real estate villa marketing renders",
    ],
    searchAudience: [
      "architecture students studying modern residential composition",
      "developers marketing villa projects",
    ],
    angle:
      "Center the page on clean facades, reflective pools, Mediterranean lighting, and high-end interior styling moments like living rooms, fireplaces, dining areas, rugs, vases, paintings, and lounge compositions.",
    gallery: [
      full("modern-glass-villa"),
      fullVariation("modern-glass-villa", "morning"),
      fullVariation("modern-glass-villa", "night"),
      fullVariation("modern-glass-villa", "overcast"),
      fullVariation("modern-glass-villa", "lifestyle"),
      front("modern-white-villa"),
      preset("mediterranean-villa"),
      presetVariation("mediterranean-villa", "lifestyle"),
    ],
    relatedSlugs: [
      "luxury-mansion-render-ideas",
      "desert-modern-house-render-ideas",
      "tuscan-villa-render-ideas",
    ],
  },
  {
    slug: "luxury-condo-tower-render-ideas",
    category: "towers-penthouses",
    titleSeed: "Luxury Condo Tower Render Ideas",
    primaryKeyword: "luxury condo tower render ideas",
    supportingKeywords: [
      "high rise exterior render",
      "condo tower visualization",
      "apartment tower marketing render",
      "residential skyscraper inspiration",
    ],
    searchAudience: [
      "architecture students presenting urban towers",
      "real estate teams launching condo developments",
    ],
    angle:
      "Keep the page focused on high-rise facades, podium arrival shots, skyline context, and luxury resident spaces like marble lobbies, art-lined lounges, furnished terraces, wellness amenities, and hotel-style common areas.",
    gallery: [
      full("miami-condo-tower"),
      fullVariation("miami-condo-tower", "morning"),
      fullVariation("miami-condo-tower", "night"),
      fullVariation("miami-condo-tower", "overcast"),
      fullVariation("miami-condo-tower", "lifestyle"),
      full("luxury-glass-skyscraper"),
      fullVariation("luxury-glass-skyscraper", "morning"),
      front("glass-skyscraper-penthouse"),
    ],
    relatedSlugs: [
      "luxury-penthouse-render-ideas",
      "modern-villa-render-ideas",
      "luxury-mansion-render-ideas",
    ],
  },
  {
    slug: "beach-house-render-ideas",
    category: "coastal-retreats",
    titleSeed: "Beach House Render Ideas",
    primaryKeyword: "beach house render ideas",
    supportingKeywords: [
      "coastal home rendering inspiration",
      "beachfront villa visualization",
      "modern beach house exterior render",
      "real estate coastal marketing images",
    ],
    searchAudience: [
      "architecture students designing coastal houses",
      "marketers selling beachfront homes and resorts",
    ],
    angle:
      "Prioritize timber facades, ocean backdrops, breezy indoor-outdoor living rooms, layered coastal textiles, sculptural decor, deck lounges, and sales-oriented beachfront visuals with strong atmosphere.",
    gallery: [
      full("malibu-beach-mansion"),
      fullVariation("malibu-beach-mansion", "morning"),
      fullVariation("malibu-beach-mansion", "night"),
      fullVariation("malibu-beach-mansion", "overcast"),
      fullVariation("malibu-beach-mansion", "lifestyle"),
      front("beach-house-timber"),
      preset("cape-town-clifftop"),
      preset("amalfi-coast-villa"),
    ],
    relatedSlugs: [
      "overwater-villa-render-ideas",
      "modern-villa-render-ideas",
      "luxury-penthouse-render-ideas",
    ],
  },
  {
    slug: "desert-modern-house-render-ideas",
    category: "luxury-residential",
    titleSeed: "Desert Modern House Render Ideas",
    primaryKeyword: "desert modern house render ideas",
    supportingKeywords: [
      "desert house visualization",
      "joshua tree architectural render",
      "scottsdale house exterior render",
      "modern desert real estate marketing",
    ],
    searchAudience: [
      "architecture students researching climate-driven form",
      "brokers and developers marketing desert homes",
    ],
    angle:
      "Lean into rammed earth, corten steel, sparse landscaping, serene luxury interiors with plaster walls and low lounge seating, and dramatic light shifts that work for both studio critiques and marketing decks.",
    gallery: [
      full("desert-modern-house"),
      fullVariation("desert-modern-house", "morning"),
      fullVariation("desert-modern-house", "night"),
      fullVariation("desert-modern-house", "overcast"),
      fullVariation("desert-modern-house", "lifestyle"),
      preset("joshua-tree-retreat"),
      front("luxury-mobile-home"),
      front("concrete-brutalist-house"),
    ],
    relatedSlugs: [
      "modern-villa-render-ideas",
      "japanese-house-render-ideas",
      "luxury-mansion-render-ideas",
    ],
  },
  {
    slug: "luxury-mansion-render-ideas",
    category: "luxury-residential",
    titleSeed: "Luxury Mansion Render Ideas",
    primaryKeyword: "luxury mansion render ideas",
    supportingKeywords: [
      "mansion exterior visualization",
      "estate rendering inspiration",
      "luxury real estate marketing render",
      "residential architectural visualization ideas",
    ],
    searchAudience: [
      "architecture students presenting estate concepts",
      "real estate marketers creating premium listing visuals",
    ],
    angle:
      "Keep the page centered on formal arrival shots, symmetry, grand facades, and upscale interior moments like salons, chandeliers, piano rooms, formal dining tables, art walls, and styled libraries that sell prestige.",
    gallery: [
      full("classic-white-mansion"),
      fullVariation("classic-white-mansion", "morning"),
      fullVariation("classic-white-mansion", "night"),
      fullVariation("classic-white-mansion", "overcast"),
      fullVariation("classic-white-mansion", "lifestyle"),
      front("spanish-colonial-mansion"),
      preset("lake-como-palazzo"),
      preset("caribbean-plantation"),
    ],
    relatedSlugs: [
      "modern-villa-render-ideas",
      "tuscan-villa-render-ideas",
      "luxury-penthouse-render-ideas",
    ],
  },
  {
    slug: "swiss-chalet-render-ideas",
    category: "regional-styles",
    titleSeed: "Swiss Chalet Render Ideas",
    primaryKeyword: "swiss chalet render ideas",
    supportingKeywords: [
      "alpine chalet visualization",
      "mountain house render inspiration",
      "ski chalet exterior render",
      "hospitality chalet marketing visuals",
    ],
    searchAudience: [
      "architecture students studying alpine typologies",
      "resort marketers promoting mountain properties",
    ],
    angle:
      "Focus on timber warmth, mountain framing, fireplace lounges, layered wool textiles, chalet dining tables, spa corners, and hospitality mood that feels practical for both studio work and listings.",
    gallery: [
      full("swiss-mountain-chalet"),
      fullVariation("swiss-mountain-chalet", "morning"),
      fullVariation("swiss-mountain-chalet", "night"),
      fullVariation("swiss-mountain-chalet", "overcast"),
      fullVariation("swiss-mountain-chalet", "lifestyle"),
      front("alpine-chalet-front"),
      preset("swiss-chalet"),
      preset("scandinavian-lakehouse"),
    ],
    relatedSlugs: [
      "tuscan-villa-render-ideas",
      "japanese-house-render-ideas",
      "beach-house-render-ideas",
    ],
  },
  {
    slug: "tuscan-villa-render-ideas",
    category: "regional-styles",
    titleSeed: "Tuscan Villa Render Ideas",
    primaryKeyword: "tuscan villa render ideas",
    supportingKeywords: [
      "mediterranean villa visualization",
      "italian villa exterior render",
      "stone farmhouse render inspiration",
      "luxury countryside real estate visuals",
    ],
    searchAudience: [
      "architecture students researching regional residential language",
      "marketers selling vineyard estates and countryside villas",
    ],
    angle:
      "Highlight stone textures, cypress approaches, vineyard context, rustic-luxury living rooms, terracotta floors, arched kitchens, linen dining setups, and timeless presentation references that convert well in real estate decks.",
    gallery: [
      full("tuscan-villa-estate"),
      fullVariation("tuscan-villa-estate", "morning"),
      fullVariation("tuscan-villa-estate", "night"),
      fullVariation("tuscan-villa-estate", "overcast"),
      fullVariation("tuscan-villa-estate", "lifestyle"),
      front("tuscan-stone-farmhouse"),
      preset("tuscan-hilltop-villa"),
      preset("provence-farmhouse"),
    ],
    relatedSlugs: [
      "modern-villa-render-ideas",
      "luxury-mansion-render-ideas",
      "swiss-chalet-render-ideas",
    ],
  },
  {
    slug: "japanese-house-render-ideas",
    category: "regional-styles",
    titleSeed: "Japanese House Render Ideas",
    primaryKeyword: "japanese house render ideas",
    supportingKeywords: [
      "japanese minimalist house render",
      "zen house visualization",
      "architectural render inspiration japan",
      "minimal residential presentation ideas",
    ],
    searchAudience: [
      "architecture students studying minimalist housing",
      "design marketers showcasing calm residential concepts",
    ],
    angle:
      "Keep the references disciplined around calm geometry, zen landscaping, clean material palettes, serene timber living rooms, ceramics, paper lantern glow, tatami-inspired styling, and composition choices students and marketers both reuse.",
    gallery: [
      full("japanese-minimalist-home"),
      fullVariation("japanese-minimalist-home", "morning"),
      fullVariation("japanese-minimalist-home", "night"),
      fullVariation("japanese-minimalist-home", "overcast"),
      fullVariation("japanese-minimalist-home", "lifestyle"),
      preset("japanese-zen-house"),
      presetVariation("japanese-zen-house", "lifestyle"),
      style("japanese"),
    ],
    relatedSlugs: [
      "desert-modern-house-render-ideas",
      "swiss-chalet-render-ideas",
      "modern-villa-render-ideas",
    ],
  },
  {
    slug: "overwater-villa-render-ideas",
    category: "coastal-retreats",
    titleSeed: "Overwater Villa Render Ideas",
    primaryKeyword: "overwater villa render ideas",
    supportingKeywords: [
      "resort villa visualization",
      "maldives villa render",
      "tropical hospitality rendering",
      "luxury resort marketing visuals",
    ],
    searchAudience: [
      "architecture students exploring hospitality concepts",
      "real estate and resort marketers building campaign imagery",
    ],
    angle:
      "Stay consistent around tropical hospitality, deck composition, water reflections, indoor-outdoor bedroom suites, spa bathrooms, woven decor, breakfast trays, and resort-grade imagery that works for moodboards and launch pages.",
    gallery: [
      full("tropical-overwater-villa"),
      fullVariation("tropical-overwater-villa", "morning"),
      fullVariation("tropical-overwater-villa", "night"),
      fullVariation("tropical-overwater-villa", "overcast"),
      fullVariation("tropical-overwater-villa", "lifestyle"),
      preset("maldives-overwater"),
      presetVariation("maldives-overwater", "lifestyle"),
      front("tropical-villa-pool"),
    ],
    relatedSlugs: [
      "beach-house-render-ideas",
      "modern-villa-render-ideas",
      "luxury-penthouse-render-ideas",
    ],
  },
];
