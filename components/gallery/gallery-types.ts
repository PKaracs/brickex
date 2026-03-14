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

export type GalleryProjectModalItem =
  | (GalleryProjectOriginal & { kind: "original"; label: string })
  | (GalleryProjectVariation & { kind: "variation"; label: string });

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

  project.variations.forEach((variation, index) => {
    items.push({
      ...variation,
      kind: "variation",
      label: `Variation ${index + 1}`,
    });
  });

  return items;
}
