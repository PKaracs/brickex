"use server";

import { requireAuth } from "@/lib/auth-guard";
import {
  submitVideoGeneration,
  pollForVideoResult,
  type KlingVideoParams,
} from "@/lib/generation/kling";
import { getPresetById } from "@/lib/constants/video-presets";

export interface GenerateVideoInput {
  startImageBase64: string;
  endImageBase64?: string;
  prompt: string;
  presetId?: string;
  duration: number;
  mode: "std" | "pro";
  enableAudio: boolean;
}

export interface GenerateVideoResult {
  videoUrl?: string;
  taskId?: string;
  error?: string;
}

export async function generateVideo(
  input: GenerateVideoInput
): Promise<GenerateVideoResult> {
  try {
    await requireAuth();

    console.log("[BrickEx:Video] === Starting video generation ===");
    console.log(
      `[BrickEx:Video] Mode: ${input.mode}, Duration: ${input.duration}s, Preset: ${input.presetId ?? "none"}`
    );

    const preset = input.presetId
      ? getPresetById(input.presetId)
      : undefined;

    let finalPrompt = "";
    if (input.prompt && preset) {
      finalPrompt = `${input.prompt}. ${preset.prompt}`;
    } else if (input.prompt) {
      finalPrompt = input.prompt;
    } else if (preset) {
      finalPrompt = preset.prompt;
    } else {
      finalPrompt =
        "Smooth cinematic camera movement, high quality, photorealistic, professional cinematography";
    }

    const params: KlingVideoParams = {
      image: input.startImageBase64,
      prompt: finalPrompt,
      duration: input.duration,
      mode: input.mode,
    };

    if (input.endImageBase64) {
      params.imageTail = input.endImageBase64;
    }

    const taskId = await submitVideoGeneration(params);
    console.log(`[BrickEx:Video] Task submitted: ${taskId}`);

    const videoUrl = await pollForVideoResult(taskId);
    console.log(`[BrickEx:Video] === Video complete ===`);

    return { videoUrl, taskId };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("[BrickEx:Video] Generation error:", message);
    return { error: message };
  }
}
