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

const VISION_SYSTEM_PROMPT = `Eres un consultor experto en visualizacion arquitectonica para BrickEx. Conviertes entradas arquitectonicas en renders fotorrealistas que parecen FOTOGRAFIAS REALES tomadas por un fotografo profesional de arquitectura.

Recibiras una imagen de entrada (plano, boceto, modelo 3D, render o fotografia) y los ajustes del usuario.

TU PRIORIDAD #1: la imagen de salida DEBE representar fielmente el MISMO edificio o espacio que la entrada. Misma forma, mismas proporciones, misma distribucion, mismo numero de plantas, misma posicion de ventanas y misma forma de cubierta. Estas dando vida a este diseno exacto, no creando otro edificio.

Escribe un prompt detallado para generar una visualizacion fotorrealista de ESTA arquitectura exacta.

DESCRIBE EN TU PROMPT:
1. EL EDIFICIO EXACTAMENTE COMO SE VE: cada elemento estructural visible, posicion de muros, angulos de cubierta, numero de plantas, ubicacion de ventanas, puertas, voladizos, retranqueos y materiales visibles. Se forense.
2. MATERIALES Y ACABADOS: materiales reales especificos (por ejemplo, "fachada de ladrillo encalado", "revestimiento de roble natural", "cubierta de zinc oscuro de junta alzada", "vidrio low-iron de suelo a techo"). Si ves materiales en la entrada, nombralos exactamente. Si no estan claros, elige materiales premium adecuados al estilo.
3. ENTORNO: superficie del suelo, paisajismo, cielo y contexto vecino. Haz que se sienta como un lugar real.
4. ILUMINACION: direccion de luz natural, hora del dia y calidad de sombras. Respeta la preferencia de iluminacion del usuario.
5. CAMARA: lente especifica, angulo, altura y composicion. Usa tecnicas profesionales de fotografia arquitectonica.
6. ATMOSFERA: calidad del aire, temperatura de color y mood.

DEVUELVE SOLO EL TEXTO DEL PROMPT. Sin explicaciones. Menos de 500 palabras.`;

function buildSettingsContext(
  mode: string,
  settings: Record<string, string>,
): string {
  const parts: string[] = [`Modo de render: ${mode}`];

  if (settings.shotType && settings.shotType !== "auto") {
    parts.push(`Tipo de toma: ${settings.shotType.replace(/-/g, " ")}`);
  }
  if (settings.architectureStyle && settings.architectureStyle !== "auto") {
    parts.push(
      `Estilo arquitectonico: ${settings.architectureStyle.replace(/-/g, " ")}`,
    );
  }
  if (settings.interiorStyle && settings.interiorStyle !== "auto") {
    parts.push(`Estilo interior: ${settings.interiorStyle.replace(/-/g, " ")}`);
  }
  if (settings.roomType && settings.roomType !== "auto") {
    parts.push(`Tipo de habitacion: ${settings.roomType.replace(/-/g, " ")}`);
  }
  if (settings.facadeMaterial && settings.facadeMaterial !== "auto") {
    parts.push(
      `Material de fachada: ${settings.facadeMaterial.replace(/-/g, " ")}`,
    );
  }
  if (settings.environment && settings.environment !== "auto") {
    parts.push(`Entorno: ${settings.environment.replace(/-/g, " ")}`);
  }
  if (settings.lighting && settings.lighting !== "auto") {
    parts.push(`Iluminacion: ${settings.lighting.replace(/-/g, " ")}`);
  }
  if (settings.furnitureDensity && settings.furnitureDensity !== "auto") {
    parts.push(
      `Densidad de mobiliario: ${settings.furnitureDensity.replace(/-/g, " ")}`,
    );
  }
  if (settings.targetStyle && settings.targetStyle !== "auto") {
    parts.push(`Estilo objetivo: ${settings.targetStyle.replace(/-/g, " ")}`);
  }
  if (settings.preserveStructure && settings.preserveStructure !== "auto") {
    parts.push(`Preservar estructura: ${settings.preserveStructure}`);
  }
  if (settings.objects) {
    const objs = settings.objects.split(",").filter(Boolean);
    if (objs.length > 0) {
      parts.push(
        `Objetos a incluir: ${objs.map((o) => o.replace(/-/g, " ")).join(", ")}`,
      );
    }
  }
  if (settings.customPrompt) {
    parts.push(`Instrucciones del usuario: ${settings.customPrompt}`);
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
    return `Crea un render arquitectonico fotorrealista basado en la imagen de referencia. ${settingsContext}. Ultra detallado, calidad 8K, fotografia arquitectonica profesional.`;
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
              text: `Estudia esta imagen con cuidado. Describe cada elemento arquitectonico visible: forma exacta del edificio, proporciones, materiales, ventanas, puertas y cubierta. Despues escribe un prompt para generar un render fotorrealista de ESTE edificio o espacio exacto llevado a la realidad.\n\nAjustes del usuario:\n${settingsContext}`,
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
      return `Crea un render arquitectonico fotorrealista. ${settingsContext}. Ultra detallado, 8K, fotografia arquitectonica profesional, iluminacion dramatica.`;
    }

    return prompt;
  } catch (error: any) {
    console.error("[BrickEx] GPT-5-mini vision failed:", error?.message);
    return `Crea un render arquitectonico fotorrealista. ${settingsContext}. Ultra detallado, 8K, fotografia arquitectonica profesional, iluminacion dramatica.`;
  }
}

const ARCH_ENHANCER_SYSTEM = `Eres un fotografo arquitectonico y supervisor CGI de nivel mundial (V-Ray, Lumion, Enscape). Toma este prompt y anade especificaciones fotorrealistas.

ANADIR:
- CAMARA: lente especifica para arquitectura (Canon TS-E 17mm f/4L tilt-shift, Sony 16-35mm f/2.8 GM, Fuji GFX con 23mm para medio formato, etc.)
- POSICION DE CAMARA: altura exacta (nivel de ojos 1.6m, angulo bajo 0.5m, elevado 4m), distancia y correccion de perspectiva
- ILUMINACION: posicion solar fisicamente precisa, relleno del cielo y rebotes en superficies. Si es golden hour: luz calida direccional a 15 grados sobre el horizonte. Si esta nublado: luz cenital suave y difusa. Se especifico.
- MATERIALES: hiper especificos (por ejemplo, "ladrillo artesanal Vieux Lille", no solo "ladrillo"; "acero inoxidable 316L cepillado", no solo "metal")
- ATMOSFERA: niebla volumetrica, particulas en rayos de luz, humedad en superficies tras lluvia, shimmer de calor
- PAISAJISMO: plantas especificas adecuadas al clima (gramineas ornamentales, olivos maduros, etc.)
- POSTPRODUCCION: color grade tipo Architectural Digest, vineteado sutil de lente y microcontraste

REGLAS ABSOLUTAS:
1. PRESERVA cada detalle arquitectonico del prompt original; no cambies el edificio
2. El resultado debe ser indistinguible de una fotografia real
3. Nunca anadas personas salvo que se pidan
4. Devuelve SOLO el prompt mejorado
5. Menos de 500 palabras`;

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
          content: `Mejora este prompt de visualizacion arquitectonica:\n\n${rawPrompt}`,
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
    text: `IMAGEN DE REFERENCIA ESTRUCTURAL: ESTA ES LA PRIORIDAD #1.

Debes generar una imagen de ESTE edificio o espacio exacto. La imagen de referencia muestra el diseno arquitectonico que debe reproducirse fielmente. No es opcional; es el objetivo principal.

FIDELIDAD ESTRUCTURAL OBLIGATORIA:
- La forma, masa y proporciones del edificio deben coincidir exactamente con la referencia
- Cada planta, angulo de muro, retranqueo y voladizo debe preservarse
- Las posiciones, tamanos y patrones de ventanas deben coincidir con precision
- La forma y pendiente de la cubierta deben ser identicas
- La silueta general desde el mismo angulo debe reconocerse como el mismo edificio
- Si la referencia es un plano o boceto, interpretalo fielmente en 3D con la misma distribucion y relaciones espaciales
- No anadas plantas, alas o elementos arquitectonicos ausentes en la referencia
- No elimines ni simplifiques rasgos estructurales visibles

LO QUE DEBES CAMBIAR:
- Convierte calidad de boceto, wireframe o modelo 3D en calidad fotorrealista
- Anade materiales reales, texturas, reflejos y precision fisica
- Anade entorno natural, cielo, paisajismo y superficies de suelo
- Anade iluminacion y sombras fisicamente precisas
- Haz que parezca una FOTOGRAFIA REAL de un EDIFICIO REAL, no un render ni CGI

El espectador debe mirar la referencia y la salida y reconocer de inmediato el mismo edificio, solo llevado a la vida como si estuviera construido y fotografiado.`,
  });

  parts.push({
    inlineData: {
      mimeType: inputMimeType,
      data: inputImageBase64,
    },
  });

  parts.push({
    text: `Ahora genera el render fotorrealista basado en la referencia anterior. Este es el prompt detallado:\n\n${enhancedPrompt}`,
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

export interface BatchSlotInput {
  slotId: string;
  settings: Record<string, string>;
}

export interface BatchSlotResult {
  slotId: string;
  outputUrl?: string;
  error?: string;
}

// Single-slot generation (kept for backwards compat)
export async function generateRender(
  projectId: string,
  imageBase64: string,
  mimeType: string,
  modeId: string,
  mode: string,
  settings: Record<string, string>,
): Promise<GenerateRenderResult> {
  const results = await generateRenderBatch(projectId, imageBase64, mimeType, modeId, mode, [
    { slotId: "single", settings },
  ]);
  const r = results[0];
  return { outputUrl: r?.outputUrl, error: r?.error };
}

/**
 * Batch generation: analyse the image ONCE with GPT, then fan out per-slot
 * enhancement + Gemini calls in parallel.
 */
export async function generateRenderBatch(
  projectId: string,
  imageBase64: string,
  mimeType: string,
  modeId: string,
  mode: string,
  slotsInput: BatchSlotInput[],
): Promise<BatchSlotResult[]> {
  const sourceAsset = await ensureProjectSourceImageAsset({
    projectId,
    dataUrl: `data:${mimeType};base64,${imageBase64}`,
  });

  console.log(`[BrickEx] === Starting batch render (${slotsInput.length} slots) ===`);
  console.log(`[BrickEx] Mode: ${mode}`);
  console.log(`[BrickEx] Image size: ${Math.round(imageBase64.length / 1024)}KB base64`);

  // Step 1: GPT vision analysis ONCE with the first slot's settings as context
  const baseAnalysis = await analyzeAndBuildPrompt(
    imageBase64,
    mimeType,
    mode,
    slotsInput[0].settings,
  );
  console.log(`[BrickEx] Shared base analysis: ${baseAnalysis.slice(0, 200)}...`);

  // Step 2+3: For each slot, enhance the base prompt with slot-specific settings,
  // then generate with Gemini — all in parallel.
  const slotPromises = slotsInput.map(async (slot): Promise<BatchSlotResult> => {
    const run = await startProjectImageRun({
      projectId,
      type: "image_generation",
      toolId: modeId,
      model: GEMINI_IMAGE_MODEL,
      settings: { mode: modeId, modeLabel: mode, ...slot.settings },
      inputAssetId: sourceAsset.assetId,
    });

    try {
      const slotContext = buildSettingsContext(mode, slot.settings);
      const rawPrompt = `${baseAnalysis}\n\n--- AJUSTES ESPECIFICOS DE ESTA VARIACION ---\n${slotContext}`;

      const enhancedPrompt = await enhanceArchPrompt(rawPrompt);
      console.log(`[BrickEx] [${slot.slotId}] Enhanced prompt: ${enhancedPrompt.slice(0, 120)}...`);
      await updateProjectImageRunPrompt(run.runId, enhancedPrompt);

      const outputUrl = await generateWithGemini(enhancedPrompt, imageBase64, mimeType);

      if (!outputUrl) {
        await finishProjectImageRunFailure({ run, errorMessage: "La generacion fallo." });
        return { slotId: slot.slotId, error: "La generacion fallo. Intentalo de nuevo." };
      }

      const persisted = await finishProjectImageRunSuccess({
        run,
        dataUrl: outputUrl,
        sourceAssetId: sourceAsset.assetId,
        pathKind: "render-images",
        deliverableTitle: "Render generado",
        deliverableMetadata: { mode: modeId, modeLabel: mode, kind: "generation" },
      });

      console.log(`[BrickEx] [${slot.slotId}] Render complete`);
      return { slotId: slot.slotId, outputUrl: persisted.url };
    } catch (error: any) {
      console.error(`[BrickEx] [${slot.slotId}] Error:`, error?.message);
      await finishProjectImageRunFailure({
        run,
        errorMessage: error?.message || "Algo salio mal.",
      });
      return { slotId: slot.slotId, error: error?.message || "Algo salio mal." };
    }
  });

  const results = await Promise.all(slotPromises);
  console.log(`[BrickEx] === Batch complete: ${results.filter((r) => r.outputUrl).length}/${slotsInput.length} succeeded ===`);
  return results;
}
