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
    label: "Exterior Render",
    description:
      "Photorealistic exterior views from sketches, plans, or models",
    icon: Building2,
    category: "generate",
  },
  {
    id: "interior-render",
    label: "Interior Render",
    description: "Furnished interiors from floor plans or empty rooms",
    icon: Armchair,
    category: "generate",
  },
  {
    id: "style-transform",
    label: "Style Transformation",
    description: "Change the design style of a building or interior",
    icon: Paintbrush,
    category: "edit",
  },
  {
    id: "material-change",
    label: "Material Change",
    description: "Swap materials and finishes on any surface",
    icon: Palette,
    category: "edit",
  },
  {
    id: "scene-composition",
    label: "Scene Composition",
    description: "Add people, cars, landscaping, and lifestyle elements",
    icon: Users,
    category: "scene",
  },
];

export const MODE_CATEGORIES = [
  { key: "generate" as const, label: "Generate" },
  { key: "edit" as const, label: "Edit" },
  { key: "scene" as const, label: "Scene" },
];

const AUTO: ModeSettingOption = { value: "auto", label: "Auto" };

const EXTERIOR_SETTINGS: ModeSettingGroup[] = [
  {
    key: "shotType",
    title: "Shot Type",
    type: "dropdown",
    options: [
      AUTO,
      {
        value: "street-level",
        label: "Street Level",
        image: shotImg("street-level.jpg"),
      },
      {
        value: "wide-angle",
        label: "Wide Angle",
        image: shotImg("wide-angle.jpg"),
      },
      { value: "aerial", label: "Aerial", image: shotImg("aerial.jpg") },
      { value: "rooftop", label: "Rooftop", image: shotImg("rooftop.jpg") },
      {
        value: "corner-view",
        label: "Corner View",
        image: shotImg("corner-view.jpg"),
      },
      {
        value: "close-up",
        label: "Detail Close-Up",
        image: shotImg("close-up.jpg"),
      },
      {
        value: "drone-low",
        label: "Low Drone",
        image: shotImg("drone-low.jpg"),
      },
      {
        value: "entrance",
        label: "Entrance View",
        image: shotImg("entrance.jpg"),
      },
    ],
  },
  {
    key: "architectureStyle",
    title: "Architecture Style",
    type: "dropdown",
    options: [
      AUTO,
      { value: "modern", label: "Modern", image: styleImg("modern.jpg") },
      {
        value: "mediterranean",
        label: "Mediterranean",
        image: styleImg("mediterranean.jpg"),
      },
      { value: "minimal", label: "Minimal", image: styleImg("minimal.jpg") },
      { value: "luxury", label: "Luxury", image: styleImg("luxury.jpg") },
      {
        value: "brutalist",
        label: "Brutalist",
        image: styleImg("brutalist.jpg"),
      },
      { value: "art-deco", label: "Art Deco", image: styleImg("art-deco.jpg") },
      {
        value: "industrial",
        label: "Industrial",
        image: styleImg("industrial.jpg"),
      },
      { value: "tropical", label: "Tropical", image: styleImg("tropical.jpg") },
      { value: "japanese", label: "Japanese", image: styleImg("japanese.jpg") },
      {
        value: "scandinavian",
        label: "Scandinavian",
        image: styleImg("scandinavian.jpg"),
      },
      { value: "colonial", label: "Colonial", image: styleImg("colonial.jpg") },
      {
        value: "parametric",
        label: "Parametric",
        image: styleImg("parametric.jpg"),
      },
      {
        value: "neo-classical",
        label: "Neo-Classical",
        image: styleImg("neo-classical.jpg"),
      },
      {
        value: "farmhouse",
        label: "Farmhouse",
        image: styleImg("farmhouse.jpg"),
      },
      {
        value: "contemporary",
        label: "Contemporary",
        image: styleImg("contemporary.jpg"),
      },
    ],
  },
  {
    key: "facadeMaterial",
    title: "Facade Material",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "concrete", label: "Concrete" },
      { value: "stone", label: "Stone" },
      { value: "wood", label: "Wood" },
      { value: "glass", label: "Glass" },
    ],
  },
  {
    key: "environment",
    title: "Environment",
    type: "select-with-upload",
    columns: 2,
    options: [
      AUTO,
      { value: "urban", label: "Urban" },
      { value: "nature", label: "Nature" },
      { value: "coastal", label: "Coastal" },
    ],
  },
  {
    key: "lighting",
    title: "Lighting",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "day", label: "Day" },
      { value: "sunset", label: "Sunset" },
      { value: "night", label: "Night" },
    ],
  },
];

const INTERIOR_SETTINGS: ModeSettingGroup[] = [
  {
    key: "shotType",
    title: "Shot Type",
    type: "dropdown",
    options: [
      AUTO,
      {
        value: "wide-room",
        label: "Wide Room",
        image: shotImg("wide-room.jpg"),
      },
      {
        value: "corner-angle",
        label: "Corner Angle",
        image: shotImg("corner-angle.jpg"),
      },
      {
        value: "straight-on",
        label: "Straight On",
        image: shotImg("straight-on.jpg"),
      },
      { value: "detail", label: "Detail Shot", image: shotImg("detail.jpg") },
      { value: "overhead", label: "Overhead", image: shotImg("overhead.jpg") },
      {
        value: "window-view",
        label: "Window View",
        image: shotImg("window-view.jpg"),
      },
    ],
  },
  {
    key: "roomType",
    title: "Room Type",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "living-room", label: "Living Room" },
      { value: "kitchen", label: "Kitchen" },
      { value: "bedroom", label: "Bedroom" },
      { value: "bathroom", label: "Bathroom" },
    ],
  },
  {
    key: "interiorStyle",
    title: "Interior Style",
    type: "dropdown",
    options: [
      { value: "auto", label: "Auto" },
      {
        value: "scandinavian",
        label: "Scandinavian",
        image: styleImg("scandinavian-int.jpg"),
      },
      { value: "modern", label: "Modern", image: styleImg("modern-int.jpg") },
      { value: "luxury", label: "Luxury", image: styleImg("luxury-int.jpg") },
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
        label: "Bohemian",
        image: styleImg("bohemian-int.jpg"),
      },
      {
        value: "japandi",
        label: "Japandi",
        image: styleImg("japandi-int.jpg"),
      },
      {
        value: "mid-century",
        label: "Mid-Century",
        image: styleImg("mid-century-int.jpg"),
      },
      {
        value: "art-deco",
        label: "Art Deco",
        image: styleImg("art-deco-int.jpg"),
      },
      {
        value: "coastal",
        label: "Coastal",
        image: styleImg("coastal-int.jpg"),
      },
      { value: "rustic", label: "Rustic", image: styleImg("rustic-int.jpg") },
    ],
  },
  {
    key: "objects",
    title: "Objects",
    type: "object-picker",
    options: [
      { value: "sofa", label: "Sofa", image: objectImg("sofa.jpg") },
      {
        value: "dining-table",
        label: "Dining Table",
        image: objectImg("dining-table.jpg"),
      },
      {
        value: "coffee-table",
        label: "Coffee Table",
        image: objectImg("coffee-table.jpg"),
      },
      {
        value: "armchair",
        label: "Armchair",
        image: objectImg("armchair.jpg"),
      },
      {
        value: "bookshelf",
        label: "Bookshelf",
        image: objectImg("bookshelf.jpg"),
      },
      {
        value: "floor-lamp",
        label: "Floor Lamp",
        image: objectImg("floor-lamp.jpg"),
      },
      {
        value: "pendant-light",
        label: "Pendant Light",
        image: objectImg("pendant-light.jpg"),
      },
      { value: "rug", label: "Rug", image: objectImg("rug.jpg") },
      {
        value: "indoor-plant",
        label: "Indoor Plant",
        image: objectImg("indoor-plant.jpg"),
      },
      { value: "artwork", label: "Wall Art", image: objectImg("artwork.jpg") },
      { value: "mirror", label: "Mirror", image: objectImg("mirror.jpg") },
      { value: "tv-unit", label: "TV Unit", image: objectImg("tv-unit.jpg") },
      { value: "bed", label: "Bed", image: objectImg("bed.jpg") },
      {
        value: "wardrobe",
        label: "Wardrobe",
        image: objectImg("wardrobe.jpg"),
      },
      {
        value: "kitchen-island",
        label: "Kitchen Island",
        image: objectImg("kitchen-island.jpg"),
      },
      {
        value: "bar-stools",
        label: "Bar Stools",
        image: objectImg("bar-stools.jpg"),
      },
      { value: "bathtub", label: "Bathtub", image: objectImg("bathtub.jpg") },
      { value: "vanity", label: "Vanity", image: objectImg("vanity.jpg") },
    ],
  },
  {
    key: "furnitureDensity",
    title: "Furniture Density",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "minimal", label: "Minimal" },
      { value: "balanced", label: "Balanced" },
      { value: "full", label: "Full Staging" },
    ],
  },
  {
    key: "textures",
    title: "Textures",
    type: "texture-picker",
    options: [
      { value: "marble", label: "Marble", image: textureImg("marble-012.webp") },
      {
        value: "concrete-polished",
        label: "Polished Concrete",
        image: textureImg("concrete-smooth.webp"),
      },
      {
        value: "concrete-rough",
        label: "Rough Concrete",
        image: textureImg("concrete-rough.webp"),
      },
      { value: "oakwood", label: "Oak Wood", image: textureImg("oak-wood.webp") },
      { value: "brick", label: "Brick", image: textureImg("brick-herringbone.webp") },
      {
        value: "polished-metal",
        label: "Polished Metal",
        image: textureImg("polished-metal.webp"),
      },
      {
        value: "terracotta",
        label: "Terracotta",
        image: textureImg("terracotta.webp"),
      },
      {
        value: "stone-gravel",
        label: "Stone Gravel",
        image: textureImg("stone-gravel.webp"),
      },
      {
        value: "white-plaster",
        label: "White Plaster",
        image: textureImg("white-plaster.webp"),
      },
      {
        value: "grey-paver",
        label: "Grey Paver",
        image: textureImg("grey-paver.webp"),
      },
      {
        value: "moss-stone",
        label: "Moss Stone",
        image: textureImg("moss-stone.webp"),
      },
      {
        value: "rust-metal",
        label: "Rust Metal",
        image: textureImg("rust-metal.webp"),
      },
    ],
  },
  {
    key: "lighting",
    title: "Lighting",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "daylight", label: "Daylight" },
      { value: "warm-evening", label: "Warm Evening" },
      { value: "night", label: "Night" },
    ],
  },
];

const STYLE_TRANSFORM_SETTINGS: ModeSettingGroup[] = [
  {
    key: "targetStyle",
    title: "Target Style",
    type: "dropdown",
    options: [
      { value: "auto", label: "Auto", image: styleImg("auto.jpg") },
      { value: "modern", label: "Modern", image: styleImg("modern.jpg") },
      {
        value: "mediterranean",
        label: "Mediterranean",
        image: styleImg("mediterranean.jpg"),
      },
      {
        value: "industrial",
        label: "Industrial",
        image: styleImg("industrial.jpg"),
      },
      { value: "minimal", label: "Minimal", image: styleImg("minimal.jpg") },
      { value: "luxury", label: "Luxury", image: styleImg("luxury.jpg") },
      { value: "art-deco", label: "Art Deco", image: styleImg("art-deco.jpg") },
      {
        value: "brutalist",
        label: "Brutalist",
        image: styleImg("brutalist.jpg"),
      },
      { value: "tropical", label: "Tropical", image: styleImg("tropical.jpg") },
      { value: "japanese", label: "Japanese", image: styleImg("japanese.jpg") },
      {
        value: "scandinavian",
        label: "Scandinavian",
        image: styleImg("scandinavian.jpg"),
      },
      {
        value: "parametric",
        label: "Parametric",
        image: styleImg("parametric.jpg"),
      },
      {
        value: "neo-classical",
        label: "Neo-Classical",
        image: styleImg("neo-classical.jpg"),
      },
      {
        value: "contemporary",
        label: "Contemporary",
        image: styleImg("contemporary.jpg"),
      },
    ],
  },
  {
    key: "styleStrength",
    title: "Style Strength",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "strong", label: "Strong" },
    ],
  },
  {
    key: "preserveStructure",
    title: "Preserve Structure",
    type: "toggle",
    options: [
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
    ],
  },
];

const MATERIAL_CHANGE_SETTINGS: ModeSettingGroup[] = [
  {
    key: "surface",
    title: "Surface",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "facade", label: "Facade" },
      { value: "walls", label: "Walls" },
      { value: "floor", label: "Floor" },
      { value: "roof", label: "Roof" },
    ],
  },
  {
    key: "material",
    title: "Material",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "stone", label: "Stone" },
      { value: "concrete", label: "Concrete" },
      { value: "wood", label: "Wood" },
      { value: "glass", label: "Glass" },
      { value: "metal", label: "Metal" },
      { value: "marble", label: "Marble" },
    ],
  },
  {
    key: "textureStrength",
    title: "Texture Strength",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
];

const SCENE_COMPOSITION_SETTINGS: ModeSettingGroup[] = [
  {
    key: "shotType",
    title: "Shot Type",
    type: "dropdown",
    options: [
      { value: "auto", label: "Auto", image: shotImg("auto.jpg") },
      {
        value: "wide-establishing",
        label: "Wide Establishing",
        image: shotImg("wide-angle.jpg"),
      },
      {
        value: "eye-level",
        label: "Eye Level",
        image: shotImg("street-level.jpg"),
      },
      { value: "aerial", label: "Aerial", image: shotImg("aerial.jpg") },
      {
        value: "street-view",
        label: "Street View",
        image: shotImg("street-level.jpg"),
      },
    ],
  },
  {
    key: "elements",
    title: "Elements",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "people", label: "People" },
      { value: "cars", label: "Cars" },
      { value: "plants", label: "Plants" },
      { value: "furniture", label: "Outdoor Furniture" },
    ],
  },
  {
    key: "sceneActivity",
    title: "Scene Activity",
    type: "select",
    columns: 2,
    options: [
      AUTO,
      { value: "minimal", label: "Minimal" },
      { value: "moderate", label: "Moderate" },
      { value: "busy", label: "Busy" },
    ],
  },
  {
    key: "environmentStyle",
    title: "Environment Style",
    type: "select-with-upload",
    columns: 2,
    options: [
      AUTO,
      { value: "luxury", label: "Luxury" },
      { value: "urban", label: "Urban" },
      { value: "nature", label: "Nature" },
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
    label: `Angle ${index + 1}`,
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
