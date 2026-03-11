"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, CheckCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import posthog from "posthog-js";

interface RequestItemButtonProps {
  type: "template" | "object";
  className?: string;
}

export function RequestItemButton({ type, className }: RequestItemButtonProps) {
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeLabel = type === "template" ? "Template" : "Object";
  const typeArticle = type === "template" ? "a" : "an";
  const typeLower = type === "template" ? "template" : "object";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Capture email in PostHog for session recordings if provided
      if (userEmail.trim()) {
        posthog.capture("$identify", {
          email: userEmail.trim(),
        });
        posthog.people.set({
          email: userEmail.trim(),
        });
      }

      const response = await fetch("/api/request-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          itemName: itemName.trim(),
          userEmail: userEmail.trim() || undefined,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setItemName("");
        setUserEmail("");
        setTimeout(() => {
          setOpen(false);
          setTimeout(() => setSuccess(false), 300);
        }, 2000);
      } else {
        setError("Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Failed to submit request:", err);
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setItemName("");
        setUserEmail("");
        setError(null);
        setSuccess(false);
      }, 300);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
      >
        <MessageSquarePlus className="h-4 w-4 mr-2" />
        Request {typeArticle} {typeLabel}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-neutral-950 border-neutral-800/50 w-full md:max-w-[400px] p-0 overflow-hidden">
          {success ? (
            <div className="py-12 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-7 w-7 text-green-500" />
              </div>
              <p className="text-white font-semibold text-lg">
                Request Submitted!
              </p>
              <p className="text-neutral-400 text-sm mt-2">
                We'll review and add it soon.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="text-white text-lg font-semibold">
                  Request {typeArticle} {typeLabel}
                </DialogTitle>
                <DialogDescription className="text-neutral-400 text-sm">
                  Can't find what you need? Tell us!
                </DialogDescription>
              </DialogHeader>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="itemName"
                    className="text-neutral-200 text-sm font-medium"
                  >
                    What {typeLower} would you like?
                  </Label>
                  <Input
                    id="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={
                      type === "template"
                        ? "e.g., Luxury Penthouse, Yacht Interior"
                        : "e.g., Ferrari SF90, Hermès Bag"
                    }
                    className="bg-neutral-900 border-neutral-700/50 text-white h-12 rounded-xl placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="userEmail"
                    className="text-neutral-200 text-sm font-medium"
                  >
                    Your email{" "}
                    <span className="text-neutral-500 font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="bg-neutral-900 border-neutral-700/50 text-white h-12 rounded-xl placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-neutral-600"
                  />
                  <p className="text-xs text-neutral-500">
                    Get notified when we add it
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="flex-1 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800 hover:text-white h-12 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !itemName.trim()}
                    className="flex-1 bg-white text-black hover:bg-neutral-200 h-12 rounded-xl font-medium disabled:opacity-50"
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
