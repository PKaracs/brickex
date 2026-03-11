"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Zap, Crown, Lock } from "lucide-react";

export type VideoModel = "pro" | "std";

interface ModelOption {
  id: VideoModel;
  label: string;
  subtitle: string;
  description: string;
  icon: typeof Crown;
  features: string[];
  gradient: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "pro",
    label: "Kling v3 Pro",
    subtitle: "Best Quality",
    description:
      "Higher quality output with support for start and end frames. Ideal for cinematic results.",
    icon: Crown,
    features: [
      "Start + End frame support",
      "Higher visual quality",
      "~60s generation time",
      "Native audio generation",
    ],
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
  },
  {
    id: "std",
    label: "Kling v3 Standard",
    subtitle: "Faster",
    description:
      "Fast generation for quick iterations. Image-to-video only.",
    icon: Zap,
    features: [
      "Image to video only",
      "Faster generation",
      "~30s generation time",
      "Native audio generation",
    ],
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
  },
];

function ModelCard({
  option,
  isSelected,
  isDisabled,
  disabledReason,
  onSelect,
}: {
  option: ModelOption;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <button
      onClick={isDisabled ? undefined : onSelect}
      disabled={isDisabled}
      className={cn(
        "group relative flex flex-col rounded-2xl border text-left transition-all duration-200 overflow-hidden",
        isDisabled
          ? "opacity-50 cursor-not-allowed border-neutral-800/50 bg-neutral-900/30"
          : isSelected
            ? "border-white/20 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.4)]"
            : "border-neutral-800 bg-neutral-800/30 hover:border-neutral-700 hover:bg-neutral-800/50 active:scale-[0.98]"
      )}
    >
      <div
        className={cn(
          "relative w-full px-5 pt-5 pb-4 bg-gradient-to-br",
          option.gradient
        )}
      >
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
              isSelected
                ? "bg-white/15 text-white"
                : "bg-neutral-700/50 text-neutral-400 group-hover:text-neutral-300"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          {isSelected && !isDisabled && (
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.3)]">
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
          {isDisabled && (
            <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center">
              <Lock className="w-3 h-3 text-neutral-500" />
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-semibold",
                isSelected ? "text-white" : "text-neutral-200"
              )}
            >
              {option.label}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 bg-neutral-800/60 px-1.5 py-0.5 rounded">
              {option.subtitle}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
            {option.description}
          </p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-2">
        {option.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <div
              className={cn(
                "w-1 h-1 rounded-full",
                isSelected ? "bg-white/60" : "bg-neutral-600"
              )}
            />
            <span className="text-xs text-neutral-400">{feature}</span>
          </div>
        ))}
        {isDisabled && disabledReason && (
          <p className="text-[11px] text-amber-500/80 mt-2 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            {disabledReason}
          </p>
        )}
      </div>
    </button>
  );
}

interface SelectVideoModelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (model: VideoModel) => void;
  currentModel: VideoModel;
  isEndFrameMode: boolean;
}

export function SelectVideoModelModal({
  open,
  onOpenChange,
  onSelect,
  currentModel,
  isEndFrameMode,
}: SelectVideoModelModalProps) {
  const [selectedId, setSelectedId] = useState<VideoModel>(currentModel);

  useEffect(() => {
    if (open) setSelectedId(currentModel);
  }, [open, currentModel]);

  const handleSelect = (model: VideoModel) => {
    setSelectedId(model);
    onSelect(model);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full md:w-[80vw] bg-neutral-950 border-neutral-800 flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-0">
          <DialogTitle className="text-lg text-white">
            Choose Video Model
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-1">
            Select the AI model for your video generation
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODEL_OPTIONS.map((option) => {
              const isDisabled =
                isEndFrameMode && option.id === "std";
              return (
                <ModelCard
                  key={option.id}
                  option={option}
                  isSelected={selectedId === option.id}
                  isDisabled={isDisabled}
                  disabledReason={
                    isDisabled
                      ? "Pro required for Start + End Frame"
                      : undefined
                  }
                  onSelect={() => handleSelect(option.id)}
                />
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
