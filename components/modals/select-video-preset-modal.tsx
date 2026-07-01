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
  VIDEO_SCENE_PRESETS,
  type VideoScenePreset,
} from "@/lib/constants/video-presets";

function ScenePresetCard({
  preset,
  isSelected,
  onSelect,
}: {
  preset: VideoScenePreset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = preset.icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col rounded-2xl border text-left transition-all duration-200 overflow-hidden",
        isSelected
          ? "border-white/20 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.4)]"
          : "border-neutral-800 bg-neutral-800/30 hover:border-neutral-700 hover:bg-neutral-800/50 active:scale-[0.98]"
      )}
    >
      {/* Preview area */}
      <div
        className={cn(
          "relative w-full aspect-[2.2/1] overflow-hidden bg-gradient-to-br flex items-center justify-center",
          preset.gradient.replace(/\/30/g, "/20"),
          "from-neutral-800 to-neutral-900"
        )}
      >
        {preset.previewUrl ? (
          <video
            src={preset.previewUrl}
            muted
            loop
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br opacity-60" style={{
              backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
            }} />
            <div
              className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-white/15 text-white"
                  : "bg-neutral-700/50 text-neutral-500 group-hover:text-neutral-400 group-hover:bg-neutral-700/70"
              )}
            >
              <Icon className="w-7 h-7" />
            </div>
          </>
        )}

        {isSelected && (
          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.3)]">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "text-sm font-semibold transition-colors",
              isSelected
                ? "text-white"
                : "text-neutral-200 group-hover:text-white"
            )}
          >
            {preset.label}
          </span>
        </div>
        <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
          {preset.tagline}
        </p>
        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
          {preset.description}
        </p>
      </div>
    </button>
  );
}

interface SelectVideoPresetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (preset: VideoScenePreset) => void;
  currentPresetId?: string | null;
}

export function SelectVideoPresetModal({
  open,
  onOpenChange,
  onSelect,
  currentPresetId,
}: SelectVideoPresetModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    currentPresetId ?? null
  );

  useEffect(() => {
    if (open) {
      setSelectedId(currentPresetId ?? null);
    }
  }, [open, currentPresetId]);

  const handleSelect = (preset: VideoScenePreset) => {
    setSelectedId(preset.id);
    onSelect(preset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full md:w-[88vw] max-h-[80vh] bg-neutral-950 border-neutral-800 flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-0">
          <DialogTitle className="text-lg text-white">
            Presets de video
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-1">
            Elige un estilo de escena cinematica para tu edificio
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-none px-6 pb-6 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VIDEO_SCENE_PRESETS.map((preset) => (
              <ScenePresetCard
                key={preset.id}
                preset={preset}
                isSelected={selectedId === preset.id}
                onSelect={() => handleSelect(preset)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
