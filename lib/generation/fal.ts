import "server-only";

import { fal } from "@fal-ai/client";

const FAL_TRELLIS_MODEL = "fal-ai/trellis-2";

let falConfigured = false;

function getFalClient() {
  const key =
    process.env.FAL_KEY ||
    process.env.FAL_API_KEY ||
    process.env["fal_api_key"];
  if (!key) {
    throw new Error(
      "Configura FAL_KEY, FAL_API_KEY o fal_api_key para generar modelos 3D.",
    );
  }

  if (!falConfigured) {
    fal.config({ credentials: key });
    falConfigured = true;
  }

  return fal;
}

export interface Trellis3DParams {
  imageUrl: string;
  resolution?: 512 | 1024 | 1536;
  textureSize?: 1024 | 2048 | 4096;
  decimationTarget?: number;
  remesh?: boolean;
}

interface TrellisResult {
  model_glb?: {
    url?: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
  };
}

export async function generateTrellis3DModel(
  params: Trellis3DParams,
): Promise<{ modelUrl: string; requestId: string; contentType?: string }> {
  const client = getFalClient();

  const result = await client.subscribe(FAL_TRELLIS_MODEL, {
    input: {
      image_url: params.imageUrl,
      resolution: params.resolution ?? 1024,
      texture_size: params.textureSize ?? 2048,
      decimation_target: params.decimationTarget ?? 100000,
      remesh: params.remesh ?? true,
    },
    logs: true,
    onQueueUpdate(update) {
      if (update.status === "IN_PROGRESS") {
        update.logs?.forEach((log) => {
          console.log(`[BrickEx:FAL] ${log.message}`);
        });
      }
    },
  });

  const modelUrl = result.data?.model_glb?.url;
  if (!modelUrl) {
    throw new Error("Trellis termino sin devolver un GLB.");
  }

  return {
    modelUrl,
    requestId: result.requestId,
    contentType: result.data?.model_glb?.content_type,
  };
}
