/**
 * Copies Johnny's (csaohallod@gmail.com) generated images + all blog/landing images
 * into the "explore" bucket under a "johnny/" folder.
 * 
 * - Johnny's images: copied from richflex-user-media outputs/ → explore/johnny/
 * - Blog + landing images: copied from objects/ → explore/johnny/
 * - Does NOT delete originals, just copies
 * - Skips duplicates
 * 
 * Usage: npx tsx scripts/copy-johnny-and-site-images-to-explore.ts
 */

import { config } from "dotenv";
config({ path: ".env" });

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, projects, avatars } from "../db/schema";
import { eq } from "drizzle-orm";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const pgClient = postgres(process.env.DATABASE_URL!);
const db = drizzle(pgClient);

const EXPLORE_BUCKET = "explore";
const USER_MEDIA_BUCKET = "richflex-user-media";
const OBJECTS_BUCKET = "objects";
const JOHNNY_FOLDER = "johnny";
const JOHNNY_EMAIL = "csaohallod@gmail.com";

// All image paths referenced in blog posts and landing components (from objects bucket)
const SITE_IMAGE_PATHS = [
  // Landing - Hero
  "8fa45743a3429d2f55be146c8f5afb55.png",
  // Landing - SocialProofSection
  "Flux 2 Multi-Reference Image Editor (1).jpg",
  "Richflex (12).png",
  "Capture-2025-12-04-154731.png",
  "Richflex (13).png",
  "Richflex (4).png",
  "Richflex (14).png",
  "Richflex (5).png",
  "Richflex (15).png",
  "FLUX 2 Customizable Text-to-Image AI.jpg",
  "Richflex (16).png",
  "Richflex (17).png",
  "Richflex (18).png",
  // Landing - TransformationHero
  "Google Nano Banana 2 (15).png",
  "Richflex (50).png",
  // Landing - ThreeStepGuide
  "landing-chick.png",
  "landing-after.png",
  // Landing - HowItWorks
  "FLUX 2 Multi-Reference Image Editor.jpg",
  // Pricing
  "pricing-before.jpg",
  "pricing-after.png",
  // Blog - luxury-images
  "blog1yachtblog.png",
  "blog2-how-to-look-rich-without-money-luxury.png",
  "blog1penthouse.png",
  "blog1roomsuite.png",
  "blog1hotelretreat.png",
  "blog1bentleybentaygablog.png",
  "blog1patek.png",
  "blog1michelin.png",
  "blog1privatejetblog.png",
  "blog1fashion.png",
  "blog1housesunset.png",
  // Blog - pricing gallery
  "blog2-dating-image.png",
  "blog2-ai-luxury-travel-photo-without-travel.png",
  "blog2-gstaad-traveling.png",
  "blog2-mansion.png",
  "blog2-fake-rich.png",
  "blog2-luxury-dating-profile-photo-ai.png",
  "blog2-fake-rich-ai-private-jet-photo.png",
  // Blog - why-normal-photos-fail
  "blog-5-high-value-dating-profile-photo.png",
  "blog-5-normal-photos-dating-apps.png",
  "blog-5-clear-dating-profile-environment.png",
  "blog-5-boring-dating-profile-photo.png",
  "blog-5-average-dating-photos-create-doubt.png",
  "blog-5-upgrade-dating-photos.png",
  // Blog - images-with-cars
  "blog-6-bugatti-mistral-lursen-yacht-panther.jpeg",
  "blog-6-neon-city-car.jpeg",
  "blog-6-cinematic-jaguar-e-type.jpeg",
  "blog-6-gulfstream-lamborghini-revuelto.jpeg",
  "blog-6-electric-rolls-royce.jpeg",
  "blog-6-6x6.jpeg",
  // Blog - pics-of-yachts
  "blog9-lurssen-opus-floating-palace-superyacht-sunset.jpeg.jpeg",
  "blog9-sunreef-80-eco-solar-yacht-sustainable-luxury.jpeg",
  "blog9-oceanco-project-kairos-futuristic-superyacht-night.jpeg.jpeg",
  "blog9-perini-navi-60m-classic-sailing-yacht-mediterranean.jpeg",
  "blog9-damen-seaxplorer-77-explorer-yacht-arctic.jpeg",
  "blog9-wally-why200-minimalist-design-superyacht.jpeg.jpeg",
  "blog9-benetti-oasis-40m-charter-yacht-beach-club.jpeg.jpeg",
  // Blog - old-money-vs-new-money
  "blog11-new-money-aesthetic-monaco-penthouse-woman.jpeg",
  "blog11-old-vs-new-money-perception-gap-monaco-marina.jpeg",
  "blog11-old-money-aesthetic-provence-villa-woman.jpeg",
  "blog11-old-money-vs-new-money-south-of-france-contrast.jpeg",
  "blog11-old-money-dating-app-aesthetic-french-villa.jpeg",
  "blog11-old-money-mediterranean-villa.jpeg",
];

async function getJohnnyUserId(): Promise<string | null> {
  const result = await db.select({ id: users.id }).from(users).where(eq(users.email, JOHNNY_EMAIL)).limit(1);
  return result[0]?.id || null;
}

async function listAllOutputs(prefix: string): Promise<string[]> {
  const allFiles: string[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage
      .from(USER_MEDIA_BUCKET)
      .list(prefix, { limit, offset });

    if (error) {
      console.error(`Failed to list ${prefix}:`, error);
      break;
    }
    if (!data || data.length === 0) break;

    for (const file of data) {
      if (file.name && !file.name.startsWith(".")) {
        allFiles.push(`${prefix}/${file.name}`);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

async function copyFileBetweenBuckets(
  srcBucket: string,
  srcPath: string,
  destPath: string
): Promise<boolean> {
  // Download from source
  const { data, error: dlError } = await supabase.storage
    .from(srcBucket)
    .download(srcPath);

  if (dlError || !data) {
    console.error(`   ❌ Download failed: ${srcPath} — ${dlError?.message}`);
    return false;
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const ext = srcPath.split(".").pop()?.toLowerCase() || "png";
  const contentType =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "webp"
        ? "image/webp"
        : "image/png";

  // Upload to explore bucket
  const { error: upError } = await supabase.storage
    .from(EXPLORE_BUCKET)
    .upload(destPath, buffer, { contentType, upsert: false });

  if (upError) {
    if (upError.message.includes("already exists") || upError.message.includes("Duplicate")) {
      return false; // skip silently
    }
    console.error(`   ❌ Upload failed: ${destPath} — ${upError.message}`);
    return false;
  }

  return true;
}

async function main() {
  console.log("🚀 Copying Johnny's images + site images to explore bucket\n");

  // Check explore bucket exists
  const { error: bucketError } = await supabase.storage.createBucket(EXPLORE_BUCKET, {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 10 * 1024 * 1024,
  });
  if (bucketError && !bucketError.message.includes("already exists")) {
    console.error("Failed to create bucket:", bucketError);
    return;
  }

  // ========== PART 1: Johnny's generated outputs ==========
  console.log("1️⃣  Finding Johnny's user account...");
  const userId = await getJohnnyUserId();
  if (!userId) {
    console.error(`   ❌ Could not find user with email: ${JOHNNY_EMAIL}`);
    return;
  }
  console.log(`   ✅ Found userId: ${userId}`);

  // Find Johnny's projects by querying the DB via Supabase
  // Projects outputs are stored as: outputs/{projectId}/{generationId}.png
  // We need to find projects belonging to this user
  console.log("\n2️⃣  Finding Johnny's projects and output images...");

  let johnnyOutputKeys: string[] = [];

  const johnnyProjects = await db.select({ id: projects.id }).from(projects).where(eq(projects.userId, userId));
  console.log(`   Found ${johnnyProjects.length} projects for Johnny`);

  for (const proj of johnnyProjects) {
    const files = await listAllOutputs(`outputs/${proj.id}`);
    johnnyOutputKeys.push(...files);
  }

  console.log(`   📸 Found ${johnnyOutputKeys.length} output images`);

  // Also get Johnny's avatar/input images
  const johnnyAvatars = await db.select({ id: avatars.id }).from(avatars).where(eq(avatars.userId, userId));

  let avatarKeys: string[] = [];
  for (const avatar of johnnyAvatars) {
    const files = await listAllOutputs(`avatars/${avatar.id}`);
    avatarKeys.push(...files);
  }
  console.log(`   📷 Found ${avatarKeys.length} avatar images`);

  // Copy Johnny's outputs
  console.log(`\n3️⃣  Copying Johnny's output images to explore/${JOHNNY_FOLDER}/...`);
  let copied = 0;
  let skipped = 0;

  for (let i = 0; i < johnnyOutputKeys.length; i++) {
    const key = johnnyOutputKeys[i];
    const fileName = key.split("/").pop()!;
    const destPath = `${JOHNNY_FOLDER}/output-${fileName}`;

    const success = await copyFileBetweenBuckets(USER_MEDIA_BUCKET, key, destPath);
    if (success) {
      copied++;
      if (copied % 10 === 0) {
        console.log(`   📤 ${copied} copied (${i + 1}/${johnnyOutputKeys.length})`);
      }
    } else {
      skipped++;
    }
  }
  console.log(`   ✅ Outputs: ${copied} copied, ${skipped} skipped`);

  // ========== PART 2: Blog + Landing images from objects bucket ==========
  console.log(`\n4️⃣  Copying blog & landing images to explore/${JOHNNY_FOLDER}/...`);
  let siteCopied = 0;
  let siteSkipped = 0;

  // Deduplicate the site image paths
  const uniquePaths = [...new Set(SITE_IMAGE_PATHS)];
  console.log(`   ${uniquePaths.length} unique site images to copy`);

  for (let i = 0; i < uniquePaths.length; i++) {
    const srcPath = uniquePaths[i];
    // Keep original filename but prefix with source
    const safeName = srcPath.replace(/[^a-zA-Z0-9._-]/g, "_");
    const destPath = `${JOHNNY_FOLDER}/site-${safeName}`;

    const success = await copyFileBetweenBuckets(OBJECTS_BUCKET, srcPath, destPath);
    if (success) {
      siteCopied++;
    } else {
      siteSkipped++;
    }
  }
  console.log(`   ✅ Site images: ${siteCopied} copied, ${siteSkipped} skipped`);

  // ========== Summary ==========
  console.log(`\n✅ All done!`);
  console.log(`   Johnny outputs copied: ${copied}`);
  console.log(`   Site images copied: ${siteCopied}`);
  console.log(`   Total new in explore/${JOHNNY_FOLDER}/: ${copied + siteCopied}`);
  console.log(`   Skipped (already existed): ${skipped + siteSkipped}`);
  console.log(`\n🔗 Public URL pattern:`);
  console.log(`   ${SUPABASE_URL}/storage/v1/object/public/${EXPLORE_BUCKET}/${JOHNNY_FOLDER}/<filename>`);
}

main().catch(console.error).finally(() => pgClient.end());

