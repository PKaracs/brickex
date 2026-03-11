"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Upload,
  X,
  Loader2,
  ArrowRight,
  Download,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";

const VIDEO_TIPS = [
  "Submitting your request...",
  "Analyzing the input image...",
  "Generating motion paths...",
  "Rendering frames...",
  "Compositing final video...",
  "Almost there...",
];

function GeneratingState() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % VIDEO_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-neutral-800" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-white/60 animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-medium">Generating your video</p>
        <p className="text-sm text-neutral-500">{VIDEO_TIPS[tipIndex]}</p>
      </div>
      <p className="text-xs text-neutral-600">
        This usually takes 30–90 seconds
      </p>
    </div>
  );
}

interface VideoCanvasProps {
  isEndFrameMode: boolean;
  startFile: File | null;
  endFile: File | null;
  onStartFileSelect: (file: File) => void;
  onEndFileSelect: (file: File) => void;
  onStartFileClear: () => void;
  onEndFileClear: () => void;
  isGenerating: boolean;
  videoUrl: string | null;
  onDownload: () => void;
}

export function VideoCanvas({
  isEndFrameMode,
  startFile,
  endFile,
  onStartFileSelect,
  onEndFileSelect,
  onStartFileClear,
  onEndFileClear,
  isGenerating,
  videoUrl,
  onDownload,
}: VideoCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [startBlobUrl, setStartBlobUrl] = useState<string | null>(null);
  const [endBlobUrl, setEndBlobUrl] = useState<string | null>(null);
  const dragCounterRef = useRef(0);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (startFile) {
      const url = URL.createObjectURL(startFile);
      setStartBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setStartBlobUrl(null);
  }, [startFile]);

  useEffect(() => {
    if (endFile) {
      const url = URL.createObjectURL(endFile);
      setEndBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setEndBlobUrl(null);
  }, [endFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounterRef.current = 0;
      const file = e.dataTransfer.files[0];
      if (file && ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        if (!startFile) {
          onStartFileSelect(file);
        } else if (isEndFrameMode && !endFile) {
          onEndFileSelect(file);
        } else {
          onStartFileSelect(file);
        }
      }
    },
    [startFile, endFile, isEndFrameMode, onStartFileSelect, onEndFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, target: "start" | "end") => {
      const file = e.target.files?.[0];
      if (file) {
        if (target === "start") onStartFileSelect(file);
        else onEndFileSelect(file);
      }
      e.target.value = "";
    },
    [onStartFileSelect, onEndFileSelect]
  );

  // === GENERATING STATE ===
  if (isGenerating) {
    return (
      <Card className="flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden">
        <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex flex-col items-center justify-center overflow-hidden">
          <GeneratingState />
        </div>
      </Card>
    );
  }

  // === VIDEO RESULT ===
  if (videoUrl) {
    return (
      <Card className="flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden relative">
        <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex flex-col items-center justify-center overflow-hidden p-4">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            playsInline
            className="max-w-full max-h-[calc(100%-60px)] rounded-lg shadow-2xl"
          />
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </Card>
    );
  }

  const hasSource = !!startFile;

  // === START+END FRAME MODE WITH SOURCE ===
  if (isEndFrameMode && hasSource) {
    return (
      <div
        className="flex-1 flex flex-col min-h-0 gap-3"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Card
          className={cn(
            "flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden relative",
            isDragOver
              ? "border-white/40 bg-white/5"
              : "border-neutral-800/80"
          )}
        >
          <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex items-center justify-center overflow-hidden p-6">
            <div className="flex items-center gap-6 h-full max-h-[70%] w-full max-w-3xl">
              {/* Start frame */}
              <div className="relative flex-1 h-full rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900/50 group">
                <img
                  src={startBlobUrl!}
                  alt="Start frame"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={onStartFileClear}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-800"
                >
                  <X className="w-3.5 h-3.5 text-neutral-300" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                  <span className="text-[10px] text-neutral-300 font-medium">
                    Start Frame
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </div>
                <span className="text-[10px] text-neutral-600 font-medium">
                  motion
                </span>
              </div>

              {/* End frame */}
              {endBlobUrl ? (
                <div className="relative flex-1 h-full rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900/50 group">
                  <img
                    src={endBlobUrl}
                    alt="End frame"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={onEndFileClear}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-800"
                  >
                    <X className="w-3.5 h-3.5 text-neutral-300" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
                    <span className="text-[10px] text-neutral-300 font-medium">
                      End Frame
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => endInputRef.current?.click()}
                  className="flex-1 h-full rounded-xl border-2 border-dashed border-neutral-700/50 bg-neutral-900/30 flex flex-col items-center justify-center cursor-pointer hover:border-neutral-600 hover:bg-neutral-900/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-neutral-600 bg-neutral-800/50 flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-neutral-400" />
                  </div>
                  <p className="text-xs font-medium text-neutral-400">
                    End Frame
                  </p>
                  <p className="text-[10px] text-neutral-600 mt-0.5">
                    Click or drag to upload
                  </p>
                </div>
              )}
            </div>
          </div>

          {isDragOver && (
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white" />
                <p className="text-sm font-medium text-white">
                  Drop image here
                </p>
              </div>
            </div>
          )}
        </Card>

        <input
          ref={endInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => handleFileInput(e, "end")}
        />
        <input
          ref={startInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => handleFileInput(e, "start")}
        />
      </div>
    );
  }

  // === SINGLE IMAGE SOURCE PREVIEW ===
  if (hasSource && !isEndFrameMode) {
    return (
      <div
        className="flex-1 flex flex-col min-h-0 gap-3"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Card
          className={cn(
            "flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden relative",
            isDragOver
              ? "border-white/40 bg-white/5"
              : "border-neutral-800/80"
          )}
        >
          <button
            onClick={onStartFileClear}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-300" />
          </button>

          <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex items-center justify-center overflow-hidden p-4">
            <div className="relative flex-1 h-full flex items-center justify-center">
              <img
                src={startBlobUrl!}
                alt="Source image"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {isDragOver && (
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white" />
                <p className="text-sm font-medium text-white">
                  Drop to replace
                </p>
              </div>
            </div>
          )}
        </Card>

        <input
          ref={startInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => handleFileInput(e, "start")}
        />
      </div>
    );
  }

  // === EMPTY STATE ===
  return (
    <div
      className="flex-1 min-h-0"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Card
        className={cn(
          "w-full h-full rounded-xl border-2 bg-neutral-900/30 overflow-hidden transition-all duration-200 cursor-pointer",
          isDragOver
            ? "border-white/40 bg-white/5 scale-[1.01]"
            : "hover:bg-neutral-900/50"
        )}
        onClick={() => startInputRef.current?.click()}
      >
        <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center gap-4 p-6 max-w-md text-center">
            <div
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all",
                isDragOver
                  ? "border-white/40 bg-white/10"
                  : "border-neutral-600 bg-neutral-800/50"
              )}
            >
              <Upload
                className={cn(
                  "w-7 h-7 md:w-9 md:h-9 transition-colors",
                  isDragOver ? "text-white" : "text-neutral-400"
                )}
              />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base md:text-lg font-medium text-white">
                {isDragOver ? "Drop files here" : "Upload your source"}
              </h3>
              <p className="text-xs md:text-sm text-neutral-500 leading-relaxed">
                {isEndFrameMode
                  ? "Upload your start frame image to begin"
                  : "Drag & drop your image — or click to browse"}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startInputRef.current?.click();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Browse Files
              </button>
            </div>

            <p className="text-[10px] text-neutral-600 mt-1">
              JPG, PNG, WebP
            </p>
          </div>
        </div>
      </Card>

      <input
        ref={startInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={(e) => handleFileInput(e, "start")}
      />
    </div>
  );
}
