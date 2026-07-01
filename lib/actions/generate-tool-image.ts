"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";

import * as schema from "@/db/schema";
import { requireWorkspaceContext } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import {
  ASPECT_RATIOS,
  GEMINI_IMAGE_MODEL,
  GEMINI_IMAGE_MODEL_FALLBACK,
  genai,
} from "@/lib/google-genai";
import {
  isSupportedToolId,
  TOOL_GENERATION_SPECS,
  type ToolGenerationSpec,
} from "@/lib/constants/tool-generation";
import { getToolById } from "@/lib/constants/tools";
import {
  finishProjectImageRunFailure,
  finishProjectBinaryRunSuccess,
  finishProjectImageRunSuccess,
  startProjectImageRun,
  updateProjectImageRunPrompt,
} from "@/lib/generation/project-image-runs";
import { generateTrellis3DModel } from "@/lib/generation/fal";
import {
  downloadStorageObject,
  getSignedDownloadUrl,
  toStorageKey,
} from "@/lib/storage";

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;
const IMAGE_TO_3D_TOOL_ID = "image-to-3d";
const TRELLIS_MODEL_ID = "fal-ai/trellis-2";
const IMAGE_TO_3D_PROMPT =
  "Genera un modelo 3D GLB texturizado desde la imagen de objeto subida usando Trellis 2.";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadSourceAssets(
  projectId: string,
  organizationId: string,
  limit: number,
) {
  return db.query.assets.findMany({
    where: and(
      eq(schema.assets.organizationId, organizationId),
      eq(schema.assets.projectId, projectId),
      inArray(schema.assets.assetKind, [
        "source_image",
        "reference_image",
        "moodboard",
        "style_reference",
      ]),
      eq(schema.assets.mediaType, "image"),
      eq(schema.assets.status, "ready"),
      isNull(schema.assets.deletedAt),
    ),
    columns: {
      id: true,
      bucket: true,
      path: true,
      contentType: true,
      originalFilename: true,
    },
    orderBy: (assets, { desc }) => [desc(assets.createdAt)],
    limit,
  });
}

async function generateWithGemini(
  spec: ToolGenerationSpec,
  inputAssets: Awaited<ReturnType<typeof loadSourceAssets>>,
) {
  const parts: ContentPart[] = [{ text: spec.referenceInstruction }];

  for (const [index, asset] of [...inputAssets].reverse().entries()) {
    const label = spec.referenceImageLabel ?? "IMAGEN DE REFERENCIA";
    parts.push({
      text:
        spec.maxInputImages > 1
          ? `${label} ${index + 1}:`
          : `${label}:`,
    });
    const buffer = await downloadStorageObject(toStorageKey(asset.bucket, asset.path));
    parts.push({
      inlineData: {
        mimeType: asset.contentType || "image/jpeg",
        data: buffer.toString("base64"),
      },
    });
  }

  parts.push({ text: spec.prompt });

  const modelsToTry = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_MODEL_FALLBACK];

  for (const model of modelsToTry) {
    console.log(`[ToolGeneration] Trying model ${model} for ${spec.label}`);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      if (attempt > 0) {
        await sleep(RETRY_DELAY_MS * attempt);
      }

      try {
        const response = await genai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: {
            responseModalities: ["IMAGE", "TEXT"],
            imageConfig: {
              aspectRatio: ASPECT_RATIOS[spec.aspectRatio].ratio,
              imageSize: "2K",
            },
          },
        });

        if (response.promptFeedback) {
          const blockReason = (response.promptFeedback as { blockReason?: string }).blockReason;
          if (blockReason) {
            return {
              error: "La generacion fue bloqueada por filtros de seguridad.",
            };
          }
        }

        if (!response.candidates?.length) {
          if (attempt < MAX_RETRIES) continue;
          return { error: "El modelo de imagen no devolvio candidatos." };
        }

        const candidate = response.candidates[0];
        if (candidate.finishReason === "SAFETY") {
          return {
            error: "La generacion fue bloqueada por filtros de seguridad.",
          };
        }

        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              return {
                outputUrl: `data:image/png;base64,${part.inlineData.data}`,
              };
            }
          }
        }

        if (attempt < MAX_RETRIES) continue;
        return { error: "Gemini no devolvio una imagen." };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "La generacion fallo.";
        const status =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status?: number }).status === "number"
            ? (error as { status: number }).status
            : null;

        console.error(
          `[ToolGeneration] ${model} attempt ${attempt + 1} failed:`,
          message,
        );

        if (status === 429) {
          break;
        }

        if (status === 400 || status === 401) {
          return { error: message };
        }

        if (attempt < MAX_RETRIES) continue;
        return { error: message };
      }
    }
  }

  return { error: "Todos los modelos de imagen Gemini fallaron." };
}

export async function generateToolImage(
  projectId: string,
  toolId: string,
): Promise<{ outputUrl?: string; error?: string; mediaType?: "image" | "model_3d" }> {
  if (!projectId) {
    return { error: "Se requiere el ID del proyecto." };
  }

  const is3DTool = toolId === IMAGE_TO_3D_TOOL_ID;

  if (!is3DTool && !isSupportedToolId(toolId)) {
    return {
      error:
        getToolById(toolId)?.unavailableReason ??
        "Esta herramienta no esta disponible en el flujo actual de imagen Gemini.",
    };
  }

  const { organizationId } = await requireWorkspaceContext();
  const spec = !is3DTool ? TOOL_GENERATION_SPECS[toolId] : null;
  const tool = getToolById(toolId);

  const sourceAssets = await loadSourceAssets(
    projectId,
    organizationId,
    spec?.maxInputImages ?? 1,
  );

  if (sourceAssets.length === 0) {
    return { error: "Sube una imagen antes de generar." };
  }

  if (is3DTool) {
    const run = await startProjectImageRun({
      projectId,
      type: "image_generation",
      toolId,
      provider: "other",
      model: TRELLIS_MODEL_ID,
      prompt: IMAGE_TO_3D_PROMPT,
      settings: {
        kind: "tool-generation",
        toolLabel: tool?.label ?? "Imagen a objeto 3D",
        inputAssetCount: sourceAssets.length,
        outputKind: "model_3d",
      },
      inputAssetId: sourceAssets[0].id,
    });

    try {
      const sourceUrl = await getSignedDownloadUrl(
        toStorageKey(sourceAssets[0].bucket, sourceAssets[0].path),
      );
      const result = await generateTrellis3DModel({
        imageUrl: sourceUrl,
      });

      const persisted = await finishProjectBinaryRunSuccess({
        run,
        sourceUrl: result.modelUrl,
        sourceAssetId: sourceAssets[0].id,
        pathKind: "tool-models",
        mediaType: "model_3d",
        contentType: result.contentType || "model/gltf-binary",
        assetKind: "other",
        deliverableType: "other",
        deliverableTitle: "Modelo de objeto 3D",
        deliverableMetadata: {
          kind: "tool-generation",
          toolId,
          toolLabel: tool?.label ?? "Imagen a objeto 3D",
          providerRequestId: result.requestId,
        },
        promoteToHero: false,
      });

      return {
        outputUrl: persisted.url,
        mediaType: "model_3d",
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "La generacion 3D fallo.";

      await finishProjectImageRunFailure({
        run,
        errorMessage: message,
      });

      return { error: message };
    }
  }

  if (!spec) {
    return { error: "A esta herramienta le falta una especificacion de generacion." };
  }

  const run = await startProjectImageRun({
    projectId,
    type: "image_generation",
    toolId,
    model: GEMINI_IMAGE_MODEL,
    settings: {
      kind: "tool-generation",
      toolLabel: spec.label,
      inputAssetCount: sourceAssets.length,
    },
    inputAssetId: sourceAssets[0].id,
  });

  try {
    await updateProjectImageRunPrompt(run.runId, spec.prompt);

    const result = await generateWithGemini(spec, sourceAssets);

    if (result.error || !result.outputUrl) {
      await finishProjectImageRunFailure({
        run,
        errorMessage: result.error || "Gemini no devolvio una imagen.",
      });
      return { error: result.error || "Gemini no devolvio una imagen." };
    }

    const persisted = await finishProjectImageRunSuccess({
      run,
      dataUrl: result.outputUrl,
      sourceAssetId: sourceAssets[0].id,
      pathKind: "tool-images",
      deliverableTitle: spec.outputTitle,
      deliverableMetadata: {
        kind: "tool-generation",
        toolId,
        toolLabel: spec.label,
      },
    });

    return {
      outputUrl: persisted.url,
      mediaType: "image",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "La generacion fallo.";

    await finishProjectImageRunFailure({
      run,
      errorMessage: message,
    });

    return { error: message };
  }
}
