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

const INPUT_DIR = path.join(process.cwd(), "public", "real-estate-full");
const OUTPUT_DIR = path.join(process.cwd(), "public", "real-estate-full-variations");

interface Property {
  name: string;
  peopleScene: string;
}

const PROPERTIES: Property[] = [
  {
    name: "classic-white-mansion",
    peopleScene: "An elegant couple in formal attire walking up the front steps toward the entrance. A dark green Bentley Continental GT parked on the circular driveway near the fountain. A gardener tending to the hedges in the background.",
  },
  {
    name: "desert-modern-house",
    peopleScene: "A man in linen shirt and chinos leaning against the entrance frame, coffee in hand, looking out at the desert. A matte gray Rivian R1S parked on the gravel drive. A woman in a sun hat sitting on the covered patio reading.",
  },
  {
    name: "japanese-minimalist-home",
    peopleScene: "A person in a minimalist linen outfit walking the slate pathway toward the front door. A white Lexus LC 500 parked on the gravel parking area. Soft warm light glowing through the entrance.",
  },
  {
    name: "luxury-glass-skyscraper",
    peopleScene: "Well-dressed businesspeople walking near the glass lobby entrance at street level. A black Mercedes-Maybach S-Class pulling up to the valet area. A doorman in uniform holding the lobby door. Street-level cafe seating with a few patrons.",
  },
  {
    name: "malibu-beach-mansion",
    peopleScene: "A couple in casual resort wear walking barefoot along the sand toward the house. Surfboards leaning against the patio railing. A vintage woody station wagon parked in the driveway. A golden retriever on the deck.",
  },
  {
    name: "miami-condo-tower",
    peopleScene: "People walking along the palm-lined boulevard at the base of the tower. A red Ferrari 296 GTB parked at the entrance with a valet attendant. A couple stepping out of the glass lobby doors. Street-level retail with shoppers.",
  },
  {
    name: "modern-glass-villa",
    peopleScene: "A woman in an elegant white dress lounging on a sun bed by the infinity pool. A black Porsche Taycan parked on the sleek driveway. A man in swim trunks standing at the pool edge. Outdoor dining table set for two with wine and candles.",
  },
  {
    name: "swiss-mountain-chalet",
    peopleScene: "A family in cozy outdoor wear on the front balcony, kids pointing at the mountains. A dark blue Land Rover Defender parked on the gravel in front. Smoke rising from the chimney. Hiking boots and ski poles near the entrance.",
  },
  {
    name: "tropical-overwater-villa",
    peopleScene: "A couple in swimwear on the wooden deck, one diving into the turquoise water, the other watching from the plunge pool. A traditional wooden speedboat moored at the villa's private dock. Tropical drinks on a deck table.",
  },
  {
    name: "tuscan-villa-estate",
    peopleScene: "An older couple in elegant Italian casual attire strolling arm-in-arm up the cypress-lined gravel path. A dark red Maserati GranTurismo parked near the entrance. A table with wine and cheese set under the arched portico.",
  },
];

const NIGHT_PROMPT = `Transform this property photograph to NIGHTTIME.

KEEP the EXACT same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND TIME OF DAY:
- Deep dark blue/navy night sky with visible stars and possibly a crescent moon
- All interior lights ON — warm golden/amber glow pouring through every window
- Exterior architectural lighting: subtle uplights on the facade, pathway lights, landscape lighting
- Pool/water should have underwater lights creating a glowing turquoise effect
- Dramatic contrast between the warm interior light and cool blue night atmosphere
- Reflections of lights on glass, water, and polished surfaces
- The building should look inviting and luxurious at night
- NO changes to the building structure, landscaping layout, or camera angle`;

const MORNING_PROMPT = `Transform this property photograph to EARLY MORNING / SUNRISE.

KEEP the EXACT same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND TIME OF DAY:
- Soft, diffused early morning light — the sun just rising on the horizon
- Pink, peach, and soft orange tones in the sky, transitioning to pale blue above
- Gentle morning mist or haze in the air
- Dew on the grass and landscaping — everything looks fresh and clean
- Long, soft shadows stretching across the ground from the low sun angle
- Cool blue shadow areas with warm highlights where sunlight touches
- Calm, peaceful, serene atmosphere
- Soft reflections on glass and water surfaces catching the sunrise colors
- NO changes to the building structure, landscaping layout, or camera angle`;

const OVERCAST_PROMPT = `Transform this property photograph to DRAMATIC OVERCAST / MOODY weather.

KEEP the EXACT same building, angle, perspective, composition, and every architectural detail identical.

CHANGE ONLY THE LIGHTING AND ATMOSPHERE:
- Heavy dramatic cloud cover — dark, textured storm clouds with occasional breaks of light
- Moody, cinematic atmosphere — like a luxury real estate editorial
- Desaturated, cool color palette — blues, grays, dark greens
- Wet surfaces — the ground, pathways, and roof look like it just rained, with puddle reflections
- Dramatic light breaking through a gap in the clouds, spotlight effect on part of the building
- Rich contrast — deep shadows but the building materials still readable
- The vegetation looks lush and saturated from rain
- The overall mood: brooding luxury, architectural drama
- NO changes to the building structure, landscaping layout, or camera angle`;

function lifestylePrompt(scene: string): string {
  return `Transform this property photograph to add PEOPLE and VEHICLES for a lifestyle scene.

KEEP the EXACT same building, angle, perspective, composition, and every architectural detail identical. Keep the same golden hour / daylight lighting.

ADD THE FOLLOWING ELEMENTS NATURALLY INTO THE SCENE:
${scene}

RULES:
- People must look photorealistic, natural, and like they belong in this setting
- Vehicles must be photorealistic with correct proportions, reflections, and shadows
- Everything must be properly lit to match the existing lighting in the scene
- People and vehicles cast appropriate shadows
- The scene should feel aspirational — luxury lifestyle photography
- DO NOT change the building, landscaping, or camera angle — only ADD elements`;
}

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
            { text: "SOURCE IMAGE — preserve the exact same building, angle, perspective, and composition:" },
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
      if (e?.status === 429) {
        console.log("    Rate limited, waiting 15s...");
        await new Promise((r) => setTimeout(r, 15000));
      }
    }
  }
  return null;
}

async function main() {
  console.log("=== Full-Building Lighting Variations ===\n");

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const total = PROPERTIES.length * 4;
  let count = 0;
  let ok = 0;

  for (const prop of PROPERTIES) {
    const inputPath = path.join(INPUT_DIR, `${prop.name}.png`);
    if (!fs.existsSync(inputPath)) {
      console.error(`[MISSING] ${prop.name}.png`);
      count += 4;
      continue;
    }

    const propDir = path.join(OUTPUT_DIR, prop.name);
    if (!fs.existsSync(propDir)) fs.mkdirSync(propDir, { recursive: true });

    console.log(`\n=== ${prop.name} ===`);

    const variations: { suffix: string; prompt: string }[] = [
      { suffix: "night", prompt: NIGHT_PROMPT },
      { suffix: "morning", prompt: MORNING_PROMPT },
      { suffix: "overcast", prompt: OVERCAST_PROMPT },
      { suffix: "lifestyle", prompt: lifestylePrompt(prop.peopleScene) },
    ];

    for (const v of variations) {
      count++;
      const outPath = path.join(propDir, `${v.suffix}.png`);
      if (fs.existsSync(outPath)) {
        console.log(`  [Skip] ${v.suffix}.png exists`);
        ok++;
        continue;
      }

      console.log(`  [${count}/${total}] ${v.suffix}`);
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
  }

  console.log(`\n=== Done! ${ok}/${total} ===`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
