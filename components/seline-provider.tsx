"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { seline, storeUtmParams, getStoredUtmParams } from "@/lib/seline";

export function SelineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Capture UTM params on first visit (for Meta ads attribution)
    storeUtmParams();

    const identifyUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user && window.seline) {
          const user = session.data.user;
          const utmParams = getStoredUtmParams();

          // Set user with plan info and UTM attribution
          seline.setUser({
            userId: user.id,
            email: user.email || undefined,
            name: user.name || undefined,
            // Include signup source from UTM for cohort analysis
            signup_source: utmParams.utm_source || "organic",
            utm_campaign: utmParams.utm_campaign,
            utm_medium: utmParams.utm_medium,
          });
        }
      } catch (error) {
        console.error("Failed to identify user in Seline:", error);
      }
    };

    // Wait for Seline script to load
    const checkSeline = setInterval(() => {
      if (window.seline) {
        clearInterval(checkSeline);
        identifyUser();
      }
    }, 100);

    // Cleanup after 5 seconds if Seline never loads
    const timeout = setTimeout(() => clearInterval(checkSeline), 5000);

    return () => {
      clearInterval(checkSeline);
      clearTimeout(timeout);
    };
  }, []);

  return <>{children}</>;
}
