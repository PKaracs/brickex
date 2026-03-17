import {
  Box,
  Layers,
  Home,
  Sofa,
  ImageIcon,
  Palette,
  Rotate3d,
  Map,
  Trees,
  type LucideIcon,
} from "lucide-react";

export interface Tool {
  id: string;
  label: string;
  /** The last word(s) rendered in italic */
  labelItalic: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  placeholder: string;
  coverImage: string;
  sampleInputImage: string;
  /** Prompt shown in the right panel before generation */
  readyTitle: string;
  readySubtitle: string;
  /** Whether the tool supports multiple input images (like moodboard) */
  multiUpload?: boolean;
  /** Before/after preview images for the card (input shown by default, output on hover) */
  inputPreview?: string;
  outputPreview?: string;
  /** Credit cost for this tool */
  creditCost: number;
  /** Whether this tool can run in the current image-generation workflow */
  generationReady: boolean;
  /** Explanation shown when a tool is unavailable */
  unavailableReason?: string;
}

export const TOOLS: Tool[] = [
  {
    id: "image-to-3d",
    label: "Image to 3D Object",
    labelItalic: "Object",
    description:
      "Convert any 2D image into a detailed 3D object model with realistic depth and geometry.",
    icon: Box,
    tags: ["3D", "Modeling"],
    placeholder: "Upload an image of an object to convert to 3D",
    coverImage: "/tools/image-to-3d-cover.jpg",
    sampleInputImage: "/tools/image-to-3d-input.jpg",
    readyTitle: "Upload an image to get started",
    readySubtitle: "Transform photos into 3D object models",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/image-to-3d-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/image-to-3d-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "exploded-diagram",
    label: "Exploded Diagram",
    labelItalic: "Diagram",
    description:
      "Generate exploded assembly diagrams that show how components fit together.",
    icon: Layers,
    tags: ["Architecture", "Technical"],
    placeholder: "Upload an image to create an exploded diagram",
    coverImage: "/tools/exploded-diagram-cover.jpg",
    sampleInputImage: "/tools/exploded-diagram-input.jpg",
    readyTitle: "Upload an image to get started",
    readySubtitle: "Break down structures into exploded views",
    creditCost: 80,
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/exploded-diagram-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/exploded-diagram-output.png",
    generationReady: true,
  },
  {
    id: "floorplan-to-furnished",
    label: "Empty Floorplan to Furnished",
    labelItalic: "Furnished",
    description:
      "Transform empty floor plans into fully furnished, photorealistic interior renders.",
    icon: Home,
    tags: ["Interior", "Floorplan"],
    placeholder: "Upload an empty floor plan to furnish",
    coverImage: "/tools/floorplan-furnished-cover.jpg",
    sampleInputImage: "/tools/floorplan-furnished-input.jpg",
    readyTitle: "Upload a floorplan to get started",
    readySubtitle: "Transform empty rooms into furnished interiors",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/floorplan-to-furnished-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/floorplan-to-furnished-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "upholstery-change",
    label: "Upholstery Change",
    labelItalic: "Change",
    description:
      "Swap fabrics, textures, and materials on furniture with AI-powered precision.",
    icon: Sofa,
    tags: ["Interior", "Material"],
    placeholder: "Upload a furniture image to change its upholstery",
    coverImage: "/tools/upholstery-change-cover.jpg",
    sampleInputImage: "/tools/upholstery-change-input.jpg",
    readyTitle: "Upload furniture to get started",
    readySubtitle: "Swap fabrics and materials on any piece",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/upholstery-change-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/upholstery-change-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "moodboard-to-render",
    label: "Moodboard to Render",
    labelItalic: "Render",
    description:
      "Transform moodboard concepts into realistic interior renders with AI-powered visualization.",
    icon: ImageIcon,
    tags: ["Interior"],
    placeholder: "Upload a moodboard to transform into a render",
    coverImage: "/tools/moodboard-render-cover.jpg",
    sampleInputImage: "/tools/moodboard-render-input.jpg",
    readyTitle: "Upload moodboard images to get started",
    readySubtitle: "Turn inspiration boards into photorealistic renders",
    multiUpload: true,
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/moodboard-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/moodboard-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "render-to-isometric",
    label: "Render to Isometric Diagram",
    labelItalic: "Diagram",
    description:
      "Convert architectural renders into clean isometric diagrams for presentations.",
    icon: Rotate3d,
    tags: ["Architecture", "Technical"],
    placeholder: "Upload a render to convert to isometric",
    coverImage: "/tools/render-isometric-cover.jpg",
    sampleInputImage: "/tools/render-isometric-input.jpg",
    readyTitle: "Upload a render to get started",
    readySubtitle: "Transform renders into isometric diagrams",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/render-to-isometric-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/render-to-isometric-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "floorplan-to-3d",
    label: "Floorplan to 3D Diagram",
    labelItalic: "Diagram",
    description:
      "Transform 2D floor plans into immersive 3D spatial diagrams and axonometric views.",
    icon: Map,
    tags: ["Architecture", "3D"],
    placeholder: "Upload a floor plan to convert to 3D",
    coverImage: "/tools/floorplan-3d-cover.jpg",
    sampleInputImage: "/tools/floorplan-3d-input.jpg",
    readyTitle: "Upload a floorplan to get started",
    readySubtitle: "Convert 2D plans into 3D spatial views",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/floorplan-to-3d-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/floorplan-to-3d-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "landscape-generator",
    label: "Landscape Generator",
    labelItalic: "Generator",
    description:
      "Generate stunning landscape designs and outdoor environments from sketches or descriptions.",
    icon: Trees,
    tags: ["Landscape", "Architecture"],
    placeholder: "Upload a sketch or site photo for landscape generation",
    coverImage: "/tools/landscape-gen-cover.jpg",
    sampleInputImage: "/tools/landscape-gen-input.jpg",
    readyTitle: "Upload a sketch to get started",
    readySubtitle: "Generate landscape designs from sketches or photos",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/landscape-generator-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/landscape-generator-output.png",
    creditCost: 80,
    generationReady: true,
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function isToolGenerationReady(id: string): boolean {
  return getToolById(id)?.generationReady ?? false;
}

export function getToolUnavailableReason(id: string): string | null {
  return getToolById(id)?.unavailableReason ?? null;
}

export const VIDEO_CREDIT_COST_PER_SECOND = 50;
export const EDIT_CREDIT_COST = 20;

export function calculateVideoCreditCost(durationSeconds: number): number {
  return Math.ceil(durationSeconds) * VIDEO_CREDIT_COST_PER_SECOND;
}

export const IMAGE_CREDIT_COST = 80;

/**
 * Resolve the brick cost for a given toolId.
 * Edits (region-edit, global-edit) cost EDIT_CREDIT_COST.
 * Image tools cost IMAGE_CREDIT_COST (or the tool's creditCost).
 */
export function getCreditCostForToolId(toolId: string): number {
  if (toolId === "region-edit" || toolId === "global-edit") {
    return EDIT_CREDIT_COST;
  }
  const tool = getToolById(toolId);
  return tool?.creditCost ?? IMAGE_CREDIT_COST;
}
