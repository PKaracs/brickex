"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectObjectForm, ObjectItem } from "@/components/forms";
import { RequestItemButton } from "@/components/request-item-button";

// Re-export for backwards compatibility
export type { ObjectItem };

interface SelectObjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (objects: ObjectItem[]) => void;
  initialSelected?: ObjectItem[];
  maxSelections?: number;
}

export function SelectObjectModal({
  open,
  onOpenChange,
  onSave,
  initialSelected = [],
  maxSelections = 5,
}: SelectObjectModalProps) {
  const [selected, setSelected] = useState<ObjectItem[]>(initialSelected);

  useEffect(() => {
    if (open) setSelected(initialSelected);
  }, [open, initialSelected]);

  const handleSave = () => {
    onSave(selected);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelected(initialSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-4xl w-full md:w-[90vw] h-[85vh] md:h-[80vh] bg-neutral-900 border-neutral-800 flex flex-col p-0 md:p-6 overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-4 pt-2 md:pt-0 md:px-0">
          <DialogTitle className="text-lg md:text-xl text-white flex items-center justify-between pr-10 md:pr-0">
            <span>Select Objects</span>
            <span className="text-xs md:text-sm font-normal text-neutral-400">
              {selected.length} / {maxSelections}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-0 scrollbar-none">
          <SelectObjectForm
            value={selected}
            onChange={setSelected}
            maxSelections={maxSelections}
          />
          
          {/* Request button at bottom of scroll area */}
          <div className="mt-4 pb-4 pt-4 border-t border-neutral-800">
            <RequestItemButton 
              type="object" 
              className="w-full justify-center text-neutral-400 hover:text-white hover:bg-neutral-800" 
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 p-4 md:pt-4 md:px-0 border-t border-neutral-800 gap-2 flex-col sm:flex-row">
          <Button
            onClick={handleSave}
            disabled={selected.length === 0}
            variant="default"
            size="default"
            className="w-full sm:w-auto h-12 md:h-10"
          >
            Save Selection ({selected.length})
          </Button>
          <Button
            variant="black"
            onClick={handleCancel}
            size="default"
            className="w-full sm:w-auto h-12 md:h-10"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
