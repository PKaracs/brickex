import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const GOOGLE_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
if (!GOOGLE_API_KEY) { console.error("Missing GOOGLE_GENAI_API_KEY"); process.exit(1); }

const genai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const MODEL = "gemini-3.1-flash-image-preview";

const INPUT_PATH = path.join(process.cwd(), "public", "interior.png");
const OUTPUT_DIR = path.join(process.cwd(), "public", "interior-variations");

const STYLES = [
  {
    name: "empty-room",
    prompt: `Transform this furnished interior into a COMPLETELY EMPTY ROOM.

REMOVE all furniture, rugs, artwork, lamps, decorative objects, cushions, and accessories.
KEEP the exact same room shell: walls, ceiling, floor, windows, doors, built-in shelving structure, crown molding, recessed lighting positions.

The room should look like a freshly completed construction — clean empty space ready for staging:
- Bare hardwood floors (same wood tone), freshly cleaned
- Plain painted walls (same warm neutral color)
- Ceiling with the same cove lighting and recessed lights, turned on
- Windows with plain curtain rods but NO curtains
- Built-in shelf structure visible but empty
- Natural daylight filling the space
- Clean, bright, inviting empty room — like a real estate listing "before staging" photo

KEEP the exact same camera angle, perspective, and room proportions. Photorealistic.`,
  },
  {
    name: "modern-minimalist",
    prompt: `Redesign this interior in a MODERN MINIMALIST style. Keep the exact same room shell, camera angle, and proportions.

NEW DESIGN:
- FURNITURE: Low-profile white modular sofa, slim black metal coffee table with marble top, single Eames-style lounge chair in light gray, floating TV console in matte white
- UPHOLSTERY: All white and light gray fabrics, clean linen textures
- WALLS: Bright white with one accent wall in soft concrete/plaster texture
- FLOOR: Same hardwood, add a large off-white wool area rug with subtle texture
- LIGHTING: Minimal pendant light (Flos IC style), hidden LED strips in ceiling cove, one slim floor lamp
- ACCESSORIES: Single large abstract black-and-white artwork, one potted monstera plant, 2-3 ceramic objects
- PALETTE: White, light gray, black accents, natural wood
- MOOD: Airy, spacious, clean, Japanese-Scandinavian influenced

Photorealistic, magazine-quality interior photography.`,
  },
  {
    name: "art-deco",
    prompt: `Redesign this interior in a LUXURIOUS ART DECO style. Keep the exact same room shell, camera angle, and proportions.

NEW DESIGN:
- FURNITURE: Curved velvet sofa in deep emerald green, matching armchairs in navy blue velvet, round gold-framed marble coffee table, art deco bar cart in brass and glass
- UPHOLSTERY: Rich velvets in emerald, navy, and champagne gold tufted details
- WALLS: Dark charcoal with gold geometric wallpaper pattern on one accent wall, ornate gold mirror
- FLOOR: Same hardwood polished to high gloss, add a deep burgundy and gold Persian-style rug
- LIGHTING: Dramatic crystal chandelier (art deco geometric design), brass wall sconces, table lamps with gold shades
- ACCESSORIES: Gold sunburst mirror, geometric sculptures, vintage cocktail glasses on bar cart, oversized floral arrangement
- PALETTE: Emerald, navy, gold, charcoal, champagne
- MOOD: Gatsby-era glamour, sophisticated, opulent but tasteful

Photorealistic, magazine-quality interior photography.`,
  },
  {
    name: "scandinavian",
    prompt: `Redesign this interior in a WARM SCANDINAVIAN / HYGGE style. Keep the exact same room shell, camera angle, and proportions.

NEW DESIGN:
- FURNITURE: Soft rounded sofa in warm oatmeal boucle, two cozy armchairs in blush pink wool, light oak round coffee table, oak sideboard with rattan doors
- UPHOLSTERY: Boucle, chunky knit throws, linen cushions in muted earth tones (terracotta, sage, cream)
- WALLS: Warm white/cream, one wall with light oak wood slat paneling
- FLOOR: Light oak hardwood (lighter than current), sheepskin rug layered over a jute area rug
- LIGHTING: Paper pendant lamp (Japanese-Nordic style), candles in wooden holders, brass table lamp with linen shade
- ACCESSORIES: Dried pampas grass arrangement, stacked coffee table books, ceramic vases in earthy glazes, woven baskets, small indoor olive tree
- PALETTE: Cream, oatmeal, blush, sage, terracotta, light oak
- MOOD: Warm, cozy, inviting, lived-in comfort, soft textures everywhere

Photorealistic, magazine-quality interior photography.`,
  },
  {
    name: "industrial",
    prompt: `Redesign this interior in a MODERN INDUSTRIAL LOFT style. Keep the exact same room shell, camera angle, and proportions.

NEW DESIGN:
- FURNITURE: Large distressed brown leather Chesterfield sofa, industrial steel and reclaimed wood coffee table, black metal and leather armchair, open metal bookshelf unit
- UPHOLSTERY: Aged brown leather, charcoal linen, dark denim, worn canvas
- WALLS: Exposed brick on one wall (red/brown tones), remaining walls in raw concrete/plaster finish
- FLOOR: Same hardwood but slightly more weathered look, vintage Turkish rug in faded reds and blues
- LIGHTING: Edison bulb pendant cluster on exposed black cords, industrial black metal floor lamp, vintage factory-style wall sconces
- ACCESSORIES: Vintage industrial clock, stacked old books, metal gear sculptures, potted fiddle leaf fig, black and white photography prints in raw steel frames
- PALETTE: Brown leather, charcoal, black metal, warm wood, brick red, faded blue accents
- MOOD: Urban warehouse loft, masculine, raw materials, warm industrial

Photorealistic, magazine-quality interior photography.`,
  },
];

async function generateVariation(inputPath: string, prompt: string): Promise<Buffer | null> {
  const base64 = fs.readFileSync(inputPath).toString("base64");

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log(`    Retry ${attempt}/3...`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [{
          role: "user",
          parts: [
            { text: "SOURCE ROOM — keep the exact same room shell, camera angle, and proportions:" },
            { inlineData: { mimeType: "image/png", data: base64 } },
            { text: prompt },
          ],
        }],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
        },
      });
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const p of parts) {
          if ("inlineData" in p && p.inlineData?.data) {
            return Buffer.from(p.inlineData.data, "base64");
          }
        }
      }
      console.warn("    No image in response");
    } catch (e: any) {
      console.error(`    Error: ${e?.message}`);
      if (e?.status === 429) await new Promise((r) => setTimeout(r, 15000));
    }
  }
  return null;
}

async function main() {
  console.log("=== Interior Variation Generator ===\n");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let ok = 0;
  for (let i = 0; i < STYLES.length; i++) {
    const style = STYLES[i];
    const outPath = path.join(OUTPUT_DIR, `${style.name}.png`);

    if (fs.existsSync(outPath)) {
      console.log(`[Skip] ${style.name}.png exists`);
      ok++;
      continue;
    }

    console.log(`[${i + 1}/${STYLES.length}] Generating: ${style.name}`);
    const buf = await generateVariation(INPUT_PATH, style.prompt);
    if (buf) {
      fs.writeFileSync(outPath, buf);
      console.log(`[Saved] ${style.name}.png (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
      ok++;
    } else {
      console.error(`[FAIL] ${style.name}`);
    }
    if (i < STYLES.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done! ${ok}/${STYLES.length} ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
