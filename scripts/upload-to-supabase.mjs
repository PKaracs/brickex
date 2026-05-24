import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "public-assets";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DIRS_TO_UPLOAD = [
  "real-estate-full",
  "real-estate-full-variations",
  "real-estate-variations",
  "real-estate-presets",
  "real-estate-sketch",
  "real-estate-front",
  "interior-variations",
  "blog",
  "architecture-styles",
  "tool-previews",
];

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 52428800, // 50MB
  });
  if (error && error.message !== "The resource already exists") {
    throw new Error(`Failed to create bucket: ${error.message}`);
  }
  console.log(`Bucket "${BUCKET_NAME}" ready.`);
}

function getAllFiles(dirPath, basePath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, basePath));
    } else {
      const relativePath = path.relative(basePath, fullPath);
      files.push({ fullPath, relativePath });
    }
  }
  return files;
}

async function uploadFile(file) {
  const fileBuffer = fs.readFileSync(file.fullPath);
  const ext = path.extname(file.relativePath).toLowerCase();
  const mimeTypes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  const contentType = mimeTypes[ext] || "application/octet-stream";

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(file.relativePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`  FAIL: ${file.relativePath} — ${error.message}`);
    return false;
  }
  return true;
}

async function main() {
  console.log("Creating bucket...");
  await createBucket();

  const publicDir = path.resolve("public");
  let totalFiles = 0;
  let uploaded = 0;
  let failed = 0;

  for (const dir of DIRS_TO_UPLOAD) {
    const dirPath = path.join(publicDir, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Skipping ${dir} (not found)`);
      continue;
    }

    const files = getAllFiles(dirPath, publicDir);
    console.log(`\nUploading ${dir}/ (${files.length} files)...`);
    totalFiles += files.length;

    const BATCH_SIZE = 5;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(uploadFile));
      for (const r of results) {
        if (r) uploaded++;
        else failed++;
      }
      process.stdout.write(`  ${Math.min(i + BATCH_SIZE, files.length)}/${files.length}\r`);
    }
    console.log();
  }

  console.log(`\nDone! ${uploaded}/${totalFiles} uploaded, ${failed} failed.`);
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}`;
  console.log(`\nPublic base URL: ${publicUrl}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
