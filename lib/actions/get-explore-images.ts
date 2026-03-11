"use server";

export interface ExploreImage {
  id: string;
  url: string;
  name: string;
}

export async function getExploreImages(
  offset = 0,
  limit = 20
): Promise<{ images: ExploreImage[]; hasMore: boolean; total: number }> {
  return { images: [], hasMore: false, total: 0 };
}

export async function getExploreCategoryImages(
  category: string,
  offset = 0,
  limit = 20
): Promise<{ images: ExploreImage[]; hasMore: boolean; total: number }> {
  return { images: [], hasMore: false, total: 0 };
}
