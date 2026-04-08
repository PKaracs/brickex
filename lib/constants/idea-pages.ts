import contentData from "@/data/ideas/brickex-ideas-content.json";
import ideaGalleryManifest from "@/data/ideas/idea-gallery-manifest.json";
import architectureStylePrompts from "@/data/explore-prompts/architecture-styles.json";
import fullPrompts from "@/data/explore-prompts/real-estate-full.json";
import frontPrompts from "@/data/explore-prompts/real-estate-front.json";
import presetPrompts from "@/data/explore-prompts/real-estate-presets.json";
import {
  IDEA_CATEGORY_LABELS,
  IDEA_CATEGORY_ORDER,
  type IdeaAssetRef,
  type IdeaCategory,
  type IdeaImageVariant,
  type IdeaTopicSeed,
  ideaTopicSeeds,
} from "./idea-topic-seeds";

type PromptRecord = {
  name?: string;
  value?: string;
  label?: string;
  prompt: string;
};

type GalleryAspectRatio = "cinema" | "portrait" | "square";

export interface IdeaGalleryImage {
  id: string;
  src: string;
  aspectRatio: GalleryAspectRatio;
  title: string;
  altText: string;
  description: string;
  prompt: string;
  promptLabel: string;
}

export interface IdeaPage {
  slug: string;
  category: IdeaCategory;
  primaryKeyword: string;
  titleSeed: string;
  searchAudience: string[];
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
  gallery: IdeaGalleryImage[];
}

interface IdeaGalleryManifestEntry {
  slug: string;
  images: IdeaGalleryImage[];
}

interface GeneratedIdeaContent {
  slug: string;
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
}

const VARIANT_LABELS: Record<IdeaImageVariant, string> = {
  morning: "Morning",
  night: "Night",
  overcast: "Overcast",
  lifestyle: "Lifestyle",
};

const VARIANT_DESCRIPTIONS: Record<IdeaImageVariant, string> = {
  morning:
    "Early morning lighting study with soft sunrise color and calm atmosphere.",
  night:
    "Night rendering study with warm interior glow and premium twilight contrast.",
  overcast:
    "Moody overcast rendering study for dramatic material and facade reading.",
  lifestyle:
    "Lifestyle marketing variation with people, vehicles, and lived-in cues.",
};

const BASE_VARIATION_PROMPTS: Record<
  Exclude<IdeaImageVariant, "lifestyle">,
  string
> = {
  night: `Transform this property photograph to NIGHTTIME.

KEEP the exact same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND TIME OF DAY:
- Deep dark blue or navy night sky
- Warm interior light glowing through windows
- Exterior architectural lighting and path lights
- Reflections of light on glass, water, and polished surfaces
- The building should feel luxurious and inviting at night`,
  morning: `Transform this property photograph to EARLY MORNING / SUNRISE.

KEEP the exact same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND TIME OF DAY:
- Soft sunrise light with pink, peach, and pale blue tones
- Gentle haze or mist in the air
- Long, soft shadows from the low sun
- Calm, quiet morning atmosphere
- Fresh landscaping and subtle sunrise reflections`,
  overcast: `Transform this property photograph to DRAMATIC OVERCAST / MOODY weather.

KEEP the exact same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND ATMOSPHERE:
- Heavy, textured cloud cover
- Cool, cinematic palette with wet surfaces
- Rich contrast while keeping materials readable
- Moody architectural drama
- Vegetation saturated from recent rain`,
};

const FULL_LIFESTYLE_SCENES: Record<string, string> = {
  "classic-white-mansion":
    "An elegant couple in formal attire on the front steps, a Bentley Continental GT on the circular driveway, and subtle service activity in the background.",
  "desert-modern-house":
    "A relaxed luxury desert lifestyle with one person near the entry, a Rivian on the gravel drive, and a second person on the patio.",
  "japanese-minimalist-home":
    "A restrained lifestyle scene with a person on the slate pathway, a white Lexus in the parking area, and warm interior glow behind the facade.",
  "luxury-glass-skyscraper":
    "Street-level business life with people near the lobby, a Maybach arrival, and restrained retail activity at the podium.",
  "malibu-beach-mansion":
    "Casual resort life with a couple on the sand, surfboards by the patio, and a vintage wagon in the driveway.",
  "miami-condo-tower":
    "Palm-lined street activity with residents near the lobby and a Ferrari arrival at the entrance.",
  "modern-glass-villa":
    "A luxury residential lifestyle with people by the pool, a Porsche on the driveway, and a styled outdoor dining setup.",
  "swiss-mountain-chalet":
    "Family-oriented alpine life with people on the balcony, a Defender in front, and equipment near the entrance.",
  "tropical-overwater-villa":
    "A resort lifestyle with a couple on the deck, one person in the water, and a private boat docked nearby.",
  "tuscan-villa-estate":
    "Elegant countryside living with a couple on the path, a Maserati near the entrance, and a wine setup under the portico.",
};

const PRESET_LIFESTYLE_SCENES: Record<string, string> = {
  "japanese-zen-house":
    "A person in a linen robe on the pathway, a white Tesla nearby, and soft warm light through the shoji screens.",
  "maldives-overwater":
    "A woman walking toward the villa, a traditional boat beside the deck, and drinks staged by the railing.",
  "mediterranean-villa":
    "Family life around the pool, a white Range Rover on the drive, and a pergola dining scene.",
  "miami-penthouse":
    "People on the rooftop terrace, a supercar arrival below, and cocktails in the outdoor bar zone.",
};

function toPromptMap(records: PromptRecord[], key: "name" | "value") {
  return new Map(
    records
      .filter((record): record is PromptRecord & Record<typeof key, string> => {
        return typeof record[key] === "string";
      })
      .map((record) => [record[key], record.prompt]),
  );
}

const fullPromptMap = toPromptMap(fullPrompts as PromptRecord[], "name");
const presetPromptMap = toPromptMap(presetPrompts as PromptRecord[], "name");
const frontPromptMap = toPromptMap(frontPrompts as PromptRecord[], "name");
const stylePromptMap = toPromptMap(
  architectureStylePrompts as PromptRecord[],
  "value",
);

function titleize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPromptOrThrow(
  map: Map<string, string>,
  key: string,
  label: string,
): string {
  const prompt = map.get(key);
  if (!prompt) {
    throw new Error(`Missing prompt for ${label}: ${key}`);
  }
  return prompt;
}

function buildLifestylePrompt(basePrompt: string, scene: string) {
  return `${basePrompt}

Transform this property photograph to add PEOPLE and VEHICLES for a lifestyle scene.

KEEP the exact same building, angle, perspective, composition, and every architectural detail identical. Keep the same daylight conditions.

ADD THE FOLLOWING ELEMENTS NATURALLY INTO THE SCENE:
${scene}

RULES:
- People must look photorealistic and belong in the setting
- Vehicles must have correct proportions, reflections, and shadows
- Everything must be lit consistently with the existing scene
- Do not change the building, landscaping, or camera angle`;
}

function buildVariationPrompt(
  basePrompt: string,
  ref: Extract<IdeaAssetRef, { variant: IdeaImageVariant }>,
) {
  if (ref.variant === "lifestyle") {
    const scene =
      ref.kind === "presetVariation"
        ? PRESET_LIFESTYLE_SCENES[ref.name]
        : FULL_LIFESTYLE_SCENES[ref.name];

    if (!scene) {
      throw new Error(
        `Missing lifestyle prompt scene for ${ref.kind}:${ref.name}`,
      );
    }

    return buildLifestylePrompt(basePrompt, scene);
  }

  return `${basePrompt}

${BASE_VARIATION_PROMPTS[ref.variant]}`;
}

function buildImageFromAssetRef(ref: IdeaAssetRef): IdeaGalleryImage {
  const makeBaseImage = (
    name: string,
    src: string,
    prompt: string,
    aspectRatio: GalleryAspectRatio,
    titleSuffix?: string,
    description?: string,
  ): IdeaGalleryImage => {
    const baseTitle = titleize(name);
    const title = titleSuffix ? `${baseTitle} ${titleSuffix}` : baseTitle;
    return {
      id: `${ref.kind}:${name}${"variant" in ref ? `:${ref.variant}` : ""}`,
      src,
      aspectRatio,
      title,
      altText: `${title} architectural render idea`,
      description:
        description ??
        `${title} reference image for architectural visualization, concept boards, and real estate marketing.`,
      prompt,
      promptLabel:
        "variant" in ref
          ? `${VARIANT_LABELS[ref.variant]} prompt recipe`
          : "Prompt recipe",
    };
  };

  switch (ref.kind) {
    case "full": {
      const prompt = getPromptOrThrow(fullPromptMap, ref.name, "full");
      return makeBaseImage(
        ref.name,
        `/real-estate-full/${ref.name}.png`,
        prompt,
        "cinema",
        undefined,
        `${titleize(ref.name)} hero render for exterior presentation and listing-quality visualization.`,
      );
    }
    case "fullVariation": {
      const basePrompt = getPromptOrThrow(
        fullPromptMap,
        ref.name,
        "full variation",
      );
      return makeBaseImage(
        ref.name,
        `/real-estate-full-variations/${ref.name}/${ref.variant}.png`,
        buildVariationPrompt(basePrompt, ref),
        "cinema",
        VARIANT_LABELS[ref.variant],
        VARIANT_DESCRIPTIONS[ref.variant],
      );
    }
    case "preset": {
      const prompt = getPromptOrThrow(presetPromptMap, ref.name, "preset");
      return makeBaseImage(
        ref.name,
        `/real-estate-presets/${ref.name}.png`,
        prompt,
        "cinema",
      );
    }
    case "presetVariation": {
      const basePrompt = getPromptOrThrow(
        presetPromptMap,
        ref.name,
        "preset variation",
      );
      return makeBaseImage(
        ref.name,
        `/real-estate-variations/${ref.name}/${ref.variant}.png`,
        buildVariationPrompt(basePrompt, ref),
        "cinema",
        VARIANT_LABELS[ref.variant],
        VARIANT_DESCRIPTIONS[ref.variant],
      );
    }
    case "front": {
      const prompt = getPromptOrThrow(frontPromptMap, ref.name, "front");
      return makeBaseImage(
        ref.name,
        `/real-estate-front/${ref.name}.png`,
        prompt,
        "cinema",
      );
    }
    case "style": {
      const prompt = getPromptOrThrow(stylePromptMap, ref.name, "style");
      return makeBaseImage(
        ref.name,
        `/architecture-styles/${ref.name}.jpg`,
        prompt,
        "square",
        "Style Study",
        `${titleize(ref.name)} architecture style study for concept development and massing references.`,
      );
    }
  }
}

function createFallbackContent(seed: IdeaTopicSeed): GeneratedIdeaContent {
  const headline = seed.titleSeed;

  return {
    slug: seed.slug,
    seo: {
      title: `${seed.titleSeed} | BrickEx`,
      description: `Browse ${seed.primaryKeyword} with BrickEx. Explore eight render references, prompts, and presentation angles for architecture students and real estate marketers.`,
      keywords: [seed.primaryKeyword, ...seed.supportingKeywords],
    },
    content: {
      headline,
      subheadline:
        "A focused reference pack built for luxury visualization, concept presentations, and real estate marketing.",
      paragraphs: [
        `${seed.titleSeed} should do more than look expensive. The strongest references help architecture students explain form, atmosphere, and spatial styling while giving marketers images that can anchor a landing page, brochure, or listing campaign.`,
        `This BrickEx pack stays tight on the search intent behind "${seed.primaryKeyword}". Instead of mixing random visuals, it groups eight related render references that show lighting shifts, context, and presentation approaches that people actually reuse in project work.`,
        `Use the gallery prompts to study composition, material language, interior mood, and styling direction. That makes the page useful both as inspiration and as a starting point for generating your own real estate render ideas inside BrickEx.`,
      ],
      highlights: [
        "Eight curated visual references per topic",
        "Prompt-ready image studies",
        "Useful for architecture students and marketers",
        "Interior and exterior composition ideas",
        "Real estate presentation-friendly imagery",
        "BrickEx-ready inspiration set",
      ],
    },
    faq: [
      {
        question: `Who is this ${seed.titleSeed.toLowerCase()} page for?`,
        answer:
          "It is built for architecture students looking for reference material and for real estate marketers who need direction for campaign visuals, listing imagery, or presentation boards.",
      },
      {
        question: "Can I reuse these prompts in BrickEx?",
        answer:
          "Yes. Each gallery image includes the underlying prompt logic so you can adapt the lighting, composition, and property language for your own renders.",
      },
      {
        question: "Why does the page show multiple lighting conditions?",
        answer:
          "Showing morning, night, overcast, and lifestyle variations helps you compare how the same architectural idea performs across mood, sales context, and presentation style.",
      },
    ],
  };
}

const generatedContentMap = new Map(
  (contentData as GeneratedIdeaContent[]).map((item) => [item.slug, item]),
);

const generatedGalleryMap = new Map(
  Object.entries(
    ideaGalleryManifest as Record<string, IdeaGalleryManifestEntry>,
  ),
);

export const allIdeaPages: IdeaPage[] = ideaTopicSeeds.map((seed) => {
  const generated =
    generatedContentMap.get(seed.slug) ?? createFallbackContent(seed);
  const generatedGallery = generatedGalleryMap.get(seed.slug)?.images ?? [];

  return {
    slug: seed.slug,
    category: seed.category,
    primaryKeyword: seed.primaryKeyword,
    titleSeed: seed.titleSeed,
    searchAudience: seed.searchAudience,
    seo: generated.seo,
    content: generated.content,
    faq: generated.faq,
    relatedSlugs: seed.relatedSlugs,
    gallery:
      generatedGallery.length > 0
        ? generatedGallery
        : seed.gallery.map(buildImageFromAssetRef),
  };
});

export { IDEA_CATEGORY_LABELS, IDEA_CATEGORY_ORDER };

export function getIdeaBySlug(slug: string): IdeaPage | undefined {
  return allIdeaPages.find((page) => page.slug === slug);
}

export function getIdeasByCategory(category: IdeaCategory): IdeaPage[] {
  return allIdeaPages.filter((page) => page.category === category);
}

export function getIdeaHeroImage(page: IdeaPage): string | undefined {
  return page.gallery[0]?.src;
}
