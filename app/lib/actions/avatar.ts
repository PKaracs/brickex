"use server";

type AvatarWithImages = {
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

export async function createAvatar(_name?: string) {
  return { avatarId: "stub-avatar-id" };
}

export async function fetchUserAvatar(): Promise<{
  avatar: AvatarWithImages | null;
  error?: string;
}> {
  return { avatar: null };
}

export async function removeAvatarImage(_imageId: string) {
  return { success: true };
}
