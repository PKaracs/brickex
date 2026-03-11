"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const email = searchParams.get("email");

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">
            You're unsubscribed
          </h1>
          <p className="text-neutral-400 mb-6">
            {email ? (
              <>
                <span className="text-neutral-300">{email}</span> has been
                removed from our email list.
              </>
            ) : (
              "You won't receive any more marketing emails from us."
            )}
          </p>
          <p className="text-sm text-neutral-500">
            Changed your mind?{" "}
            <a
              href="https://app.richflex.co"
              className="text-neutral-300 underline hover:text-white"
            >
              Visit Richflex
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-white mb-3">
          Unsubscribe
        </h1>
        <p className="text-neutral-400 mb-6">
          Sorry to see you go. If you clicked an unsubscribe link, you should
          be unsubscribed automatically.
        </p>
        <p className="text-sm text-neutral-500">
          Having trouble?{" "}
          <a
            href="mailto:hello@richflex.co"
            className="text-neutral-300 underline hover:text-white"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <div className="text-neutral-400">Loading...</div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}

