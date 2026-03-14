import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const GOOGLE_API_KEY = process.env.GOOGLE_GENAI_API_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = process.env.SUPABASE_BUCKET_PUBLIC_ASSETS || "objects";

if (!GOOGLE_API_KEY) throw new Error("Missing GOOGLE_GENAI_API_KEY");
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Missing Supabase credentials");

const genai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const MODEL = "gemini-3.1-flash-image-preview";
const FALLBACK_MODEL = "gemini-3-pro-image-preview";

const ENHANCER_SYSTEM = `You are a world-class architectural photographer. Rewrite the given prompt with professional photography specifications:
- CAMERA: specific body + lens (e.g. "Canon EOS R5 with RF 24-70mm f/2.8L")
- SETTINGS: aperture, ISO, shutter speed matching the scene
- LIGHTING: exact lighting that matches time of day
- COLOR GRADING: cinematic color palette and tonal quality  
- COMPOSITION: rule of thirds, leading lines, depth layers
- TEXTURE & DETAIL: material quality, reflections, micro-details
- ATMOSPHERE: haze, bokeh, light particles, ambient mood

RULES:
1. Keep ALL scene details from the original prompt
2. Add cinematic photography expertise on top
3. Make it look like it belongs in Architectural Digest or Dezeen
4. Output ONLY the enhanced prompt, no explanations
5. Under 400 words`;

async function enhancePrompt(raw: string): Promise<string> {
  if (!openai) return raw;
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: ENHANCER_SYSTEM },
        { role: "user", content: raw },
      ],
      max_completion_tokens: 800,
    });
    return res.choices[0]?.message?.content?.trim() || raw;
  } catch (e: any) {
    console.warn(`[Enhance] Failed: ${e.message}, using raw prompt`);
    return raw;
  }
}

async function generateImage(prompt: string, aspectRatio = "16:9"): Promise<Buffer | null> {
  const enhanced = await enhancePrompt(prompt);
  console.log(`[Generate] Enhanced prompt (${enhanced.length} chars)`);

  for (const model of [MODEL, FALLBACK_MODEL]) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 2000 * attempt));
      try {
        const response = await genai.models.generateContent({
          model,
          contents: [{ role: "user", parts: [{ text: enhanced }] }],
          config: {
            responseModalities: ["IMAGE", "TEXT"],
            imageConfig: { aspectRatio, imageSize: "2K" },
          },
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              return Buffer.from(part.inlineData.data, "base64");
            }
          }
        }
      } catch (e: any) {
        console.warn(`[Generate] ${model} attempt ${attempt + 1} failed: ${e.message}`);
        if (e?.status === 429) break;
      }
    }
  }
  return null;
}

async function uploadToSupabase(buffer: Buffer, path: string): Promise<string | null> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) {
    console.error(`[Upload] Failed ${path}: ${error.message}`);
    return null;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

interface ImageSpec {
  name: string;
  prompt: string;
  folder: string;
}

const SKYSCRAPERS: ImageSpec[] = [
  {
    name: "dubai-golden-tower",
    folder: "showcase/skyscrapers",
    prompt: "A breathtaking supertall glass skyscraper at golden hour in Dubai. Sleek tapered crystalline facade reflecting sunset in amber and rose gold tones. Sky gardens with palm trees on setback terraces every 20 floors. The tower pierces through a thin cloud layer near its summit. Desert cityscape sprawling below. Ultra-photorealistic architectural visualization.",
  },
  {
    name: "shanghai-neon-helix",
    folder: "showcase/skyscrapers",
    prompt: "A stunning neo-futuristic skyscraper in Shanghai at night. Double-helix twisted form wrapped in LED-lit glass panels glowing electric blue and white. A dramatic illuminated sky bridge connects to a neighboring tower at the 60th floor. Huangpu River reflects the building's lights. Rainy night atmosphere with wet streets and light streaks. Cinematic architectural photography.",
  },
  {
    name: "nyc-art-deco",
    folder: "showcase/skyscrapers",
    prompt: "A majestic art-deco skyscraper in New York City during a crisp autumn morning. Stepped limestone and granite facade with bronze and gold ornamental details, gargoyle sculptures, and a gleaming spire crown. Fall foliage in Central Park visible in foreground with orange and red trees. Clear blue sky. Classic architectural photography.",
  },
  {
    name: "singapore-eco-tower",
    folder: "showcase/skyscrapers",
    prompt: "A revolutionary eco-skyscraper covered entirely in vertical forests and hanging gardens in Singapore. Lush tropical vegetation cascading from every balcony across 80 floors. Organic curved silhouette with bamboo-clad structural elements and flowing water features on sky terraces. Bright tropical sunlight, vivid green foliage against sky-blue glass. Birds around upper levels.",
  },
  {
    name: "tokyo-black-monolith",
    folder: "showcase/skyscrapers",
    prompt: "A sleek black monolithic skyscraper in Tokyo at twilight. Ultra-minimalist rectangular obsidian-like facade with subtle gold accent lines between floor plates. Dramatic rooftop helipad lit in white. Cherry blossom trees line the street below in full bloom — stunning contrast of delicate pink against the dark tower. Moody blue-purple twilight sky.",
  },
  {
    name: "miami-twin-towers",
    folder: "showcase/skyscrapers",
    prompt: "A pair of interconnected luxury skyscrapers in Miami Beach at sunset. Flowing white sculptural facades inspired by ocean waves with curved balconies on every floor. An infinity sky pool stretches between the two towers on the 50th floor, glowing turquoise. Palm trees and white sand beach in foreground, ocean to the horizon. Warm pink and orange sunset.",
  },
  {
    name: "london-diamond",
    folder: "showcase/skyscrapers",
    prompt: "A magnificent glass skyscraper in London reflecting the Thames River and surrounding historic architecture. Faceted diamond-cut glass facade fragmenting light into rainbow prisms. Victorian buildings and bridges visible in the reflection. Dramatic British sky with rays of sunlight breaking through clouds hitting the tower's crown. Red double-decker buses at street level for scale.",
  },
  {
    name: "abudhabi-spiral",
    folder: "showcase/skyscrapers",
    prompt: "A breathtaking spiraling skyscraper in Abu Dhabi rising from a man-made island. The tower rotates 90 degrees from base to top with each floor slightly offset creating a mesmerizing spiral. White marble and gold-tinted glass facade. A marina with luxury yachts at the base. Crystal clear turquoise Arabian Gulf waters. Bright midday sun with deep blue sky. Aerial drone perspective.",
  },
  {
    name: "saopaulo-brutalist-modern",
    folder: "showcase/skyscrapers",
    prompt: "A stunning brutalist-meets-modern skyscraper in São Paulo, Brazil. Raw exposed concrete core with dramatic cantilevered glass volumes jutting out at various angles creating a striking geometric composition. Lush tropical roof garden on top. Warm afternoon light casting dramatic shadows on textured concrete surfaces. Street art murals on neighboring buildings. Vibrant urban energy.",
  },
  {
    name: "seoul-stacked-cubes",
    folder: "showcase/skyscrapers",
    prompt: "A futuristic residential supertall skyscraper in Seoul, South Korea at blue hour. Series of stacked cubic volumes rotated at different angles connected by glass atriums filled with indoor gardens. Warm amber light from residential windows while exterior lit in cool white and blue. Hangang River reflecting the tower in foreground. Mountains in the misty background.",
  },
];

const EXOTIC: ImageSpec[] = [
  {
    name: "baobab-treehouse-mansion",
    folder: "showcase/exotic",
    prompt: "An extraordinary treehouse mansion built into a massive ancient baobab tree in Madagascar. Multiple interconnected wooden platforms and rooms with thatched roofs winding around the trunk and branches. Rope bridges connecting sections. Warm lantern light from windows. Lush tropical rainforest with exotic birds and a misty waterfall in the background. Magical golden hour light filtering through the canopy.",
  },
  {
    name: "maldives-overwater-palace",
    folder: "showcase/exotic",
    prompt: "A stunning overwater palace resort in the Maldives at sunset. Traditional Maldivian peaked roofs with modern glass walls built on stilts over crystal-clear turquoise lagoon water. Glass-floor infinity pool extending over the ocean. Thatched pavilions connected by illuminated wooden walkways. Bioluminescent plankton glowing blue in shallow water. Dramatic orange and purple sunset sky.",
  },
  {
    name: "moroccan-riad-palace",
    folder: "showcase/exotic",
    prompt: "A breathtaking Moroccan riad palace with intricate Islamic geometric tilework and carved stucco. Grand central courtyard with turquoise mosaic fountain, orange trees, and date palms. Towering ornate arched doorways with hand-carved cedar wood doors. Colorful zellige tiles in deep blues, greens, and golds on every surface. Brass lanterns casting intricate shadow patterns. Atlas Mountains visible from rooftop terrace.",
  },
  {
    name: "swedish-ice-hotel",
    folder: "showcase/exotic",
    prompt: "A spectacular ice hotel in northern Sweden entirely sculpted from crystal-clear and blue-tinted ice. Dramatic sweeping ice arches and frozen sculptural elements that catch and refract light. Entrance flanked by massive ice pillars carved with Nordic patterns. Northern lights shimmering green and violet above. Snow-covered pine forest surrounding the structure. Warm amber light glowing from within through translucent ice walls. Starry night sky.",
  },
  {
    name: "petra-cliffside-monastery",
    folder: "showcase/exotic",
    prompt: "An incredible cliffside monastery carved directly into a red sandstone cliff face, Petra Jordan style. Multiple levels of rooms with ornate columns, carved facades with Nabataean-inspired details, and arched windows hewn from living rock. Winding stone staircase carved into the cliff connecting levels. Late afternoon light painting the red rock in deep crimson and gold. Desert landscape with scattered acacia trees. Eagles soaring overhead.",
  },
];

async function main() {
  const allSpecs = [...SKYSCRAPERS, ...EXOTIC];
  console.log(`\n=== Generating ${allSpecs.length} showcase images ===`);
  console.log(`Using Gemini 3.1 Flash Image + GPT-5-mini prompt enhancement`);
  console.log(`Uploading to Supabase bucket: ${BUCKET}\n`);

  const results: { name: string; url: string | null; error?: string }[] = [];

  for (let i = 0; i < allSpecs.length; i++) {
    const spec = allSpecs[i];
    const path = `${spec.folder}/${spec.name}.png`;
    console.log(`\n[${i + 1}/${allSpecs.length}] Generating: ${spec.name}`);

    try {
      const buffer = await generateImage(spec.prompt);
      if (!buffer) {
        console.error(`  ✗ No image generated`);
        results.push({ name: spec.name, url: null, error: "No image returned" });
        continue;
      }
      console.log(`  ✓ Generated ${(buffer.length / 1024).toFixed(0)}KB`);

      const url = await uploadToSupabase(buffer, path);
      if (url) {
        console.log(`  ✓ Uploaded → ${url}`);
        results.push({ name: spec.name, url });
      } else {
        results.push({ name: spec.name, url: null, error: "Upload failed" });
      }
    } catch (e: any) {
      console.error(`  ✗ Error: ${e.message}`);
      results.push({ name: spec.name, url: null, error: e.message });
    }

    // Rate limit pause between generations
    if (i < allSpecs.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log("\n\n=== RESULTS ===");
  for (const r of results) {
    if (r.url) {
      console.log(`✓ ${r.name}: ${r.url}`);
    } else {
      console.log(`✗ ${r.name}: FAILED (${r.error})`);
    }
  }

  const success = results.filter((r) => r.url).length;
  console.log(`\nDone: ${success}/${results.length} images generated and uploaded.`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
