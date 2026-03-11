"use client";

import { useEffect, useState } from "react";

function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.font = "11pt Arial";
    ctx.fillText("RichFlex", 2, 15);

    return simpleHash(canvas.toDataURL());
  } catch {
    return "canvas-error";
  }
}

function collectFingerprint(): string {
  const components: (string | number)[] = [
    window.screen.width,
    window.screen.height,
    window.screen.colorDepth,
    window.devicePixelRatio || 1,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.platform,
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
    getCanvasFingerprint(),
  ];

  return simpleHash(components.join("|"));
}

export function useDeviceFingerprint(): {
  fingerprint: string | null;
  isLoading: boolean;
} {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setFingerprint(collectFingerprint());
      } catch {
        setFingerprint("error");
      } finally {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return { fingerprint, isLoading };
}

export function getDeviceFingerprint(): string {
  try {
    return collectFingerprint();
  } catch {
    return "error";
  }
}
