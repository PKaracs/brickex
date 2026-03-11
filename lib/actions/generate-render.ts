"use server";

import OpenAI from "openai";
import {
  genai,
  GEMINI_IMAGE_MODEL,
  GEMINI_IMAGE_MODEL_FALLBACK,
  ASPECT_RATIOS,
} from "@/lib/google-genai";

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

const VISION_SYSTEM_PROMPT = `You are an expert architectural visualization consultant for BrickEx. You turn architectural inputs into photorealistic renders that look like REAL PHOTOGRAPHS taken by a professional architecture photographer.

You will receive an input image (floor plan, sketch, 3D model, render, or photograph) and the user's settings.

YOUR #1 PRIORITY: The output image MUST faithfully represent the SAME building/space as the input. Same shape, same proportions, same layout, same number of floors, same window placement, same roof form. You are bringing this exact design to life — not creating a different building.

Write a detailed prompt that will generate a photorealistic visualization of THIS EXACT architecture.

DESCRIBE IN YOUR PROMPT:
1. THE BUILDING EXACTLY AS SHOWN: every structural element you see — wall positions, roof angles, floor count, window locations, door placement, overhangs, setbacks, materials visible. Be forensically precise.
2. MATERIALS & FINISHES: specific real-world materials (e.g. "white-washed brick facade", "natural oak cladding", "dark zinc standing-seam roof", "floor-to-ceiling low-iron glass"). If you see materials in the input, name them exactly. If unclear, choose premium materials appropriate to the style.
3. ENVIRONMENT: ground surface, landscaping, sky, neighboring context. Make it feel like a real place.
4. LIGHTING: natural light direction, time of day, shadow quality. Match the user's lighting preference.
5. CAMERA: specific lens (tilt-shift for architecture), angle, height, composition. Use professional architectural photography techniques.
6. ATMOSPHERE: air quality, color temperature, mood.

OUTPUT ONLY THE PROMPT TEXT. No explanations. Under 500 words.`;

function buildSettingsContext(
  mode: string,
  settings: Record<string, string>,
): string {
  const parts: string[] = [`Render Mode: ${mode}`];

  if (settings.shotType && settings.shotType !== "auto") {
    parts.push(`Shot Type: ${settings.shotType.replace(/-/g, " ")}`);
  }
  if (settings.architectureStyle && settings.architectureStyle !== "auto") {
    parts.push(
      `Architecture Style: ${settings.architectureStyle.replace(/-/g, " ")}`,
    );
  }
  if (settings.interiorStyle && settings.interiorStyle !== "auto") {
    parts.push(`Interior Style: ${settings.interiorStyle.replace(/-/g, " ")}`);
  }
  if (settings.roomType && settings.roomType !== "auto") {
    parts.push(`Room Type: ${settings.roomType.replace(/-/g, " ")}`);
  }
  if (settings.facadeMaterial && settings.facadeMaterial !== "auto") {
    parts.push(
      `Facade Material: ${settings.facadeMaterial.replace(/-/g, " ")}`,
    );
  }
  if (settings.environment && settings.environment !== "auto") {
    parts.push(`Environment: ${settings.environment.replace(/-/g, " ")}`);
  }
  if (settings.lighting && settings.lighting !== "auto") {
    parts.push(`Lighting: ${settings.lighting.replace(/-/g, " ")}`);
  }
  if (settings.furnitureDensity && settings.furnitureDensity !== "auto") {
    parts.push(
      `Furniture Density: ${settings.furnitureDensity.replace(/-/g, " ")}`,
    );
  }
  if (settings.targetStyle && settings.targetStyle !== "auto") {
    parts.push(`Target Style: ${settings.targetStyle.replace(/-/g, " ")}`);
  }
  if (settings.preserveStructure && settings.preserveStructure !== "auto") {
    parts.push(`Preserve Structure: ${settings.preserveStructure}`);
  }
  if (settings.objects) {
    const objs = settings.objects.split(",").filter(Boolean);
    if (objs.length > 0) {
      parts.push(
        `Objects to include: ${objs.map((o) => o.replace(/-/g, " ")).join(", ")}`,
      );
    }
  }
  if (settings.customPrompt) {
    parts.push(`User instructions: ${settings.customPrompt}`);
  }

  return parts.join("\n");
}

async function analyzeAndBuildPrompt(
  imageBase64: string,
  mimeType: string,
  mode: string,
  settings: Record<string, string>,
): Promise<string> {
  const openai = getOpenAI();
  const settingsContext = buildSettingsContext(mode, settings);

  if (!openai) {
    return `Create a photorealistic architectural render based on the reference image. ${settingsContext}. Ultra-detailed, 8K quality, professional architectural photography.`;
  }

  try {
    console.log("[BrickEx] Analyzing input with GPT-5-mini vision...");
    const start = Date.now();

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: VISION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: `Study this image carefully. Describe every architectural element you see — the exact building shape, proportions, materials, windows, doors, roof. Then write a prompt to generate a photorealistic render of THIS EXACT building/space brought to life.\n\nUser settings:\n${settingsContext}`,
            },
          ],
        },
      ],
      temperature: 1,
      max_completion_tokens: 5000,
    });

    const prompt = response.choices[0]?.message?.content?.trim();
    console.log(`[BrickEx] GPT-5-mini analysis complete in ${Date.now() - start}ms`);

    if (!prompt || prompt.length < 30) {
      console.warn("[BrickEx] GPT-5-mini returned weak prompt, using fallback");
      return `Create a photorealistic architectural render. ${settingsContext}. Ultra-detailed, 8K, professional architectural photography, dramatic lighting.`;
    }

    return prompt;
  } catch (error: any) {
    console.error("[BrickEx] GPT-5-mini vision failed:", error?.message);
    return `Create a photorealistic architectural render. ${settingsContext}. Ultra-detailed, 8K, professional architectural photography, dramatic lighting.`;
  }
}

const ARCH_ENHANCER_SYSTEM = `You are a world-class architectural photographer and CGI supervisor (V-Ray, Lumion, Enscape level). Take this prompt and add photorealistic specifications.

ADD:
- CAMERA: architecture-specific lens (Canon TS-E 17mm f/4L tilt-shift, Sony 16-35mm f/2.8 GM, Fuji GFX with 23mm for medium format, etc.)
- CAMERA POSITION: exact height (eye-level 1.6m, low angle 0.5m, elevated 4m), distance, perspective correction
- LIGHTING: physically accurate sun position, fill from sky, bounce light off surfaces. If golden hour: warm directional 15° above horizon. If overcast: soft diffused top-light. Be specific.
- MATERIALS: hyper-specific (e.g. "Vieux Lille hand-molded brick" not just "brick", "brushed 316L stainless steel" not just "metal")
- ATMOSPHERE: volumetric haze, air particles in light beams, moisture on surfaces after rain, heat shimmer
- LANDSCAPING: specific plants appropriate to climate (ornamental grasses, mature olive trees, etc.)
- POST-PROCESSING: Architectural Digest color grade, slight lens vignette, micro-contrast enhancement

ABSOLUTE RULES:
1. PRESERVE every architectural detail from the original prompt — do not change the building
2. The result must be INDISTINGUISHABLE from a real photograph
3. Never add people unless asked
4. Output ONLY the enhanced prompt
5. Under 500 words`;

async function enhanceArchPrompt(rawPrompt: string): Promise<string> {
  const openai = getOpenAI();
  if (!openai) return rawPrompt;

  try {
    console.log("[BrickEx] Enhancing prompt...");
    const start = Date.now();

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: ARCH_ENHANCER_SYSTEM },
        {
          role: "user",
          content: `Enhance this architectural visualization prompt:\n\n${rawPrompt}`,
        },
      ],
      temperature: 1,
      max_completion_tokens: 4000,
    });

    const enhanced = response.choices[0]?.message?.content?.trim();
    console.log(`[BrickEx] Enhancement done in ${Date.now() - start}ms`);

    return enhanced && enhanced.length > 50 ? enhanced : rawPrompt;
  } catch (error: any) {
    console.error("[BrickEx] Enhancement failed:", error?.message);
    return rawPrompt;
  }
}

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithGemini(
  enhancedPrompt: string,
  inputImageBase64: string,
  inputMimeType: string,
): Promise<string | null> {
  const parts: ContentPart[] = [];

  parts.push({
    text: `⚠️ STRUCTURAL REFERENCE IMAGE — THIS IS THE #1 PRIORITY:

You MUST generate an image of THIS EXACT building/space. The reference image shows the architectural design that must be faithfully reproduced. This is NOT optional — it is the entire point.

MANDATORY STRUCTURAL FIDELITY:
• The building shape, massing, and proportions MUST match the reference EXACTLY
• Every floor, every wall angle, every setback, every overhang must be preserved
• Window positions, sizes, and patterns must match precisely
• Roof form and pitch must be identical
• The overall silhouette when viewed from the same angle must be recognizable as the same building
• If the reference is a floor plan or sketch, interpret it faithfully into 3D — same room layout, same spatial relationships
• DO NOT add floors, wings, or architectural elements not present in the reference
• DO NOT remove or simplify any structural features shown

WHAT YOU MUST CHANGE:
• Transform sketch/wireframe/3D model quality into PHOTOREALISTIC quality
• Add real materials, textures, reflections, and physical accuracy
• Add natural environment, sky, landscaping, ground surfaces
• Add physically accurate lighting and shadows
• Make it look like a REAL PHOTOGRAPH of a REAL BUILDING — not a render, not CGI, a photograph

The viewer should look at the reference and the output and immediately recognize it as the same building, just brought to life as if it were actually built and photographed.`,
  });

  parts.push({
    inlineData: {
      mimeType: inputMimeType,
      data: inputImageBase64,
    },
  });

  parts.push({
    text: `Now generate the photorealistic render based on the reference above. Here is the detailed prompt:\n\n${enhancedPrompt}`,
  });

  const modelsToTry = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_MODEL_FALLBACK];

  for (const model of modelsToTry) {
    console.log(`[BrickEx] Trying model: ${model}`);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`[BrickEx] Retry ${attempt}/${MAX_RETRIES}`);
        await sleep(RETRY_DELAY_MS * attempt);
      }

      try {
        const response = await genai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: {
            responseModalities: ["IMAGE", "TEXT"],
            imageConfig: {
              aspectRatio: ASPECT_RATIOS.cinema.ratio,
              imageSize: "2K",
            },
          },
        });

        if (response.promptFeedback) {
          const blockReason = (response.promptFeedback as any).blockReason;
          if (blockReason) {
            console.error(`[BrickEx] Prompt blocked: ${blockReason}`);
            return null;
          }
        }

        if (!response.candidates || response.candidates.length === 0) {
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const candidate = response.candidates[0];
        if (candidate.finishReason === "SAFETY") {
          console.error("[BrickEx] Content blocked by safety filter");
          return null;
        }

        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              console.log(
                `[BrickEx] Image generated successfully with ${model}`,
              );
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }

        if (attempt < MAX_RETRIES) continue;
        return null;
      } catch (error: any) {
        console.error(`[BrickEx] ${model} error:`, error?.message);
        if (error?.status === 429) break;
        if (error?.status === 401 || error?.status === 400) throw error;
        if (attempt < MAX_RETRIES) continue;
        throw error;
      }
    }
  }

  return null;
}

export interface GenerateRenderResult {
  outputUrl?: string;
  prompt?: string;
  error?: string;
}

export async function generateRender(
  imageBase64: string,
  mimeType: string,
  mode: string,
  settings: Record<string, string>,
): Promise<GenerateRenderResult> {
  try {
    console.log(`[BrickEx] === Starting render generation ===`);
    console.log(`[BrickEx] Mode: ${mode}`);
    console.log(
      `[BrickEx] Image size: ${Math.round(imageBase64.length / 1024)}KB base64`,
    );

    // Step 1: GPT-5-mini vision analyzes input and builds prompt
    const rawPrompt = await analyzeAndBuildPrompt(
      imageBase64,
      mimeType,
      mode,
      settings,
    );
    console.log(`[BrickEx] Raw prompt: ${rawPrompt.slice(0, 200)}...`);

    // Step 2: Enhance the prompt with photography specs
    const enhancedPrompt = await enhanceArchPrompt(rawPrompt);
    console.log(
      `[BrickEx] Enhanced prompt: ${enhancedPrompt.slice(0, 200)}...`,
    );

    // Step 3: Generate with Gemini (Nano Banana 2)
    const outputUrl = await generateWithGemini(
      enhancedPrompt,
      imageBase64,
      mimeType,
    );

    if (!outputUrl) {
      return { error: "Generation failed. Please try again." };
    }

    console.log(`[BrickEx] === Render complete ===`);
    return { outputUrl, prompt: enhancedPrompt };
  } catch (error: any) {
    console.error(
      "[BrickEx] Generation pipeline error:",
      error?.message || error,
    );
    return {
      error: error?.message || "Something went wrong. Please try again.",
    };
  }
}
