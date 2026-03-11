"use client";

import type { ReactNode } from "react";
import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from "canvas-confetti";
import confettiLib from "canvas-confetti";

// Safe wrapper - handle cases where confetti might not be available
const confetti = typeof confettiLib === "function" ? confettiLib : null;

import { Button } from "@/components/ui/button";

type Api = {
  fire: (options?: ConfettiOptions) => void;
};

type Props = React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions;
  globalOptions?: ConfettiGlobalOptions;
  manualstart?: boolean;
  children?: ReactNode;
};

export type ConfettiRef = Api | null;

const ConfettiContext = createContext<Api>({} as Api);

// Define component first
const ConfettiComponent = forwardRef<ConfettiRef, Props>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);

  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return;
        if (!confetti) {
          console.warn("[Confetti] Not available");
          return;
        }
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else {
        if (instanceRef.current) {
          instanceRef.current.reset();
          instanceRef.current = null;
        }
      }
    },
    [globalOptions]
  );

  const fire = useCallback(
    async (opts = {}) => {
      try {
        await instanceRef.current?.({ ...options, ...opts });
      } catch (error) {
        console.error("Confetti error:", error);
      }
    },
    [options]
  );

  const api = useMemo(
    () => ({
      fire,
    }),
    [fire]
  );

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    if (!manualstart) {
      (async () => {
        try {
          await fire();
        } catch (error) {
          console.error("Confetti effect error:", error);
        }
      })();
    }
  }, [manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasRef} {...rest} />
      {children}
    </ConfettiContext.Provider>
  );
});

// Set display name immediately
ConfettiComponent.displayName = "Confetti";

// Export as Confetti
export const Confetti = ConfettiComponent;

interface ConfettiButtonProps extends React.ComponentProps<"button"> {
  options?: ConfettiOptions &
    ConfettiGlobalOptions & { canvas?: HTMLCanvasElement };
}

const ConfettiButtonComponent = ({
  options,
  children,
  ...props
}: ConfettiButtonProps) => {
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!confetti || typeof window === "undefined") {
      console.warn("[Confetti] Not available");
      return;
    }
    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      await confetti({
        ...options,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
      });
    } catch (error) {
      // Non-critical - just log
      console.warn("[Confetti] Button error:", error);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};

ConfettiButtonComponent.displayName = "ConfettiButton";

export const ConfettiButton = ConfettiButtonComponent;

// Helper function to fire confetti from anywhere
export async function fireConfetti(options?: ConfettiOptions) {
  // Early return if not in browser environment
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Check if confetti is available
    if (!confetti || typeof confetti !== "function") {
      console.warn("[Confetti] Not available in this environment");
      return;
    }

    await confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      ...options,
    });
  } catch (error) {
    // Non-critical - just log and continue
    console.warn("[Confetti] Error:", error);
  }
}

// Subtle celebration confetti for first generation
// This is non-critical - failures should NOT break the app
export async function fireFirstGenConfetti() {
  // Early return if not in browser environment
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Check if confetti is available (might fail on some browsers/deployments)
    if (!confetti || typeof confetti !== "function") {
      console.warn("[Confetti] Not available in this environment");
      return;
    }

    // Additional safety check for canvas support
    if (typeof document === "undefined" || !document.createElement) {
      console.warn("[Confetti] Document not available");
      return;
    }

    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    let intervalId: NodeJS.Timeout | number | null = null;

    try {
      intervalId = window.setInterval(async () => {
        try {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
            return;
          }

          const particleCount = 50 * (timeLeft / duration);

          // Fire from both sides with error handling
          try {
            await confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
          } catch (e) {
            // Silently fail individual confetti calls
          }

          try {
            await confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
          } catch (e) {
            // Silently fail individual confetti calls
          }
        } catch (e) {
          // If interval callback fails, clean up
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      }, 250);

      // Safety timeout to ensure cleanup
      setTimeout(() => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, duration + 500);
    } catch (error) {
      // Clean up interval if setup fails
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      throw error;
    }
  } catch (error) {
    // Non-critical - just log and continue (never throw)
    console.warn("[Confetti] Error:", error);
  }
}






