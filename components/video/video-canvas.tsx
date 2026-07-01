"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Upload,
  X,
  FolderOpen,
  ImageIcon,
  Search,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { GalleryListImage } from "@/components/gallery/gallery-list-card";
import { getUserOutputsPaginated } from "@/lib/actions/get-user-outputs";
import { RENDER_MODES } from "@/lib/constants/render-modes";
import { AutoplayVideo } from "@/components/ui/autoplay-video";
import Image from "next/image";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.webp";

const VIDEO_TIPS = [
  "Enviando tu solicitud...",
  "Analizando la imagen de entrada...",
  "Generando rutas de movimiento...",
  "Renderizando fotogramas...",
  "Componiendo el video final...",
  "Ya casi esta...",
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
        <p className="text-white font-medium">Generando tu video</p>
        <p className="text-sm text-neutral-500">{VIDEO_TIPS[tipIndex]}</p>
      </div>
      <p className="text-xs text-neutral-600">
        Normalmente tarda entre 1 y 3 minutos
      </p>
    </div>
  );
}

function PickFromGalleryModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}) {
  const [images, setImages] = useState<GalleryListImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    setSearchQuery("");
    getUserOutputsPaginated(0, 48).then((result) => {
      if ("images" in result) {
        setImages(
          result.images
            .filter((img) => (img.mediaType ?? "image") === "image")
            .map((img) => ({
              id: img.id,
              url: img.url,
              createdAt: new Date(img.createdAt),
              projectId: img.projectId,
              mode: img.mode,
              prompt: img.prompt,
              mediaType: img.mediaType,
            }))
        );
      }
      setIsLoading(false);
    });
  }, [open]);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const q = searchQuery.toLowerCase();
    return images.filter((img) => {
      const mode = img.mode
        ? RENDER_MODES.find((m) => m.id === img.mode)
        : null;
      return (
        img.prompt?.toLowerCase().includes(q) ||
        mode?.label.toLowerCase().includes(q)
      );
    });
  }, [images, searchQuery]);

  const getModeLabel = (modeId?: string) => {
    if (!modeId) return null;
    return RENDER_MODES.find((m) => m.id === modeId)?.label ?? null;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showXIcon={false}
        className="max-w-3xl w-full md:w-[88vw] max-h-[85vh] bg-neutral-950 border-neutral-800 p-0 overflow-hidden flex flex-col"
      >
        <div className="flex-shrink-0 px-5 pt-5 pb-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Tu galeria</h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {isLoading
                  ? "Cargando tus imagenes..."
                  : `${images.length} imagen${images.length !== 1 ? "es" : ""} disponible${images.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center hover:bg-neutral-700 transition-colors"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {!isLoading && images.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por prompt o modo..."
                className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none px-5 pb-5 pt-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square bg-neutral-800/60 rounded-xl animate-pulse" />
                  <div className="space-y-1.5 px-0.5">
                    <div className="h-3 w-16 bg-neutral-800/60 rounded animate-pulse" />
                    <div className="h-2.5 w-24 bg-neutral-800/40 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-7 h-7 text-neutral-600" />
              </div>
              <p className="text-sm font-medium text-neutral-400">Aun no hay imagenes</p>
              <p className="text-xs text-neutral-600 mt-1">
                Genera algunas imagenes primero y luego elige una aqui para animarla
              </p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="w-8 h-8 text-neutral-700 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">
                No hay resultados para &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredImages.map((img) => {
                const modeLabel = getModeLabel(img.mode);
                const isHovered = hoveredId === img.id;

                return (
                  <button
                    key={img.id}
                    onClick={() => {
                      onSelect(img.url);
                      onOpenChange(false);
                    }}
                    onMouseEnter={() => setHoveredId(img.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="group text-left rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                  >
                    <div
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden border transition-all duration-200",
                        isHovered
                          ? "border-white/25 shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                          : "border-neutral-800/80"
                      )}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-200",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                      />

                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 text-black" />
                        </div>
                      </div>

                      {modeLabel && (
                        <div
                          className={cn(
                            "absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm transition-opacity duration-200",
                            isHovered ? "opacity-100" : "opacity-0"
                          )}
                        >
                          <span className="text-[10px] font-medium text-neutral-300">
                            {modeLabel}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 px-0.5">
                      <p className="text-[11px] text-neutral-500">
                        {formatDate(img.createdAt)}
                      </p>
                      {img.prompt && (
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                          {img.prompt}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface VideoCanvasProps {
  imageFile: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onGallerySelect: (url: string) => void;
  onFileClear: () => void;
  isGenerating: boolean;
  videoUrl: string | null;
}

export function VideoCanvas({
  imageFile,
  previewUrl,
  onFileSelect,
  onGallerySelect,
  onFileClear,
  isGenerating,
  videoUrl,
}: VideoCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const dragCounterRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setBlobUrl(null);
  }, [imageFile]);

  const displayUrl = blobUrl || previewUrl;

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
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = "";
    },
    [onFileSelect]
  );

  if (isGenerating) {
    return (
      <Card className="flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden">
        <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex flex-col items-center justify-center overflow-hidden">
          <GeneratingState />
        </div>
      </Card>
    );
  }

  if (videoUrl) {
    return (
      <Card className="flex-1 min-h-0 rounded-xl border-2 bg-neutral-900/30 overflow-hidden relative">
        <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex flex-col items-center justify-center overflow-hidden p-4">
          <AutoplayVideo
            src={videoUrl}
            controls
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      </Card>
    );
  }

  if (displayUrl) {
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
            onClick={onFileClear}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-neutral-900/80 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-300" />
          </button>

          <div className="w-full h-full rounded-lg border border-neutral-700 bg-neutral-900/50 flex items-center justify-center overflow-hidden p-4">
            <div className="relative flex-1 h-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl}
                alt="Imagen de origen"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {isDragOver && (
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-white" />
                <p className="text-sm font-medium text-white">
                  Suelta para reemplazar
                </p>
              </div>
            </div>
          )}
        </Card>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleFileInput}
        />
      </div>
    );
  }

  return (
    <>
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
          onClick={() => inputRef.current?.click()}
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
                  {isDragOver ? "Suelta los archivos aqui" : "Sube tu imagen"}
                </h3>
                <p className="text-xs md:text-sm text-neutral-500 leading-relaxed">
                  Arrastra y suelta, busca archivos o elige desde tu galeria
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  Buscar archivos
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGalleryModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 border border-neutral-700 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  Desde la galeria
                </button>
              </div>

              <p className="text-[10px] text-neutral-600 mt-1">
                JPG, PNG, WebP
              </p>
            </div>
          </div>
        </Card>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      <PickFromGalleryModal
        open={galleryModalOpen}
        onOpenChange={setGalleryModalOpen}
        onSelect={onGallerySelect}
      />
    </>
  );
}
