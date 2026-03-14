import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const BUCKET = "objects";
const SHOTS_DIR = join(process.cwd(), "public", "shots");
const REMOTE_PREFIX = "shots";
const THUMB_SIZE = 400;

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const files = (await readdir(SHOTS_DIR)).filter((f) => f.endsWith(".jpg"));
  console.log(`Found ${files.length} images to process`);

  for (const file of files) {
    const sourcePath = join(SHOTS_DIR, file);
    const raw = await readFile(sourcePath);

    const resized = await sharp(raw)
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    const remotePath = `${REMOTE_PREFIX}/${file}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(remotePath, resized, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    } else {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);
      console.log(`Uploaded ${file} (${(resized.byteLength / 1024).toFixed(0)}KB) → ${data.publicUrl}`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
