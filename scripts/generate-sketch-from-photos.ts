import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const GOOGLE_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_GENAI_API_KEY");
  process.exit(1);
}

const genai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const MODEL = "gemini-3.1-flash-image-preview";

const INPUT_DIR = path.join(process.cwd(), "public", "real-estate-front");
const OUTPUT_DIR = path.join(process.cwd(), "public", "real-estate-sketch");

const SKETCH_PROMPT = `Transform this photograph into a SketchUp 3D model render / architectural 3D visualization.

CRITICAL STYLE — MUST MATCH EXACTLY:
- This must look like a screenshot from SketchUp / Google SketchUp 3D modeling software
- COLORED FLAT SHADING on surfaces — muted, desaturated colors: beige/tan for walls, gray-green for grass/ground, dark gray for roofs, muted blue for sky, brown for wood
- PROMINENT BLACK EDGE LINES on every geometric edge — this is the signature SketchUp look. Every corner, every wall junction, every window frame, every roof edge has a crisp dark outline
- The shading is FLAT and simplified — no photorealistic textures, no reflections, no complex lighting. Just flat color fills with visible polygon edges
- Sky should be a simple gradient: light blue at top fading to almost white at horizon — the classic SketchUp sky
- Ground/grass is a flat muted green with visible edge outlines where it meets paths, driveways, etc.
- Windows appear as dark flat rectangles or with simple glass-like dark tint
- Trees and landscaping are simplified 3D shapes — like SketchUp's built-in tree components (blobby green shapes on brown trunks, NOT realistic foliage)
- Shadows are simple, flat, and cast on the ground plane — like SketchUp's shadow engine
- Overall the image should look DIGITAL and 3D-MODELED, not hand-drawn
- The feel is: "an architect made this 3D model in SketchUp to show the client before construction"

PRESERVE:
- The EXACT same building, perspective, composition, and framing as the original photo
- All architectural elements: walls, windows, doors, roof shape, landscaping layout
- The proportions and scale of everything

DO NOT:
- Make it photorealistic
- Add complex textures or realistic materials
- Remove the edge lines — they are essential to the SketchUp aesthetic`;

const STYLE_REF_PATH = path.join(process.cwd(), ".cursor", "projects", "Users-karacs-brickex", "assets", "image-4eaee237-8396-4d49-b452-c0767336074b.png");

async function convertToSketch(inputPath: string): Promise<Buffer | null> {
  const imageData = fs.readFileSync(inputPath);
  const base64 = imageData.toString("base64");

  const styleRefExists = fs.existsSync(STYLE_REF_PATH);
  const styleRefBase64 = styleRefExists ? fs.readFileSync(STYLE_REF_PATH).toString("base64") : null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log(`  Retry ${attempt}/3...`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }

    try {
      const parts: any[] = [];

      if (styleRefBase64) {
        parts.push({ text: "STYLE REFERENCE — the output must match this SketchUp 3D model visual style exactly (flat shading, dark edge lines, muted colors, simplified 3D geometry):" });
        parts.push({ inlineData: { mimeType: "image/png", data: styleRefBase64 } });
      }

      parts.push({ text: "SOURCE PHOTOGRAPH — convert this into the SketchUp style shown above, preserving the exact same building, perspective, and composition:" });
      parts.push({ inlineData: { mimeType: "image/png", data: base64 } });
      parts.push({ text: SKETCH_PROMPT });

      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "2K",
          },
        },
      });

      const resParts = response.candidates?.[0]?.content?.parts;
      if (resParts) {
        for (const p of resParts) {
          if ("inlineData" in p && p.inlineData?.data) {
            return Buffer.from(p.inlineData.data, "base64");
          }
        }
      }
      console.warn("  No image in response");
    } catch (e: any) {
      console.error(`  Error: ${e?.message}`);
      if (e?.status === 429) {
        console.log("  Rate limited, waiting 15s...");
        await new Promise((r) => setTimeout(r, 15000));
      }
    }
  }
  return null;
}

async function main() {
  const testOnly = process.argv.includes("--test");

  console.log(`=== Sketch3D / CAD Converter ${testOnly ? "(TEST - 1 image)" : "(all images)"} ===\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created: ${OUTPUT_DIR}\n`);
  }

  const pngs = fs.readdirSync(INPUT_DIR).filter((f) => f.endsWith(".png")).sort();
  const files = testOnly ? pngs.slice(0, 1) : pngs;

  console.log(`Processing ${files.length} images from ${INPUT_DIR}\n`);

  let ok = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const name = path.basename(file, ".png");
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, `${name}-sketch.png`);

    if (fs.existsSync(outputPath)) {
      console.log(`[Skip] ${name}-sketch.png exists`);
      ok++;
      continue;
    }

    console.log(`[${i + 1}/${files.length}] Converting: ${name}`);

    const buf = await convertToSketch(inputPath);
    if (buf) {
      fs.writeFileSync(outputPath, buf);
      console.log(`[Saved] ${name}-sketch.png (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
      ok++;
    } else {
      console.error(`[FAIL] ${name}`);
    }

    if (i < files.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Done! ${ok}/${files.length} ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
