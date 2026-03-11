import {
  Building2,
  Armchair,
  Paintbrush,
  Palette,
  Users,
  type LucideIcon,
} from "lucide-react";

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
  type: "select" | "toggle" | "dropdown" | "select-with-upload" | "object-picker";
  columns?: 2 | 3;
  options: ModeSettingOption[];
}

export const RENDER_MODES: RenderMode[] = [
  {
    id: "exterior-render",
    label: "Exterior Render",
    description: "Photorealistic exterior views from sketches, plans, or models",
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
      { value: "auto", label: "Auto", image: "/shots/auto.jpg" },
      { value: "street-level", label: "Street Level", image: "/shots/street-level.jpg" },
      { value: "wide-angle", label: "Wide Angle", image: "/shots/wide-angle.jpg" },
      { value: "aerial", label: "Aerial", image: "/shots/aerial.jpg" },
      { value: "rooftop", label: "Rooftop", image: "/shots/rooftop.jpg" },
      { value: "corner-view", label: "Corner View", image: "/shots/corner-view.jpg" },
      { value: "close-up", label: "Detail Close-Up", image: "/shots/close-up.jpg" },
      { value: "drone-low", label: "Low Drone", image: "/shots/drone-low.jpg" },
      { value: "entrance", label: "Entrance View", image: "/shots/entrance.jpg" },
    ],
  },
  {
    key: "architectureStyle",
    title: "Architecture Style",
    type: "dropdown",
    options: [
      { value: "auto", label: "Auto", image: "/styles/auto.jpg" },
      { value: "modern", label: "Modern", image: "/styles/modern.jpg" },
      { value: "mediterranean", label: "Mediterranean", image: "/styles/mediterranean.jpg" },
      { value: "minimal", label: "Minimal", image: "/styles/minimal.jpg" },
      { value: "luxury", label: "Luxury", image: "/styles/luxury.jpg" },
      { value: "brutalist", label: "Brutalist", image: "/styles/brutalist.jpg" },
      { value: "art-deco", label: "Art Deco", image: "/styles/art-deco.jpg" },
      { value: "industrial", label: "Industrial", image: "/styles/industrial.jpg" },
      { value: "tropical", label: "Tropical", image: "/styles/tropical.jpg" },
      { value: "japanese", label: "Japanese", image: "/styles/japanese.jpg" },
      { value: "scandinavian", label: "Scandinavian", image: "/styles/scandinavian.jpg" },
      { value: "colonial", label: "Colonial", image: "/styles/colonial.jpg" },
      { value: "parametric", label: "Parametric", image: "/styles/parametric.jpg" },
      { value: "neo-classical", label: "Neo-Classical", image: "/styles/neo-classical.jpg" },
      { value: "farmhouse", label: "Farmhouse", image: "/styles/farmhouse.jpg" },
      { value: "contemporary", label: "Contemporary", image: "/styles/contemporary.jpg" },
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
      { value: "auto", label: "Auto", image: "/shots/int-auto.jpg" },
      { value: "wide-room", label: "Wide Room", image: "/shots/wide-room.jpg" },
      { value: "corner-angle", label: "Corner Angle", image: "/shots/corner-angle.jpg" },
      { value: "straight-on", label: "Straight On", image: "/shots/straight-on.jpg" },
      { value: "detail", label: "Detail Shot", image: "/shots/detail.jpg" },
      { value: "overhead", label: "Overhead", image: "/shots/overhead.jpg" },
      { value: "window-view", label: "Window View", image: "/shots/window-view.jpg" },
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
      { value: "auto", label: "Auto", image: "/styles/int-auto.jpg" },
      { value: "scandinavian", label: "Scandinavian", image: "/styles/scandinavian.jpg" },
      { value: "modern", label: "Modern", image: "/styles/modern-int.jpg" },
      { value: "luxury", label: "Luxury", image: "/styles/luxury-int.jpg" },
      { value: "minimal", label: "Minimal", image: "/styles/minimal-int.jpg" },
      { value: "industrial", label: "Industrial", image: "/styles/industrial-int.jpg" },
      { value: "bohemian", label: "Bohemian", image: "/styles/bohemian.jpg" },
      { value: "japandi", label: "Japandi", image: "/styles/japandi.jpg" },
      { value: "mid-century", label: "Mid-Century", image: "/styles/mid-century.jpg" },
      { value: "art-deco", label: "Art Deco", image: "/styles/art-deco-int.jpg" },
      { value: "coastal", label: "Coastal", image: "/styles/coastal-int.jpg" },
      { value: "rustic", label: "Rustic", image: "/styles/rustic.jpg" },
    ],
  },
  {
    key: "objects",
    title: "Objects",
    type: "object-picker",
    options: [
      { value: "sofa", label: "Sofa", image: "/objects/sofa.jpg" },
      { value: "dining-table", label: "Dining Table", image: "/objects/dining-table.jpg" },
      { value: "coffee-table", label: "Coffee Table", image: "/objects/coffee-table.jpg" },
      { value: "armchair", label: "Armchair", image: "/objects/armchair.jpg" },
      { value: "bookshelf", label: "Bookshelf", image: "/objects/bookshelf.jpg" },
      { value: "floor-lamp", label: "Floor Lamp", image: "/objects/floor-lamp.jpg" },
      { value: "pendant-light", label: "Pendant Light", image: "/objects/pendant-light.jpg" },
      { value: "rug", label: "Rug", image: "/objects/rug.jpg" },
      { value: "indoor-plant", label: "Indoor Plant", image: "/objects/indoor-plant.jpg" },
      { value: "artwork", label: "Wall Art", image: "/objects/artwork.jpg" },
      { value: "mirror", label: "Mirror", image: "/objects/mirror.jpg" },
      { value: "tv-unit", label: "TV Unit", image: "/objects/tv-unit.jpg" },
      { value: "bed", label: "Bed", image: "/objects/bed.jpg" },
      { value: "wardrobe", label: "Wardrobe", image: "/objects/wardrobe.jpg" },
      { value: "kitchen-island", label: "Kitchen Island", image: "/objects/kitchen-island.jpg" },
      { value: "bar-stools", label: "Bar Stools", image: "/objects/bar-stools.jpg" },
      { value: "bathtub", label: "Bathtub", image: "/objects/bathtub.jpg" },
      { value: "vanity", label: "Vanity", image: "/objects/vanity.jpg" },
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
      { value: "auto", label: "Auto", image: "/styles/auto.jpg" },
      { value: "modern", label: "Modern", image: "/styles/modern.jpg" },
      { value: "mediterranean", label: "Mediterranean", image: "/styles/mediterranean.jpg" },
      { value: "industrial", label: "Industrial", image: "/styles/industrial.jpg" },
      { value: "minimal", label: "Minimal", image: "/styles/minimal.jpg" },
      { value: "luxury", label: "Luxury", image: "/styles/luxury.jpg" },
      { value: "art-deco", label: "Art Deco", image: "/styles/art-deco.jpg" },
      { value: "brutalist", label: "Brutalist", image: "/styles/brutalist.jpg" },
      { value: "tropical", label: "Tropical", image: "/styles/tropical.jpg" },
      { value: "japanese", label: "Japanese", image: "/styles/japanese.jpg" },
      { value: "scandinavian", label: "Scandinavian", image: "/styles/scandinavian.jpg" },
      { value: "parametric", label: "Parametric", image: "/styles/parametric.jpg" },
      { value: "neo-classical", label: "Neo-Classical", image: "/styles/neo-classical.jpg" },
      { value: "contemporary", label: "Contemporary", image: "/styles/contemporary.jpg" },
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
      { value: "auto", label: "Auto", image: "/shots/auto.jpg" },
      { value: "wide-establishing", label: "Wide Establishing", image: "/shots/wide-establishing.jpg" },
      { value: "eye-level", label: "Eye Level", image: "/shots/eye-level.jpg" },
      { value: "aerial", label: "Aerial", image: "/shots/aerial.jpg" },
      { value: "street-view", label: "Street View", image: "/shots/street-view.jpg" },
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
    } else if (group.type === "object-picker") {
      defaults[group.key] = "";
    } else {
      defaults[group.key] = "auto";
    }
  }
  defaults.customPrompt = "";
  return defaults;
}
