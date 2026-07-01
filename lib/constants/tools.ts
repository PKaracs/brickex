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
    label: "Imagen a objeto 3D",
    labelItalic: "Objeto",
    description:
      "Convierte cualquier imagen 2D en un modelo de objeto 3D detallado, con profundidad y geometria realistas.",
    icon: Box,
    tags: ["3D", "Modelado"],
    placeholder: "Sube una imagen de un objeto para convertirlo a 3D",
    coverImage: "/tools/image-to-3d-cover.jpg",
    sampleInputImage: "/tools/image-to-3d-input.jpg",
    readyTitle: "Sube una imagen para empezar",
    readySubtitle: "Transforma fotos en modelos de objeto 3D",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/image-to-3d-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/image-to-3d-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "exploded-diagram",
    label: "Diagrama explotado",
    labelItalic: "Diagrama",
    description:
      "Genera diagramas de ensamblaje explotado que muestran como encajan los componentes.",
    icon: Layers,
    tags: ["Arquitectura", "Tecnico"],
    placeholder: "Sube una imagen para crear un diagrama explotado",
    coverImage: "/tools/exploded-diagram-cover.jpg",
    sampleInputImage: "/tools/exploded-diagram-input.jpg",
    readyTitle: "Sube una imagen para empezar",
    readySubtitle: "Descompone estructuras en vistas explotadas",
    creditCost: 80,
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/exploded-diagram-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/exploded-diagram-output.png",
    generationReady: true,
  },
  {
    id: "floorplan-to-furnished",
    label: "Plano vacio a amueblado",
    labelItalic: "Amueblado",
    description:
      "Transforma planos vacios en renders interiores fotorrealistas totalmente amueblados.",
    icon: Home,
    tags: ["Interior", "Plano"],
    placeholder: "Sube un plano vacio para amueblarlo",
    coverImage: "/tools/floorplan-furnished-cover.jpg",
    sampleInputImage: "/tools/floorplan-furnished-input.jpg",
    readyTitle: "Sube un plano para empezar",
    readySubtitle: "Transforma habitaciones vacias en interiores amueblados",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/floorplan-to-furnished-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/floorplan-to-furnished-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "upholstery-change",
    label: "Cambio de tapiceria",
    labelItalic: "Tapiceria",
    description:
      "Cambia telas, texturas y materiales de muebles con precision impulsada por IA.",
    icon: Sofa,
    tags: ["Interior", "Material"],
    placeholder: "Sube una imagen de mueble para cambiar su tapiceria",
    coverImage: "/tools/upholstery-change-cover.jpg",
    sampleInputImage: "/tools/upholstery-change-input.jpg",
    readyTitle: "Sube un mueble para empezar",
    readySubtitle: "Cambia telas y materiales en cualquier pieza",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/upholstery-change-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/upholstery-change-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "moodboard-to-render",
    label: "Moodboard a render",
    labelItalic: "Render",
    description:
      "Transforma conceptos de moodboard en renders interiores realistas con visualizacion impulsada por IA.",
    icon: ImageIcon,
    tags: ["Interior"],
    placeholder: "Sube un moodboard para transformarlo en render",
    coverImage: "/tools/moodboard-render-cover.jpg",
    sampleInputImage: "/tools/moodboard-render-input.jpg",
    readyTitle: "Sube imagenes de moodboard para empezar",
    readySubtitle: "Convierte boards de inspiracion en renders fotorrealistas",
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
    label: "Render a diagrama isometrico",
    labelItalic: "Diagrama",
    description:
      "Convierte renders arquitectonicos en diagramas isometricos limpios para presentaciones.",
    icon: Rotate3d,
    tags: ["Arquitectura", "Tecnico"],
    placeholder: "Sube un render para convertirlo a isometrico",
    coverImage: "/tools/render-isometric-cover.jpg",
    sampleInputImage: "/tools/render-isometric-input.jpg",
    readyTitle: "Sube un render para empezar",
    readySubtitle: "Transforma renders en diagramas isometricos",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/render-to-isometric-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/render-to-isometric-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "floorplan-to-3d",
    label: "Plano a diagrama 3D",
    labelItalic: "Diagrama",
    description:
      "Transforma planos 2D en diagramas espaciales 3D inmersivos y vistas axonometricas.",
    icon: Map,
    tags: ["Arquitectura", "3D"],
    placeholder: "Sube un plano para convertirlo a 3D",
    coverImage: "/tools/floorplan-3d-cover.jpg",
    sampleInputImage: "/tools/floorplan-3d-input.jpg",
    readyTitle: "Sube un plano para empezar",
    readySubtitle: "Convierte planos 2D en vistas espaciales 3D",
    inputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/floorplan-to-3d-input.png",
    outputPreview:
      "https://fgqxhvrvzrzqhofqbmdp.supabase.co/storage/v1/object/public/public-assets/tools/floorplan-to-3d-output.png",
    creditCost: 80,
    generationReady: true,
  },
  {
    id: "landscape-generator",
    label: "Generador de paisajismo",
    labelItalic: "Paisajismo",
    description:
      "Genera disenos de paisaje y entornos exteriores a partir de bocetos o descripciones.",
    icon: Trees,
    tags: ["Paisajismo", "Arquitectura"],
    placeholder: "Sube un boceto o foto del sitio para generar paisajismo",
    coverImage: "/tools/landscape-gen-cover.jpg",
    sampleInputImage: "/tools/landscape-gen-input.jpg",
    readyTitle: "Sube un boceto para empezar",
    readySubtitle: "Genera disenos de paisaje desde bocetos o fotos",
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
