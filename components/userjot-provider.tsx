"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { identifyUserJot } from "@/lib/userjot";

/**
 * UserJot Provider - Identifies logged-in users to UserJot
 */
export function UserJotProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      // Extract first and last name from full name
      const nameParts = session.user.name?.split(" ") || [];
      const firstName = nameParts[0] || undefined;
      const lastName = nameParts.slice(1).join(" ") || undefined;

      identifyUserJot({
        id: session.user.id,
        email: session.user.email || undefined,
        firstName,
        lastName,
        avatar: session.user.image || undefined,
      });
    }
  }, [session?.user]);

  return <>{children}</>;
}


