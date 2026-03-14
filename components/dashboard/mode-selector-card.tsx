"use client";

import { Building2, Armchair } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RENDER_MODES,
  type RenderMode,
} from "@/lib/constants/render-modes";

const EXTERIOR = RENDER_MODES.find((m) => m.id === "exterior-render")!;
const INTERIOR = RENDER_MODES.find((m) => m.id === "interior-render")!;

interface ModeSelectorCardProps {
  currentMode: RenderMode | null;
  onModeChange: (mode: RenderMode) => void;
}

export function ModeSelectorCard({
  currentMode,
  onModeChange,
}: ModeSelectorCardProps) {
  const activeId = currentMode?.id ?? EXTERIOR.id;

  return (
    <div className="flex items-center w-full rounded-xl bg-neutral-800/50 p-1 border border-neutral-700/40">
      <button
        onClick={() => onModeChange(EXTERIOR)}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
          activeId === "exterior-render"
            ? "bg-white text-black shadow-sm"
            : "text-neutral-400 hover:text-white"
        )}
      >
        <Building2 className="w-3.5 h-3.5" />
        Exterior
      </button>
      <button
        onClick={() => onModeChange(INTERIOR)}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
          activeId === "interior-render"
            ? "bg-white text-black shadow-sm"
            : "text-neutral-400 hover:text-white"
        )}
      >
        <Armchair className="w-3.5 h-3.5" />
        Interior
      </button>
    </div>
  );
}
