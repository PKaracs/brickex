"use server";

import OpenAI from "openai";
import {
  genai,
  GEMINI_IMAGE_MODEL,
  GEMINI_IMAGE_MODEL_FALLBACK,
  ASPECT_RATIOS,
} from "@/lib/google-genai";
import {
  ensureProjectSourceImageAsset,
  finishProjectImageRunFailure,
  finishProjectImageRunSuccess,
  startProjectImageRun,
  updateProjectImageRunPrompt,
} from "@/lib/generation/project-image-runs";

function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// ---------------------------------------------------------------------------
// Step 1 — Room Analysis (GPT-5-mini vision)
// ---------------------------------------------------------------------------

const ROOM_ANALYSIS_SYSTEM = `You are an expert interior designer and spatial analyst for BrickEx.

You will receive a photograph or render of a room. Analyze it with surgical precision:

OUTPUT (structured, concise):
1. ROOM TYPE: (living room / kitchen / bedroom / bathroom / dining / office / other)
2. DIMENSIONS: approximate width × depth × ceiling height based on visual cues
3. EXISTING FURNITURE: list every piece of furniture visible, with location (e.g. "grey fabric sofa against left wall")
4. EMPTY AREAS: list zones with no furniture (e.g. "large open area center-right, corner by window is empty")
5. WALLS: color, material, any wall features (wainscoting, exposed brick, accent wall)
6. FLOOR: material and color (hardwood oak, white marble, concrete, etc.)
7. WINDOWS/DOORS: count, positions, sizes, natural light direction
8. ARCHITECTURAL FEATURES: columns, alcoves, built-ins, ceiling type (flat, vaulted, beamed)
9. CURRENT STYLE: the existing aesthetic (if any)
10. LIGHTING CONDITIONS: natural light quality, visible light fixtures

Be factual and precise. No opinions. Under 300 words.`;

async function analyzeRoom(
  openai: OpenAI,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  const start = Date.now();
  console.log("[Interior] Step 1: Analyzing room...");

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: ROOM_ANALYSIS_SYSTEM },
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
          { type: "text", text: "Analyze this room." },
        ],
      },
    ],
    temperature: 1,
    max_completion_tokens: 4000,
  });

  const analysis = response.choices[0]?.message?.content?.trim() ?? "";
  console.log(`[Interior] Room analysis done in ${Date.now() - start}ms (${analysis.length} chars)`);
  return analysis;
}

// ---------------------------------------------------------------------------
// Step 2 — Object Placement Plan (GPT-5-mini text)
// ---------------------------------------------------------------------------

const PLACEMENT_SYSTEM = `You are a senior interior designer planning furniture placement for a room.

You will receive:
- A room analysis (dimensions, existing furniture, empty areas, architectural features)
- A list of objects the client wants placed
- Descriptions of any custom objects the client uploaded photos of
- The desired interior style and furniture density

Your job: create a SPECIFIC placement plan.

RULES:
- If the room already has furniture in a spot, decide whether to REPLACE it (if the user selected a similar item) or KEEP it (if it doesn't conflict)
- Place objects where they make spatial and functional sense
- Respect traffic flow — don't block doors or create tight squeezes
- Group objects logically (coffee table near sofa, bedside table near bed, etc.)
- Match the density preference: "minimal" = only essentials, "balanced" = comfortable not cluttered, "full" = richly furnished
- For each object, specify: WHAT it is, WHERE it goes (specific wall/corner/center), and HOW it relates to other pieces
- If user uploaded custom object photos, incorporate those exact items by their description

OUTPUT a numbered placement list. Be specific about positions. Under 250 words.`;

async function planObjectPlacement(
  openai: OpenAI,
  roomAnalysis: string,
  presetObjects: string[],
  customObjectDescriptions: string[],
  style: string,
  density: string,
): Promise<string> {
  const start = Date.now();
  console.log("[Interior] Step 2: Planning object placement...");

  const objectList = [
    ...presetObjects.map((o) => o.replace(/-/g, " ")),
    ...customObjectDescriptions,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: PLACEMENT_SYSTEM },
      {
        role: "user",
        content: `ROOM ANALYSIS:\n${roomAnalysis}\n\nOBJECTS TO PLACE:\n${objectList.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\nSTYLE: ${style || "auto (choose what fits best)"}\nDENSITY: ${density || "balanced"}`,
      },
    ],
    temperature: 1,
    max_completion_tokens: 4000,
  });

  const plan = response.choices[0]?.message?.content?.trim() ?? "";
  console.log(`[Interior] Placement plan done in ${Date.now() - start}ms`);
  return plan;
}

// ---------------------------------------------------------------------------
// Step 2.5 — Describe uploaded object images (GPT-5-mini vision)
// ---------------------------------------------------------------------------

async function describeCustomObject(
  openai: OpenAI,
  objectBase64: string,
  objectMimeType: string,
  objectName: string,
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content:
            "Describe this furniture/decor item in one detailed sentence: material, color, style, approximate size. Output ONLY the description.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${objectMimeType};base64,${objectBase64}`,
                detail: "low",
              },
            },
            {
              type: "text",
              text: `Describe this item (uploaded as "${objectName}").`,
            },
          ],
        },
      ],
    temperature: 1,
    max_completion_tokens: 2000,
    });
    return response.choices[0]?.message?.content?.trim() ?? objectName;
  } catch {
    return objectName;
  }
}

// ---------------------------------------------------------------------------
// Step 3 — Final Prompt Construction (GPT-5-mini text)
// ---------------------------------------------------------------------------

const FINAL_PROMPT_SYSTEM = `You are a world-class interior visualization artist (V-Ray / Lumion / Enscape quality). Write the definitive image generation prompt.

You will receive:
- Room analysis
- Object placement plan
- User settings (style, lighting, room type, custom instructions)

Write a SINGLE prompt that will generate a PHOTOREALISTIC interior render. This must look like a photograph from Architectural Digest, not a CGI render.

INCLUDE:
- Exact description of every wall, floor, ceiling as it appears in the original room
- Every piece of furniture with its exact position from the placement plan
- Specific materials for each item (e.g. "bouclé ivory sofa" not just "sofa", "brushed brass pendant" not just "light")
- Styled to the requested interior style with specific design references
- Camera: interior photography lens (14-24mm wide angle or 35mm for detail), eye-level or slightly elevated
- Lighting: match the requested time of day with physically accurate light
- Atmosphere: warmth, mood, air quality
- Styling details: throw pillows, books on coffee table, fresh flowers — the finishing touches that make it feel LIVED IN

RULES:
1. The room structure (walls, windows, doors, floor) MUST match the original room exactly
2. Output ONLY the prompt text
3. Under 500 words
4. The result must be INDISTINGUISHABLE from a real interior photograph`;

async function buildFinalPrompt(
  openai: OpenAI,
  roomAnalysis: string,
  placementPlan: string,
  settings: Record<string, string>,
): Promise<string> {
  const start = Date.now();
  console.log("[Interior] Step 3: Building final prompt...");

  const settingsParts: string[] = [];
  if (settings.interiorStyle && settings.interiorStyle !== "auto")
    settingsParts.push(`Interior Style: ${settings.interiorStyle.replace(/-/g, " ")}`);
  if (settings.roomType && settings.roomType !== "auto")
    settingsParts.push(`Room Type: ${settings.roomType.replace(/-/g, " ")}`);
  if (settings.lighting && settings.lighting !== "auto")
    settingsParts.push(`Lighting: ${settings.lighting}`);
  if (settings.furnitureDensity && settings.furnitureDensity !== "auto")
    settingsParts.push(`Furniture Density: ${settings.furnitureDensity}`);
  if (settings.textures) {
    const textureList = settings.textures.split(",").filter(Boolean).map((t) => t.replace(/-/g, " "));
    if (textureList.length > 0)
      settingsParts.push(`Material / Texture preferences: ${textureList.join(", ")}. Use these specific materials and finishes prominently throughout the room — on floors, walls, countertops, and/or furniture surfaces as appropriate.`);
  }
  if (settings.customPrompt)
    settingsParts.push(`User instructions: ${settings.customPrompt}`);

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: FINAL_PROMPT_SYSTEM },
      {
        role: "user",
        content: `ROOM ANALYSIS:\n${roomAnalysis}\n\nPLACEMENT PLAN:\n${placementPlan}\n\nSETTINGS:\n${settingsParts.join("\n") || "Auto — choose what looks best"}`,
      },
    ],
    temperature: 1,
    max_completion_tokens: 5000,
  });

  const prompt = response.choices[0]?.message?.content?.trim() ?? "";
  console.log(`[Interior] Final prompt done in ${Date.now() - start}ms (${prompt.length} chars)`);
  return prompt;
}

// ---------------------------------------------------------------------------
// Step 4 — Gemini Generation
// ---------------------------------------------------------------------------

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithGemini(
  finalPrompt: string,
  roomImageBase64: string,
  roomMimeType: string,
  objectImages: Array<{ base64: string; mimeType: string; label: string }>,
): Promise<string | null> {
  const parts: ContentPart[] = [];

  parts.push({
    text: `ROOM REFERENCE IMAGE — THIS IS THE #1 PRIORITY:

You MUST preserve the room's structure EXACTLY:
• Wall positions, angles, and materials must be identical
• Window and door positions and sizes must be identical
• Floor material and layout must be identical
• Ceiling height and type must match
• The room's overall shape and proportions are SACRED — do not change them

WHAT CHANGES: the furniture, objects, and styling inside the room. The room is the canvas — you are filling it with beautiful, photorealistic interior design.

The output must look like a REAL PHOTOGRAPH taken by an Architectural Digest photographer — not a render, not CGI. Real materials, real light, real atmosphere.`,
  });

  parts.push({
    inlineData: {
      mimeType: roomMimeType,
      data: roomImageBase64,
    },
  });

  if (objectImages.length > 0) {
    parts.push({
      text: `OBJECT REFERENCE IMAGES — Place these specific items in the room. Match their appearance, material, color, and style EXACTLY as shown:`,
    });

    for (const obj of objectImages.slice(0, 8)) {
      parts.push({
        text: `Object: ${obj.label}`,
      });
      parts.push({
        inlineData: {
          mimeType: obj.mimeType,
          data: obj.base64,
        },
      });
    }
  }

  parts.push({
    text: `Now generate the photorealistic interior render:\n\n${finalPrompt}`,
  });

  const modelsToTry = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_MODEL_FALLBACK];

  for (const model of modelsToTry) {
    console.log(`[Interior] Trying Gemini model: ${model}`);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`[Interior] Retry ${attempt}/${MAX_RETRIES}`);
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
            console.error(`[Interior] Prompt blocked: ${blockReason}`);
            return null;
          }
        }

        if (!response.candidates || response.candidates.length === 0) {
          if (attempt < MAX_RETRIES) continue;
          return null;
        }

        const candidate = response.candidates[0];
        if (candidate.finishReason === "SAFETY") {
          console.error("[Interior] Content blocked by safety filter");
          return null;
        }

        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              console.log(`[Interior] Image generated with ${model}`);
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }

        if (attempt < MAX_RETRIES) continue;
        return null;
      } catch (error: any) {
        console.error(`[Interior] ${model} error:`, error?.message);
        if (error?.status === 429) break;
        if (error?.status === 401 || error?.status === 400) throw error;
        if (attempt < MAX_RETRIES) continue;
        throw error;
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Fallback — no OpenAI key (Gemini-only with basic prompt)
// ---------------------------------------------------------------------------

function buildFallbackPrompt(settings: Record<string, string>): string {
  const parts = ["Photorealistic interior design render."];
  const style = settings.interiorStyle?.replace(/-/g, " ");
  const room = settings.roomType?.replace(/-/g, " ");
  const objects = settings.objects
    ?.split(",")
    .filter(Boolean)
    .map((o) => o.replace(/-/g, " "));

  if (room && room !== "auto") parts.push(`Room type: ${room}.`);
  if (style && style !== "auto") parts.push(`Style: ${style}.`);
  if (objects && objects.length > 0) parts.push(`Include: ${objects.join(", ")}.`);
  if (settings.lighting && settings.lighting !== "auto")
    parts.push(`Lighting: ${settings.lighting}.`);
  if (settings.furnitureDensity && settings.furnitureDensity !== "auto")
    parts.push(`Furniture density: ${settings.furnitureDensity}.`);
  if (settings.textures) {
    const textureList = settings.textures.split(",").filter(Boolean).map((t) => t.replace(/-/g, " "));
    if (textureList.length > 0)
      parts.push(`Use these materials/textures prominently: ${textureList.join(", ")}.`);
  }
  if (settings.customPrompt) parts.push(settings.customPrompt);

  parts.push(
    "Preserve the room's exact structure. Ultra-detailed, 8K, Architectural Digest quality, professional interior photography with wide-angle lens."
  );

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ObjectFileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface GenerateInteriorResult {
  outputUrl?: string;
  prompt?: string;
  error?: string;
}

export interface InteriorBatchSlotInput {
  slotId: string;
  settings: Record<string, string>;
}

export interface InteriorBatchSlotResult {
  slotId: string;
  outputUrl?: string;
  error?: string;
}

// Single-slot generation (kept for backwards compat)
export async function generateInterior(
  projectId: string,
  imageBase64: string,
  mimeType: string,
  settings: Record<string, string>,
  objectFileData: ObjectFileData[] = [],
): Promise<GenerateInteriorResult> {
  const results = await generateInteriorBatch(
    projectId, imageBase64, mimeType,
    [{ slotId: "single", settings }],
    objectFileData,
  );
  const r = results[0];
  return { outputUrl: r?.outputUrl, error: r?.error };
}

/**
 * Batch interior generation: room analysis + object descriptions ONCE,
 * then per-slot placement + final prompt + Gemini in parallel.
 */
export async function generateInteriorBatch(
  projectId: string,
  imageBase64: string,
  mimeType: string,
  slotsInput: InteriorBatchSlotInput[],
  objectFileData: ObjectFileData[] = [],
): Promise<InteriorBatchSlotResult[]> {
  const sourceAsset = await ensureProjectSourceImageAsset({
    projectId,
    dataUrl: `data:${mimeType};base64,${imageBase64}`,
  });

  console.log(`[Interior] === Starting batch interior (${slotsInput.length} slots) ===`);
  console.log(`[Interior] Room image: ${Math.round(imageBase64.length / 1024)}KB`);

  const openai = getOpenAI();
  const firstSettings = slotsInput[0].settings;

  // Shared Step 1: Room analysis (ONCE)
  let roomAnalysis = "";
  let customDescriptions: string[] = [];

  if (openai) {
    roomAnalysis = await analyzeRoom(openai, imageBase64, mimeType);

    if (objectFileData.length > 0) {
      console.log(`[Interior] Describing ${objectFileData.length} custom objects...`);
      customDescriptions = await Promise.all(
        objectFileData.map((obj) =>
          describeCustomObject(openai, obj.base64, obj.mimeType, obj.name)
        )
      );
    }
  }

  const geminiObjectImages = objectFileData.map((obj) => ({
    base64: obj.base64,
    mimeType: obj.mimeType,
    label: obj.name,
  }));

  // Per-slot: placement plan + final prompt + Gemini — all in parallel
  const slotPromises = slotsInput.map(async (slot): Promise<InteriorBatchSlotResult> => {
    const run = await startProjectImageRun({
      projectId,
      type: "image_generation",
      toolId: "interior-render",
      model: GEMINI_IMAGE_MODEL,
      settings: {
        mode: "interior-render",
        modeLabel: "Interior Render",
        ...slot.settings,
        customObjectCount: objectFileData.length,
      },
      inputAssetId: sourceAsset.assetId,
    });

    try {
      const presetObjects = slot.settings.objects?.split(",").filter(Boolean) ?? [];
      let finalPrompt: string;

      if (openai && roomAnalysis) {
        const placementPlan = await planObjectPlacement(
          openai,
          roomAnalysis,
          presetObjects,
          customDescriptions,
          slot.settings.interiorStyle ?? "auto",
          slot.settings.furnitureDensity ?? "balanced",
        );
        finalPrompt = await buildFinalPrompt(openai, roomAnalysis, placementPlan, slot.settings);
      } else {
        finalPrompt = buildFallbackPrompt(slot.settings);
      }

      console.log(`[Interior] [${slot.slotId}] Final prompt (${finalPrompt.length} chars)`);
      await updateProjectImageRunPrompt(run.runId, finalPrompt);

      const outputUrl = await generateWithGemini(
        finalPrompt, imageBase64, mimeType, geminiObjectImages,
      );

      if (!outputUrl) {
        await finishProjectImageRunFailure({ run, errorMessage: "Interior generation failed." });
        return { slotId: slot.slotId, error: "Interior generation failed. Please try again." };
      }

      const persisted = await finishProjectImageRunSuccess({
        run,
        dataUrl: outputUrl,
        sourceAssetId: sourceAsset.assetId,
        pathKind: "interior-renders",
        deliverableTitle: "Interior render",
        deliverableMetadata: { mode: "interior-render", modeLabel: "Interior Render", kind: "generation" },
      });

      console.log(`[Interior] [${slot.slotId}] Render complete`);
      return { slotId: slot.slotId, outputUrl: persisted.url };
    } catch (error: any) {
      console.error(`[Interior] [${slot.slotId}] Error:`, error?.message);
      await finishProjectImageRunFailure({
        run,
        errorMessage: error?.message || "Something went wrong.",
      });
      return { slotId: slot.slotId, error: error?.message || "Something went wrong." };
    }
  });

  const results = await Promise.all(slotPromises);
  console.log(`[Interior] === Batch complete: ${results.filter((r) => r.outputUrl).length}/${slotsInput.length} succeeded ===`);
  return results;
}
