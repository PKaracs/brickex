/**
 * Script to create "explore" bucket on Supabase and upload all foxy images.
 * 
 * Usage: npx tsx scripts/upload-explore-images.ts
 */

import { config } from "dotenv";
config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET_NAME = "explore";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Directories to upload from
const IMAGE_DIRS = [
  { dir: path.join(process.env.HOME!, "Downloads/foxy-images"), prefix: "" },
  { dir: path.join(process.env.HOME!, "Downloads/foxy-images/luxury"), prefix: "" },
];

function getFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(buffer).digest("hex");
}

function getImageFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => path.join(dir, f));
}

async function main() {
  console.log(`\n🚀 Supabase URL: ${SUPABASE_URL}`);
  console.log(`📦 Bucket: ${BUCKET_NAME}\n`);

  // Step 1: Create bucket (public, so explore page can serve images directly)
  console.log("1️⃣  Creating bucket...");
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  });

  if (bucketError) {
    if (bucketError.message.includes("already exists")) {
      console.log("   ✅ Bucket already exists, continuing...");
    } else {
      console.error("   ❌ Failed to create bucket:", bucketError.message);
      process.exit(1);
    }
  } else {
    console.log("   ✅ Bucket created!");
  }

  // Step 2: Collect all image files and deduplicate by content hash
  console.log("\n2️⃣  Collecting images...");
  const hashToFile = new Map<string, string>();

  for (const { dir } of IMAGE_DIRS) {
    const files = getImageFiles(dir);
    console.log(`   Found ${files.length} images in ${dir}`);
    for (const file of files) {
      // Skip tiny files (likely errors)
      const stat = fs.statSync(file);
      if (stat.size < 1024) continue;

      const hash = getFileHash(file);
      if (!hashToFile.has(hash)) {
        hashToFile.set(hash, file);
      }
    }
  }

  console.log(`   📸 ${hashToFile.size} unique images (by content hash)`);

  // Step 3: Check existing files in bucket to avoid re-uploading
  console.log("\n3️⃣  Checking existing uploads...");
  const { data: existingFiles } = await supabase.storage.from(BUCKET_NAME).list("", {
    limit: 1000,
  });
  const existingNames = new Set((existingFiles || []).map((f) => f.name));
  console.log(`   Found ${existingNames.size} existing files in bucket`);

  // Step 4: Upload
  console.log("\n4️⃣  Uploading...");
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const entries = Array.from(hashToFile.entries());

  for (let i = 0; i < entries.length; i++) {
    const [hash, filePath] = entries[i];
    const ext = path.extname(filePath).toLowerCase();
    const fileName = `explore-${hash}${ext}`;

    if (existingNames.has(fileName)) {
      skipped++;
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, fileBuffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      if (error.message.includes("already exists") || error.message.includes("Duplicate")) {
        skipped++;
      } else {
        console.error(`   ❌ Failed: ${fileName} — ${error.message}`);
        failed++;
      }
    } else {
      uploaded++;
      if (uploaded % 20 === 0 || i === entries.length - 1) {
        console.log(`   📤 ${uploaded} uploaded, ${skipped} skipped, ${failed} failed (${i + 1}/${entries.length})`);
      }
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Skipped (already exists): ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total in bucket: ${uploaded + skipped + existingNames.size}`);
  console.log(`\n🔗 Public URL pattern:`);
  console.log(`   ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/<filename>`);
}

main().catch(console.error);

