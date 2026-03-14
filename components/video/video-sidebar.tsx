"use client";

import { useState, useRef, useCallback, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Settings2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Wand2,
  Film,
  Download,
  RotateCcw,
} from "lucide-react";
import {
  VIDEO_PRESETS,
  VIDEO_SCENE_PRESETS,
  type VideoScenePreset,
} from "@/lib/constants/video-presets";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SelectVideoPresetModal } from "@/components/modals/select-video-preset-modal";

export interface VideoSidebarProps {
  selectedPresetId: string | null;
  onPresetSelect: (id: string | null) => void;
  selectedScenePresetId: string | null;
  onScenePresetSelect: (preset: VideoScenePreset | null) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  resolution: string;
  onResolutionChange: (res: string) => void;
  isGenerating: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
  videoUrl: string | null;
  onDownload: () => void;
  onNewVideo: () => void;
}

const DURATIONS = [3, 5, 7, 10, 15];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
];

const RESOLUTIONS = [
  { value: "480p", label: "480p" },
  { value: "720p", label: "720p" },
];

const CARD_H = 72;
const GAP = 6;
const VISIBLE = 3;
const CONTAINER_H = CARD_H * VISIBLE + GAP * (VISIBLE - 1);

type PresetItem = {
  id: string | null;
  label: string;
  description: string;
  icon: typeof Wand2;
  gradient: string;
};

const ALL_ITEMS: PresetItem[] = [
  {
    id: null,
    label: "Default",
    description: "AI chooses the best motion",
    icon: Wand2,
    gradient: "from-neutral-500/20 to-neutral-800/20",
  },
  ...VIDEO_PRESETS.map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
    icon: p.icon,
    gradient: p.gradient,
  })),
];

function PresetSlotMachine({
  selectedPresetId,
  onPresetSelect,
}: {
  selectedPresetId: string | null;
  onPresetSelect: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeIdx = Math.max(
    0,
    ALL_ITEMS.findIndex((p) => p.id === selectedPresetId)
  );

  const scrollToIdx = useCallback((idx: number, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * (CARD_H + GAP), behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    scrollToIdx(activeIdx, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isUserScrolling.current) scrollToIdx(activeIdx);
  }, [activeIdx, scrollToIdx]);

  const handleScroll = useCallback(() => {
    isUserScrolling.current = true;
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const snapped = Math.round(el.scrollTop / (CARD_H + GAP));
      const clamped = Math.max(0, Math.min(snapped, ALL_ITEMS.length - 1));
      el.scrollTo({ top: clamped * (CARD_H + GAP), behavior: "smooth" });
      onPresetSelect(ALL_ITEMS[clamped].id);
      setTimeout(() => {
        isUserScrolling.current = false;
      }, 250);
    }, 100);
  }, [onPresetSelect]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(ALL_ITEMS.length - 1, activeIdx + dir));
      onPresetSelect(ALL_ITEMS[next].id);
    },
    [activeIdx, onPresetSelect]
  );

  const handleArrow = useCallback(
    (dir: -1 | 1) => {
      const next = Math.max(0, Math.min(ALL_ITEMS.length - 1, activeIdx + dir));
      onPresetSelect(ALL_ITEMS[next].id);
    },
    [activeIdx, onPresetSelect]
  );

  return (
    <div className="relative">
      <button
        onClick={() => handleArrow(-1)}
        disabled={activeIdx === 0}
        className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-neutral-900/95 border border-neutral-700/60 flex items-center justify-center hover:bg-neutral-800 transition-all disabled:opacity-0 disabled:pointer-events-none backdrop-blur-sm shadow-lg"
      >
        <ChevronUp className="w-4 h-4 text-neutral-300" />
      </button>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="overflow-y-auto scrollbar-none"
        style={{
          height: CONTAINER_H,
          scrollSnapType: "y mandatory",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      >
        <div style={{ height: CARD_H + GAP }} />

        {ALL_ITEMS.map((item, idx) => {
          const isCurrent = idx === activeIdx;
          const dist = Math.abs(idx - activeIdx);
          const Icon = item.icon;

          return (
            <div
              key={item.id ?? "_default"}
              onClick={() => onPresetSelect(item.id)}
              className="cursor-pointer"
              style={{
                height: CARD_H,
                marginBottom: GAP,
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
              }}
            >
              <div
                className={cn(
                  "relative w-full h-full flex items-center gap-3 rounded-2xl border px-4 transition-all duration-200 overflow-hidden",
                  isCurrent
                    ? "border-white/15 bg-white/[0.07] scale-[1.03]"
                    : dist === 1
                      ? "border-neutral-800/30 bg-neutral-900/20 scale-[0.96] opacity-50"
                      : "border-transparent bg-neutral-900/10 scale-[0.92] opacity-20"
                )}
              >
                {isCurrent && (
                  <div className={cn("absolute inset-0 bg-gradient-to-r opacity-30 pointer-events-none", item.gradient)} />
                )}

                <div
                  className={cn(
                    "relative flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-200",
                    isCurrent ? "w-12 h-12 bg-white/10" : "w-10 h-10 bg-neutral-800/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-all duration-200",
                      isCurrent ? "w-5 h-5 text-white" : "w-[18px] h-[18px] text-neutral-500"
                    )}
                  />
                </div>

                <div className="relative flex-1 min-w-0 text-left">
                  <div
                    className={cn(
                      "font-semibold leading-tight truncate transition-colors duration-200",
                      isCurrent ? "text-[14px] text-white" : "text-[13px] text-neutral-500"
                    )}
                  >
                    {item.label}
                  </div>
                  <div
                    className={cn(
                      "text-[11px] mt-0.5 leading-tight truncate",
                      isCurrent ? "text-neutral-400" : "text-neutral-600"
                    )}
                  >
                    {item.description}
                  </div>
                </div>

                <div className="relative flex-shrink-0 w-[18px] h-[18px]">
                  {isCurrent && (
                    <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center">
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ height: CARD_H + GAP }} />
      </div>

      <button
        onClick={() => handleArrow(1)}
        disabled={activeIdx === ALL_ITEMS.length - 1}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-neutral-900/95 border border-neutral-700/60 flex items-center justify-center hover:bg-neutral-800 transition-all disabled:opacity-0 disabled:pointer-events-none backdrop-blur-sm shadow-lg"
      >
        <ChevronDown className="w-4 h-4 text-neutral-300" />
      </button>
    </div>
  );
}

function ScenePresetSelectorCard({
  selectedScenePresetId,
  onScenePresetSelect,
}: {
  selectedScenePresetId: string | null;
  onScenePresetSelect: (preset: VideoScenePreset | null) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const activePreset = selectedScenePresetId
    ? VIDEO_SCENE_PRESETS.find((p) => p.id === selectedScenePresetId) ?? null
    : null;

  const Icon = activePreset?.icon ?? Film;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "group relative w-full rounded-xl border transition-all duration-200 overflow-hidden",
          activePreset
            ? "bg-white/[0.05] border-white/15 hover:border-white/25"
            : "bg-neutral-800/40 border-neutral-700/50 hover:border-neutral-600",
          "hover:bg-neutral-800/60 active:scale-[0.98]"
        )}
      >
        {activePreset && (
          <div className={cn("absolute inset-0 bg-gradient-to-r opacity-20 pointer-events-none", activePreset.gradient)} />
        )}
        <div className="relative flex items-center gap-3 p-2.5">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
              activePreset
                ? "bg-white/10"
                : "bg-gradient-to-br from-neutral-700 to-neutral-800"
            )}
          >
            <Icon className="w-5 h-5 text-neutral-300" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold leading-none">
              Video Preset
            </div>
            <div className="text-sm font-semibold text-white mt-1 truncate">
              {activePreset ? activePreset.label : "None selected"}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors flex-shrink-0" />
        </div>
      </button>

      <SelectVideoPresetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={(preset) => onScenePresetSelect(preset)}
        currentPresetId={selectedScenePresetId}
      />
    </>
  );
}

function SidebarContent({
  selectedPresetId,
  onPresetSelect,
  selectedScenePresetId,
  onScenePresetSelect,
  prompt,
  onPromptChange,
  duration,
  onDurationChange,
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  isGenerating,
  canGenerate,
  onGenerate,
  videoUrl,
  onDownload,
  onNewVideo,
}: VideoSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-5 space-y-5">
        <ScenePresetSelectorCard
          selectedScenePresetId={selectedScenePresetId}
          onScenePresetSelect={onScenePresetSelect}
        />

        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2.5 block">
            Motion Preset
          </label>
          <PresetSlotMachine selectedPresetId={selectedPresetId} onPresetSelect={onPresetSelect} />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the motion you want..."
            rows={3}
            className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-neutral-600 resize-none transition-colors"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Settings
          </label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Duration</span>
            <div className="flex gap-1">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => onDurationChange(d)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                    duration === d
                      ? "bg-white/10 text-white border border-neutral-700/50"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                  )}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Aspect Ratio</span>
            <div className="flex gap-1">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onAspectRatioChange(r.value)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                    aspectRatio === r.value
                      ? "bg-white/10 text-white border border-neutral-700/50"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Resolution</span>
            <div className="flex gap-1">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onResolutionChange(r.value)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors",
                    resolution === r.value
                      ? "bg-white/10 text-white border border-neutral-700/50"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 p-5 pt-3 border-t border-neutral-800/50">
        {videoUrl ? (
          <div className="space-y-2">
            <button
              onClick={onDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              Download Video
            </button>
            <button
              onClick={onNewVideo}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              New Video
            </button>
          </div>
        ) : (
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
              canGenerate && !isGenerating
                ? "bg-white text-black hover:bg-neutral-200 active:scale-[0.98]"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Video
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function VideoSidebar(props: VideoSidebarProps) {
  return (
    <div className="hidden md:flex w-96 border-l border-neutral-800/50 bg-neutral-950 flex-col overflow-hidden">
      <SidebarContent {...props} />
    </div>
  );
}

export const VideoMobileBottomBar = memo(function VideoMobileBottomBar(props: VideoSidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isGenerating, canGenerate, onGenerate, videoUrl, onDownload, onNewVideo } = props;

  return (
    <div className="md:hidden fixed bottom-2 left-3 right-3 z-40 bg-neutral-900 border border-neutral-800 rounded-2xl px-3 py-3">
      <div className="flex items-center gap-2">
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors">
              <Settings2 className="w-4 h-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-neutral-950 border-neutral-800 h-[85vh] rounded-t-2xl p-0">
            <SidebarContent {...props} />
          </SheetContent>
        </Sheet>
        {videoUrl ? (
          <>
            <button
              onClick={onDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onNewVideo}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
              canGenerate && !isGenerating
                ? "bg-white text-black hover:bg-neutral-200 active:scale-[0.98]"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Video
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
