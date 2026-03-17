"use server";

import { existsSync } from "node:fs";
import path from "node:path";
import { assetUrl } from "@/lib/assets";
import {
  IDEA_CATEGORY_LABELS,
  IDEA_CATEGORY_ORDER,
  getIdeasByCategory,
} from "@/lib/constants/idea-pages";
import type { IdeaCategory } from "@/lib/constants/idea-topic-seeds";
import architectureStylePrompts from "@/public/architecture-styles/prompts.json";
import fullPrompts from "@/public/real-estate-full/prompts.json";
import frontPrompts from "@/public/real-estate-front/prompts.json";
import presetPrompts from "@/public/real-estate-presets/prompts.json";
import interiorStylePrompts from "@/public/interior-styles/prompts.json";

type PropertyPromptRecord = {
  name: string;
  desc?: string;
  property?: string;
  prompt: string;
};

type StylePromptRecord = {
  value: string;
  label: string;
  prompt: string;
};

type ExploreVariant = "morning" | "night" | "overcast" | "lifestyle";

export type ExploreCategoryId = "all" | IdeaCategory;

export interface ExploreImage {
  id: string;
  url: string;
  name: string;
  description: string;
  packSlug: string;
  packTitle: string;
  category: IdeaCategory;
  categoryLabel: string;
}

export interface ExploreCategory {
  id: ExploreCategoryId;
  label: string;
  cover: string;
  count: number;
}

const VARIANT_ORDER: ExploreVariant[] = [
  "morning",
  "night",
  "overcast",
  "lifestyle",
];

const VARIANT_LABELS: Record<ExploreVariant, string> = {
  morning: "Morning",
  night: "Night",
  overcast: "Overcast",
  lifestyle: "Lifestyle",
};

const FULL_VARIATION_NAMES = [
  "classic-white-mansion",
  "desert-modern-house",
  "japanese-minimalist-home",
  "luxury-glass-skyscraper",
  "malibu-beach-mansion",
  "miami-condo-tower",
  "modern-glass-villa",
  "swiss-mountain-chalet",
  "tropical-overwater-villa",
  "tuscan-villa-estate",
] as const;

const PRESET_VARIATION_NAMES = [
  "hollywood-hills-modern",
  "japanese-zen-house",
  "maldives-overwater",
  "mediterranean-villa",
  "miami-penthouse",
] as const;

const INTERIOR_VARIATION_ENTRIES = [
  {
    slug: "modern-minimalist",
    title: "Modern Minimal Interior",
    description: "Landing interior variation with a clean contemporary furniture scheme.",
  },
  {
    slug: "art-deco",
    title: "Art Deco Interior",
    description: "Landing interior variation with Deco lighting, pattern, and material direction.",
  },
  {
    slug: "scandinavian",
    title: "Scandinavian Interior",
    description: "Landing interior variation with pale timber, soft daylight, and Nordic styling.",
  },
  {
    slug: "industrial",
    title: "Industrial Interior",
    description: "Landing interior variation with darker finishes, metal accents, and loft character.",
  },
] as const;

const CATEGORY_COVER_OVERRIDES: Record<ExploreCategoryId, string> = {
  all: assetUrl("real-estate-presets/hollywood-hills-modern.png"),
  "towers-penthouses": assetUrl("real-estate-front/glass-skyscraper-penthouse.png"),
  "luxury-residential": assetUrl("real-estate-full/modern-glass-villa.png"),
  "coastal-retreats": assetUrl("real-estate-presets/maldives-overwater.png"),
  "regional-styles": assetUrl("real-estate-full/swiss-mountain-chalet.png"),
};

function titleize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function localAssetExists(relativePath: string) {
  return existsSync(path.join(process.cwd(), "public", relativePath));
}

function createExploreImage({
  id,
  url,
  name,
  description,
  packSlug,
  packTitle,
  category,
}: Omit<ExploreImage, "categoryLabel">): ExploreImage {
  return {
    id,
    url,
    name,
    description,
    packSlug,
    packTitle,
    category,
    categoryLabel: IDEA_CATEGORY_LABELS[category],
  };
}

function getPropertyCategory(name: string): IdeaCategory {
  const normalized = name.toLowerCase();

  if (
    normalized.includes("tower") ||
    normalized.includes("skyscraper") ||
    normalized.includes("penthouse") ||
    normalized.includes("condo")
  ) {
    return "towers-penthouses";
  }

  if (
    normalized.includes("japanese") ||
    normalized.includes("swiss") ||
    normalized.includes("chalet") ||
    normalized.includes("tuscan") ||
    normalized.includes("farmhouse") ||
    normalized.includes("brownstone") ||
    normalized.includes("spanish") ||
    normalized.includes("zen")
  ) {
    return "regional-styles";
  }

  if (
    normalized.includes("beach") ||
    normalized.includes("coast") ||
    normalized.includes("overwater") ||
    normalized.includes("maldives") ||
    normalized.includes("amalfi") ||
    normalized.includes("bali") ||
    normalized.includes("cape-town") ||
    normalized.includes("caribbean") ||
    normalized.includes("fjord") ||
    normalized.includes("mykonos") ||
    normalized.includes("lake-como") ||
    normalized.includes("tulum") ||
    normalized.includes("mediterranean") ||
    normalized.includes("big-sur")
  ) {
    return "coastal-retreats";
  }

  return "luxury-residential";
}

function buildIdeaImages() {
  return IDEA_CATEGORY_ORDER.flatMap((category) =>
    getIdeasByCategory(category).flatMap((page, pageIndex) =>
      page.gallery.map((image, imageIndex) =>
        createExploreImage({
          id: `idea:${page.slug}:${image.id}:${pageIndex}:${imageIndex}`,
          url: image.src,
          name: image.title,
          description: image.description,
          packSlug: page.slug,
          packTitle: page.content.headline,
          category,
        }),
      ),
    ),
  );
}

function buildPropertyCollection(
  records: PropertyPromptRecord[],
  {
    basePath,
    packSlug,
    packTitle,
  }: {
    basePath: string;
    packSlug: string;
    packTitle: string;
  },
) {
  return records.flatMap((record) => {
    if (record.name.includes("input")) {
      return [];
    }

    const relativePath = `${basePath}/${record.name}.png`;
    if (!localAssetExists(relativePath)) {
      return [];
    }

    return [
      createExploreImage({
        id: `${packSlug}:${record.name}`,
        url: assetUrl(relativePath),
        name: titleize(record.name),
        description:
          record.desc ??
          record.property ??
          `${titleize(record.name)} architecture reference from the BrickEx landing library.`,
        packSlug,
        packTitle,
        category: getPropertyCategory(record.name),
      }),
    ];
  });
}

function buildVariationCollection(
  records: PropertyPromptRecord[],
  names: readonly string[],
  {
    basePath,
    packSlug,
    packTitle,
  }: {
    basePath: string;
    packSlug: string;
    packTitle: string;
  },
) {
  const recordMap = new Map(records.map((record) => [record.name, record]));

  return names.flatMap((name) =>
    VARIANT_ORDER.flatMap((variant) => {
      const relativePath = `${basePath}/${name}/${variant}.png`;
      if (!localAssetExists(relativePath)) {
        return [];
      }

      const record = recordMap.get(name);
      const baseTitle = titleize(name);

      return [
        createExploreImage({
          id: `${packSlug}:${name}:${variant}`,
          url: assetUrl(relativePath),
          name: `${baseTitle} ${VARIANT_LABELS[variant]}`,
          description:
            record?.desc ??
            record?.property ??
            `${VARIANT_LABELS[variant]} lighting and lifestyle study for ${baseTitle}.`,
          packSlug,
          packTitle,
          category: getPropertyCategory(name),
        }),
      ];
    }),
  );
}

function buildStyleCollection(
  records: StylePromptRecord[],
  {
    basePath,
    packSlug,
    packTitle,
    titleSuffix,
  }: {
    basePath: string;
    packSlug: string;
    packTitle: string;
    titleSuffix: string;
  },
) {
  return records.flatMap((record) => {
    if (record.value === "auto") {
      return [];
    }

    const relativePath = `${basePath}/${record.value}.jpg`;
    if (!localAssetExists(relativePath)) {
      return [];
    }

    return [
      createExploreImage({
        id: `${packSlug}:${record.value}`,
        url: assetUrl(relativePath),
        name: `${record.label} ${titleSuffix}`,
        description: `${record.label} style reference from the BrickEx landing showcase.`,
        packSlug,
        packTitle,
        category: "regional-styles",
      }),
    ];
  });
}

function buildInteriorVariationCollection() {
  return INTERIOR_VARIATION_ENTRIES.flatMap((entry) => {
    const relativePath = `interior-variations/${entry.slug}.png`;
    if (!localAssetExists(relativePath)) {
      return [];
    }

    return [
      createExploreImage({
        id: `landing-interior-variations:${entry.slug}`,
        url: assetUrl(relativePath),
        name: entry.title,
        description: entry.description,
        packSlug: "landing-interior-variations",
        packTitle: "Landing: Interior Variations",
        category: "regional-styles",
      }),
    ];
  });
}

const IDEA_IMAGES = buildIdeaImages();

const LANDING_IMAGES = [
  ...buildPropertyCollection(fullPrompts as PropertyPromptRecord[], {
    basePath: "real-estate-full",
    packSlug: "landing-real-estate-full",
    packTitle: "Landing: Full Property Renders",
  }),
  ...buildVariationCollection(
    fullPrompts as PropertyPromptRecord[],
    FULL_VARIATION_NAMES,
    {
      basePath: "real-estate-full-variations",
      packSlug: "landing-real-estate-full-variations",
      packTitle: "Landing: Full Property Variations",
    },
  ),
  ...buildPropertyCollection(frontPrompts as PropertyPromptRecord[], {
    basePath: "real-estate-front",
    packSlug: "landing-real-estate-front",
    packTitle: "Landing: Sketch-to-Render Exteriors",
  }),
  ...buildPropertyCollection(presetPrompts as PropertyPromptRecord[], {
    basePath: "real-estate-presets",
    packSlug: "landing-real-estate-presets",
    packTitle: "Landing: Property Presets",
  }),
  ...buildVariationCollection(
    presetPrompts as PropertyPromptRecord[],
    PRESET_VARIATION_NAMES,
    {
      basePath: "real-estate-variations",
      packSlug: "landing-real-estate-variations",
      packTitle: "Landing: Preset Variations",
    },
  ),
  ...buildStyleCollection(architectureStylePrompts as StylePromptRecord[], {
    basePath: "architecture-styles",
    packSlug: "landing-architecture-styles",
    packTitle: "Landing: Architecture Styles",
    titleSuffix: "Architecture",
  }),
  ...buildStyleCollection(interiorStylePrompts as StylePromptRecord[], {
    basePath: "interior-styles",
    packSlug: "landing-interior-styles",
    packTitle: "Landing: Interior Styles",
    titleSuffix: "Interior",
  }),
  ...buildInteriorVariationCollection(),
];

const EXPLORE_IMAGES: ExploreImage[] = IDEA_CATEGORY_ORDER.flatMap((category) => [
  ...IDEA_IMAGES.filter((image) => image.category === category),
  ...LANDING_IMAGES.filter((image) => image.category === category),
]);

const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    id: "all",
    label: "All Architecture",
    cover: CATEGORY_COVER_OVERRIDES.all,
    count: EXPLORE_IMAGES.length,
  },
  ...IDEA_CATEGORY_ORDER.map((category): ExploreCategory => ({
    id: category,
    label: IDEA_CATEGORY_LABELS[category],
    cover: CATEGORY_COVER_OVERRIDES[category],
    count: EXPLORE_IMAGES.filter((image) => image.category === category).length,
  })),
].filter((category): category is ExploreCategory => Boolean(category.cover));

function paginateImages(images: ExploreImage[], offset = 0, limit = 20) {
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.max(1, limit);
  const sliceEnd = safeOffset + safeLimit;
  const paginatedImages = images.slice(safeOffset, sliceEnd);

  return {
    images: paginatedImages,
    hasMore: sliceEnd < images.length,
    total: images.length,
  };
}

export async function getExploreCategories(): Promise<ExploreCategory[]> {
  return EXPLORE_CATEGORIES;
}

export async function getExploreImages(
  offset = 0,
  limit = 20,
): Promise<{ images: ExploreImage[]; hasMore: boolean; total: number }> {
  return paginateImages(EXPLORE_IMAGES, offset, limit);
}

export async function getExploreCategoryImages(
  category: ExploreCategoryId,
  offset = 0,
  limit = 20,
): Promise<{ images: ExploreImage[]; hasMore: boolean; total: number }> {
  if (category === "all") {
    return getExploreImages(offset, limit);
  }

  return paginateImages(
    EXPLORE_IMAGES.filter((image) => image.category === category),
    offset,
    limit,
  );
}
