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
  /** Credit cost for this tool */
  creditCost: number;
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
    creditCost: 4,
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
    creditCost: 4,
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
    creditCost: 4,
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
    creditCost: 4,
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
    creditCost: 4,
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
    creditCost: 4,
  },
  {
    id: "floorplan-to-3d",
    label: "Floorplan to 3D Diagram",
    labelItalic: "Diagram",
    description:
      "Transform 2D floor plans into immersive 3D spatial diagrams and walkthroughs.",
    icon: Map,
    tags: ["Architecture", "3D"],
    placeholder: "Upload a floor plan to convert to 3D",
    coverImage: "/tools/floorplan-3d-cover.jpg",
    sampleInputImage: "/tools/floorplan-3d-input.jpg",
    readyTitle: "Upload a floorplan to get started",
    readySubtitle: "Convert 2D plans into 3D spatial views",
    creditCost: 4,
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
    creditCost: 4,
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}
