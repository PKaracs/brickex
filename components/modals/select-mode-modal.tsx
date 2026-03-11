"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  RENDER_MODES,
  MODE_CATEGORIES,
  type RenderMode,
} from "@/lib/constants/render-modes";

export type { RenderMode } from "@/lib/constants/render-modes";
export { RENDER_MODES } from "@/lib/constants/render-modes";

function ModeCard({
  mode,
  isSelected,
  onSelect,
}: {
  mode: RenderMode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = mode.icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] overflow-hidden",
        isSelected
          ? "border-white/25 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.4)]"
          : "border-neutral-800 bg-neutral-800/30 hover:border-neutral-700 hover:bg-neutral-800/50"
      )}
    >
      {/* Preview area with icon */}
      <div className="relative w-full aspect-[2/1] overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
          isSelected
            ? "bg-white/10 text-white"
            : "bg-neutral-700/50 text-neutral-500 group-hover:text-neutral-400 group-hover:bg-neutral-700/70"
        )}>
          <Icon className="w-7 h-7" />
        </div>
        {isSelected && (
          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.3)]">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className={cn(
          "text-sm font-semibold transition-colors",
          isSelected ? "text-white" : "text-neutral-200 group-hover:text-white"
        )}>
          {mode.label}
        </div>
        <div className="text-xs text-neutral-500 mt-1 leading-relaxed">
          {mode.description}
        </div>
      </div>
    </button>
  );
}

interface SelectModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mode: RenderMode) => void;
  currentMode?: RenderMode | null;
}

export function SelectModeModal({
  open,
  onOpenChange,
  onSelect,
  currentMode,
}: SelectModeModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    currentMode?.id ?? null
  );

  useEffect(() => {
    if (open) {
      setSelectedId(currentMode?.id ?? null);
    }
  }, [open, currentMode]);

  const handleSelect = (mode: RenderMode) => {
    setSelectedId(mode.id);
    onSelect(mode);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full md:w-[88vw] max-h-[80vh] bg-neutral-950 border-neutral-800 flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-0">
          <DialogTitle className="text-lg text-white">
            Choose a Mode
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-1">
            Select how you want to transform your project
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-none px-6 pb-6 pt-5">
          <div className="space-y-6">
            {MODE_CATEGORIES.map((cat) => {
              const modes = RENDER_MODES.filter((m) => m.category === cat.key);
              if (modes.length === 0) return null;
              return (
                <div key={cat.key}>
                  <h3 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                    {cat.label}
                  </h3>
                  <div className={cn(
                    "grid gap-3",
                    modes.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-1 sm:grid-cols-2"
                  )}>
                    {modes.map((mode) => (
                      <ModeCard
                        key={mode.id}
                        mode={mode}
                        isSelected={selectedId === mode.id}
                        onSelect={() => handleSelect(mode)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
