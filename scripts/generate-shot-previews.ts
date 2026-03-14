import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const API_KEY = process.env.GOOGLE_GENAI_API_KEY;
if (!API_KEY) {
  console.error("Missing GOOGLE_GENAI_API_KEY in env");
  process.exit(1);
}

const genai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL = "gemini-3.1-flash-image-preview";
const OUTPUT_DIR = path.join(process.cwd(), "public", "shots");
const SOURCE_IMAGE = path.join(
  process.cwd(),
  "public",
  "real-estate-presets",
  "cape-town-clifftop.png",
);

const EXTERIOR_SHOTS = [
  {
    value: "auto",
    prompt:
      "Keep this image exactly as-is. This is the default/auto camera angle — a natural, balanced three-quarter exterior view of the property at golden hour. Do not change the angle, composition, or perspective. Output the same image with identical framing.",
  },
  {
    value: "street-level",
    prompt:
      "Reimagine this luxury Cape Town clifftop property from a street-level perspective. Camera at standing eye height (~5.5ft / 1.7m), positioned on the street or driveway looking up slightly at the facade. Low vantage point that emphasizes the grandeur and height of the building. Include foreground elements like the driveway, landscaping, or entry path. Keep the same architectural style, materials (stone, glass, timber), the same pool, deck, and ocean backdrop. Golden hour lighting, photorealistic architectural photography.",
  },
  {
    value: "wide-angle",
    prompt:
      "Reimagine this luxury Cape Town clifftop property shot with an ultra-wide-angle lens (16mm equivalent). Dramatic wide-angle perspective that captures the entire property plus its surrounding landscape — the Atlantic Ocean, Table Mountain backdrop, and fynbos landscaping. Slight barrel distortion typical of wide-angle architectural photography. The full width of the property should be visible with generous environmental context. Golden hour lighting, photorealistic.",
  },
  {
    value: "aerial",
    prompt:
      "Reimagine this luxury Cape Town clifftop property from a high aerial/drone perspective, looking straight down at roughly a 60-70 degree angle. Bird's-eye view that shows the full property footprint — the roof, the infinity pool, the deck, the landscaping, and the dramatic cliff edge meeting the Atlantic Ocean. Table Mountain visible in the distance. Golden hour lighting with long shadows cast by the building. Photorealistic aerial architectural photography.",
  },
  {
    value: "rooftop",
    prompt:
      "Reimagine this luxury Cape Town clifftop property from a rooftop perspective — camera positioned at or above roof height on an adjacent structure or elevated point, looking slightly down across the property. Shows the roof profile, the pool terrace below, and the sweeping Atlantic Ocean and Table Mountain panorama beyond. Golden hour lighting, photorealistic architectural photography.",
  },
  {
    value: "corner-view",
    prompt:
      "Reimagine this luxury Cape Town clifftop property from a corner-view perspective — camera positioned at one corner of the building, capturing two facades simultaneously at roughly a 45-degree angle. This classic architectural photography angle shows depth and dimension of the building, revealing both the front and side elevations. Emphasize the stone and glass materiality. Golden hour lighting, photorealistic.",
  },
  {
    value: "close-up",
    prompt:
      "Reimagine this luxury Cape Town clifftop property as a detail close-up shot. Focus tightly on an architectural detail — the junction of stone wall and glass curtain wall, the timber overhang detail, or the infinity pool edge with ocean beyond. Shallow depth of field (f/2.8), creamy bokeh in the background. Show material textures: grain of the stone, warmth of the timber, clarity of the glass. Golden hour light raking across the surfaces. Photorealistic macro-style architectural detail photography.",
  },
  {
    value: "drone-low",
    prompt:
      "Reimagine this luxury Cape Town clifftop property from a low drone angle — camera positioned approximately 10-15 feet above ground level, slightly elevated but still intimate. This gives a gentle downward perspective that reveals the pool, deck layout, and landscaping while keeping the facade prominent. More personal than a high aerial shot. The ocean and coastline stretch out behind the property. Golden hour lighting, photorealistic architectural photography.",
  },
  {
    value: "entrance",
    prompt:
      "Reimagine this luxury Cape Town clifftop property from the entrance/arrival perspective — camera positioned at the front entrance or main approach, as if you just arrived at the property. Eye-level view looking at the front door, entry courtyard, or main entrance. Emphasis on the arrival experience: driveway, landscaping leading to the door, the welcoming facade. Warm golden hour light illuminating the entrance. Photorealistic architectural photography.",
  },
];

const INTERIOR_SHOTS = [
  {
    value: "int-auto",
    prompt:
      "Generate a luxurious, magazine-quality interior of this Cape Town clifftop property. Open-plan living room with floor-to-ceiling glass windows showing the Atlantic Ocean panorama. Contemporary African-inspired interior design: natural materials, warm earth tones, stone accent wall, timber ceiling. Balanced camera angle, natural composition. Daylight flooding in through the windows. Photorealistic interior architectural photography, shot on medium format camera.",
  },
  {
    value: "wide-room",
    prompt:
      "Generate a wide-room interior shot of this Cape Town clifftop property. Ultra-wide-angle lens (16mm) capturing the full expanse of a luxurious open-plan living/dining space. Floor-to-ceiling ocean-view windows dominate the far wall. Contemporary African interior design, natural materials, warm palette. The wide angle shows the full room scale — furniture arrangement, ceiling height, spatial flow. Daylight streaming in. Photorealistic interior photography.",
  },
  {
    value: "corner-angle",
    prompt:
      "Generate a corner-angle interior shot of this Cape Town clifftop property. Camera positioned in the corner of a luxurious living room, looking diagonally across the space. This reveals two walls and creates natural depth/perspective. Floor-to-ceiling glass on one side with ocean views. Contemporary African design, stone feature wall, timber details. Natural daylight, photorealistic interior architectural photography.",
  },
  {
    value: "straight-on",
    prompt:
      "Generate a straight-on/frontal interior shot of this Cape Town clifftop property. Camera perpendicular to a striking feature wall — a stone fireplace wall or a floor-to-ceiling window wall with ocean view. Symmetrical, centered composition. Luxurious contemporary African interior, warm materials. Clean, editorial look. Natural daylight. Photorealistic interior photography, medium format camera.",
  },
  {
    value: "detail",
    prompt:
      "Generate an interior detail shot of this Cape Town clifftop property. Close-up of a design vignette — a styled console table, a textured stone wall with artwork, or a reading nook by the window overlooking the ocean. Shallow depth of field, beautiful bokeh. Rich material textures visible: grain of wood, weave of fabric, stone patina. Warm natural light. Photorealistic interior detail photography.",
  },
  {
    value: "overhead",
    prompt:
      "Generate an overhead/bird's-eye interior shot looking straight down at a beautifully set dining table or living room seating arrangement in this Cape Town clifftop property. Top-down perspective showing furniture layout, a circular dining table with place settings, or a sectional sofa arrangement with coffee table. Natural materials, contemporary African design touches. Natural daylight. Photorealistic overhead interior photography.",
  },
  {
    value: "window-view",
    prompt:
      "Generate a window-view interior shot from inside this Cape Town clifftop property. Camera positioned inside a dark, moody interior looking outward through massive floor-to-ceiling windows at the stunning Atlantic Ocean, coastline, and Table Mountain. The interior frames the view — silhouetted furniture, curtain edges, window mullions create a dramatic frame. Contrast between the dim warm interior and bright exterior. Photorealistic interior photography.",
  },
];

async function generateFromReference(
  sourceData: string,
  sourceMime: string,
  shot: { value: string; prompt: string },
  index: number,
  total: number,
): Promise<Buffer | null> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = 3000 * attempt;
      console.log(`  Retry ${attempt}/${maxRetries} after ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: { mimeType: sourceMime, data: sourceData },
              },
              { text: shot.prompt },
            ],
          },
        ],
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: "16:9",
            imageSize: "2K",
          },
        },
      });

      if (!response.candidates?.length) {
        console.warn(`  No candidates for ${shot.value}`);
        continue;
      }

      const parts = response.candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          if ("inlineData" in part && part.inlineData?.data) {
            return Buffer.from(part.inlineData.data, "base64");
          }
        }
      }

      console.warn(`  No image data in response for ${shot.value}`);
    } catch (error: any) {
      console.error(
        `  Error for ${shot.value} (attempt ${attempt + 1}):`,
        error?.message,
      );

      if (error?.status === 429) {
        console.log("  Rate limited, waiting 20s...");
        await new Promise((r) => setTimeout(r, 20000));
      }
    }
  }

  return null;
}

async function main() {
  console.log("=== Shot Preview Image Generator ===\n");
  console.log(`Source: ${SOURCE_IMAGE}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`Source image not found: ${SOURCE_IMAGE}`);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}\n`);
  }

  const sourceBuffer = fs.readFileSync(SOURCE_IMAGE);
  const sourceData = sourceBuffer.toString("base64");
  const sourceMime = "image/png";

  const allShots = [...EXTERIOR_SHOTS, ...INTERIOR_SHOTS];
  const total = allShots.length;
  let success = 0;

  for (let i = 0; i < allShots.length; i++) {
    const shot = allShots[i];
    const outputPath = path.join(OUTPUT_DIR, `${shot.value}.jpg`);

    if (fs.existsSync(outputPath)) {
      console.log(`[Skip] ${shot.value}.jpg already exists`);
      success++;
      continue;
    }

    console.log(`\n[${i + 1}/${total}] Generating: ${shot.value}`);

    const imageBuffer = await generateFromReference(
      sourceData,
      sourceMime,
      shot,
      i,
      total,
    );

    if (imageBuffer) {
      fs.writeFileSync(outputPath, imageBuffer);
      console.log(
        `[Saved] ${shot.value}.jpg (${(imageBuffer.length / 1024).toFixed(0)}KB)`,
      );
      success++;
    } else {
      console.error(`[FAILED] Could not generate ${shot.value}`);
    }

    if (i < allShots.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Done! ${success}/${total} images generated ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
