"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getProjectLatestOutput } from "@/lib/actions/get-project";

interface GenerationOutput {
  url: string | null;
  flexWorth: number | null;
  flexBreakdown: Record<string, number> | null;
}

export function useGenerationSubscription(
  generationId: string | null,
  projectId: string,
  onComplete: (output: GenerationOutput) => void,
  onError: () => void
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  return { isSubscribed };
}
