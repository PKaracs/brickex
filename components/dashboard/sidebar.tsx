"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Loader2,
  Plus,
  Download,
  Settings2,
  Share2,
  Pencil,
  SplitSquareHorizontal,
  ArrowUp,
  BoxSelect,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SubscriptionData } from "@/lib/actions/get-user-subscription";
import { ModeSelectorCard } from "@/components/dashboard/mode-selector-card";
import { ModeSettingsForm } from "@/components/dashboard/mode-settings-form";
import type { RenderMode } from "@/lib/constants/render-modes";
import { getModeSettings, RENDER_MODES } from "@/lib/constants/render-modes";
import { cn } from "@/lib/utils";

// ============================================================
// EDIT SIDEBAR (shown when a generated image exists)
// ============================================================

interface EditSidebarProps {
  globalPrompt: string;
  onGlobalPromptChange: (value: string) => void;
  onGlobalEditSubmit: () => void;
  isEditGenerating: boolean;
  hasSelection: boolean;
  onToggleCompare: () => void;
  isComparing: boolean;
  onDownload: () => void;
  onNewProject: () => void;
  subscription?: SubscriptionData | null;
}

const EditSidebar = memo(function EditSidebar({
  globalPrompt,
  onGlobalPromptChange,
  onGlobalEditSubmit,
  isEditGenerating,
  hasSelection,
  onToggleCompare,
  isComparing,
  onDownload,
  onNewProject,
}: EditSidebarProps) {
  return (
    <div className="w-96 border-l border-neutral-800/50 bg-neutral-950 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-5 space-y-5">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Pencil className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-white">Edit Render</h2>
          </div>
          <p className="text-xs text-neutral-500">
            Select a region on the image for targeted edits, or use the prompt
            below for global changes.
          </p>
        </div>

        {/* Region edit hint */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
          <BoxSelect className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-xs text-neutral-300">
            {hasSelection
              ? "Region selected — use the prompt on the image"
              : "Draw a rectangle on the image for region edits"}
          </span>
        </div>

        {/* Global edit prompt */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Global Edit
          </label>
          <div className="relative">
            <textarea
              value={globalPrompt}
              onChange={(e) => onGlobalPromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && globalPrompt.trim()) {
                  e.preventDefault();
                  onGlobalEditSubmit();
                }
              }}
              placeholder="e.g. Make the lighting warmer, add more greenery..."
              rows={3}
              disabled={isEditGenerating}
              className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 resize-none outline-none focus:border-neutral-600 transition-colors disabled:opacity-50"
            />
          </div>
          <Button
            onClick={onGlobalEditSubmit}
            disabled={!globalPrompt.trim() || isEditGenerating}
            variant="default"
            className="w-full"
          >
            {isEditGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            {isEditGenerating ? "Applying..." : "Apply Edit"}
            {!isEditGenerating && (
              <span className="text-neutral-400 text-[10px] ml-1">
                (1 credit)
              </span>
            )}
          </Button>
        </div>

        {/* Compare */}
        <button
          onClick={onToggleCompare}
          className={cn(
            "w-full h-9 flex items-center justify-center gap-2 rounded-lg text-sm border transition-colors",
            isComparing
              ? "bg-white text-black border-white"
              : "text-neutral-400 hover:text-white bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800",
          )}
        >
          <SplitSquareHorizontal className="w-3.5 h-3.5" />
          {isComparing ? "Viewing Original" : "Compare with Original"}
        </button>
      </div>

      {/* Bottom actions */}
      <div className="flex-shrink-0 p-5 pt-3 border-t border-neutral-800/50">
        <div className="flex flex-col gap-2">
          <Button
            onClick={onDownload}
            size="sm"
            variant="secondary"
            className="w-full h-10 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button
            onClick={onNewProject}
            size="sm"
            variant="white"
            className="w-full h-10 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        </div>
      </div>
    </div>
  );
});

// ============================================================
// SETTINGS SIDEBAR (shown before generation)
// ============================================================

interface SidebarProps {
  onGenerate: () => void;
  onNewProject: () => void;
  onDownload: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
  hasGeneratedImage?: boolean;
  subscription?: SubscriptionData | null;
  currentMode: RenderMode | null;
  onModeChange: (mode: RenderMode) => void;
  modeValues: Record<string, string>;
  onModeValueChange: (key: string, value: string) => void;
  referenceFiles?: Record<string, File | null>;
  onReferenceFileChange?: (key: string, file: File | null) => void;
  objectFiles?: Record<string, File[]>;
  onObjectFileAdd?: (key: string, file: File) => void;
  onObjectFileRemove?: (key: string, index: number) => void;
  // Edit mode props
  globalPrompt?: string;
  onGlobalPromptChange?: (value: string) => void;
  onGlobalEditSubmit?: () => void;
  isEditGenerating?: boolean;
  hasSelection?: boolean;
  onToggleCompare?: () => void;
  isComparing?: boolean;
}

export const Sidebar = memo(function Sidebar({
  onGenerate,
  onNewProject,
  onDownload,
  isGenerating = false,
  canGenerate = true,
  hasGeneratedImage = false,
  subscription,
  currentMode,
  onModeChange,
  modeValues,
  onModeValueChange,
  referenceFiles,
  onReferenceFileChange,
  objectFiles,
  onObjectFileAdd,
  onObjectFileRemove,
  // Edit mode props
  globalPrompt = "",
  onGlobalPromptChange,
  onGlobalEditSubmit,
  isEditGenerating = false,
  hasSelection = false,
  onToggleCompare,
  isComparing = false,
}: SidebarProps) {
  const isDisabled = isGenerating || !canGenerate;
  const activeMode = currentMode ?? RENDER_MODES[0];
  const settings = getModeSettings(activeMode.id);

  if (hasGeneratedImage) {
    return (
      <EditSidebar
        globalPrompt={globalPrompt}
        onGlobalPromptChange={onGlobalPromptChange ?? (() => {})}
        onGlobalEditSubmit={onGlobalEditSubmit ?? (() => {})}
        isEditGenerating={isEditGenerating}
        hasSelection={hasSelection}
        onToggleCompare={onToggleCompare ?? (() => {})}
        isComparing={isComparing}
        onDownload={onDownload}
        onNewProject={onNewProject}
        subscription={subscription}
      />
    );
  }

  return (
    <div className="w-96 border-l border-neutral-800/50 bg-neutral-950 flex flex-col overflow-hidden">
      {/* Scrollable settings area */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none p-5 space-y-4">
        <ModeSelectorCard
          currentMode={currentMode}
          onModeChange={onModeChange}
        />

        {settings.length > 0 && (
          <ModeSettingsForm
            settings={settings}
            values={modeValues}
            onChange={onModeValueChange}
            disabled={isGenerating}
            referenceFiles={referenceFiles}
            onReferenceFileChange={onReferenceFileChange}
            objectFiles={objectFiles}
            onObjectFileAdd={onObjectFileAdd}
            onObjectFileRemove={onObjectFileRemove}
          />
        )}
      </div>

      {/* Bottom pinned: Generate button */}
      <div className="flex-shrink-0 p-5 pt-3 border-t border-neutral-800/50">
        <div className="flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={onGenerate}
                  size="lg"
                  variant="default"
                  className="w-full"
                  disabled={isDisabled}
                  data-fast-goal="generate_clicked"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </TooltipTrigger>
            {!canGenerate && (
              <TooltipContent
                side="top"
                className="bg-neutral-900 border-neutral-700 text-white"
              >
                Upload a source image first
              </TooltipContent>
            )}
          </Tooltip>
          {subscription?.plan === "free" && (
            <p className="text-[10px] text-neutral-500 text-center">
              {(subscription?.creationsUsed ?? 0) === 0
                ? "1 free render included · Upgrade anytime"
                : "Upgrade to create more"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

// ============================================================
// MOBILE BOTTOM BAR
// ============================================================

interface MobileBottomBarProps {
  onGenerate: () => void;
  onNewProject: () => void;
  onDownload: () => void;
  onShare?: () => void;
  isGenerating?: boolean;
  canGenerate?: boolean;
  hasGeneratedImage?: boolean;
  subscription?: SubscriptionData | null;
  currentMode: RenderMode | null;
  modeValues: Record<string, string>;
  onModeValueChange: (key: string, value: string) => void;
  // Edit mode
  globalPrompt?: string;
  onGlobalPromptChange?: (value: string) => void;
  onGlobalEditSubmit?: () => void;
  isEditGenerating?: boolean;
}

export const MobileBottomBar = memo(function MobileBottomBar({
  onGenerate,
  onNewProject,
  onDownload,
  onShare,
  isGenerating = false,
  canGenerate = true,
  hasGeneratedImage = false,
  subscription,
  currentMode,
  modeValues,
  onModeValueChange,
  globalPrompt = "",
  onGlobalPromptChange,
  onGlobalEditSubmit,
  isEditGenerating = false,
}: MobileBottomBarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDisabled = isGenerating || !canGenerate;
  const activeMode = currentMode ?? RENDER_MODES[0];
  const settings = getModeSettings(activeMode.id);

  if (hasGeneratedImage) {
    return (
      <div className="md:hidden fixed bottom-2 left-3 right-3 z-40 bg-neutral-900 border border-neutral-800 rounded-2xl px-3 py-3 space-y-2">
        {/* Global edit prompt */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={globalPrompt}
            onChange={(e) => onGlobalPromptChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && globalPrompt.trim()) {
                onGlobalEditSubmit?.();
              }
            }}
            placeholder="Describe a global edit..."
            disabled={isEditGenerating}
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none min-w-0"
          />
          <button
            onClick={onGlobalEditSubmit}
            disabled={!globalPrompt.trim() || isEditGenerating}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isEditGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-1.5">
          <div className="flex-1" />
          {onShare && (
            <button
              onClick={onShare}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white bg-neutral-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDownload}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white bg-neutral-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <Button
            onClick={onNewProject}
            size="sm"
            variant="white"
            className="h-9 text-xs px-3"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden fixed bottom-2 left-3 right-3 z-40 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSettingsOpen(true)}
              variant="secondary"
              size="icon"
              className="h-12 w-12 shrink-0"
              disabled={isGenerating}
            >
              <Settings2 className="h-5 w-5" />
            </Button>
            <Button
              onClick={onGenerate}
              variant="default"
              className="flex-1 h-12 text-base font-semibold"
              disabled={isDisabled}
              data-fast-goal="generate_clicked"
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-5 w-5 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
          {subscription?.plan === "free" && (
            <p className="text-[10px] text-neutral-500 text-center">
              {(subscription?.creationsUsed ?? 0) === 0
                ? "1 free render included · Upgrade anytime"
                : "Upgrade to create more"}
            </p>
          )}
        </div>
      </div>

      {/* Settings Bottom Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="bottom"
          className="bg-neutral-900 border-neutral-800 rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-neutral-600 rounded-full" />
          </div>
          <SheetHeader className="px-4 pb-2">
            <SheetTitle className="text-white text-lg">
              {activeMode.label} Settings
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <ModeSettingsForm
              settings={settings}
              values={modeValues}
              onChange={onModeValueChange}
              disabled={isGenerating}
            />
          </div>
          <div className="p-4 border-t border-neutral-800">
            <Button
              onClick={() => setSettingsOpen(false)}
              variant="white"
              className="w-full h-12"
            >
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});
