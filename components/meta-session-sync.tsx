"use client";

import { useEffect } from "react";

import { updateMetaTracking } from "@/lib/actions/update-meta-tracking";
import { authClient } from "@/lib/auth-client";
import { SESSION_STORAGE_KEYS } from "@/lib/constants/session-storage-keys";
import { setMetaUserData } from "@/lib/meta-pixel";

function getSessionFlag(prefix: string, userId: string) {
  return `${prefix}_${userId}`;
}

export function MetaSessionSync() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const email = session?.user?.email;

  useEffect(() => {
    if (!userId || !email) {
      return;
    }

    const userDataFlag = getSessionFlag("meta_user_data_set", userId);
    if (sessionStorage.getItem(userDataFlag)) {
      return;
    }

    setMetaUserData({
      email,
      externalId: userId,
    });
    sessionStorage.setItem(userDataFlag, "true");
  }, [email, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const persistedFlag = getSessionFlag("meta_tracking_persisted", userId);
    if (sessionStorage.getItem(persistedFlag)) {
      return;
    }

    const rawTrackingData = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.META_TRACKING_DATA,
    );

    if (!rawTrackingData) {
      sessionStorage.removeItem("pending_oauth_signup");
      sessionStorage.removeItem("oauth_started_at");
      return;
    }

    let cancelled = false;

    try {
      const parsed = JSON.parse(rawTrackingData) as {
        fbp?: string | null;
        fbc?: string | null;
        userAgent?: string;
      };

      void updateMetaTracking({
        fbp: parsed.fbp ?? null,
        fbc: parsed.fbc ?? null,
        userAgent: parsed.userAgent ?? "",
      }).then((result) => {
        if (cancelled || !result.success) {
          return;
        }

        sessionStorage.setItem(persistedFlag, "true");
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.META_TRACKING_DATA);
        sessionStorage.removeItem("pending_oauth_signup");
        sessionStorage.removeItem("oauth_started_at");
      });
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.META_TRACKING_DATA);
      sessionStorage.removeItem("pending_oauth_signup");
      sessionStorage.removeItem("oauth_started_at");
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return null;
}
