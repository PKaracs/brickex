"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { authClient } from "@/lib/auth-client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Get current session and identify user
    const identifyUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          const user = session.data.user;
          // Identify user with email - this makes email visible in PostHog recordings list
          // identify() already sets person properties, so no need for separate people.set()
          posthog.identify(user.id, {
            email: user.email,
            name: user.name,
            created_at: user.createdAt,
          });
        }
      } catch (error) {
        console.error("Failed to identify user:", error);
      }
    };

    identifyUser();
  }, []);

  return <>{children}</>;
}
