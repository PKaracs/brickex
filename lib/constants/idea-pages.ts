import { assetUrl } from "@/lib/assets";
import {
  IDEA_CATEGORY_LABELS,
  IDEA_CATEGORY_ORDER,
  type IdeaAssetRef,
  type IdeaCategory,
  type IdeaImageVariant,
  type IdeaTopicSeed,
  ideaTopicSeeds,
} from "./idea-topic-seeds";

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
  morning: "Manana",
  night: "Noche",
  overcast: "Nublado",
  lifestyle: "Con vida",
};

const VARIANT_DESCRIPTIONS: Record<IdeaImageVariant, string> = {
  morning:
    "Estudio de luz de manana con color suave de amanecer y atmosfera calmada.",
  night:
    "Estudio nocturno con brillo interior calido y contraste premium de twilight.",
  overcast:
    "Estudio nublado y dramatico para leer materiales, fachada y atmosfera.",
  lifestyle:
    "Variacion lifestyle con personas, vehiculos y senales de uso real.",
};

const DISPLAY_TITLES: Record<string, string> = {
  "alpine-chalet-front": "Chalet alpino frontal",
  "amalfi-coast-villa": "Villa en la costa Amalfi",
  "beach-house-timber": "Casa de playa en madera",
  "cape-town-clifftop": "Residencia en acantilado de Ciudad del Cabo",
  "caribbean-plantation": "Estate colonial caribeno",
  "classic-white-mansion": "Mansion blanca clasica",
  "concrete-brutalist-house": "Casa brutalista de hormigon",
  "desert-modern-house": "Casa desert modern",
  "glass-skyscraper-penthouse": "Penthouse en rascacielos de vidrio",
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
  "provence-farmhouse": "Casa rural en Provenza",
  "scandinavian-lakehouse": "Casa de lago escandinava",
  "spanish-colonial-mansion": "Mansion colonial espanola",
  "swiss-chalet": "Chalet suizo",
  "swiss-mountain-chalet": "Chalet suizo de montana",
  "tropical-overwater-villa": "Villa tropical sobre el agua",
  "tropical-villa-pool": "Villa tropical con piscina",
  "tuscan-hilltop-villa": "Villa toscana en colina",
  "tuscan-stone-farmhouse": "Casa toscana de piedra",
  "tuscan-villa-estate": "Estate de villa toscana",
};

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

function buildDisplayPrompt(title: string, variant?: IdeaImageVariant) {
  const variationLine = variant
    ? `Variacion: ${VARIANT_LABELS[variant].toLowerCase()}. Mantiene el edificio, la composicion y la camara, cambiando solo atmosfera, luz y senales de uso.`
    : "Mantiene una composicion clara, materiales legibles y encuadre de marketing inmobiliario.";

  return `Crea un render arquitectonico fotorrealista de ${title}.

${variationLine}

Incluye lenguaje material creible, profundidad espacial, luz natural controlada y detalles suficientes para que la escena funcione como referencia de presentacion, listing o campana.`;
}

function buildImageFromAssetRef(ref: IdeaAssetRef): IdeaGalleryImage {
  const makeBaseImage = (
    name: string,
    src: string,
    aspectRatio: GalleryAspectRatio,
    titleSuffix?: string,
    description?: string,
  ): IdeaGalleryImage => {
    const baseTitle = titleize(name);
    const title = titleSuffix ? `${baseTitle} ${titleSuffix}` : baseTitle;
    const variant = "variant" in ref ? ref.variant : undefined;
    return {
      id: `${ref.kind}:${name}${"variant" in ref ? `:${ref.variant}` : ""}`,
      src,
      aspectRatio,
      title,
      altText: `Idea de render arquitectonico: ${title}`,
      description:
        description ??
        `${title} como imagen de referencia para visualizacion arquitectonica, concept boards y marketing inmobiliario.`,
      prompt: buildDisplayPrompt(title, variant),
      promptLabel:
        "variant" in ref
          ? `Receta de prompt: ${VARIANT_LABELS[ref.variant]}`
          : "Receta de prompt",
    };
  };

  switch (ref.kind) {
    case "full": {
      return makeBaseImage(
        ref.name,
        assetUrl(`real-estate-full/${ref.name}.png`),
        "cinema",
        undefined,
        `Render hero de ${titleize(ref.name)} para presentacion exterior y visualizacion con calidad de listing.`,
      );
    }
    case "fullVariation": {
      return makeBaseImage(
        ref.name,
        assetUrl(`real-estate-full-variations/${ref.name}/${ref.variant}.png`),
        "cinema",
        VARIANT_LABELS[ref.variant],
        VARIANT_DESCRIPTIONS[ref.variant],
      );
    }
    case "preset": {
      return makeBaseImage(
        ref.name,
        assetUrl(`real-estate-presets/${ref.name}.png`),
        "cinema",
      );
    }
    case "presetVariation": {
      return makeBaseImage(
        ref.name,
        assetUrl(`real-estate-variations/${ref.name}/${ref.variant}.png`),
        "cinema",
        VARIANT_LABELS[ref.variant],
        VARIANT_DESCRIPTIONS[ref.variant],
      );
    }
    case "front": {
      return makeBaseImage(
        ref.name,
        assetUrl(`real-estate-front/${ref.name}.png`),
        "cinema",
      );
    }
    case "style": {
      return makeBaseImage(
        ref.name,
        assetUrl(`architecture-styles/${ref.name}.jpg`),
        "square",
        "Estudio de estilo",
        `Estudio de estilo arquitectonico ${titleize(ref.name)} para desarrollo conceptual y referencias de volumen.`,
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
      description: `Explora ${seed.primaryKeyword} con BrickEx. Revisa ocho referencias de render, prompts y angulos de presentacion para estudiantes de arquitectura y marketers inmobiliarios.`,
      keywords: [seed.primaryKeyword, ...seed.supportingKeywords],
    },
    content: {
      headline,
      subheadline:
        "Un pack de referencias enfocado para visualizacion de lujo, presentaciones conceptuales y marketing inmobiliario.",
      paragraphs: [
        `${seed.titleSeed} debe hacer mas que parecer caro. Las mejores referencias ayudan a estudiantes de arquitectura a explicar forma, atmosfera y styling espacial, y dan a marketers imagenes capaces de sostener una landing, brochure o campana de listings.`,
        `Este pack de BrickEx se mantiene centrado en la intencion de busqueda detras de "${seed.primaryKeyword}". En lugar de mezclar visuales aleatorios, agrupa ocho referencias relacionadas que muestran cambios de luz, contexto y enfoques de presentacion reutilizables en proyectos reales.`,
        `Usa los prompts de la galeria para estudiar composicion, lenguaje material, mood interior y direccion de estilo. Asi la pagina sirve como inspiracion y como punto de partida para generar tus propias ideas de render inmobiliario dentro de BrickEx.`,
      ],
      highlights: [
        "Ocho referencias visuales curadas por tema",
        "Estudios de imagen listos para prompt",
        "Util para estudiantes de arquitectura y marketers",
        "Ideas de composicion interior y exterior",
        "Imagenes pensadas para presentaciones inmobiliarias",
        "Set de inspiracion listo para BrickEx",
      ],
    },
    faq: [
      {
        question: `Para quien es esta pagina de ${seed.titleSeed.toLowerCase()}?`,
        answer:
          "Esta creada para estudiantes de arquitectura que buscan material de referencia y para marketers inmobiliarios que necesitan direccion para visuales de campana, imagenes de listings o boards de presentacion.",
      },
      {
        question: "Puedo reutilizar estos prompts en BrickEx?",
        answer:
          "Si. Cada imagen de la galeria incluye la logica del prompt para que adaptes la luz, composicion y lenguaje de la propiedad a tus propios renders.",
      },
      {
        question: "Por que la pagina muestra varias condiciones de luz?",
        answer:
          "Mostrar variaciones de manana, noche, nublado y lifestyle ayuda a comparar como funciona la misma idea arquitectonica en distintos moods, contextos de venta y estilos de presentacion.",
      },
    ],
  };
}

export const allIdeaPages: IdeaPage[] = ideaTopicSeeds.map((seed) => {
  const generated = createFallbackContent(seed);

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
    gallery: seed.gallery.map(buildImageFromAssetRef),
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
