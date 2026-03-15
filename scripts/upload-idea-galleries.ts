import "dotenv/config";

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET_PUBLIC_ASSETS || "objects";

const MANIFEST_PATH = path.join(
  process.cwd(),
  "data",
  "ideas",
  "idea-gallery-manifest.json",
);
const LOCAL_ROOT = path.join(process.cwd(), "public", "ideas-generated");
const REMOTE_ROOT = "ideas-generated";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

type AspectRatio = "cinema" | "portrait" | "square";

interface ManifestImage {
  id: string;
  src: string;
  aspectRatio: AspectRatio;
  title: string;
  altText: string;
  description: string;
  prompt: string;
  promptLabel: string;
}

interface ManifestEntry {
  slug: string;
  images: ManifestImage[];
}

function readManifest(): Record<string, ManifestEntry> {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Missing manifest: ${MANIFEST_PATH}`);
  }

  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as Record<
    string,
    ManifestEntry
  >;
}

function writeManifest(manifest: Record<string, ManifestEntry>) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
}

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

function buildPublicUrl(remotePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${remotePath}`;
}

function parseArgs(args: string[]) {
  const slugIndex = args.indexOf("--slug");
  const all = args.includes("--all");
  const includePrompts = args.includes("--include-prompts");

  if (!all && slugIndex === -1) {
    console.log(`Usage:
  npx tsx scripts/upload-idea-galleries.ts --slug <idea-slug>
  npx tsx scripts/upload-idea-galleries.ts --all
  npx tsx scripts/upload-idea-galleries.ts --slug <idea-slug> --include-prompts`);
    process.exit(0);
  }

  return {
    slug: slugIndex !== -1 ? args[slugIndex + 1] : null,
    all,
    includePrompts,
  };
}

async function uploadFile(localPath: string, remotePath: string) {
  const buffer = fs.readFileSync(localPath);
  const { error } = await supabase.storage.from(BUCKET).upload(remotePath, buffer, {
    contentType: contentTypeFor(localPath),
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function uploadTopic(
  slug: string,
  entry: ManifestEntry,
  includePrompts: boolean,
) {
  const topicDir = path.join(LOCAL_ROOT, slug);
  if (!fs.existsSync(topicDir)) {
    throw new Error(`Missing local gallery directory: ${topicDir}`);
  }

  console.log(`\nUploading ${slug}...`);

  for (const image of entry.images) {
    const fileName = path.basename(image.src);
    const localPath = path.join(topicDir, fileName);
    const remotePath = `${REMOTE_ROOT}/${slug}/${fileName}`;

    if (!fs.existsSync(localPath)) {
      throw new Error(`Missing local image: ${localPath}`);
    }

    await uploadFile(localPath, remotePath);
    image.src = buildPublicUrl(remotePath);
    console.log(`  ${fileName}`);
  }

  if (includePrompts) {
    const promptsPath = path.join(topicDir, "prompts.json");
    if (fs.existsSync(promptsPath)) {
      const remotePath = `${REMOTE_ROOT}/${slug}/prompts.json`;
      await uploadFile(promptsPath, remotePath);
      console.log("  prompts.json");
    }
  }
}

async function main() {
  const { slug, all, includePrompts } = parseArgs(process.argv.slice(2));
  const manifest = readManifest();
  const slugs = all ? Object.keys(manifest) : [slug!];

  for (const currentSlug of slugs) {
    const entry = manifest[currentSlug];
    if (!entry) {
      throw new Error(`Missing manifest entry for slug: ${currentSlug}`);
    }

    await uploadTopic(currentSlug, entry, includePrompts);
  }

  writeManifest(manifest);
  console.log(`\nUpdated manifest: ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
