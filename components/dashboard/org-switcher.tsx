"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Plus, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import {
  ensurePlaygroundAndListWorkspaces,
  createWorkspace,
  type WorkspaceItem,
} from "@/lib/actions/workspaces";

interface OrgSwitcherProps {
  isOpen: boolean;
}

function OrgAvatar({
  name,
  isPlayground,
  size = "sm",
}: {
  name: string;
  isPlayground: boolean;
  size?: "sm" | "md";
}) {
  const letter = isPlayground ? "P" : (name[0] ?? "?").toUpperCase();
  const dim = size === "sm" ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-xs";

  return (
    <div
      className={cn(
        dim,
        "rounded-md flex items-center justify-center font-semibold flex-shrink-0",
        isPlayground
          ? "bg-neutral-700 text-neutral-300"
          : "bg-neutral-600 text-white",
      )}
    >
      {letter}
    </div>
  );
}

export function OrgSwitcher({ isOpen }: OrgSwitcherProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [switching, startSwitching] = useTransition();
  const [creating, startCreating] = useTransition();
  const [newName, setNewName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);

  const activeOrgId = session?.session?.activeOrganizationId ?? null;

  const activeWs = workspaces.find((w) => w.id === activeOrgId);
  const playground = workspaces.find((w) => w.isPlayground);
  const namedProjects = workspaces.filter((w) => !w.isPlayground);

  const fetchWorkspaces = useCallback(async () => {
    const res = await ensurePlaygroundAndListWorkspaces();
    if ("workspaces" in res) {
      setWorkspaces(res.workspaces);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      fetchWorkspaces();
    }
  }, [loaded, fetchWorkspaces]);

  useEffect(() => {
    if (popoverOpen) {
      setLoading(true);
      fetchWorkspaces().finally(() => setLoading(false));
    }
  }, [popoverOpen, fetchWorkspaces]);

  function handleSwitch(orgId: string) {
    if (orgId === activeOrgId) {
      setPopoverOpen(false);
      return;
    }
    startSwitching(async () => {
      await authClient.organization.setActive({ organizationId: orgId });
      setPopoverOpen(false);
      router.push("/dashboard/new");
      router.refresh();
    });
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;

    startCreating(async () => {
      const res = await createWorkspace(name);
      if ("workspaceId" in res) {
        await authClient.organization.setActive({
          organizationId: res.workspaceId,
        });
        setNewName("");
        setShowNewInput(false);
        setPopoverOpen(false);
        router.push("/dashboard/new");
        router.refresh();
      }
    });
  }

  const isPlaygroundActive = activeWs?.isPlayground ?? !activeWs;
  const displayName = activeWs?.name ?? "Playground";

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2.5 mx-1 my-2 px-2 py-1.5 rounded-lg transition-colors text-left w-auto",
            "hover:bg-neutral-700/50",
            !isOpen && "justify-center px-0 mx-0",
          )}
        >
          <OrgAvatar
            name={displayName}
            isPlayground={isPlaygroundActive}
            size="sm"
          />
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 overflow-hidden whitespace-nowrap flex-1 min-w-0"
              >
                <span className="text-[13px] font-medium text-neutral-300 truncate">
                  {displayName}
                </span>
                <ChevronsUpDown className="w-3 h-3 text-neutral-600 flex-shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-56 p-0 bg-neutral-900 border-neutral-700/80 rounded-lg overflow-hidden shadow-xl"
      >
        <div className="px-3 pt-3 pb-1.5">
          <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
            Projects
          </p>
        </div>

        <div className="max-h-64 overflow-y-auto px-1 pb-1">
          {loading && workspaces.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            </div>
          ) : (
            <>
              {playground && (
                <button
                  onClick={() => handleSwitch(playground.id)}
                  disabled={switching}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-left transition-colors",
                    playground.id === activeOrgId
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200",
                    switching && "opacity-60 cursor-wait",
                  )}
                >
                  <OrgAvatar name="Playground" isPlayground size="sm" />
                  <span className="text-[13px] font-medium truncate flex-1">
                    Playground
                  </span>
                  {playground.id === activeOrgId && (
                    <Check className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                </button>
              )}

              {playground && namedProjects.length > 0 && (
                <div className="h-px bg-neutral-800 mx-1.5 my-1" />
              )}

              {namedProjects.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => handleSwitch(ws.id)}
                  disabled={switching}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-left transition-colors",
                    ws.id === activeOrgId
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200",
                    switching && "opacity-60 cursor-wait",
                  )}
                >
                  <OrgAvatar name={ws.name} isPlayground={false} size="sm" />
                  <span className="text-[13px] font-medium truncate flex-1">
                    {ws.name}
                  </span>
                  {ws.id === activeOrgId && (
                    <Check className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="border-t border-neutral-800 px-1 py-1">
          {showNewInput ? (
            <div className="px-1.5 py-1.5 space-y-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setShowNewInput(false);
                    setNewName("");
                  }
                }}
                placeholder="e.g. Bugatti Mansions"
                className="w-full bg-neutral-800 border border-neutral-700/60 rounded-md px-2.5 py-1.5 text-[13px] text-white placeholder:text-neutral-600 outline-none focus:border-neutral-600 transition-colors"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setShowNewInput(false);
                    setNewName("");
                  }}
                  className="flex-1 text-[11px] text-neutral-500 hover:text-neutral-300 py-0.5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  className="flex-1 text-[11px] font-medium text-white bg-neutral-700 hover:bg-neutral-600 rounded py-0.5 transition-colors disabled:opacity-40"
                >
                  {creating ? (
                    <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewInput(true)}
              className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-left text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-300 transition-colors"
            >
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border border-dashed border-neutral-700">
                <Plus className="w-3 h-3" />
              </div>
              <span className="text-[13px] font-medium">New Project</span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
