"use server";

import {
  genai,
  GEMINI_IMAGE_MODEL,
  GEMINI_IMAGE_MODEL_FALLBACK,
} from "@/lib/google-genai";
import {
  finishProjectImageRunFailure,
  finishProjectImageRunSuccess,
  startProjectImageRun,
} from "@/lib/generation/project-image-runs";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

/**
 * Region edit: sends the annotated image (with green rectangle overlay) + prompt.
 * Only ONE image is sent to stay within body size limits.
 */
export async function editRenderRegion(
  projectId: string,
  annotatedImageBase64: string,
  editPrompt: string
): Promise<{ outputUrl?: string; error?: string }> {
  if (!annotatedImageBase64 || !editPrompt) {
    return { error: "Faltan parametros necesarios para editar." };
  }

  const run = await startProjectImageRun({
    projectId,
    type: "image_edit",
    toolId: "region-edit",
    model: GEMINI_IMAGE_MODEL,
    prompt: editPrompt,
    settings: {
      editType: "region",
    },
  });

  console.log(`[EditRender] Region edit: "${editPrompt}" (${Math.round(annotatedImageBase64.length / 1024)}KB)`);

  const parts: ContentPart[] = [];

  parts.push({
    text: `Eres un editor experto de imagen arquitectonica. Esta imagen tiene un rectangulo verde semitransparente que marca la region concreta que el usuario quiere cambiar.`,
  });

  parts.push({
    inlineData: {
      mimeType: "image/jpeg",
      data: annotatedImageBase64,
    },
  });

  parts.push({
    text: `INSTRUCCION DE EDICION: "${editPrompt}"

REGLAS:
1. Edita SOLO el area dentro del rectangulo verde resaltado
2. Aplica la instruccion de edicion a esa region concreta
3. Mantiene TODO fuera del rectangulo verde exactamente igual
4. Elimina el overlay verde en la salida; el resultado debe verse limpio
5. La salida debe ser la imagen completa con las mismas dimensiones
6. Mantiene iluminacion, perspectiva y estilo coherentes con el resto de la imagen
7. La edicion debe verse natural e integrada

Devuelve la imagen completa editada.`,
  });

  const result = await callGeminiEdit(parts);

  if (result.error) {
    await finishProjectImageRunFailure({
      run,
      errorMessage: result.error,
    });
    return result;
  }

  if (!result.outputUrl) {
    await finishProjectImageRunFailure({
      run,
      errorMessage: "La IA no devolvio una imagen. Intentalo de nuevo.",
    });
    return { error: "La IA no devolvio una imagen. Intentalo de nuevo." };
  }

  const persisted = await finishProjectImageRunSuccess({
    run,
    dataUrl: result.outputUrl,
    pathKind: "edited-renders",
    deliverableTitle: "Render editado",
    deliverableMetadata: {
      editType: "region",
      kind: "edit",
    },
  });

  return { outputUrl: persisted.url };
}

/**
 * Global edit: sends the full image + prompt (no region selection).
 */
export async function editRenderGlobal(
  projectId: string,
  imageBase64: string,
  editPrompt: string
): Promise<{ outputUrl?: string; error?: string }> {
  if (!imageBase64 || !editPrompt) {
    return { error: "Faltan parametros necesarios para editar." };
  }

  const run = await startProjectImageRun({
    projectId,
    type: "image_edit",
    toolId: "global-edit",
    model: GEMINI_IMAGE_MODEL,
    prompt: editPrompt,
    settings: {
      editType: "global",
    },
  });

  console.log(`[EditRender] Global edit: "${editPrompt}" (${Math.round(imageBase64.length / 1024)}KB)`);

  const parts: ContentPart[] = [];

  parts.push({
    text: `Eres un editor experto de imagen arquitectonica. El usuario quiere hacer un cambio en este render.`,
  });

  parts.push({
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBase64,
    },
  });

  parts.push({
    text: `INSTRUCCION DE EDICION: "${editPrompt}"

REGLAS:
1. Aplica la instruccion de edicion a la imagen
2. Preserva composicion, perspectiva y calidad general
3. La salida debe tener las mismas dimensiones que la entrada
4. Haz que la edicion se vea natural e integrada
5. Cambia solo lo que pide la instruccion; mantiene todo lo demas igual

Devuelve la imagen completa editada.`,
  });

  const result = await callGeminiEdit(parts);

  if (result.error) {
    await finishProjectImageRunFailure({
      run,
      errorMessage: result.error,
    });
    return result;
  }

  if (!result.outputUrl) {
    await finishProjectImageRunFailure({
      run,
      errorMessage: "La IA no devolvio una imagen. Intentalo de nuevo.",
    });
    return { error: "La IA no devolvio una imagen. Intentalo de nuevo." };
  }

  const persisted = await finishProjectImageRunSuccess({
    run,
    dataUrl: result.outputUrl,
    pathKind: "edited-renders",
    deliverableTitle: "Render editado",
    deliverableMetadata: {
      editType: "global",
      kind: "edit",
    },
  });

  return { outputUrl: persisted.url };
}

async function callGeminiEdit(
  parts: ContentPart[]
): Promise<{ outputUrl?: string; error?: string }> {
  const modelsToTry = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_MODEL_FALLBACK];

  for (const model of modelsToTry) {
    console.log(`[EditRender] Trying model: ${model}`);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(
          `[EditRender] Retry ${attempt}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms`
        );
        await sleep(RETRY_DELAY_MS * attempt);
      }

      try {
        const response = await genai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        });

        if (response.promptFeedback) {
          const blockReason = (response.promptFeedback as any).blockReason;
          if (blockReason) {
            return { error: "La edicion fue bloqueada por filtros de seguridad." };
          }
        }

        if (!response.candidates || response.candidates.length === 0) {
          if (attempt < MAX_RETRIES) continue;
          return { error: "El modelo no devolvio resultado. Prueba otra edicion." };
        }

        const candidate = response.candidates[0];

        if (candidate.finishReason === "SAFETY") {
          return { error: "Edicion bloqueada por filtros de seguridad. Reformula el prompt." };
        }

        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              const outputUrl = `data:image/png;base64,${part.inlineData.data}`;
              console.log(`[EditRender] Success (model: ${model})`);
              return { outputUrl };
            }
          }
        }

        if (attempt < MAX_RETRIES) continue;
        return { error: "La IA no devolvio una imagen. Intentalo de nuevo." };
      } catch (error: any) {
        console.error(
          `[EditRender] Error on ${model} (attempt ${attempt + 1}):`,
          error?.message || error
        );

        if (error?.status === 401 || error?.status === 400) {
          return { error: "Error de autenticacion de la API." };
        }

        if (error?.status === 429) {
          console.log(`[EditRender] Quota exhausted, trying fallback...`);
          break;
        }

        if (attempt < MAX_RETRIES) continue;
        return { error: error?.message || "La edicion fallo. Intentalo de nuevo." };
      }
    }
  }

  return { error: "Todos los modelos de IA estan ocupados. Intentalo de nuevo en un momento." };
}
