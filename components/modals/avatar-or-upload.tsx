"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { AvatarUploadForm } from "@/components/forms";
import { cn } from "@/lib/utils";
import { User, Camera, Check, ChevronLeft } from "lucide-react";

export type AvatarChoice = "existing" | "upload";

interface AvatarOrUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (choice: AvatarChoice, uploadedImages?: File[]) => void;
  hasExistingAvatar?: boolean;
  /** Force upload-only mode (skip avatar choice screen) */
  forceUploadOnly?: boolean;
  /** Maximum images allowed (default: 3 for Person 1, 1 for others) */
  maxImages?: number;
  /** If true, modal cannot be dismissed - user must complete upload */
  mandatory?: boolean;
}

export function AvatarOrUploadModal({
  open,
  onOpenChange,
  onSelect,
  hasExistingAvatar = true,
  forceUploadOnly = false,
  maxImages = 3,
  mandatory = false,
}: AvatarOrUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showUploadView, setShowUploadView] = useState(forceUploadOnly);

  const handleUseAvatar = () => {
    onSelect("existing");
    onOpenChange(false);
  };

  const handleConfirmUpload = () => {
    if (uploadedFiles.length > 0) {
      onSelect("upload", uploadedFiles);
      onOpenChange(false);
      reset();
    }
  };

  const handleBack = () => {
    setShowUploadView(false);
    setUploadedFiles([]);
  };

  const reset = () => {
    setUploadedFiles([]);
    setShowUploadView(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    // Don't allow closing if mandatory and no images uploaded yet
    if (!isOpen && mandatory && uploadedFiles.length === 0 && showUploadView) {
      return;
    }
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  // If forceUploadOnly or mandatory, skip the choice screen and go straight to upload
  useEffect(() => {
    if ((forceUploadOnly || mandatory) && open && !showUploadView) {
      setShowUploadView(true);
    }
  }, [forceUploadOnly, mandatory, open, showUploadView]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg w-full md:w-[90vw] bg-neutral-950 border-neutral-800 p-4 md:p-6 gap-0"
        showXIcon={!mandatory || (mandatory && uploadedFiles.length > 0)}
        onInteractOutside={(e) =>
          mandatory &&
          uploadedFiles.length === 0 &&
          showUploadView &&
          e.preventDefault()
        }
        onEscapeKeyDown={(e) =>
          mandatory &&
          uploadedFiles.length === 0 &&
          showUploadView &&
          e.preventDefault()
        }
      >
        {!showUploadView ? (
          <>
            <DialogHeader className="text-center mb-4 md:mb-6 pt-2 md:pt-0">
              <DialogTitle className="text-lg md:text-xl font-semibold text-white">
                How do you want to appear?
              </DialogTitle>
              <DialogDescription className="text-neutral-500 text-xs md:text-sm mt-1">
                Choose your avatar source
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <button
                onClick={handleUseAvatar}
                disabled={!hasExistingAvatar || forceUploadOnly}
                className={cn(
                  "flex flex-col items-center gap-2 md:gap-3 p-4 md:p-5 rounded-xl border transition-all text-center min-h-[120px]",
                  "focus:outline-none focus:ring-2 focus:ring-neutral-600 active:scale-[0.98]",
                  hasExistingAvatar && !forceUploadOnly
                    ? "border-neutral-800 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 hover:border-neutral-700"
                    : "border-neutral-800/50 bg-neutral-900/50 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-neutral-800">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Use My Avatar
                  </p>
                  <p className="text-[10px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">
                    Your saved selfies
                  </p>
                </div>
              </button>

              <button
                onClick={() => setShowUploadView(true)}
                className={cn(
                  "flex flex-col items-center gap-2 md:gap-3 p-4 md:p-5 rounded-xl border transition-all text-center min-h-[120px]",
                  "border-neutral-800 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 hover:border-neutral-700",
                  "focus:outline-none focus:ring-2 focus:ring-neutral-600 active:scale-[0.98]"
                )}
              >
                <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full bg-neutral-800">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Upload Selfies
                  </p>
                  <p className="text-[10px] md:text-xs text-neutral-500 mt-0.5 md:mt-1">
                    New photos for this project
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col max-h-[calc(85vh-2rem)] md:max-h-[70vh]">
            {/* Accessible DialogTitle for screen readers */}
            <VisuallyHidden>
              <DialogTitle>
                {maxImages === 1 ? "Upload Photo" : "Upload Selfies"}
              </DialogTitle>
            </VisuallyHidden>

            <div className="flex items-center gap-3 mb-4 md:mb-5 pt-2 md:pt-0 flex-shrink-0">
              {!forceUploadOnly && !mandatory && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-neutral-800 active:bg-neutral-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-neutral-400" />
                </button>
              )}
              <div>
                <h2 className="text-base md:text-lg font-semibold text-white">
                  {maxImages === 1 ? "Upload Photo" : "Upload Selfies"}
                </h2>
                <p className="text-xs text-neutral-500">
                  {maxImages === 1
                    ? "Upload 1 photo for your partner"
                    : `Add 1–${maxImages} images`}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pb-2">
              <AvatarUploadForm
                value={uploadedFiles}
                onChange={setUploadedFiles}
                maxImages={maxImages}
              />
            </div>

            {/* Sticky button at bottom */}
            <div className="flex-shrink-0 pt-3 mt-auto border-t border-neutral-800 bg-neutral-950">
              <Button
                onClick={handleConfirmUpload}
                disabled={uploadedFiles.length === 0}
                className="w-full h-12 md:h-10 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:bg-neutral-700 disabled:text-neutral-400"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Continue
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
