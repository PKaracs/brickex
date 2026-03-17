import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import {
  submitVideoGeneration,
  pollForVideoResult,
  type GrokVideoParams,
} from "@/lib/generation/grok-video";
import { getPresetById } from "@/lib/constants/video-presets";
import { getScenePrompt } from "@/lib/generation/video-prompt";
import { saveVideoToGallery } from "@/lib/generation/save-video";
import { deductBricks } from "@/lib/actions/get-user-subscription";
import { calculateVideoCreditCost } from "@/lib/constants/tools";
import { getPostHogClient } from "@/lib/posthog-server";

export const maxDuration = 600;

export async function POST(req: NextRequest) {
  const posthog = getPostHogClient();
  let userId: string | undefined;
  try {
    userId = await requireAuth();

    const body = await req.json();
    const {
      imageBase64,
      imageMimeType,
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

    const videoDuration = duration ?? 5;
    const brickCost = calculateVideoCreditCost(videoDuration);
    const deduction = await deductBricks(brickCost);
    if (!deduction.success) {
      return NextResponse.json(
        { error: deduction.error },
        { status: 402 }
      );
    }

    posthog.capture({
      distinctId: userId,
      event: "video_generation_started",
      properties: {
        duration: videoDuration,
        brick_cost: brickCost,
        preset_id: presetId ?? null,
        scene_preset_id: scenePresetId ?? null,
        aspect_ratio: aspectRatio ?? "16:9",
        resolution: resolution ?? "720p",
        has_custom_prompt: !!prompt,
      },
    });

    console.log("[BrickEx:Video] === Starting video generation ===");
    console.log(`[BrickEx:Video] Deducted ${brickCost} bricks (${videoDuration}s × 50/s). Remaining: ${deduction.remaining}`);
    console.log(
      `[BrickEx:Video] Duration: ${duration}s, Aspect: ${aspectRatio ?? "default"}, Res: ${resolution ?? "default"}, Motion: ${presetId ?? "none"}, Scene: ${scenePresetId ?? "none"}`
    );
    console.log(`[BrickEx:Video] Image base64 length: ${imageBase64.length} chars (~${Math.round(imageBase64.length * 0.75 / 1024)}KB)`);

    const motionPreset = presetId ? getPresetById(presetId) : undefined;

    let finalPrompt: string;

    if (scenePresetId) {
      finalPrompt = getScenePrompt(
        scenePresetId,
        prompt || undefined,
        motionPreset?.prompt,
      );
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

    console.log(`[BrickEx:Video] Final prompt: ${finalPrompt.substring(0, 200)}...`);

    const safeImageMimeType =
      typeof imageMimeType === "string" && imageMimeType.startsWith("image/")
        ? imageMimeType
        : "image/jpeg";
    const imageUrl = `data:${safeImageMimeType};base64,${imageBase64}`;

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

    posthog.capture({
      distinctId: userId,
      event: "video_generation_completed",
      properties: {
        request_id: requestId,
        duration: videoDuration,
        brick_cost: brickCost,
      },
    });

    return NextResponse.json({ videoUrl: savedUrl, requestId });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("[BrickEx:Video] Generation error:", message);
    if (userId) {
      posthog.capture({
        distinctId: userId,
        event: "video_generation_failed",
        properties: { error: message },
      });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
