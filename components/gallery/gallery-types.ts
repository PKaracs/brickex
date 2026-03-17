import { getToolById } from "@/lib/constants/tools";

export interface GalleryProjectOriginal {
  id: string;
  url: string;
  createdAt: Date;
  filename?: string;
}

export interface GalleryProjectVariation {
  id: string;
  url: string;
  createdAt: Date;
  projectId: string;
  mode?: string;
  prompt?: string;
  title?: string;
  mediaType?: string;
  toolId?: string;
}

export interface GalleryProjectStack {
  projectId: string;
  title: string;
  slug: string;
  latestCreatedAt: Date;
  variationCount: number;
  modeIds: string[];
  original: GalleryProjectOriginal | null;
  variations: GalleryProjectVariation[];
}

export type GalleryProjectMediaType = "image" | "video" | "model_3d";
export type GalleryProjectCollection = "exterior" | "interior" | "video" | "tool";

export type GalleryProjectModalItem =
  | (GalleryProjectOriginal & { kind: "original"; label: string })
  | (GalleryProjectVariation & { kind: "variation"; label: string });

function humanizeToken(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isRenderModeId(value?: string) {
  return value === "exterior-render" || value === "interior-render";
}

export function getGalleryProjectItems(
  project: GalleryProjectStack,
): GalleryProjectModalItem[] {
  const items: GalleryProjectModalItem[] = [];

  if (project.original) {
    items.push({
      ...project.original,
      kind: "original",
      label: "Original",
    });
  }

  const chronologicalVariations = [...project.variations].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  chronologicalVariations.forEach((variation, index) => {
    items.push({
      ...variation,
      kind: "variation",
      label:
        variation.mediaType === "video"
          ? `Video ${index + 1}`
          : variation.mediaType === "model_3d"
            ? `3D Model ${index + 1}`
          : `Variation ${index + 1}`,
    });
  });

  return items;
}

export function getGalleryProjectPrimaryMediaType(
  project: GalleryProjectStack,
): GalleryProjectMediaType {
  if (project.variations[0]?.mediaType === "video") {
    return "video";
  }

  if (project.variations[0]?.mediaType === "model_3d") {
    return "model_3d";
  }

  return "image";
}

export function getGalleryProjectCollection(
  project: GalleryProjectStack,
): GalleryProjectCollection {
  if (getGalleryProjectPrimaryMediaType(project) === "video") {
    return "video";
  }

  if (project.modeIds.includes("interior-render")) {
    return "interior";
  }

  if (project.modeIds.includes("exterior-render")) {
    return "exterior";
  }

  const primaryToolId = project.variations[0]?.toolId;
  if (primaryToolId && !isRenderModeId(primaryToolId)) {
    return "tool";
  }

  return "tool";
}

export function getGalleryProjectCollectionLabel(
  collection: GalleryProjectCollection,
) {
  switch (collection) {
    case "video":
      return "Videos";
    case "interior":
      return "Interior Renders";
    case "exterior":
      return "Exterior Renders";
    case "tool":
      return "Tool Generations";
  }
}

export function getGalleryProjectPrimaryDescriptor(project: GalleryProjectStack) {
  const collection = getGalleryProjectCollection(project);
  if (collection === "video") {
    return "Video";
  }

  if (collection === "interior") {
    return "Interior";
  }

  if (collection === "exterior") {
    return "Exterior";
  }

  const toolId = project.variations[0]?.toolId;
  if (!toolId) {
    return "Tool";
  }

  return getToolById(toolId)?.label ?? humanizeToken(toolId);
}
