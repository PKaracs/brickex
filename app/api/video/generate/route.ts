import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import {
  submitVideoGeneration,
  pollForVideoResult,
  type KlingVideoParams,
} from "@/lib/generation/kling";
import { getPresetById } from "@/lib/constants/video-presets";

export const maxDuration = 600;

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const {
      startImageBase64,
      endImageBase64,
      prompt,
      presetId,
      duration,
      mode,
      enableAudio,
    } = body;

    if (!startImageBase64) {
      return NextResponse.json(
        { error: "Start image is required" },
        { status: 400 }
      );
    }

    console.log("[BrickEx:Video] === Starting video generation ===");
    console.log(
      `[BrickEx:Video] Mode: ${mode}, Duration: ${duration}s, Preset: ${presetId ?? "none"}`
    );

    const preset = presetId ? getPresetById(presetId) : undefined;

    let finalPrompt = "";
    if (prompt && preset) {
      finalPrompt = `${prompt}. ${preset.prompt}`;
    } else if (prompt) {
      finalPrompt = prompt;
    } else if (preset) {
      finalPrompt = preset.prompt;
    } else {
      finalPrompt =
        "Smooth cinematic camera movement, high quality, photorealistic, professional cinematography";
    }

    const params: KlingVideoParams = {
      image: startImageBase64,
      prompt: finalPrompt,
      duration: duration ?? 5,
      mode: mode ?? "std",
    };

    if (endImageBase64) {
      params.imageTail = endImageBase64;
    }

    const taskId = await submitVideoGeneration(params);
    console.log(`[BrickEx:Video] Task submitted: ${taskId}`);

    const videoUrl = await pollForVideoResult(taskId);
    console.log(`[BrickEx:Video] === Video complete ===`);

    return NextResponse.json({ videoUrl, taskId });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("[BrickEx:Video] Generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
