"use server";

export interface GalleryImage {
  id: string;
  url: string;
  createdAt: string;
  projectId: string;
  mode?: string;
  prompt?: string;
}

export interface PaginatedGalleryResult {
  images: GalleryImage[];
  totalCount: number;
  hasMore: boolean;
  nextOffset: number;
}

export async function getUserLatestOutput(): Promise<
  { url: string } | { error: string } | null
> {
  return null;
}

export async function getUserOutputs(): Promise<
  { images: GalleryImage[] } | { error: string }
> {
  return { images: [] };
}

export async function getUserOutputsPaginated(
  offset = 0,
  limit = 8
): Promise<PaginatedGalleryResult | { error: string }> {
  return { images: [], totalCount: 0, hasMore: false, nextOffset: 0 };
}

export async function deleteUserOutput(
  outputId: string
): Promise<{ success: true } | { error: string }> {
  return { success: true };
}
