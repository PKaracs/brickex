import { getPublicAssetUrl } from "@/lib/utils/storage";

export type BackgroundImageCategory = "car" | "jet" | "yacht" | "motorcycle" | "template";

export interface BackgroundImage {
  id: string;
  category: BackgroundImageCategory;
  objectType?: string; // "car", "jet", etc. - matches object.type
  objectName?: string; // Specific object name like "Bugatti Chiron", "Gulfstream G700"
  objectId?: number; // Match to object.id for exact matching
  sceneType?: "indoor" | "outdoor" | "garage" | "runway" | "harbor" | "any";
  imageUrl: string;
  description?: string; // For debugging/logging
}

// ═══════════════════════════════════════════════════════════════════════════
// FREE USER DEFAULT BACKGROUND - EASY TO CHANGE
// ═══════════════════════════════════════════════════════════════════════════
// Just update the URL below to change the background image
// To change the PROMPT, go to: lib/prompt-builder.ts (search for "FREE USER DEFAULT BACKGROUND")
export const FREE_USER_DEFAULT_BACKGROUND = "https://bnibtqjlriohmuacvjmf.supabase.co/storage/v1/object/public/objects/Capture-2026-01-23-123725.png";

// ═══════════════════════════════════════════════════════════════════════════
// FUTURE: Background images for PRO users (not used yet)
// ═══════════════════════════════════════════════════════════════════════════
// Commented out until images are uploaded to Supabase
/*
export const BACKGROUND_IMAGES: BackgroundImage[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // CARS - BUGATTI CHIRON
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "car-bugatti-chiron-1",
    category: "car",
    objectType: "car",
    objectName: "Bugatti Chiron",
    objectId: 2,
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/bugatti-chiron-1.jpg"),
    description: "Bugatti Chiron in front of modern mansion",
  },
  {
    id: "car-bugatti-chiron-2",
    category: "car",
    objectType: "car",
    objectName: "Bugatti Chiron",
    objectId: 2,
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/bugatti-chiron-2.jpg"),
    description: "Bugatti Chiron on luxury driveway",
  },
  {
    id: "car-bugatti-chiron-3",
    category: "car",
    objectType: "car",
    objectName: "Bugatti Chiron",
    objectId: 2,
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/bugatti-chiron-3.jpg"),
    description: "Bugatti Chiron tunnel scene",
  },
  // Add more Bugatti Chiron images as you source them (aim for 20+ total)
  // Just number them sequentially: bugatti-chiron-4.jpg, bugatti-chiron-5.jpg, etc.

  // ═══════════════════════════════════════════════════════════════════════════
  // CARS - FERRARI SF90 STRADALE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "car-ferrari-sf90-1",
    category: "car",
    objectType: "car",
    objectName: "Ferrari SF90 Stradale",
    objectId: 3,
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/ferrari-sf90-1.jpg"),
  },
  {
    id: "car-ferrari-sf90-2",
    category: "car",
    objectType: "car",
    objectName: "Ferrari SF90 Stradale",
    objectId: 3,
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/ferrari-sf90-2.jpg"),
  },
  // Add more Ferrari SF90 images (aim for 20+ total)

  // ═══════════════════════════════════════════════════════════════════════════
  // CARS - GENERIC (fallback for any car)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "car-generic-1",
    category: "car",
    objectType: "car",
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/generic-1.jpg"),
    description: "Generic luxury car scene",
  },
  {
    id: "car-generic-2",
    category: "car",
    objectType: "car",
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/generic-2.jpg"),
    description: "Generic luxury car scene",
  },
  {
    id: "car-generic-tunnel-1",
    category: "car",
    objectType: "car",
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/generic-tunnel-1.jpg"),
    description: "Generic luxury car tunnel scene",
  },
  {
    id: "car-generic-desert-1",
    category: "car",
    objectType: "car",
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/cars/generic-desert-1.jpg"),
    description: "Desert hypercars scene",
  },
  // Add more generic car backgrounds (aim for 20+ total)

  // ═══════════════════════════════════════════════════════════════════════════
  // JETS - GULFSTREAM G700
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "jet-gulfstream-g700-1",
    category: "jet",
    objectType: "jet",
    objectName: "Gulfstream G700",
    objectId: 300,
    sceneType: "runway",
    imageUrl: getPublicAssetUrl("backgrounds/jets/gulfstream-g700-1.jpg"),
    description: "Gulfstream G700 on runway",
  },
  {
    id: "jet-gulfstream-g700-2",
    category: "jet",
    objectType: "jet",
    objectName: "Gulfstream G700",
    objectId: 300,
    sceneType: "runway",
    imageUrl: getPublicAssetUrl("backgrounds/jets/gulfstream-g700-2.jpg"),
    description: "Gulfstream G700 on tarmac",
  },
  // Add more Gulfstream G700 images (aim for 20+ total)

  // ═══════════════════════════════════════════════════════════════════════════
  // JETS - GENERIC (fallback for any jet)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "jet-generic-runway-1",
    category: "jet",
    objectType: "jet",
    sceneType: "runway",
    imageUrl: getPublicAssetUrl("backgrounds/jets/generic-runway-1.jpg"),
    description: "Generic private jet on runway",
  },
  {
    id: "jet-generic-runway-2",
    category: "jet",
    objectType: "jet",
    sceneType: "runway",
    imageUrl: getPublicAssetUrl("backgrounds/jets/generic-runway-2.jpg"),
    description: "Generic private jet on runway",
  },
  // Add more generic jet backgrounds (aim for 20+ total)

  // ═══════════════════════════════════════════════════════════════════════════
  // YACHTS - GENERIC
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "yacht-generic-harbor-1",
    category: "yacht",
    objectType: "yacht",
    sceneType: "harbor",
    imageUrl: getPublicAssetUrl("backgrounds/yachts/generic-harbor-1.jpg"),
  },
  {
    id: "yacht-generic-deck-1",
    category: "yacht",
    objectType: "yacht",
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/yachts/generic-deck-1.jpg"),
  },
  // Add more yacht backgrounds (aim for 20+ total)

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATES (for nanobanana pro)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "template-bugatti-mansion-1",
    category: "template",
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/templates/bugatti-mansion-1.jpg"),
    description: "Bugatti Chiron Mansion template background",
  },
  {
    id: "template-bugatti-mansion-2",
    category: "template",
    sceneType: "outdoor",
    imageUrl: getPublicAssetUrl("backgrounds/templates/bugatti-mansion-2.jpg"),
    description: "Bugatti Chiron Mansion template background variant",
  },
  {
    id: "template-gulfstream-runway-1",
    category: "template",
    sceneType: "runway",
    imageUrl: getPublicAssetUrl("backgrounds/templates/gulfstream-runway-1.jpg"),
    description: "Gulfstream G700 template background",
  },
  // Add more template backgrounds (aim for multiple variants per template)
];

export function getRandomBackgroundImage(
  objectId: number | null,
  objectName: string | null,
  objectType: string
): BackgroundImage | null {
  const matches = BACKGROUND_IMAGES.filter((bg) => {
    if (bg.category !== objectType && bg.category !== "template") {
      return false;
    }
    if (objectId && bg.objectId === objectId) {
      return true;
    }
    if (objectName && bg.objectName === objectName) {
      return true;
    }
    if (!bg.objectName && !bg.objectId && bg.objectType === objectType) {
      return true;
    }
    return false;
  });
  if (matches.length === 0) return null;
  return matches[Math.floor(Math.random() * matches.length)];
}

export function getRandomBackgroundImageForTemplate(
  templateId: number
): BackgroundImage | null {
  const matches = BACKGROUND_IMAGES.filter((bg) => bg.category === "template");
  if (matches.length === 0) return null;
  return matches[Math.floor(Math.random() * matches.length)];
}
*/

