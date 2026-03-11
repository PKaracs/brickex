"use client";

import { cn } from "@/lib/utils";
import type { VideoPreset } from "@/lib/constants/video-presets";

interface PresetCardProps {
  preset: VideoPreset;
  isSelected: boolean;
  onSelect: () => void;
}

export function PresetCard({ preset, isSelected, onSelect }: PresetCardProps) {
  const Icon = preset.icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col rounded-2xl border text-left transition-all duration-200 active:scale-[0.97] overflow-hidden",
        isSelected
          ? "border-white/20 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
          : "border-neutral-800/60 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-800/50"
      )}
    >
      <div
        className={cn(
          "relative w-full aspect-[2.2/1] overflow-hidden flex items-center justify-center bg-gradient-to-br",
          preset.gradient
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />

        <div
          className={cn(
            "relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
            isSelected
              ? "bg-white/15 text-white scale-110"
              : "bg-white/5 text-neutral-400 group-hover:text-neutral-200 group-hover:bg-white/10 group-hover:scale-105"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
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

      <div className="px-3 py-2.5">
        <div
          className={cn(
            "text-[13px] font-semibold transition-colors",
            isSelected
              ? "text-white"
              : "text-neutral-300 group-hover:text-white"
          )}
        >
          {preset.label}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">
          {preset.description}
        </div>
      </div>
    </button>
  );
}
