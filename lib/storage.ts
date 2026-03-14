import "server-only";

import { basename, extname } from "path";

import { createId } from "@paralleldrive/cuid2";

import { env, storageBuckets } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

export type BucketName = (typeof storageBuckets)[keyof typeof storageBuckets];

function sanitizeFileSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function toStorageKey(bucket: string, path: string) {
  return `${bucket}/${path}`;
}

export function parseStorageKey(storageKey: string) {
  const firstSlash = storageKey.indexOf("/");
  if (firstSlash === -1) {
    throw new Error(`Invalid storage key: ${storageKey}`);
  }

  return {
    bucket: storageKey.slice(0, firstSlash),
    path: storageKey.slice(firstSlash + 1),
  };
}

export function buildProjectAssetPath(input: {
  organizationId: string;
  projectId: string;
  assetId?: string;
  kind: string;
  originalFilename: string;
}) {
  const assetId = input.assetId ?? createId();
  const extension = extname(input.originalFilename || "").toLowerCase();
  const fileBase = sanitizeFileSegment(
    basename(input.originalFilename || `asset-${assetId}`, extension) || `asset-${assetId}`,
  );
  const safeExtension = extension || ".bin";
  const path = [
    "orgs",
    input.organizationId,
    "projects",
    input.projectId,
    input.kind,
    `${assetId}-${fileBase}${safeExtension}`,
  ].join("/");

  return {
    assetId,
    path,
  };
}

export async function createSignedUploadUrl(input: {
  bucket: BucketName | string;
  path: string;
}) {
  const result = await supabaseAdmin.storage
    .from(input.bucket)
    .createSignedUploadUrl(input.path, {
      upsert: false,
    });

  if (result.error || !result.data) {
    throw new Error(result.error?.message || "Failed to create signed upload URL");
  }

  return result.data;
}

export async function getSignedDownloadUrl(storageKey: string, expiresIn = env.SUPABASE_SIGNED_URL_TTL_SECONDS) {
  const { bucket, path } = parseStorageKey(storageKey);
  const result = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (result.error || !result.data) {
    throw new Error(result.error?.message || "Failed to create signed URL");
  }

  return result.data.signedUrl;
}

export async function uploadBufferToStorage(input: {
  bucket: BucketName | string;
  path: string;
  buffer: Buffer;
  contentType: string;
  upsert?: boolean;
}) {
  const result = await supabaseAdmin.storage.from(input.bucket).upload(input.path, input.buffer, {
    contentType: input.contentType,
    upsert: input.upsert ?? false,
  });

  if (result.error || !result.data) {
    throw new Error(result.error?.message || "Failed to upload object to Supabase Storage");
  }

  return result.data;
}

export async function downloadStorageObject(storageKey: string) {
  const { bucket, path } = parseStorageKey(storageKey);
  const result = await supabaseAdmin.storage.from(bucket).download(path);

  if (result.error || !result.data) {
    throw new Error(result.error?.message || "Failed to download object from Supabase Storage");
  }

  const arrayBuffer = await result.data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function getStorageObjectInfo(storageKey: string) {
  const { bucket, path } = parseStorageKey(storageKey);
  const result = await supabaseAdmin.storage.from(bucket).info(path);

  if (result.error || !result.data) {
    throw new Error(result.error?.message || "Failed to load object metadata");
  }

  return result.data;
}

export async function ingestExternalFileToStorage(input: {
  sourceUrl: string;
  bucket: BucketName | string;
  path: string;
  contentType?: string;
}) {
  const response = await fetch(input.sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to download external asset: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await uploadBufferToStorage({
    bucket: input.bucket,
    path: input.path,
    buffer,
    contentType:
      input.contentType || response.headers.get("content-type") || "application/octet-stream",
  });

  return {
    byteSize: buffer.byteLength,
    contentType: input.contentType || response.headers.get("content-type") || "application/octet-stream",
  };
}
