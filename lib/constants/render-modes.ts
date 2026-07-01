import {
  Building2,
  Armchair,
  Paintbrush,
  Palette,
  Users,
  type LucideIcon,
} from "lucide-react";

const SUPABASE_PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/objects`;

function shotImg(file: string) {
  return `${SUPABASE_PUBLIC}/shots/${file}`;
}

function styleImg(file: string) {
  return `${SUPABASE_PUBLIC}/styles/${file}`;
}

function objectImg(file: string) {
  return `${SUPABASE_PUBLIC}/objects/${file}`;
}

function textureImg(file: string) {
  return `${SUPABASE_PUBLIC}/textures/${file}`;
}

export interface RenderMode {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "generate" | "edit" | "scene";
}

export interface ModeSettingOption {
  value: string;
  label: string;
  image?: string;
}

export interface ModeSettingGroup {
  key: string;
  title: string;
  type:
    | "select"
    | "toggle"
    | "dropdown"
    | "select-with-upload"
    | "object-picker"
    | "texture-picker";
  columns?: 2 | 3;
  options: ModeSettingOption[];
}

export const RENDER_MODES: RenderMode[] = [
  {
    id: "exterior-render",
    label: "Render exterior",
    description:
      "Vistas exteriores fotorrealistas desde bocetos, planos o modelos",
    icon: Building2,
    category: "generate",
  },
  {
    id: "interior-render",
    label: "Render interior",
    description: "Interiores amueblados desde planos o habitaciones vacias",
    icon: Armchair,
    category: "generate",
  },
  {
    id: "style-transform",
    label: "Transformacion de estilo",
    description: "Cambia el estilo de diseno de un edificio o interior",
    icon: Paintbrush,
    category: "edit",
  },
  {
    id: "material-change",
    label: "Cambio de material",
    description: "Cambia materiales y acabados en cualquier superficie",
    icon: Palette,
    category: "edit",
  },
  {
    id: "scene-composition",
    label: "Composicion de escena",
    description: "Anade personas, coches, paisajismo y elementos lifestyle",
    icon: Users,
    category: "scene",
  },
];

export const MODE_CATEGORIES = [
  { key: "generate" as const, label: "Generar" },
  { key: "edit" as const, label: "Editar" },
  { key: "scene" as const, label: "Escena" },
];

const AUTO: ModeSettingOption = { value: "auto", label: "Auto" };

const EXTERIOR_SETTINGS: ModeSettingGroup[] = [
  {
    key: "shotType",
    title: "Tipo de toma",
    type: "dropdown",
    options: [
      AUTO,
      {
        value: "street-level",
        label: "A nivel de calle",
        image: shotImg("street-level.jpg"),
      },
      {
        value: "wide-angle",
        label: "Gran angular",
        image: shotImg("wide-angle.jpg"),
      },
      { value: "aerial", label: "Aerea", image: shotImg("aerial.jpg") },
      { value: "rooftop", label: "Azotea", image: shotImg("rooftop.jpg") },
      {
        value: "corner-view",
        label: "Vista en esquina",
        image: shotImg("corner-view.jpg"),
      },
      {
        value: "close-up",
        label: "Primer plano de detalle",
        image: shotImg("close-up.jpg"),
      },
      {
        value: "drone-low",
        label: "Drone bajo",
        image: shotImg("drone-low.jpg"),
      },
      {
        value: "entrance",
        label: "Vista de entrada",
        image: shotImg("entrance.jpg"),
      },
    ],
  },
  {
    key: "architectureStyle",
    title: "Estilo arquitectonico",
    type: "dropdown",
    options: [
      AUTO,
      { value: "modern", label: "Moderno", image: styleImg("modern.jpg") },
      {
        value: "mediterranean",
        label: "Mediterraneo",
        image: styleImg("mediterranean.jpg"),
      },
      { value: "minimal", label: "Minimal", image: styleImg("minimal.jpg") },
      { value: "luxury", label: "Lujo", image: styleImg("luxury.jpg") },
      {
        value: "brutalist",
        label: "Brutalista",
        image: styleImg("brutalist.jpg"),
      },
      { value: "art-deco", label: "Art Deco", image: styleImg("art-deco.jpg") },
      {
        value: "industrial",
        label: "Industrial",
        image: styleImg("industrial.jpg"),
      },
      { value: "tropical", label: "Tropical", image: styleImg("tropical.jpg") },
      { value: "japanese", label: "Japones", image: styleImg("japanese.jpg") },
      {
        value: "scandinavian",
        label: "Escandinavo",
        image: styleImg("scandinavian.jpg"),
      },
      { value: "colonial", label: "Colonial", image: styleImg("colonial.jpg") },
      {
        value: "parametric",
        label: "Parametrico",
        image: styleImg("parametric.jpg"),
      },
      {
        value: "neo-classical",
        label: "Neoclasico",
        image: styleImg("neo-classical.jpg"),
      },
      {
        value: "farmhouse",
        label: "Casa de campo",
        image: styleImg("farmhouse.jpg"),
      },
      {
        value: "contemporary",
        label: "Contemporaneo",
        image: styleImg("contemporary.jpg"),
      },
    ],
  },
  {
    key: "facadeMaterial",
    title: "Material de fachada",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "concrete", label: "Hormigon" },
      { value: "stone", label: "Piedra" },
      { value: "wood", label: "Madera" },
      { value: "glass", label: "Vidrio" },
    ],
  },
  {
    key: "environment",
    title: "Entorno",
    type: "select-with-upload",
    columns: 2,
    options: [
      AUTO,
      { value: "urban", label: "Urbano" },
      { value: "nature", label: "Natural" },
      { value: "coastal", label: "Costero" },
    ],
  },
  {
    key: "lighting",
    title: "Iluminacion",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "day", label: "Dia" },
      { value: "sunset", label: "Atardecer" },
      { value: "night", label: "Noche" },
    ],
  },
];

const INTERIOR_SETTINGS: ModeSettingGroup[] = [
  {
    key: "shotType",
    title: "Tipo de toma",
    type: "dropdown",
    options: [
      AUTO,
      {
        value: "wide-room",
        label: "Habitacion amplia",
        image: shotImg("wide-room.jpg"),
      },
      {
        value: "corner-angle",
        label: "Angulo de esquina",
        image: shotImg("corner-angle.jpg"),
      },
      {
        value: "straight-on",
        label: "Frontal",
        image: shotImg("straight-on.jpg"),
      },
      { value: "detail", label: "Toma de detalle", image: shotImg("detail.jpg") },
      { value: "overhead", label: "Cenital", image: shotImg("overhead.jpg") },
      {
        value: "window-view",
        label: "Vista a ventana",
        image: shotImg("window-view.jpg"),
      },
    ],
  },
  {
    key: "roomType",
    title: "Tipo de habitacion",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "living-room", label: "Salon" },
      { value: "kitchen", label: "Cocina" },
      { value: "bedroom", label: "Dormitorio" },
      { value: "bathroom", label: "Bano" },
    ],
  },
  {
    key: "interiorStyle",
    title: "Estilo interior",
    type: "dropdown",
    options: [
      { value: "auto", label: "Auto" },
      {
        value: "scandinavian",
        label: "Escandinavo",
        image: styleImg("scandinavian-int.jpg"),
      },
      { value: "modern", label: "Moderno", image: styleImg("modern-int.jpg") },
      { value: "luxury", label: "Lujo", image: styleImg("luxury-int.jpg") },
      {
        value: "minimal",
        label: "Minimal",
        image: styleImg("minimal-int.jpg"),
      },
      {
        value: "industrial",
        label: "Industrial",
        image: styleImg("industrial-int.jpg"),
      },
      {
        value: "bohemian",
        label: "Bohemio",
        image: styleImg("bohemian-int.jpg"),
      },
      {
        value: "japandi",
        label: "Japandi",
        image: styleImg("japandi-int.jpg"),
      },
      {
        value: "mid-century",
        label: "Mid-century",
        image: styleImg("mid-century-int.jpg"),
      },
      {
        value: "art-deco",
        label: "Art Deco",
        image: styleImg("art-deco-int.jpg"),
      },
      {
        value: "coastal",
        label: "Costero",
        image: styleImg("coastal-int.jpg"),
      },
      { value: "rustic", label: "Rustico", image: styleImg("rustic-int.jpg") },
    ],
  },
  {
    key: "objects",
    title: "Objetos",
    type: "object-picker",
    options: [
      { value: "sofa", label: "Sofa", image: objectImg("sofa.jpg") },
      {
        value: "dining-table",
        label: "Mesa de comedor",
        image: objectImg("dining-table.jpg"),
      },
      {
        value: "coffee-table",
        label: "Mesa de centro",
        image: objectImg("coffee-table.jpg"),
      },
      {
        value: "armchair",
        label: "Sillon",
        image: objectImg("armchair.jpg"),
      },
      {
        value: "bookshelf",
        label: "Estanteria",
        image: objectImg("bookshelf.jpg"),
      },
      {
        value: "floor-lamp",
        label: "Lampara de pie",
        image: objectImg("floor-lamp.jpg"),
      },
      {
        value: "pendant-light",
        label: "Lampara colgante",
        image: objectImg("pendant-light.jpg"),
      },
      { value: "rug", label: "Alfombra", image: objectImg("rug.jpg") },
      {
        value: "indoor-plant",
        label: "Planta interior",
        image: objectImg("indoor-plant.jpg"),
      },
      { value: "artwork", label: "Arte mural", image: objectImg("artwork.jpg") },
      { value: "mirror", label: "Espejo", image: objectImg("mirror.jpg") },
      { value: "tv-unit", label: "Mueble TV", image: objectImg("tv-unit.jpg") },
      { value: "bed", label: "Cama", image: objectImg("bed.jpg") },
      {
        value: "wardrobe",
        label: "Armario",
        image: objectImg("wardrobe.jpg"),
      },
      {
        value: "kitchen-island",
        label: "Isla de cocina",
        image: objectImg("kitchen-island.jpg"),
      },
      {
        value: "bar-stools",
        label: "Taburetes",
        image: objectImg("bar-stools.jpg"),
      },
      { value: "bathtub", label: "Banera", image: objectImg("bathtub.jpg") },
      { value: "vanity", label: "Tocador", image: objectImg("vanity.jpg") },
    ],
  },
  {
    key: "furnitureDensity",
    title: "Densidad de mobiliario",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "minimal", label: "Minima" },
      { value: "balanced", label: "Equilibrada" },
      { value: "full", label: "Staging completo" },
    ],
  },
  {
    key: "textures",
    title: "Texturas",
    type: "texture-picker",
    options: [
      { value: "marble", label: "Marmol", image: textureImg("marble-012.webp") },
      {
        value: "concrete-polished",
        label: "Hormigon pulido",
        image: textureImg("concrete-smooth.webp"),
      },
      {
        value: "concrete-rough",
        label: "Hormigon rugoso",
        image: textureImg("concrete-rough.webp"),
      },
      { value: "oakwood", label: "Madera de roble", image: textureImg("oak-wood.webp") },
      { value: "brick", label: "Ladrillo", image: textureImg("brick-herringbone.webp") },
      {
        value: "polished-metal",
        label: "Metal pulido",
        image: textureImg("polished-metal.webp"),
      },
      {
        value: "terracotta",
        label: "Terracotta",
        image: textureImg("terracotta.webp"),
      },
      {
        value: "stone-gravel",
        label: "Grava de piedra",
        image: textureImg("stone-gravel.webp"),
      },
      {
        value: "white-plaster",
        label: "Yeso blanco",
        image: textureImg("white-plaster.webp"),
      },
      {
        value: "grey-paver",
        label: "Adoquin gris",
        image: textureImg("grey-paver.webp"),
      },
      {
        value: "moss-stone",
        label: "Piedra con musgo",
        image: textureImg("moss-stone.webp"),
      },
      {
        value: "rust-metal",
        label: "Metal oxidado",
        image: textureImg("rust-metal.webp"),
      },
    ],
  },
  {
    key: "lighting",
    title: "Iluminacion",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "daylight", label: "Luz de dia" },
      { value: "warm-evening", label: "Tarde calida" },
      { value: "night", label: "Noche" },
    ],
  },
];

const STYLE_TRANSFORM_SETTINGS: ModeSettingGroup[] = [
  {
    key: "targetStyle",
    title: "Estilo objetivo",
    type: "dropdown",
    options: [
      { value: "auto", label: "Auto", image: styleImg("auto.jpg") },
      { value: "modern", label: "Moderno", image: styleImg("modern.jpg") },
      {
        value: "mediterranean",
        label: "Mediterraneo",
        image: styleImg("mediterranean.jpg"),
      },
      {
        value: "industrial",
        label: "Industrial",
        image: styleImg("industrial.jpg"),
      },
      { value: "minimal", label: "Minimal", image: styleImg("minimal.jpg") },
      { value: "luxury", label: "Lujo", image: styleImg("luxury.jpg") },
      { value: "art-deco", label: "Art Deco", image: styleImg("art-deco.jpg") },
      {
        value: "brutalist",
        label: "Brutalista",
        image: styleImg("brutalist.jpg"),
      },
      { value: "tropical", label: "Tropical", image: styleImg("tropical.jpg") },
      { value: "japanese", label: "Japones", image: styleImg("japanese.jpg") },
      {
        value: "scandinavian",
        label: "Escandinavo",
        image: styleImg("scandinavian.jpg"),
      },
      {
        value: "parametric",
        label: "Parametrico",
        image: styleImg("parametric.jpg"),
      },
      {
        value: "neo-classical",
        label: "Neoclasico",
        image: styleImg("neo-classical.jpg"),
      },
      {
        value: "contemporary",
        label: "Contemporaneo",
        image: styleImg("contemporary.jpg"),
      },
    ],
  },
  {
    key: "styleStrength",
    title: "Intensidad del estilo",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "low", label: "Baja" },
      { value: "medium", label: "Media" },
      { value: "strong", label: "Alta" },
    ],
  },
  {
    key: "preserveStructure",
    title: "Preservar estructura",
    type: "toggle",
    options: [
      { value: "on", label: "Activo" },
      { value: "off", label: "Inactivo" },
    ],
  },
];

const MATERIAL_CHANGE_SETTINGS: ModeSettingGroup[] = [
  {
    key: "surface",
    title: "Superficie",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "facade", label: "Fachada" },
      { value: "walls", label: "Paredes" },
      { value: "floor", label: "Suelo" },
      { value: "roof", label: "Techo" },
    ],
  },
  {
    key: "material",
    title: "Material",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "stone", label: "Piedra" },
      { value: "concrete", label: "Hormigon" },
      { value: "wood", label: "Madera" },
      { value: "glass", label: "Vidrio" },
      { value: "metal", label: "Metal" },
      { value: "marble", label: "Marmol" },
    ],
  },
  {
    key: "textureStrength",
    title: "Intensidad de textura",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "low", label: "Baja" },
      { value: "medium", label: "Media" },
      { value: "high", label: "Alta" },
    ],
  },
];

const SCENE_COMPOSITION_SETTINGS: ModeSettingGroup[] = [
  {
    key: "shotType",
    title: "Tipo de toma",
    type: "dropdown",
    options: [
      { value: "auto", label: "Auto", image: shotImg("auto.jpg") },
      {
        value: "wide-establishing",
        label: "Plano general",
        image: shotImg("wide-angle.jpg"),
      },
      {
        value: "eye-level",
        label: "A nivel de ojos",
        image: shotImg("street-level.jpg"),
      },
      { value: "aerial", label: "Aerea", image: shotImg("aerial.jpg") },
      {
        value: "street-view",
        label: "Vista de calle",
        image: shotImg("street-level.jpg"),
      },
    ],
  },
  {
    key: "elements",
    title: "Elementos",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "people", label: "Personas" },
      { value: "cars", label: "Coches" },
      { value: "plants", label: "Plantas" },
      { value: "furniture", label: "Mobiliario exterior" },
    ],
  },
  {
    key: "sceneActivity",
    title: "Actividad de escena",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "minimal", label: "Minima" },
      { value: "moderate", label: "Moderada" },
      { value: "busy", label: "Activa" },
    ],
  },
  {
    key: "environmentStyle",
    title: "Estilo de entorno",
    type: "select-with-upload",
    columns: 2,
    options: [
      AUTO,
      { value: "luxury", label: "Lujo" },
      { value: "urban", label: "Urbano" },
      { value: "nature", label: "Natural" },
    ],
  },
];

export const MODE_SETTINGS: Record<string, ModeSettingGroup[]> = {
  "exterior-render": EXTERIOR_SETTINGS,
  "interior-render": INTERIOR_SETTINGS,
  "style-transform": STYLE_TRANSFORM_SETTINGS,
  "material-change": MATERIAL_CHANGE_SETTINGS,
  "scene-composition": SCENE_COMPOSITION_SETTINGS,
};

export function getModeSettings(modeId: string): ModeSettingGroup[] {
  return MODE_SETTINGS[modeId] ?? [];
}

export function getDefaultModeValues(modeId: string): Record<string, string> {
  const settings = getModeSettings(modeId);
  const defaults: Record<string, string> = {};
  for (const group of settings) {
    if (group.type === "toggle") {
      defaults[group.key] = group.options[0]?.value ?? "";
    } else if (
      group.type === "object-picker" ||
      group.type === "texture-picker"
    ) {
      defaults[group.key] = "";
    } else {
      defaults[group.key] = "auto";
    }
  }
  defaults.customPrompt = "";
  return defaults;
}

// Keys that each angle slot can override (everything else is global)
export const SLOT_OVERRIDABLE_KEYS: Record<string, string[]> = {
  "exterior-render": ["shotType", "lighting", "environment", "facadeMaterial"],
  "interior-render": ["shotType", "lighting", "textures", "furnitureDensity"],
};

export function getOverridableSettings(modeId: string): ModeSettingGroup[] {
  const keys = SLOT_OVERRIDABLE_KEYS[modeId] ?? [];
  return getModeSettings(modeId).filter((g) => keys.includes(g.key));
}

export function getGlobalOnlySettings(modeId: string): ModeSettingGroup[] {
  const keys = SLOT_OVERRIDABLE_KEYS[modeId] ?? [];
  return getModeSettings(modeId).filter((g) => !keys.includes(g.key));
}

export interface AngleSlot {
  id: string;
  label: string;
  overrides: Record<string, string>;
  status: "idle" | "generating" | "done" | "error";
  outputUrl: string | null;
  error: string | null;
}

export function createAngleSlot(index: number): AngleSlot {
  return {
    id: `slot-${index}`,
    label: `Angulo ${index + 1}`,
    overrides: {},
    status: "idle",
    outputUrl: null,
    error: null,
  };
}

export function resolveSlotSettings(
  globalValues: Record<string, string>,
  slotOverrides: Record<string, string>,
): Record<string, string> {
  return { ...globalValues, ...slotOverrides };
}
