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
import { SelectTemplatesForm, TemplateItem } from "@/components/forms";
import { RequestItemButton } from "@/components/request-item-button";

// Re-export for backwards compatibility
export type { TemplateItem };

interface SelectTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (template: TemplateItem | null) => void;
  initialSelected?: TemplateItem | null;
}

export function SelectTemplatesModal({
  open,
  onOpenChange,
  onSave,
  initialSelected = null,
}: SelectTemplatesModalProps) {
  const [selected, setSelected] = useState<TemplateItem | null>(
    initialSelected
  );

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
            <span>Select a Template</span>
            <span className="text-xs md:text-sm font-normal text-neutral-400">
              {selected ? "1 selected" : "None"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-0 scrollbar-none">
          <SelectTemplatesForm value={selected} onChange={setSelected} />
          
          {/* Request button at bottom of scroll area */}
          <div className="mt-4 pb-4 pt-4 border-t border-neutral-800">
            <RequestItemButton 
              type="template" 
              className="w-full justify-center text-neutral-400 hover:text-white hover:bg-neutral-800" 
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 p-4 md:pt-4 md:px-0 border-t border-neutral-800 gap-2 flex-col sm:flex-row">
          <Button
            onClick={handleSave}
            disabled={!selected}
            className="w-full sm:w-auto h-12 md:h-10 bg-white text-black hover:bg-neutral-200"
          >
            Save Selection
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto h-12 md:h-10 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
