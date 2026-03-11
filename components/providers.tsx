"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { UserJotProvider } from "@/components/userjot-provider";
import { SelineProvider } from "@/components/seline-provider";
import { useMetaFbclid } from "@/hooks/use-meta-fbclid";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Capture fbclid from Meta ads on every page load
  // This ensures we capture the click ID even if Meta Pixel is blocked
  useMetaFbclid();

  return (
    <QueryClientProvider client={queryClient}>
      <SelineProvider>
        <UserJotProvider>{children}</UserJotProvider>
      </SelineProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "bg-neutral-900 border border-neutral-800 text-white",
          style: {
            background: "#171717",
            border: "1px solid #262626",
            color: "#ffffff",
          },
        }}
      />
    </QueryClientProvider>
  );
}
