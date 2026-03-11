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

const INPUT_DIR = path.join(process.cwd(), "public", "real-estate-presets");
const OUTPUT_DIR = path.join(process.cwd(), "public", "real-estate-variations");

interface Property {
  name: string;
  peopleScene: string;
}

const SELECTED: Property[] = [
  {
    name: "hollywood-hills-modern",
    peopleScene: "A couple in elegant evening wear standing by the glass railing on the terrace, looking out at the city lights. A matte black Porsche 911 GT3 parked in the driveway. Warm interior lights glowing through the floor-to-ceiling windows.",
  },
  {
    name: "maldives-overwater",
    peopleScene: "A woman in a flowing white sundress walking along the wooden deck toward the villa entrance. A traditional Maldivian dhoni boat moored beside the bungalow. Tropical cocktails on a small table by the deck railing.",
  },
  {
    name: "mediterranean-villa",
    peopleScene: "A family of four relaxing by the pool — parents on sun loungers, kids playing at the pool edge. A white Range Rover parked on the gravel driveway. Outdoor dining table set with food and wine under a pergola.",
  },
  {
    name: "japanese-zen-house",
    peopleScene: "A person in a linen kimono-style robe walking along the slate pathway toward the entrance. A white Tesla Model S parked on the minimalist gravel parking area. Soft warm light emanating from inside through the shoji screens.",
  },
  {
    name: "miami-penthouse",
    peopleScene: "Two people lounging on the rooftop terrace by the infinity pool, city skyline behind them. A yellow Lamborghini Huracán parked at the building entrance below. Rooftop bar area with cocktails and ambient string lights.",
  },
];

interface Variation {
  suffix: string;
  prompt: string;
}

const VARIATIONS: Variation[] = [
  {
    suffix: "night",
    prompt: `Transform this property photograph to NIGHTTIME. 

KEEP the EXACT same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND TIME OF DAY:
- Deep dark blue/navy night sky with visible stars and possibly a crescent moon
- All interior lights ON — warm golden/amber glow pouring through every window
- Exterior architectural lighting: subtle uplights on the facade, pathway lights, landscape lighting
- Pool/water should have underwater lights creating a glowing turquoise effect
- Dramatic contrast between the warm interior light and cool blue night atmosphere
- City lights or ambient light on the horizon if applicable
- Reflections of lights on glass, water, and polished surfaces
- The building should look inviting and luxurious at night — like a high-end real estate twilight photo
- NO changes to the building structure, landscaping layout, or camera angle`,
  },
  {
    suffix: "morning",
    prompt: `Transform this property photograph to EARLY MORNING / SUNRISE.

KEEP the EXACT same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND TIME OF DAY:
- Soft, diffused early morning light — the sun just rising on the horizon
- Pink, peach, and soft orange tones in the sky, transitioning to pale blue above
- Gentle morning mist or haze in the air, especially in valleys or near water
- Dew on the grass and landscaping — everything looks fresh and clean
- Long, soft shadows stretching across the ground from the low sun angle
- Cool blue shadow areas with warm highlights where sunlight touches
- Calm, peaceful, serene atmosphere — the stillness of early morning
- Soft reflections on glass and water surfaces catching the sunrise colors
- NO changes to the building structure, landscaping layout, or camera angle`,
  },
  {
    suffix: "overcast",
    prompt: `Transform this property photograph to DRAMATIC OVERCAST / MOODY weather.

KEEP the EXACT same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND ATMOSPHERE:
- Heavy dramatic cloud cover — dark, textured storm clouds with occasional breaks of light
- Moody, cinematic atmosphere — like a scene from a thriller or luxury real estate editorial
- Desaturated, cool color palette — blues, grays, dark greens
- Wet surfaces — the ground, pathways, and roof look like it just rained, with puddle reflections
- Dramatic light breaking through a gap in the clouds, creating a spotlight effect on part of the building
- Rich contrast — deep shadows but the building materials still readable
- The vegetation looks lush and saturated from rain
- Mist or low clouds in the background if mountains/hills are present
- The overall mood: brooding luxury, architectural drama
- NO changes to the building structure, landscaping layout, or camera angle`,
  },
];

async function generateVariation(
  inputPath: string,
  prompt: string,
): Promise<Buffer | null> {
  const imageData = fs.readFileSync(inputPath);
  const base64 = imageData.toString("base64");

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      console.log(`    Retry ${attempt}/3...`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }

    try {
      const response = await genai.models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: "SOURCE IMAGE — preserve the exact same building, angle, perspective, and composition:" },
              { inlineData: { mimeType: "image/png", data: base64 } },
              { text: prompt },
            ],
          },
        ],
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
      if (e?.status === 429) {
        console.log("    Rate limited, waiting 15s...");
        await new Promise((r) => setTimeout(r, 15000));
      }
    }
  }
  return null;
}

async function main() {
  console.log("=== Real Estate Lighting Variations Generator ===\n");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created: ${OUTPUT_DIR}\n`);
  }

  const totalImages = SELECTED.length * 4; // 3 lighting + 1 people/cars
  let done = 0;
  let ok = 0;

  for (const prop of SELECTED) {
    const inputPath = path.join(INPUT_DIR, `${prop.name}.png`);
    if (!fs.existsSync(inputPath)) {
      console.error(`[MISSING] ${prop.name}.png not found, skipping`);
      done += 4;
      continue;
    }

    const propDir = path.join(OUTPUT_DIR, prop.name);
    if (!fs.existsSync(propDir)) {
      fs.mkdirSync(propDir, { recursive: true });
    }

    console.log(`\n=== ${prop.name} ===`);

    // 3 lighting variations
    for (const v of VARIATIONS) {
      done++;
      const outPath = path.join(propDir, `${v.suffix}.png`);
      if (fs.existsSync(outPath)) {
        console.log(`  [Skip] ${v.suffix}.png exists`);
        ok++;
        continue;
      }

      console.log(`  [${done}/${totalImages}] ${v.suffix}`);
      const buf = await generateVariation(inputPath, v.prompt);
      if (buf) {
        fs.writeFileSync(outPath, buf);
        console.log(`  [Saved] ${v.suffix}.png (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
        ok++;
      } else {
        console.error(`  [FAIL] ${v.suffix}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    // People + cars variation
    done++;
    const peopleOut = path.join(propDir, `lifestyle.png`);
    if (fs.existsSync(peopleOut)) {
      console.log(`  [Skip] lifestyle.png exists`);
      ok++;
      continue;
    }

    const peoplePrompt = `Transform this property photograph to add PEOPLE and VEHICLES for a lifestyle scene.

KEEP the EXACT same building, angle, perspective, composition, and every architectural detail identical. Keep the same golden hour / daylight lighting.

ADD THE FOLLOWING ELEMENTS NATURALLY INTO THE SCENE:
${prop.peopleScene}

RULES:
- People must look photorealistic, natural, and like they belong in this setting
- Vehicles must be photorealistic with correct proportions, reflections, and shadows
- Everything must be properly lit to match the existing lighting in the scene
- People and vehicles cast appropriate shadows
- The scene should feel aspirational — luxury lifestyle photography
- DO NOT change the building, landscaping, or camera angle — only ADD elements`;

    console.log(`  [${done}/${totalImages}] lifestyle (people + cars)`);
    const buf = await generateVariation(inputPath, peoplePrompt);
    if (buf) {
      fs.writeFileSync(peopleOut, buf);
      console.log(`  [Saved] lifestyle.png (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
      ok++;
    } else {
      console.error(`  [FAIL] lifestyle`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Done! ${ok}/${totalImages} images generated ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
