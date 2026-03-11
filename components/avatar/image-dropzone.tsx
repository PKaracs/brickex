"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageDropzone({
  onFilesAdded,
  disabled,
  className,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      onFilesAdded(files);
    },
    [disabled, onFilesAdded]
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "border border-dashed rounded-xl transition-all cursor-pointer",
        "flex flex-col items-center justify-center gap-3 min-h-[280px]",
        isDragging
          ? "border-white bg-white/5"
          : "border-neutral-700 hover:border-neutral-600",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-neutral-800">
        <Upload className="w-6 h-6 text-neutral-400" />
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
  );
}
