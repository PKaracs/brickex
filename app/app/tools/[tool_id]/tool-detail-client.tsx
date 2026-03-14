"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getToolById } from "@/lib/constants/tools";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  ArrowRight,
  Heart,
  Download,
  MoreVertical,
} from "lucide-react";

/* ─── Upload Zone ─────────────────────────────────────────────────────────── */

function UploadZone({
  files,
  onAdd,
  onRemove,
  multiUpload,
}: {
  files: (File | null)[];
  onAdd: (index: number) => void;
  onRemove: (index: number) => void;
  multiUpload?: boolean;
}) {
  const hasAnyFile = files.some(Boolean);

  if (hasAnyFile && multiUpload) {
    return (
      <div className="flex gap-3 flex-wrap">
        {files.map((file, i) => (
          <UploadedThumb
            key={i}
            file={file}
            onAdd={() => onAdd(i)}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>
    );
  }

  if (hasAnyFile) {
    const fileIndex = files.findIndex(Boolean);
    const file = files[fileIndex]!;
    return (
      <UploadedThumb
        file={file}
        onAdd={() => onAdd(fileIndex)}
        onRemove={() => onRemove(fileIndex)}
        large
      />
    );
  }

  return (
    <button
      onClick={() => onAdd(0)}
      className="w-full rounded-xl border border-dashed border-neutral-700 bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors py-14 sm:py-20 flex flex-col items-center justify-center gap-3"
    >
      <div className="w-10 h-10 rounded-full border border-dashed border-neutral-600 flex items-center justify-center">
        <Plus className="w-5 h-5 text-neutral-500" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Upload image or drag & drop
        </p>
        <p className="text-[11px] text-neutral-600 mt-1">
          PNG, JPG & JPEG (Up To 30MB)
        </p>
      </div>
    </button>
  );
}

function UploadedThumb({
  file,
  onAdd,
  onRemove,
  large,
}: {
  file: File | null;
  onAdd: () => void;
  onRemove: () => void;
  large?: boolean;
}) {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!file || !previewUrl) {
    return (
      <button
        onClick={onAdd}
        className={cn(
          "rounded-xl border border-dashed border-neutral-700 bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors flex flex-col items-center justify-center gap-2 flex-shrink-0",
          large ? "w-full py-14" : "w-40 h-32 sm:w-44 sm:h-36"
        )}
      >
        <div className="w-8 h-8 rounded-full border border-dashed border-neutral-600 flex items-center justify-center">
          <Plus className="w-4 h-4 text-neutral-500" />
        </div>
        <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
          Add Image
        </span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-neutral-800/50 border border-neutral-700/40 flex-shrink-0",
        large ? "w-full aspect-[16/9] max-h-56" : "w-40 h-32 sm:w-44 sm:h-36"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt="Uploaded"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X className="w-3 h-3 text-white" />
      </button>
      <button
        onClick={onAdd}
        className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <Plus className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

/* ─── Right Panel ─────────────────────────────────────────────────────────── */

function PreviewPanel({
  isGenerating,
  generatedUrl,
  inputThumbs,
  readyTitle,
  readySubtitle,
  icon: Icon,
}: {
  isGenerating: boolean;
  generatedUrl: string | null;
  inputThumbs: string[];
  readyTitle: string;
  readySubtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (generatedUrl) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900">
        {/* Action buttons */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
            <Heart className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
              <Download className="w-4 h-4 text-white" />
            </button>
            <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={generatedUrl}
          alt="Generated result"
          className="w-full h-full object-cover"
        />

        {/* Input thumbnails strip */}
        {inputThumbs.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent pt-8">
            {inputThumbs.map((url, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-lg overflow-hidden border border-white/20 bg-neutral-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="relative mb-5">
          <div className="w-14 h-14 rounded-full border-2 border-neutral-800" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
        </div>
        <p className="text-sm font-medium text-neutral-300">
          Creating render...
        </p>
        <p className="text-xs text-neutral-600 mt-1.5">
          This usually takes ~30 seconds
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6">
      {/* Before → After visual */}
      <div className="flex items-center gap-5 mb-7">
        <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl bg-neutral-800/50 border border-neutral-700/30 flex items-center justify-center overflow-hidden">
          <Icon className="w-8 h-8 text-neutral-600" />
        </div>
        <ArrowRight className="w-5 h-5 text-neutral-600 flex-shrink-0" />
        <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl bg-neutral-800/50 border border-dashed border-neutral-700/40 flex items-center justify-center overflow-hidden">
          <div className="w-8 h-8 rounded-lg border border-dashed border-neutral-600" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-neutral-200 text-center">
        {readyTitle}
      </h3>
      <p className="text-xs text-neutral-500 mt-1.5 text-center max-w-[280px] leading-relaxed">
        {readySubtitle}
      </p>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */

export function ToolDetailClient() {
  const params = useParams();
  const toolId = params.tool_id as string;
  const tool = getToolById(toolId);

  const maxSlots = tool?.multiUpload ? 4 : 1;
  const [files, setFiles] = useState<(File | null)[]>(
    () => Array(maxSlots).fill(null) as (File | null)[]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef = useRef<number>(0);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;
      setFiles((prev) => {
        const updated = [...prev];
        updated[activeSlotRef.current] = selected;
        return updated;
      });
      setGeneratedUrl(null);
      e.target.value = "";
    },
    []
  );

  const handleAdd = useCallback((slotIndex: number) => {
    activeSlotRef.current = slotIndex;
    inputRef.current?.click();
  }, []);

  const handleRemove = useCallback((slotIndex: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[slotIndex] = null;
      return updated;
    });
    setGeneratedUrl(null);
  }, []);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  }, []);

  const hasFiles = files.some(Boolean);

  const inputThumbs = useMemo(
    () =>
      files
        .filter((f): f is File => f !== null)
        .map((f) => URL.createObjectURL(f)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, generatedUrl]
  );

  if (!tool) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg text-neutral-400">Tool not found</p>
          <Link
            href="/tools"
            className="text-sm text-neutral-500 hover:text-white transition-colors underline"
          >
            Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  const labelParts = tool.label.split(" ");
  const italicWord = tool.labelItalic;
  const titleBeforeItalic = labelParts
    .slice(0, labelParts.lastIndexOf(italicWord.split(" ")[0]))
    .join(" ");

  return (
    <div className="h-full bg-black overflow-y-auto">
      <div className="h-full flex flex-col px-5 sm:px-8 pt-5 sm:pt-6 pb-6">
        {/* Back */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white transition-colors mb-5 flex-shrink-0 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Apps</span>
        </Link>

        {/* Container card */}
        <div className="flex-1 min-h-0 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 overflow-hidden">
          <div className="h-full flex flex-col lg:flex-row">
            {/* ── Left: controls ──────────────────────────────────────── */}
            <div className="lg:w-[45%] xl:w-[42%] flex-shrink-0 flex flex-col p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-neutral-800/60">
              {/* Title + description */}
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                  {titleBeforeItalic}{" "}
                  <em className="italic font-bold">{italicWord}</em>
                </h1>
                <p className="text-[13px] text-neutral-500 mt-1.5 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Upload area */}
              <div className="flex-1 min-h-0 flex flex-col">
                <UploadZone
                  files={files}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                  multiUpload={tool.multiUpload}
                />

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Bottom controls */}
              <div className="mt-6 space-y-3 flex-shrink-0">
                {/* Credit cost */}
                <p className="text-xs text-neutral-500 text-center">
                  Your request will cost{" "}
                  <span className="text-amber-400/90 font-medium">
                    {tool.creditCost} bricks
                  </span>
                </p>

                {/* Generate */}
                <button
                  onClick={handleGenerate}
                  disabled={!hasFiles || isGenerating}
                  className={cn(
                    "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                    hasFiles && !isGenerating
                      ? "bg-white text-black hover:bg-neutral-200 active:scale-[0.98]"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  )}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    "Generate Image"
                  )}
                </button>
              </div>
            </div>

            {/* ── Right: preview ──────────────────────────────────────── */}
            <div className="flex-1 min-w-0 min-h-[300px] lg:min-h-0">
              <PreviewPanel
                isGenerating={isGenerating}
                generatedUrl={generatedUrl}
                inputThumbs={inputThumbs}
                readyTitle={tool.readyTitle}
                readySubtitle={tool.readySubtitle}
                icon={tool.icon}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
