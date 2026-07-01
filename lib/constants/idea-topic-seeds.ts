export type IdeaCategory =
  | "luxury-residential"
  | "towers-penthouses"
  | "coastal-retreats"
  | "regional-styles";

export const IDEA_CATEGORY_LABELS: Record<IdeaCategory, string> = {
  "luxury-residential": "Residencial de lujo",
  "towers-penthouses": "Torres y penthouses",
  "coastal-retreats": "Costa y hospitalidad",
  "regional-styles": "Estudios regionales y de estilo",
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
    titleSeed: "Ideas de render para penthouse de lujo",
    primaryKeyword: "ideas de render para penthouse de lujo",
    supportingKeywords: [
      "render exterior de penthouse",
      "ideas de render para terraza rooftop",
      "visualizacion inmobiliaria de penthouse",
      "inspiracion arquitectonica para penthouse",
    ],
    searchAudience: [
      "estudiantes de arquitectura creando boards de presentacion",
      "marketers inmobiliarios planificando visuales de listings",
    ],
    angle:
      "Enfoca la pagina en terrazas al skyline, torres de vidrio, piscinas rooftop e interiores de lujo como salones, decoracion escultorica, mesas de piedra, alfombras, muros de arte y amenities estilizadas.",
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
    titleSeed: "Ideas de render para villa moderna",
    primaryKeyword: "ideas de render para villa moderna",
    supportingKeywords: [
      "ideas de render exterior de villa",
      "visualizacion de villa de lujo",
      "inspiracion de render para casa moderna",
      "renders de villa para marketing inmobiliario",
    ],
    searchAudience: [
      "estudiantes de arquitectura estudiando composicion residencial moderna",
      "promotoras comercializando proyectos de villas",
    ],
    angle:
      "Centra la pagina en fachadas limpias, piscinas reflectantes, luz mediterranea y momentos interiores de alto nivel como salones, chimeneas, comedores, alfombras, jarrones, cuadros y composiciones lounge.",
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
    titleSeed: "Ideas de render para torre residencial de lujo",
    primaryKeyword: "ideas de render para torre residencial de lujo",
    supportingKeywords: [
      "render exterior de high-rise",
      "visualizacion de torre residencial",
      "render de marketing para torre de apartamentos",
      "inspiracion para rascacielos residencial",
    ],
    searchAudience: [
      "estudiantes de arquitectura presentando torres urbanas",
      "equipos inmobiliarios lanzando desarrollos residenciales",
    ],
    angle:
      "Mantiene el foco en fachadas high-rise, llegadas de podium, contexto skyline y espacios de lujo para residentes como lobbies de marmol, lounges con arte, terrazas amuebladas, wellness amenities y zonas comunes tipo hotel.",
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
    titleSeed: "Ideas de render para casa de playa",
    primaryKeyword: "ideas de render para casa de playa",
    supportingKeywords: [
      "inspiracion de render para casa costera",
      "visualizacion de villa frente al mar",
      "render exterior de casa de playa moderna",
      "imagenes de marketing inmobiliario costero",
    ],
    searchAudience: [
      "estudiantes de arquitectura disenando casas costeras",
      "marketers vendiendo viviendas y resorts frente al mar",
    ],
    angle:
      "Prioriza fachadas de madera, fondos oceanicos, salones indoor-outdoor aireados, textiles costeros por capas, decoracion escultorica, lounges en deck y visuales beachfront orientados a venta.",
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
    titleSeed: "Ideas de render para casa desert modern",
    primaryKeyword: "ideas de render para casa desert modern",
    supportingKeywords: [
      "visualizacion de casa en el desierto",
      "render arquitectonico estilo Joshua Tree",
      "render exterior de casa en Scottsdale",
      "marketing inmobiliario de arquitectura desert modern",
    ],
    searchAudience: [
      "estudiantes de arquitectura investigando forma climatica",
      "brokers y promotoras comercializando casas en el desierto",
    ],
    angle:
      "Trabaja tierra apisonada, acero corten, paisajismo escaso, interiores de lujo serenos con muros de yeso y lounge bajo, y cambios de luz dramaticos utiles para critica de estudio y decks comerciales.",
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
    titleSeed: "Ideas de render para mansion de lujo",
    primaryKeyword: "ideas de render para mansion de lujo",
    supportingKeywords: [
      "visualizacion exterior de mansion",
      "inspiracion de render para estate",
      "render de marketing inmobiliario de lujo",
      "ideas de visualizacion arquitectonica residencial",
    ],
    searchAudience: [
      "estudiantes de arquitectura presentando conceptos de estate",
      "marketers inmobiliarios creando visuales premium para listings",
    ],
    angle:
      "Centra la pagina en llegadas formales, simetria, grandes fachadas e interiores upscale como salones, chandeliers, salas de piano, comedores formales, muros de arte y bibliotecas estilizadas que comunican prestigio.",
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
    titleSeed: "Ideas de render para chalet suizo",
    primaryKeyword: "ideas de render para chalet suizo",
    supportingKeywords: [
      "visualizacion de chalet alpino",
      "inspiracion de render para casa de montana",
      "render exterior de chalet de ski",
      "visuales de marketing para chalet hospitality",
    ],
    searchAudience: [
      "estudiantes de arquitectura estudiando tipologias alpinas",
      "marketers de resorts promocionando propiedades de montana",
    ],
    angle:
      "Enfoca la pagina en calidez de madera, encuadre de montana, lounges con chimenea, textiles de lana por capas, mesas de comedor de chalet, rincones spa y mood hospitality util para estudio y listings.",
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
    titleSeed: "Ideas de render para villa toscana",
    primaryKeyword: "ideas de render para villa toscana",
    supportingKeywords: [
      "visualizacion de villa mediterranea",
      "render exterior de villa italiana",
      "inspiracion de render para casa de piedra",
      "visuales inmobiliarios de lujo en campo",
    ],
    searchAudience: [
      "estudiantes de arquitectura investigando lenguaje residencial regional",
      "marketers vendiendo estates de vinedo y villas rurales",
    ],
    angle:
      "Destaca texturas de piedra, aproximaciones con cipreses, contexto de vinedo, salones rustico-lujo, suelos de terracota, cocinas arqueadas, mesas con lino y referencias atemporales que convierten bien en decks inmobiliarios.",
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
    titleSeed: "Ideas de render para casa japonesa",
    primaryKeyword: "ideas de render para casa japonesa",
    supportingKeywords: [
      "render de casa japonesa minimalista",
      "visualizacion de casa zen",
      "inspiracion de render arquitectonico japones",
      "ideas de presentacion residencial minimal",
    ],
    searchAudience: [
      "estudiantes de arquitectura estudiando vivienda minimalista",
      "marketers de diseno mostrando conceptos residenciales calmados",
    ],
    angle:
      "Mantiene referencias disciplinadas alrededor de geometria calmada, paisajismo zen, paletas materiales limpias, salones serenos de madera, ceramica, luz de faroles de papel, styling inspirado en tatami y decisiones compositivas reutilizables.",
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
    titleSeed: "Ideas de render para villa sobre el agua",
    primaryKeyword: "ideas de render para villa sobre el agua",
    supportingKeywords: [
      "visualizacion de villa de resort",
      "render de villa en Maldivas",
      "render hospitality tropical",
      "visuales de marketing para resort de lujo",
    ],
    searchAudience: [
      "estudiantes de arquitectura explorando conceptos hospitality",
      "marketers inmobiliarios y de resort creando imagenes de campana",
    ],
    angle:
      "Mantiene coherencia en hospitality tropical, composicion de deck, reflejos de agua, suites dormitorio indoor-outdoor, banos spa, decoracion tejida, trays de desayuno e imagenes resort-grade para moodboards y paginas de lanzamiento.",
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
