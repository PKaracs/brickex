import "dotenv/config";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "objects";
const REMOTE_DIR = "textures";
const LOCAL_DIR = join(process.cwd(), "public/textures");

const TEXTURE_NAME_MAP: Record<string, string> = {
  "marble.png": "marble-012",
  "concrete-polished.png": "concrete-smooth",
  "concrete-rough.png": "concrete-rough",
  "oakwood.png": "oak-wood",
  "brick.png": "brick-herringbone",
  "polished-metal.png": "polished-metal",
  "terracotta.png": "terracotta",
  "stone-gravel.png": "stone-gravel",
  "white-plaster.png": "white-plaster",
  "grey-paver.png": "grey-paver",
  "moss-stone.png": "moss-stone",
  "rust-metal.png": "rust-metal",
};

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const files = readdirSync(LOCAL_DIR).filter(
    (f) => f.endsWith(".png") && !f.startsWith("."),
  );

  console.log(`Found ${files.length} PNG textures to convert and upload\n`);

  for (const file of files) {
    const targetName = TEXTURE_NAME_MAP[file];
    if (!targetName) {
      console.log(`  SKIP ${file} (no mapping)`);
      continue;
    }

    const localPath = join(LOCAL_DIR, file);
    const remotePath = `${REMOTE_DIR}/${targetName}.webp`;

    console.log(`  ${file} → ${remotePath}`);

    const inputBuffer = readFileSync(localPath);

    const webpBuffer = await sharp(inputBuffer)
      .resize(512, 512, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    console.log(
      `    Converted: ${(inputBuffer.length / 1024).toFixed(0)}KB → ${(webpBuffer.length / 1024).toFixed(0)}KB`,
    );

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(remotePath, webpBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) {
      console.error(`    UPLOAD FAILED: ${error.message}`);
    } else {
      console.log(`    Uploaded ✓`);
    }
  }

  console.log("\nDone! Public URLs:");
  for (const [, targetName] of Object.entries(TEXTURE_NAME_MAP)) {
    console.log(
      `  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${REMOTE_DIR}/${targetName}.webp`,
    );
  }
}

main().catch(console.error);
