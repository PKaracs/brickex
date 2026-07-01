"use server";
import { assetUrl } from "@/lib/assets";
import {
  IDEA_CATEGORY_LABELS,
  IDEA_CATEGORY_ORDER,
  getIdeasByCategory,
} from "@/lib/constants/idea-pages";
import type { IdeaCategory } from "@/lib/constants/idea-topic-seeds";
import architectureStylePrompts from "@/data/explore-prompts/architecture-styles.json";
import fullPrompts from "@/data/explore-prompts/real-estate-full.json";
import frontPrompts from "@/data/explore-prompts/real-estate-front.json";
import presetPrompts from "@/data/explore-prompts/real-estate-presets.json";
import interiorStylePrompts from "@/data/explore-prompts/interior-styles.json";

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
  morning: "Manana",
  night: "Noche",
  overcast: "Nublado",
  lifestyle: "Con vida",
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
    title: "Interior moderno minimal",
    description: "Variacion interior con mobiliario contemporaneo limpio.",
  },
  {
    slug: "art-deco",
    title: "Interior art deco",
    description: "Variacion interior con luz, patron y materiales de direccion deco.",
  },
  {
    slug: "scandinavian",
    title: "Interior escandinavo",
    description: "Variacion interior con madera clara, luz suave y styling nordico.",
  },
  {
    slug: "industrial",
    title: "Interior industrial",
    description: "Variacion interior con acabados oscuros, acentos metalicos y caracter loft.",
  },
] as const;

const CATEGORY_COVER_OVERRIDES: Record<ExploreCategoryId, string> = {
  all: assetUrl("real-estate-presets/hollywood-hills-modern.png"),
  "towers-penthouses": assetUrl("real-estate-front/glass-skyscraper-penthouse.png"),
  "luxury-residential": assetUrl("real-estate-full/modern-glass-villa.png"),
  "coastal-retreats": assetUrl("real-estate-presets/maldives-overwater.png"),
  "regional-styles": assetUrl("real-estate-full/swiss-mountain-chalet.png"),
};

const DISPLAY_TITLES: Record<string, string> = {
  "alpine-chalet-front": "Chalet alpino frontal",
  "amalfi-coast-villa": "Villa en la costa Amalfi",
  "bali-resort-villa": "Villa resort en Bali",
  "beach-house-timber": "Casa de playa en madera",
  "big-sur-mobile-home": "Vivienda movil de lujo en Big Sur",
  "brownstone-townhouse": "Townhouse brownstone",
  "cape-town-clifftop": "Residencia en acantilado de Ciudad del Cabo",
  "caribbean-plantation": "Estate colonial caribeno",
  "classic-white-mansion": "Mansion blanca clasica",
  "concrete-brutalist-house": "Casa brutalista de hormigon",
  "desert-modern-house": "Casa desert modern",
  "glass-skyscraper-penthouse": "Penthouse en rascacielos de vidrio",
  "hollywood-hills-modern": "Casa moderna en Hollywood Hills",
  industrial: "Industrial",
  japanese: "Japones",
  "japanese-minimalist-home": "Casa japonesa minimalista",
  "japanese-zen-house": "Casa japonesa zen",
  "joshua-tree-retreat": "Retiro desertico en Joshua Tree",
  "lake-como-palazzo": "Palazzo en Lago Como",
  "luxury-glass-skyscraper": "Rascacielos residencial de vidrio",
  "luxury-mobile-home": "Vivienda movil de lujo",
  "maldives-overwater": "Villa sobre el agua en Maldivas",
  "malibu-beach-mansion": "Mansion de playa en Malibu",
  "mediterranean-villa": "Villa mediterranea",
  "miami-condo-tower": "Torre residencial en Miami",
  "miami-penthouse": "Penthouse en Miami",
  "modern-glass-villa": "Villa moderna de vidrio",
  "modern-white-villa": "Villa blanca moderna",
  "mykonos-cycladic": "Casa cicladica en Mykonos",
  "norwegian-fjord-glass": "Casa de vidrio en fiordo noruego",
  "provence-farmhouse": "Casa rural en Provenza",
  "scandinavian-lakehouse": "Casa de lago escandinava",
  "spanish-colonial-mansion": "Mansion colonial espanola",
  "swiss-chalet": "Chalet suizo",
  "swiss-mountain-chalet": "Chalet suizo de montana",
  "tropical-overwater-villa": "Villa tropical sobre el agua",
  "tropical-villa-pool": "Villa tropical con piscina",
  "tulum-treehouse": "Casa arbol en Tulum",
  "tuscan-hilltop-villa": "Villa toscana en colina",
  "tuscan-stone-farmhouse": "Casa toscana de piedra",
  "tuscan-villa-estate": "Estate de villa toscana",
};

const STYLE_LABELS: Record<string, string> = {
  "Art Deco": "Art deco",
  Auto: "Auto",
  Bohemian: "Bohemio",
  Brutalist: "Brutalista",
  Coastal: "Costero",
  Colonial: "Colonial",
  Contemporary: "Contemporaneo",
  Farmhouse: "Casa rural",
  Industrial: "Industrial",
  Japandi: "Japandi",
  Japanese: "Japones",
  Luxury: "Lujo",
  Mediterranean: "Mediterraneo",
  "Mid-Century": "Medio siglo",
  Minimal: "Minimal",
  Modern: "Moderno",
  "Neo-Classical": "Neoclasico",
  Parametric: "Parametrico",
  Rustic: "Rustico",
  Scandinavian: "Escandinavo",
  Tropical: "Tropical",
};

function translateStyleLabel(label: string) {
  return STYLE_LABELS[label] ?? label;
}

function titleize(value: string) {
  const title = DISPLAY_TITLES[value];
  if (title) {
    return title;
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
    return [
      createExploreImage({
        id: `${packSlug}:${record.name}`,
        url: assetUrl(relativePath),
        name: titleize(record.name),
        description:
          `Referencia arquitectonica de ${titleize(record.name)} de la biblioteca BrickEx.`,
        packSlug,
        packTitle,
        category: getPropertyCategory(record.name),
      }),
    ];
  });
}

function buildVariationCollection(
  _records: PropertyPromptRecord[],
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
  return names.flatMap((name) =>
    VARIANT_ORDER.flatMap((variant) => {
      const relativePath = `${basePath}/${name}/${variant}.png`;
      const baseTitle = titleize(name);

      return [
        createExploreImage({
          id: `${packSlug}:${name}:${variant}`,
          url: assetUrl(relativePath),
          name: `${baseTitle} ${VARIANT_LABELS[variant]}`,
          description:
            `Estudio de ${VARIANT_LABELS[variant].toLowerCase()} para ${baseTitle}, listo para comparar luz, atmosfera y uso.`,
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
    return [
      createExploreImage({
        id: `${packSlug}:${record.value}`,
        url: assetUrl(relativePath),
        name: `${translateStyleLabel(record.label)} ${titleSuffix}`,
        description: `Referencia de estilo ${translateStyleLabel(record.label).toLowerCase()} de la biblioteca BrickEx.`,
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
    return [
      createExploreImage({
        id: `landing-interior-variations:${entry.slug}`,
        url: assetUrl(relativePath),
        name: entry.title,
        description: entry.description,
        packSlug: "landing-interior-variations",
        packTitle: "Landing: variaciones interiores",
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
    packTitle: "Landing: renders completos de propiedad",
  }),
  ...buildVariationCollection(
    fullPrompts as PropertyPromptRecord[],
    FULL_VARIATION_NAMES,
    {
      basePath: "real-estate-full-variations",
      packSlug: "landing-real-estate-full-variations",
      packTitle: "Landing: variaciones completas de propiedad",
    },
  ),
  ...buildPropertyCollection(frontPrompts as PropertyPromptRecord[], {
    basePath: "real-estate-front",
    packSlug: "landing-real-estate-front",
    packTitle: "Landing: exteriores sketch-to-render",
  }),
  ...buildPropertyCollection(presetPrompts as PropertyPromptRecord[], {
    basePath: "real-estate-presets",
    packSlug: "landing-real-estate-presets",
    packTitle: "Landing: presets de propiedad",
  }),
  ...buildVariationCollection(
    presetPrompts as PropertyPromptRecord[],
    PRESET_VARIATION_NAMES,
    {
      basePath: "real-estate-variations",
      packSlug: "landing-real-estate-variations",
      packTitle: "Landing: variaciones de presets",
    },
  ),
  ...buildStyleCollection(architectureStylePrompts as StylePromptRecord[], {
    basePath: "architecture-styles",
    packSlug: "landing-architecture-styles",
    packTitle: "Landing: estilos arquitectonicos",
    titleSuffix: "Arquitectura",
  }),
  ...buildStyleCollection(interiorStylePrompts as StylePromptRecord[], {
    basePath: "interior-styles",
    packSlug: "landing-interior-styles",
    packTitle: "Landing: estilos interiores",
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
    label: "Toda la arquitectura",
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
