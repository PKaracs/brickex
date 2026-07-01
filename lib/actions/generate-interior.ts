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

const ROOM_ANALYSIS_SYSTEM = `Eres un experto en interiorismo y analisis espacial para BrickEx.

Recibiras una fotografia o render de una estancia. Analizala con maxima precision:

SALIDA (estructurada y concisa):
1. TIPO DE ESTANCIA: (salon / cocina / dormitorio / bano / comedor / oficina / otro)
2. DIMENSIONES: anchura x profundidad x altura aproximada del techo segun pistas visuales
3. MOBILIARIO EXISTENTE: enumera cada pieza visible, con ubicacion (por ejemplo, "sofa de tela gris contra la pared izquierda")
4. ZONAS VACIAS: enumera zonas sin muebles (por ejemplo, "gran area abierta centro-derecha, esquina junto a la ventana vacia")
5. PAREDES: color, material y rasgos (molduras, ladrillo visto, pared de acento)
6. SUELO: material y color (roble, marmol blanco, hormigon, etc.)
7. VENTANAS/PUERTAS: cantidad, posiciones, tamanos y direccion de la luz natural
8. RASGOS ARQUITECTONICOS: columnas, nichos, muebles empotrados, tipo de techo (plano, abovedado, con vigas)
9. ESTILO ACTUAL: estetica existente, si la hay
10. ILUMINACION: calidad de la luz natural y luminarias visibles

Se factual y preciso. Sin opiniones. Maximo 300 palabras.`;

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
          { type: "text", text: "Analiza esta estancia." },
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

const PLACEMENT_SYSTEM = `Eres un interiorista senior que planifica la colocacion de mobiliario en una estancia.

Recibiras:
- Un analisis de la estancia (dimensiones, muebles existentes, zonas vacias y rasgos arquitectonicos)
- Una lista de objetos que el cliente quiere colocar
- Descripciones de objetos personalizados subidos por el cliente
- El estilo interior deseado y la densidad de mobiliario

Tu tarea: crear un plan de colocacion ESPECIFICO.

REGLAS:
- Si ya hay un mueble en un punto, decide si se debe SUSTITUIR (si el usuario eligio un elemento similar) o MANTENER (si no entra en conflicto)
- Coloca los objetos donde tengan sentido espacial y funcional
- Respeta la circulacion: no bloquees puertas ni crees pasos demasiado estrechos
- Agrupa objetos de forma logica (mesa de centro cerca del sofa, mesilla junto a la cama, etc.)
- Ajustate a la densidad: "minimal" = solo esenciales, "balanced" = comodo sin saturar, "full" = ricamente amueblado
- Para cada objeto, especifica QUE es, DONDE va (pared/esquina/centro concreto) y COMO se relaciona con otras piezas
- Si el usuario subio fotos de objetos personalizados, incorpora esos elementos exactos segun su descripcion

Devuelve una lista numerada de colocacion. Se especifico con las posiciones. Maximo 250 palabras.`;

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
        content: `ANALISIS DE LA ESTANCIA:\n${roomAnalysis}\n\nOBJETOS A COLOCAR:\n${objectList.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\nESTILO: ${style || "auto (elige lo que encaje mejor)"}\nDENSIDAD: ${density || "balanced"}`,
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
            "Describe este mueble u objeto decorativo en una sola frase detallada: material, color, estilo y tamano aproximado. Devuelve SOLO la descripcion.",
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
              text: `Describe este elemento (subido como "${objectName}").`,
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

const FINAL_PROMPT_SYSTEM = `Eres un artista de visualizacion interior de primer nivel mundial (calidad V-Ray / Lumion / Enscape). Escribe el prompt definitivo para generar la imagen.

Recibiras:
- Analisis de la estancia
- Plan de colocacion de objetos
- Ajustes del usuario (estilo, iluminacion, tipo de estancia, instrucciones personalizadas)

Escribe UN SOLO prompt que genere un render interior FOTOREALISTA. Debe parecer una fotografia de Architectural Digest, no un render CGI.

INCLUYE:
- Descripcion exacta de cada pared, suelo y techo tal como aparece en la estancia original
- Cada mueble con su posicion exacta desde el plan de colocacion
- Materiales especificos para cada elemento (por ejemplo, "sofa de bouclé marfil", no solo "sofa"; "lampara colgante de laton cepillado", no solo "lampara")
- Estilo segun el interior solicitado, con referencias de diseno especificas
- Camara: lente de fotografia interior (gran angular 14-24 mm o 35 mm para detalle), a nivel de ojos o ligeramente elevada
- Iluminacion: ajustada al momento del dia solicitado con luz fisicamente precisa
- Atmosfera: calidez, estado de animo y calidad del aire
- Detalles de estilismo: cojines, libros sobre la mesa de centro, flores frescas; remates que hagan que se sienta HABITADO

REGLAS:
1. La estructura de la estancia (paredes, ventanas, puertas, suelo) DEBE coincidir exactamente con la original
2. Devuelve SOLO el texto del prompt
3. Maximo 500 palabras
4. El resultado debe ser INDISTINGUIBLE de una fotografia interior real`;

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
    settingsParts.push(`Estilo interior: ${settings.interiorStyle.replace(/-/g, " ")}`);
  if (settings.roomType && settings.roomType !== "auto")
    settingsParts.push(`Tipo de estancia: ${settings.roomType.replace(/-/g, " ")}`);
  if (settings.lighting && settings.lighting !== "auto")
    settingsParts.push(`Iluminacion: ${settings.lighting}`);
  if (settings.furnitureDensity && settings.furnitureDensity !== "auto")
    settingsParts.push(`Densidad de mobiliario: ${settings.furnitureDensity}`);
  if (settings.textures) {
    const textureList = settings.textures.split(",").filter(Boolean).map((t) => t.replace(/-/g, " "));
    if (textureList.length > 0)
      settingsParts.push(`Preferencias de materiales/texturas: ${textureList.join(", ")}. Usa estos materiales y acabados de forma visible en la estancia, en suelos, paredes, encimeras y/o superficies de muebles segun corresponda.`);
  }
  if (settings.customPrompt)
    settingsParts.push(`Instrucciones del usuario: ${settings.customPrompt}`);

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: FINAL_PROMPT_SYSTEM },
      {
        role: "user",
        content: `ANALISIS DE LA ESTANCIA:\n${roomAnalysis}\n\nPLAN DE COLOCACION:\n${placementPlan}\n\nAJUSTES:\n${settingsParts.join("\n") || "Auto: elige lo que mejor se vea"}`,
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
    text: `IMAGEN DE REFERENCIA DE LA ESTANCIA - ESTA ES LA PRIORIDAD NUMERO 1:

DEBES conservar EXACTAMENTE la estructura de la estancia:
• Las posiciones, angulos y materiales de las paredes deben ser identicos
• Las posiciones y tamanos de ventanas y puertas deben ser identicos
• El material y trazado del suelo deben ser identicos
• La altura y tipo de techo deben coincidir
• La forma y proporciones generales de la estancia son sagradas: no las cambies

LO QUE CAMBIA: los muebles, objetos y estilismo dentro de la estancia. La estancia es el lienzo; rellenala con un diseno interior bello y fotorealista.

El resultado debe parecer una FOTOGRAFIA REAL tomada por un fotografo de Architectural Digest; no un render, no CGI. Materiales reales, luz real, atmosfera real.`,
  });

  parts.push({
    inlineData: {
      mimeType: roomMimeType,
      data: roomImageBase64,
    },
  });

  if (objectImages.length > 0) {
    parts.push({
      text: `IMAGENES DE REFERENCIA DE OBJETOS - Coloca estos elementos concretos en la estancia. Igualalos EXACTAMENTE en apariencia, material, color y estilo:`,
    });

    for (const obj of objectImages.slice(0, 8)) {
      parts.push({
        text: `Objeto: ${obj.label}`,
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
    text: `Ahora genera el render interior fotorealista:\n\n${finalPrompt}`,
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
  const parts = ["Render de interiorismo fotorealista."];
  const style = settings.interiorStyle?.replace(/-/g, " ");
  const room = settings.roomType?.replace(/-/g, " ");
  const objects = settings.objects
    ?.split(",")
    .filter(Boolean)
    .map((o) => o.replace(/-/g, " "));

  if (room && room !== "auto") parts.push(`Tipo de estancia: ${room}.`);
  if (style && style !== "auto") parts.push(`Estilo: ${style}.`);
  if (objects && objects.length > 0) parts.push(`Incluye: ${objects.join(", ")}.`);
  if (settings.lighting && settings.lighting !== "auto")
    parts.push(`Iluminacion: ${settings.lighting}.`);
  if (settings.furnitureDensity && settings.furnitureDensity !== "auto")
    parts.push(`Densidad de mobiliario: ${settings.furnitureDensity}.`);
  if (settings.textures) {
    const textureList = settings.textures.split(",").filter(Boolean).map((t) => t.replace(/-/g, " "));
    if (textureList.length > 0)
      parts.push(`Usa estos materiales/texturas de forma visible: ${textureList.join(", ")}.`);
  }
  if (settings.customPrompt) parts.push(settings.customPrompt);

  parts.push(
    "Conserva la estructura exacta de la estancia. Ultra detallado, 8K, calidad Architectural Digest, fotografia interior profesional con lente gran angular."
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
        modeLabel: "Render interior",
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
        await finishProjectImageRunFailure({ run, errorMessage: "La generacion interior fallo." });
        return { slotId: slot.slotId, error: "La generacion interior fallo. Intentalo de nuevo." };
      }

      const persisted = await finishProjectImageRunSuccess({
        run,
        dataUrl: outputUrl,
        sourceAssetId: sourceAsset.assetId,
        pathKind: "interior-renders",
        deliverableTitle: "Render interior",
        deliverableMetadata: { mode: "interior-render", modeLabel: "Render interior", kind: "generation" },
      });

      console.log(`[Interior] [${slot.slotId}] Render complete`);
      return { slotId: slot.slotId, outputUrl: persisted.url };
    } catch (error: any) {
      console.error(`[Interior] [${slot.slotId}] Error:`, error?.message);
      await finishProjectImageRunFailure({
        run,
        errorMessage: error?.message || "Algo salio mal.",
      });
      return { slotId: slot.slotId, error: error?.message || "Algo salio mal." };
    }
  });

  const results = await Promise.all(slotPromises);
  console.log(`[Interior] === Batch complete: ${results.filter((r) => r.outputUrl).length}/${slotsInput.length} succeeded ===`);
  return results;
}
