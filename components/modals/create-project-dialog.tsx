"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Beaker, ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { createWorkspace } from "@/lib/actions/workspaces";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, startCreating] = useTransition();

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    startCreating(async () => {
      const res = await createWorkspace(trimmed);
      if ("workspaceId" in res) {
        await authClient.organization.setActive({
          organizationId: res.workspaceId,
        });
        setName("");
        onOpenChange(false);
        router.push("/app/dashboard/new");
        router.refresh();
      }
    });
  }

  function handleSkip() {
    onOpenChange(false);
    localStorage.setItem("brickex:onboarded", "true");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showXIcon={false}
        className="bg-neutral-900 border-neutral-700 max-w-md p-0 overflow-hidden"
      >
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Create your first project
            </DialogTitle>
            <DialogDescription className="text-neutral-400 text-sm mt-1">
              A project is a real estate development &mdash; like &ldquo;Bugatti
              Mansions&rdquo; or &ldquo;Mettrin Residences&rdquo;. All your
              renders, videos, and assets stay organized inside it.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-2">
          <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
            Project Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) handleCreate();
            }}
            placeholder="e.g. Bugatti Mansions"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-neutral-600 transition-colors"
          />
        </div>

        <div className="px-6 pb-6 pt-3 flex flex-col gap-2">
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            variant="white"
            className="w-full"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
            {creating ? "Creating..." : "Create Project"}
          </Button>

          <button
            onClick={handleSkip}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <Beaker className="w-3.5 h-3.5" />
            Skip &mdash; just use the Playground
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
