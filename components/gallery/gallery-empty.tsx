"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Sparkles } from "lucide-react";
import Link from "next/link";

export function GalleryEmpty() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md w-full rounded-xl border border-neutral-800 bg-neutral-900/30 p-8">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Icon */}
          <div className="h-20 w-20 rounded-2xl bg-neutral-800/50 border border-neutral-700 flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-neutral-500" />
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">
              No generations yet
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Your generated images will appear here. Start creating stunning
              architectural visualizations with BrickEx.
            </p>
          </div>

          {/* CTA Button */}
          <Link href="/dashboard/new">
            <Button className="bg-white text-black hover:bg-neutral-200 font-semibold h-11 px-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Create Your First Image
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
