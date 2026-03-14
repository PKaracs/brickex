import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import {
  submitVideoGeneration,
  pollForVideoResult,
  type GrokVideoParams,
} from "@/lib/generation/grok-video";
import { getPresetById, getScenePresetById } from "@/lib/constants/video-presets";
import { generateVideoPrompt } from "@/lib/generation/video-prompt";
import { saveVideoToGallery } from "@/lib/generation/save-video";

export const maxDuration = 600;

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body = await req.json();
    const {
      imageBase64,
      prompt,
      presetId,
      scenePresetId,
      duration,
      aspectRatio,
      resolution,
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "An image is required" },
        { status: 400 }
      );
    }

    console.log("[BrickEx:Video] === Starting video generation ===");
    console.log(
      `[BrickEx:Video] Duration: ${duration}s, Aspect: ${aspectRatio ?? "default"}, Res: ${resolution ?? "default"}, Motion: ${presetId ?? "none"}, Scene: ${scenePresetId ?? "none"}`
    );

    const motionPreset = presetId ? getPresetById(presetId) : undefined;
    const scenePreset = scenePresetId ? getScenePresetById(scenePresetId) : undefined;

    let finalPrompt: string;

    if (scenePreset) {
      console.log(`[BrickEx:Video] Using scene preset "${scenePreset.label}" — generating prompt with GPT...`);
      finalPrompt = await generateVideoPrompt(
        scenePreset.prompt,
        scenePreset.label,
        imageBase64,
        prompt || undefined,
        motionPreset?.prompt,
      );
      console.log(`[BrickEx:Video] GPT prompt: ${finalPrompt.substring(0, 150)}...`);
    } else if (prompt && motionPreset) {
      finalPrompt = `${prompt}. ${motionPreset.prompt}`;
    } else if (prompt) {
      finalPrompt = prompt;
    } else if (motionPreset) {
      finalPrompt = motionPreset.prompt;
    } else {
      finalPrompt =
        "Smooth cinematic camera movement, high quality, photorealistic, professional cinematography";
    }

    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

    console.log(`[BrickEx:Video] Image base64 length: ${imageBase64.length} chars (~${Math.round(imageBase64.length * 0.75 / 1024)}KB)`);

    const params: GrokVideoParams = {
      prompt: finalPrompt,
      imageUrl,
      duration: duration ?? 5,
      aspectRatio: aspectRatio ?? "16:9",
      resolution: resolution ?? "720p",
    };

    const requestId = await submitVideoGeneration(params);
    console.log(`[BrickEx:Video] Request submitted: ${requestId}`);

    const videoUrl = await pollForVideoResult(requestId);
    console.log(`[BrickEx:Video] === Video complete ===`);

    let savedUrl = videoUrl;
    try {
      const saved = await saveVideoToGallery({
        videoUrl,
        prompt: finalPrompt,
        scenePresetId: scenePresetId ?? null,
        motionPresetId: presetId ?? null,
        duration: duration ?? 5,
        settings: {
          aspectRatio: aspectRatio ?? "16:9",
          resolution: resolution ?? "720p",
          grokRequestId: requestId,
        },
      });
      savedUrl = saved.signedUrl;
      console.log(`[BrickEx:Video] Saved to gallery: ${saved.assetId}`);
    } catch (saveErr) {
      console.error("[BrickEx:Video] Failed to save to gallery (video still returned):", saveErr);
    }

    return NextResponse.json({ videoUrl: savedUrl, requestId });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("[BrickEx:Video] Generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
