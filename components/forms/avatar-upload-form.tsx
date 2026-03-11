"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

interface AvatarUploadFormProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxImages?: number;
}

export function AvatarUploadForm({
  value,
  onChange,
  maxImages = 3, // Quality over quantity for AI
}: AvatarUploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile device for camera option
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      addFiles(files);
    },
    [value, maxImages]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const combined = [...value, ...files].slice(0, maxImages);
    onChange(combined);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
    if (carouselIndex >= newFiles.length && newFiles.length > 0) {
      setCarouselIndex(newFiles.length - 1);
    }
  };

  const nextImage = () => {
    setCarouselIndex((prev) => (prev + 1) % value.length);
  };

  const prevImage = () => {
    setCarouselIndex((prev) => (prev - 1 + value.length) % value.length);
  };

  if (value.length === 0) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border border-dashed rounded-lg p-6 transition-all",
          "flex flex-col items-center justify-center gap-4 min-h-[200px]",
          isDragging ? "border-white bg-white/5" : "border-neutral-700"
        )}
      >
        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxImages > 1}
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        {/* Camera input for mobile - opens front camera directly */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileInput}
          className="hidden"
        />

        {isMobile ? (
          // Mobile: Two buttons - Camera + Gallery
          <div className="flex flex-col gap-3 w-full max-w-[200px]">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 active:scale-[0.98] transition-all"
            >
              <Camera className="w-5 h-5" />
              Take Selfie
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-neutral-800 text-white font-medium hover:bg-neutral-700 active:scale-[0.98] transition-all"
            >
              <Upload className="w-5 h-5" />
              Choose from Gallery
            </button>
            <p className="text-xs text-neutral-500 text-center mt-1">
              JPG, PNG up to 10MB
            </p>
          </div>
        ) : (
          // Desktop: Click to upload
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800">
              <Upload className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white">
                {isDragging ? "Drop images here" : "Click or drag images"}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                JPG, PNG up to 10MB each
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main carousel image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800">
        <img
          src={URL.createObjectURL(value[carouselIndex])}
          alt={`Upload ${carouselIndex + 1}`}
          className="w-full h-full object-cover"
          data-ph-capture-attribute="uploaded-selfie"
        />

        <button
          type="button"
          onClick={() => removeFile(carouselIndex)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {value.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </>
        )}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/60 text-xs text-white">
          {carouselIndex + 1} / {value.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 justify-center">
        {value.map((file, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCarouselIndex(index)}
            className={cn(
              "w-12 h-12 rounded overflow-hidden border-2 transition-all",
              index === carouselIndex
                ? "border-white"
                : "border-transparent opacity-50 hover:opacity-80"
            )}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`Thumb ${index + 1}`}
              className="w-full h-full object-cover"
              data-ph-capture-attribute="uploaded-selfie-thumb"
            />
          </button>
        ))}

        {value.length < maxImages && (
          <>
            {isMobile && (
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-12 h-12 rounded border-2 border-dashed border-neutral-700 hover:border-neutral-600 flex items-center justify-center transition-colors"
                title="Take selfie"
              >
                <Camera className="w-4 h-4 text-neutral-500" />
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded border-2 border-dashed border-neutral-700 hover:border-neutral-600 flex items-center justify-center transition-colors"
              title="Upload from gallery"
            >
              <Upload className="w-4 h-4 text-neutral-500" />
            </button>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxImages > 1}
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
