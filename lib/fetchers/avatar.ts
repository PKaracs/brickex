export type AvatarWithImages = {
  id: string;
  name: string | null;
  createdAt: Date;
  images: {
    id: string;
    storageKey: string;
    url: string;
    metadata: unknown;
  }[];
};

export async function getUserAvatar(
  userId: string
): Promise<AvatarWithImages | null> {
  return null;
}

export async function deleteAvatarImage(imageId: string, userId: string) {
  return { error: "Not available in development mode" };
}

export async function userHasAvatar(userId: string): Promise<boolean> {
  return false;
}
