"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SelectModeModal,
} from "@/components/modals/select-mode-modal";
import {
  RENDER_MODES,
  type RenderMode,
} from "@/lib/constants/render-modes";

interface ModeSelectorCardProps {
  currentMode: RenderMode | null;
  onModeChange: (mode: RenderMode) => void;
}

export function ModeSelectorCard({
  currentMode,
  onModeChange,
}: ModeSelectorCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const displayMode = currentMode ?? RENDER_MODES[0];
  const Icon = displayMode.icon;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "group relative w-full rounded-xl border transition-all duration-200 overflow-hidden",
          "bg-neutral-800/40 border-neutral-700/50 hover:border-neutral-600",
          "hover:bg-neutral-800/60 active:scale-[0.98]"
        )}
      >
        <div className="flex items-center gap-3 p-2.5">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
            <Icon className="w-5 h-5 text-neutral-300" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold leading-none">
              Mode
            </div>
            <div className="text-sm font-semibold text-white mt-1 truncate">
              {displayMode.label}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors flex-shrink-0" />
        </div>
      </button>

      <SelectModeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={onModeChange}
        currentMode={currentMode}
      />
    </>
  );
}
