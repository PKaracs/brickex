"use client";

import { supabaseClient } from "@/lib/supabase-client";
import { useEffect, useState, useRef } from "react";
import {
  getProjectLatestOutput,
  getProjectGenerationStatus,
} from "@/lib/actions/get-project";

type GenerationStatus = "idle" | "queued" | "running" | "succeeded" | "failed";

interface UseGenerationRealtimeResult {
  status: GenerationStatus;
  outputUrl: string | null;
  flexWorth: number | null;
  flexBreakdown: Record<string, number> | null;
  isGenerating: boolean;
}

/**
 * Hook to track generation status in realtime via Supabase.
 * This allows users to navigate away during generation and see the
 * correct state (loading or completed image) when they return.
 *
 * @param projectId - The project ID to track generations for
 * @returns { status, outputUrl, flexWorth, flexBreakdown, isGenerating }
 */
export function useGenerationRealtime(
  projectId: string | undefined
): UseGenerationRealtimeResult {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [flexWorth, setFlexWorth] = useState<number | null>(null);
  const [flexBreakdown, setFlexBreakdown] = useState<Record<
    string,
    number
  > | null>(null);

  // Track if we've already fetched initial state to avoid duplicate fetches
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!projectId) return;

    // Reset state when project changes
    initialFetchDone.current = false;
    setStatus("idle");
    setOutputUrl(null);

    // Check initial state - active generation OR existing output
    const checkInitial = async () => {
      if (initialFetchDone.current) return;
      initialFetchDone.current = true;

      try {
        // First check if there's an active generation (queued/running)
        const genStatus = await getProjectGenerationStatus(projectId);
        console.log(
          "[useGenerationRealtime] Initial generation status:",
          genStatus
        );

        if (genStatus.status === "queued" || genStatus.status === "running") {
          // There's an active generation - show loading state
          setStatus(genStatus.status);
          console.log(
            "[useGenerationRealtime] Active generation found, showing loading"
          );
          return;
        }

        if (genStatus.status === "succeeded") {
          // Generation completed - fetch the output
          const output = await getProjectLatestOutput(projectId);
          if (output.url) {
            setOutputUrl(output.url);
            setFlexWorth(output.flexWorth);
            setFlexBreakdown(output.flexBreakdown);
            setStatus("succeeded");
            console.log("[useGenerationRealtime] Found existing output");
          }
          return;
        }

        // No active or completed generation - check for any existing output
        const output = await getProjectLatestOutput(projectId);
        if (output.url) {
          setOutputUrl(output.url);
          setFlexWorth(output.flexWorth);
          setFlexBreakdown(output.flexBreakdown);
          setStatus("succeeded");
          console.log(
            "[useGenerationRealtime] Found existing output (fallback)"
          );
        }
      } catch (error) {
        console.error(
          "[useGenerationRealtime] Failed to check initial state:",
          error
        );
      }
    };
    checkInitial();

    // Subscribe to realtime changes on project_generations table
    const channel = supabaseClient
      .channel(`gen_${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_generations",
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          const newStatus = (payload.new as { status?: string })?.status as
            | GenerationStatus
            | undefined;

          if (!newStatus) return;

          console.log("[useGenerationRealtime] Status changed:", newStatus);
          setStatus(newStatus);

          if (newStatus === "succeeded") {
            // Fetch the output with flex data
            try {
              const output = await getProjectLatestOutput(projectId);
              setOutputUrl(output.url);
              setFlexWorth(output.flexWorth);
              setFlexBreakdown(output.flexBreakdown);
            } catch (error) {
              console.error(
                "[useGenerationRealtime] Failed to fetch output:",
                error
              );
            }
          }
        }
      )
      .subscribe((subscriptionStatus) => {
        console.log(
          "[useGenerationRealtime] Subscription status:",
          subscriptionStatus
        );
      });

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [projectId]);

  const isGenerating = status === "queued" || status === "running";

  return {
    status,
    outputUrl,
    flexWorth,
    flexBreakdown,
    isGenerating,
  };
}






