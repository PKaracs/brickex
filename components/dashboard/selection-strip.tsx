"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ObjectItem, TemplateItem } from "@/components/forms";
import { Plus, LayoutTemplate } from "lucide-react";
import { objects } from "@/lib/constants/object";
import { templates } from "@/lib/constants/templates";
import type { TeleportSelection } from "@/lib/types/teleport";

// Preview thumbnails - handpicked popular items
const objectPreviews = [
  objects.find((o) => o.name === "Rolex Daytona"),
  objects.find((o) => o.name === "Lamborghini Revuelto"),
  objects.find((o) => o.name === "Gulfstream G700"),
  objects.find((o) => o.name === "Hermès Birkin 30"),
].filter(Boolean);

const templatePreviews = templates.slice(0, 4);

interface SelectionStripProps {
  selectedObjects: ObjectItem[];
  selectedTemplate: TemplateItem | null;
  selectedTeleport?: TeleportSelection | null;
  onOpenObjectModal: () => void;
  onOpenTemplateModal: () => void;
  onOpenTeleportModal?: () => void;
  readOnly?: boolean;
  disabled?: boolean;
}

export function SelectionStrip({
  selectedObjects,
  selectedTemplate,
  selectedTeleport,
  onOpenObjectModal,
  onOpenTemplateModal,
  onOpenTeleportModal,
  readOnly = false,
  disabled = false,
}: SelectionStripProps) {
  const hasSelections =
    selectedObjects.length > 0 || selectedTemplate || selectedTeleport;

  if (!hasSelections && !readOnly) {
    return null;
  }

  // If read-only and no selections, return null (shouldn't happen, but handle gracefully)
  if (readOnly && !hasSelections) {
    return null;
  }

  return (
    <div className="flex-shrink-0 w-full overflow-x-auto scrollbar-none">
      <div className="flex gap-2 sm:gap-4 pb-2 w-max sm:w-full">
        {/* Display selected objects as cards - First */}
        {selectedObjects.map((object) => (
          <Card
            key={object.id}
            className="flex-shrink-0 w-28 sm:w-auto sm:flex-1 h-24 sm:h-40 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 relative"
          >
            <div className="relative w-12 h-12 sm:w-20 sm:h-20">
              <Image
                src={object.image}
                alt={object.name}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <span className="text-[10px] sm:text-xs text-neutral-400 truncate max-w-full px-1">
              {object.name}
            </span>
          </Card>
        ))}

        {/* Display selected template if any - Second */}
        {selectedTemplate && (
          <Card className="flex-shrink-0 w-28 sm:w-auto sm:flex-1 h-24 sm:h-40 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 relative">
            <div className="relative w-12 h-12 sm:w-20 sm:h-20">
              <Image
                src={selectedTemplate.image}
                alt={selectedTemplate.name}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <span className="text-[10px] sm:text-xs text-neutral-400 truncate max-w-full px-1">
              {selectedTemplate.name}
            </span>
          </Card>
        )}

        {/* Display selected teleport if any */}
        {selectedTeleport && (
          <Card className="flex-shrink-0 w-28 sm:w-auto sm:flex-1 h-24 sm:h-40 rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2 relative">
            {selectedTeleport.mode === "exact" && selectedTeleport.sv ? (
              <>
                <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-lg overflow-hidden">
                  <Image
                    src={selectedTeleport.sv.imageUrl}
                    alt="Street View"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-neutral-400 truncate max-w-full px-1">
                  📍 Exact
                </span>
              </>
            ) : selectedTeleport.mode === "city" ? (
              <>
                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-lg bg-neutral-800/50 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🌍</span>
                </div>
                <span className="text-[10px] sm:text-xs text-neutral-400 truncate max-w-full px-1">
                  {selectedTeleport.city}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl">🌍</span>
                <span className="text-[10px] sm:text-xs text-neutral-400">
                  Location pinned
                </span>
              </>
            )}
          </Card>
        )}

        {/* Add/Change cards - show options that aren't selected yet */}
        {!readOnly && !disabled && (
          <>
            {/* Add Objects - show if teleport selected but no objects (allow both) */}
            {selectedTeleport &&
              selectedObjects.length === 0 &&
              !selectedTemplate && (
                <Card
                  onClick={onOpenObjectModal}
                  className="flex-shrink-0 w-28 sm:w-auto sm:flex-1 h-24 sm:h-40 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 flex items-center justify-center cursor-pointer hover:bg-neutral-900/50 active:bg-neutral-800/50 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2 px-2 sm:px-4 text-center">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-500" />
                    <span className="text-[10px] sm:text-xs text-neutral-500">
                      Add Objects
                    </span>
                  </div>
                </Card>
              )}

            {/* Add Teleport - show if objects selected but no teleport (allow both) */}
            {selectedObjects.length > 0 &&
              !selectedTeleport &&
              !selectedTemplate &&
              onOpenTeleportModal && (
                <Card
                  onClick={onOpenTeleportModal}
                  className="flex-shrink-0 w-28 sm:w-auto sm:flex-1 h-24 sm:h-40 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 flex items-center justify-center cursor-pointer hover:bg-neutral-900/50 active:bg-neutral-800/50 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2 px-2 sm:px-4 text-center">
                    <span className="text-xl sm:text-2xl">🌍</span>
                    <span className="text-[10px] sm:text-xs text-neutral-500">
                      Add Location
                    </span>
                  </div>
                </Card>
              )}

            {/* Change button - opens the modal for what's already selected */}
            <Card
              onClick={
                selectedTeleport && onOpenTeleportModal
                  ? onOpenTeleportModal
                  : selectedTemplate
                    ? onOpenTemplateModal
                    : onOpenObjectModal
              }
              className="flex-shrink-0 w-28 sm:w-auto sm:flex-1 h-24 sm:h-40 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/30 flex items-center justify-center cursor-pointer hover:bg-neutral-900/50 active:bg-neutral-800/50 hover:border-neutral-600 transition-colors"
            >
              <div className="flex flex-col items-center gap-1 sm:gap-2 px-2 sm:px-4 text-center">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-500" />
                <span className="text-[10px] sm:text-xs text-neutral-500">
                  Change
                </span>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
