"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, LogOut, Mail, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { compressImage } from "@/lib/image-utils";

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getInitials(name: string | null | undefined) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileSettingsModal({
  open,
  onOpenChange,
}: ProfileSettingsModalProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(session?.user?.name ?? "");
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemovePhoto(false);
  }, [open, session?.user?.name, session?.user?.image]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const currentImageUrl = removePhoto
    ? null
    : previewUrl ?? session?.user?.image ?? null;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextFile = event.target.files?.[0];
    event.target.value = "";

    if (!nextFile) return;

    if (!ACCEPTED_IMAGE_TYPES.has(nextFile.type)) {
      toast.error("Use a JPG, PNG, WebP, or GIF image.");
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Profile photos must be 10MB or smaller.");
      return;
    }

    try {
      const compressedFile = await compressImage(nextFile);
      setSelectedFile(compressedFile);
      setRemovePhoto(false);
    } catch (error) {
      console.error("[ProfileSettings] Image compression failed:", error);
      toast.error("Could not process that image. Try another file.");
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemovePhoto(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Name is required.");
      return;
    }

    if (!session?.user) {
      toast.error("You need to sign in again.");
      return;
    }

    setIsSaving(true);

    try {
      let image = removePhoto ? null : session.user.image ?? null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/profile/image", {
          method: "POST",
          body: formData,
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload.imageUrl) {
          throw new Error(payload.error || "Failed to upload profile photo.");
        }

        image = payload.imageUrl as string;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          image,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update profile.");
      }

      await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
      });
      router.refresh();
      toast.success("Profile updated.");
      onOpenChange(false);
    } catch (error) {
      console.error("[ProfileSettings] Save failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsSigningOut(true);

    try {
      if (session?.user?.id) {
        sessionStorage.removeItem(`meta_user_data_set_${session.user.id}`);
      }

      await authClient.signOut();
      onOpenChange(false);
      router.push("/app/login");
    } catch (error) {
      console.error("[ProfileSettings] Logout failed:", error);
      toast.error("Failed to log out. Try again.");
      setIsSigningOut(false);
    }
  };

  const hasChanges =
    name.trim() !== (session?.user?.name ?? "").trim() ||
    selectedFile !== null ||
    (removePhoto && Boolean(session?.user?.image));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-neutral-800 bg-neutral-950 p-0 text-white sm:rounded-2xl">
        <div className="space-y-6 p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold text-white">
              Profile settings
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-400">
              Update your name and profile photo.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-24 w-24 border border-neutral-700">
                <AvatarImage src={currentImageUrl ?? undefined} />
                <AvatarFallback className="bg-neutral-800 text-lg text-neutral-200">
                  {isPending ? "..." : getInitials(name || session?.user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <p className="text-sm font-medium text-white">
                    Profile photo
                  </p>
                  <p className="text-xs text-neutral-400">
                    Upload a clear image for your account avatar.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Button
                    type="button"
                    variant="white"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    Change photo
                  </Button>
                  {(currentImageUrl || selectedFile) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                      onClick={handleRemovePhoto}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-neutral-300">
                Name
              </Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email" className="text-neutral-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  id="profile-email"
                  value={session?.user?.email ?? ""}
                  readOnly
                  disabled
                  className="pl-10 text-neutral-400"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-neutral-800 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="border border-red-950 bg-red-500/10 text-red-300 hover:bg-red-500/15 hover:text-red-200"
              onClick={handleLogout}
              isLoading={isSigningOut}
              disabled={isSaving || isPending}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                className="border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || isSigningOut}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="white"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!hasChanges || isPending || isSigningOut}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
