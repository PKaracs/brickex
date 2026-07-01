const GROK_API_BASE = "https://api.x.ai/v1";

function getApiKey(): string {
  const key = process.env.GROK_API_KEY;
  if (!key) {
    throw new Error("GROK_API_KEY debe estar configurada");
  }
  return key;
}

export interface GrokVideoParams {
  prompt: string;
  imageUrl?: string;
  duration?: number;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3";
  resolution?: "480p" | "720p";
}

interface GrokSubmitResponse {
  request_id: string;
}

interface GrokStatusResponse {
  status: "pending" | "done" | "expired";
  video?: {
    url: string;
    duration: number;
    respect_moderation: boolean;
  };
  model?: string;
}

export async function submitVideoGeneration(
  params: GrokVideoParams
): Promise<string> {
  const apiKey = getApiKey();

  const body: Record<string, unknown> = {
    model: "grok-imagine-video",
    prompt: params.prompt || "Anima esta imagen con movimiento cinematografico sutil",
  };

  if (params.imageUrl) {
    body.image = { url: params.imageUrl };
  }

  if (params.duration) {
    body.duration = params.duration;
  }

  if (params.aspectRatio) {
    body.aspect_ratio = params.aspectRatio;
  }

  if (params.resolution) {
    body.resolution = params.resolution;
  }

  console.log(
    `[BrickEx:Grok] Submitting video generation (duration=${params.duration ?? "default"}s, aspect=${params.aspectRatio ?? "default"}, res=${params.resolution ?? "default"}, hasImage=${!!params.imageUrl}, imageUrlLen=${params.imageUrl?.length ?? 0})`
  );

  const bodyStr = JSON.stringify(body);
  console.log(`[BrickEx:Grok] Request body size: ${Math.round(bodyStr.length / 1024)}KB`);

  const response = await fetch(`${GROK_API_BASE}/videos/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: bodyStr,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(
      `[BrickEx:Grok] Submit failed (${response.status}):`,
      text
    );
    throw new Error(`Error de API de video: ${response.status}`);
  }

  const result: GrokSubmitResponse = await response.json();
  console.log(`[BrickEx:Grok] Request submitted: ${result.request_id}`);
  return result.request_id;
}

export async function getVideoStatus(
  requestId: string
): Promise<GrokStatusResponse> {
  const apiKey = getApiKey();

  const response = await fetch(
    `${GROK_API_BASE}/videos/${requestId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(
      `[BrickEx:Grok] Status check failed (${response.status}):`,
      text
    );
    throw new Error(`Error al consultar el estado del video: ${response.status}`);
  }

  return response.json();
}

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_TIME_MS = 10 * 60 * 1000;

export async function pollForVideoResult(requestId: string): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME_MS) {
    const status = await getVideoStatus(requestId);

    if (status.status === "done") {
      if (!status.video?.respect_moderation) {
        throw new Error("El video fue filtrado por moderacion de contenido");
      }
      const videoUrl = status.video?.url;
      if (!videoUrl) {
        throw new Error("El video termino, pero no devolvio URL");
      }
      console.log(`[BrickEx:Grok] Video ready: ${videoUrl}`);
      return videoUrl;
    }

    if (status.status === "expired") {
      throw new Error("La solicitud de generacion de video expiro");
    }

    console.log(
      `[BrickEx:Grok] Status: ${status.status} (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`
    );

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(
    "La generacion de video agoto el tiempo de espera. El video podria seguir procesandose; intentalo de nuevo en unos minutos."
  );
}
