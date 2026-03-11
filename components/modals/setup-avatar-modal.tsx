"use client";

import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { storePendingUpload, isIndexedDBAvailable } from "@/lib/upload-queue";
import { compressImages } from "@/lib/image-utils";
import { toast } from "sonner";

interface SetupAvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** If true, modal cannot be dismissed - user must complete setup */
  mandatory?: boolean;
  /** If true, user already has avatar images - show replace copy */
  isReplacing?: boolean;
}

const MAX_IMAGES = 3;

export function SetupAvatarModal({
  open,
  onOpenChange,
  onSuccess,
  mandatory = false,
  isReplacing = false,
}: SetupAvatarModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      addFiles(droppedFiles);
    },
    [files]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const combined = [...files, ...newFiles].slice(0, MAX_IMAGES);
    setFiles(combined);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Compress images
      setUploadProgress(20);
      console.log(`[SetupAvatar] Compressing ${files.length} images...`);
      const compressedFiles = await compressImages(files);
      setUploadProgress(60);

      // Store for background upload
      if (!isIndexedDBAvailable()) {
        throw new Error("Storage not available. Try a different browser.");
      }

      await storePendingUpload(compressedFiles);
      setUploadProgress(100);

      // Show uploading toast
      toast.loading("Uploading your photos...", { id: "avatar-upload" });

      // Reset and close
      setFiles([]);
      setIsUploading(false);
      setUploadProgress(0);
      onSuccess();
    } catch (err) {
      console.error("[SetupAvatar] Failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setIsUploading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    // Don't allow closing if mandatory and no files uploaded yet
    if (!isOpen && mandatory) {
      return;
    }
    if (!isOpen && !isUploading) {
      // Reset state when closing
      setFiles([]);
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg w-full sm:w-[95vw] max-h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-neutral-950 border-0 sm:border sm:border-neutral-800 p-0 gap-0 sm:rounded-xl rounded-none"
        showXIcon={!mandatory}
        onInteractOutside={(e) => mandatory && e.preventDefault()}
        onEscapeKeyDown={(e) => mandatory && e.preventDefault()}
      >
        <div
          className={cn(
            "flex flex-col min-h-0 overflow-y-auto",
            "p-5 sm:p-6",
            mandatory && "pt-6 sm:pt-6"
          )}
        >
          {/* Header */}
          <div className="text-center mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-xl font-semibold tracking-tight text-white mb-3 sm:mb-2">
              {isReplacing ? "Replace your photos" : "Let's set up your avatar"}
            </h2>
            <p className="text-neutral-400 sm:text-neutral-500 text-base sm:text-sm leading-relaxed px-2">
              {isReplacing
                ? "Upload new photos to replace your current ones. Your old photos will be deleted."
                : "Upload at least one photo of yourself. We'll use it to create photos you can actually use - for dating, Instagram, or your personal brand."}
            </p>
          </div>

          {/* Upload area */}
          <div className="flex items-start sm:items-center justify-center pt-2 sm:pt-0">
            {files.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer w-full",
                  "py-8 sm:py-12 flex flex-col items-center justify-center gap-4",
                  isDragging
                    ? "border-white/40 bg-white/[0.03]"
                    : "border-neutral-700 hover:border-neutral-600 hover:bg-neutral-900/30"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <div
                  className={cn(
                    "flex items-center justify-center w-16 h-16 sm:w-14 sm:h-14 rounded-full transition-all",
                    isDragging ? "bg-white/10" : "bg-neutral-800"
                  )}
                >
                  <Upload
                    className={cn(
                      "w-7 h-7 sm:w-6 sm:h-6",
                      isDragging ? "text-white" : "text-neutral-400"
                    )}
                  />
                </div>

                <div className="text-center">
                  <p className="text-white font-medium text-lg sm:text-base">
                    {isDragging ? "Drop your photos here" : "Tap to add photos"}
                  </p>
                  <p className="text-neutral-500 text-sm mt-2">
                    JPG, PNG • Up to 3 photos
                  </p>
                </div>
              </div>
            ) : (
              /* Image preview - responsive grid */
              <div className="flex flex-wrap items-center justify-center gap-3 w-full px-2">
                {files.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-neutral-600">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                {files.length < MAX_IMAGES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 border-dashed border-neutral-600 hover:border-neutral-500 hover:bg-neutral-900/50 flex flex-col items-center justify-center gap-1.5 transition-all"
                  >
                    <Upload className="w-6 h-6 text-neutral-400" />
                    <span className="text-xs text-neutral-400">Add</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Bottom section */}
          <div className="pt-5 sm:pt-4">
            {/* Tips - above button */}
            <div className="flex items-center justify-center gap-5 sm:gap-4 text-sm sm:text-xs text-neutral-500 mb-4">
              <span>☀️ Good lighting</span>
              <span>👤 Face visible</span>
              <span>📷 Clear quality</span>
            </div>

            {/* Note about changing later - only show for new users */}
            {!isReplacing && (
              <p className="text-center text-neutral-500 text-sm sm:text-xs mb-4">
                You can change your avatar anytime from the{" "}
                <span className="text-neutral-300">👤</span> icon in the top
                right
              </p>
            )}

            {/* Continue button - at very bottom */}
            <button
              onClick={handleContinue}
              disabled={files.length === 0 || isUploading}
              className={cn(
                "relative w-full h-14 sm:h-12 rounded-xl font-semibold text-base sm:text-sm transition-all overflow-hidden",
                "flex items-center justify-center gap-2",
                files.length > 0 && !isUploading
                  ? "bg-white text-black hover:bg-neutral-200"
                  : isUploading
                    ? "bg-neutral-800 text-white"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              )}
            >
              {isUploading && (
                <div
                  className="absolute inset-0 bg-neutral-700/50 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              <span className="relative z-10">
                {isUploading
                  ? "Setting up..."
                  : isReplacing
                    ? "Replace Photos"
                    : "Upload Avatar"}
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
