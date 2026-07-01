import { extname } from "path";

import { createId } from "@paralleldrive/cuid2";
import { NextRequest, NextResponse } from "next/server";

import { requireAuthWithSession } from "@/lib/auth-guard";
import { env, storageBuckets } from "@/lib/env";
import { uploadBufferToStorage } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function resolveExtension(file: File) {
  const extension = extname(file.name).toLowerCase();

  if (extension) {
    return extension === ".jpeg" ? ".jpg" : extension;
  }

  switch (file.type) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".jpg";
  }
}

function toPublicUrl(bucket: string, path: string) {
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthWithSession();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Se requiere un archivo de imagen de perfil." },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Usa una imagen JPG, PNG, WebP o GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Las fotos de perfil deben pesar 10 MB o menos." },
        { status: 400 }
      );
    }

    const path = [
      "users",
      session.user.id,
      "profile",
      `${Date.now()}-${createId()}${resolveExtension(file)}`,
    ].join("/");

    await uploadBufferToStorage({
      bucket: storageBuckets.publicAssets,
      path,
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });

    return NextResponse.json({
      imageUrl: toPublicUrl(storageBuckets.publicAssets, path),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir la imagen de perfil.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
