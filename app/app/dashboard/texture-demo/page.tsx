"use client";

import { useState } from "react";
import { TextureBall } from "@/components/dashboard/texture-ball";
import { INTERIOR_TEXTURES } from "@/lib/constants/interior-textures";

export default function TextureDemoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(
    INTERIOR_TEXTURES[0]?.id ?? null
  );

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-lg font-semibold text-white">
          Vista previa de textura interior (esfera redondeada)
        </h1>
        <p className="text-sm text-neutral-500">
          Una textura de muestra para aprobacion. Se pueden agregar mas en{" "}
          <code className="text-neutral-400">lib/constants/interior-textures.ts</code>.
        </p>
        <div className="flex flex-wrap gap-4">
          {INTERIOR_TEXTURES.map((texture) => (
            <TextureBall
              key={texture.id}
              texture={texture}
              isSelected={selectedId === texture.id}
              onClick={() => setSelectedId(texture.id)}
              size="lg"
              showLabel
            />
          ))}
        </div>
      </div>
    </div>
  );
}
