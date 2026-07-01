"use server";

import { requireAuth } from "@/lib/auth-guard";
import {
  submitVideoGeneration,
  pollForVideoResult,
  type GrokVideoParams,
} from "@/lib/generation/grok-video";
import { getPresetById } from "@/lib/constants/video-presets";
import { getScenePrompt } from "@/lib/generation/video-prompt";

export interface GenerateVideoInput {
  imageBase64: string;
  imageMimeType?: string;
  prompt: string;
  presetId?: string;
  scenePresetId?: string;
  duration: number;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3";
  resolution?: "480p" | "720p";
}

export interface GenerateVideoResult {
  videoUrl?: string;
  requestId?: string;
  error?: string;
}

export async function generateVideo(
  input: GenerateVideoInput
): Promise<GenerateVideoResult> {
  try {
    await requireAuth();

    const motionPreset = input.presetId
      ? getPresetById(input.presetId)
      : undefined;

    let finalPrompt: string;

    if (input.scenePresetId) {
      finalPrompt = getScenePrompt(
        input.scenePresetId,
        input.prompt || undefined,
        motionPreset?.prompt,
      );
    } else if (input.prompt && motionPreset) {
      finalPrompt = `${input.prompt}. ${motionPreset.prompt}`;
    } else if (input.prompt) {
      finalPrompt = input.prompt;
    } else if (motionPreset) {
      finalPrompt = motionPreset.prompt;
    } else {
      finalPrompt =
        "Movimiento de camara cinematografico suave, alta calidad, fotorrealista, cinematografia profesional";
    }

    const safeImageMimeType =
      typeof input.imageMimeType === "string" &&
      input.imageMimeType.startsWith("image/")
        ? input.imageMimeType
        : "image/jpeg";
    const imageUrl = `data:${safeImageMimeType};base64,${input.imageBase64}`;

    const params: GrokVideoParams = {
      prompt: finalPrompt,
      imageUrl,
      duration: input.duration,
      aspectRatio: input.aspectRatio ?? "16:9",
      resolution: input.resolution ?? "720p",
    };

    const requestId = await submitVideoGeneration(params);
    const videoUrl = await pollForVideoResult(requestId);

    return { videoUrl, requestId };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Algo salio mal";
    console.error("[BrickEx:Video] Generation error:", message);
    return { error: message };
  }
}
