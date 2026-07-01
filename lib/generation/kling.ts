import jwt from "jsonwebtoken";

const KLING_API_BASE = "https://api-singapore.klingai.com";

function getKlingToken(): string {
  const ak = process.env.KLING_ACCESS_KEY;
  const sk = process.env.KLING_SECRET_KEY;
  if (!ak || !sk) {
    throw new Error("KLING_ACCESS_KEY y KLING_SECRET_KEY deben estar configuradas");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ak,
    exp: now + 1800,
    nbf: now - 5,
  };

  return jwt.sign(payload, sk, {
    algorithm: "HS256",
    header: { alg: "HS256", typ: "JWT" },
  });
}

export interface KlingVideoParams {
  image: string;
  imageTail?: string;
  prompt: string;
  negativePrompt?: string;
  duration?: number;
  mode?: "std" | "pro";
}

interface KlingSubmitResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: string;
  };
}

interface KlingStatusResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    task_id: string;
    task_status: string;
    task_status_msg?: string;
    task_result?: {
      videos?: {
        id: string;
        url: string;
        duration: string;
      }[];
    };
  };
}

export async function submitVideoGeneration(
  params: KlingVideoParams
): Promise<string> {
  const token = getKlingToken();

  const body: Record<string, unknown> = {
    model_name: "kling-v3",
    mode: params.mode ?? "pro",
    image: params.image,
    prompt: params.prompt || "",
    negative_prompt: params.negativePrompt ?? "borroso, distorsionado y baja calidad",
    duration: String(params.duration ?? 5),
  };

  if (params.imageTail) {
    body.image_tail = params.imageTail;
  }

  console.log(
    `[BrickEx:Kling] Submitting video generation (mode=${body.mode}, duration=${body.duration}s)`
  );

  const response = await fetch(`${KLING_API_BASE}/v1/videos/image2video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[BrickEx:Kling] Submit failed (${response.status}):`, text);
    throw new Error(`Error de API de video: ${response.status}`);
  }

  const result: KlingSubmitResponse = await response.json();
  if (result.code !== 0) {
    console.error(`[BrickEx:Kling] API error:`, result.message);
    throw new Error(result.message || "La API de video devolvio un error");
  }

  console.log(`[BrickEx:Kling] Task submitted: ${result.data.task_id}`);
  return result.data.task_id;
}

export async function getVideoStatus(
  taskId: string
): Promise<KlingStatusResponse["data"]> {
  const token = getKlingToken();

  const response = await fetch(
    `${KLING_API_BASE}/v1/videos/image2video/${taskId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`[BrickEx:Kling] Status check failed (${response.status}):`, text);
    throw new Error(`Error al consultar el estado del video: ${response.status}`);
  }

  const result: KlingStatusResponse = await response.json();
  if (result.code !== 0) {
    throw new Error(result.message || "Error al consultar el estado del video");
  }

  return result.data;
}

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_TIME_MS = 10 * 60 * 1000;

export async function pollForVideoResult(taskId: string): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME_MS) {
    const status = await getVideoStatus(taskId);

    if (status.task_status === "succeed") {
      const videoUrl = status.task_result?.videos?.[0]?.url;
      if (!videoUrl) {
        throw new Error("El video termino, pero no devolvio URL");
      }
      console.log(`[BrickEx:Kling] Video ready: ${videoUrl}`);
      return videoUrl;
    }

    if (status.task_status === "failed") {
      console.error(`[BrickEx:Kling] Task failed:`, status.task_status_msg);
      throw new Error(status.task_status_msg || "La generacion de video fallo");
    }

    console.log(
      `[BrickEx:Kling] Status: ${status.task_status} (${Math.round((Date.now() - startTime) / 1000)}s elapsed)`
    );

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error("La generacion de video agoto el tiempo de espera. El video podria seguir procesandose; intentalo de nuevo en unos minutos.");
}
