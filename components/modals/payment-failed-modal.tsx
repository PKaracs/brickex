"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CreditCard } from "lucide-react";
import { authClient } from "@/lib/auth-client";

/**
 * Non-dismissible modal shown when a user's payment has failed (past_due status).
 * This blocks all app access until the user resolves their payment via the
 * Polar customer portal. Common cause: disposable/one-time-use cards.
 *
 * The modal cannot be closed by clicking outside or pressing Escape.
 * The only way out is to fix payment or log out.
 */
export function PaymentFailedModal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleFixPayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authClient.customer.portal();
      if (result?.data?.url) {
        window.location.href = result.data.url;
      } else {
        setError("Could not open billing portal. Please try again.");
      }
    } catch (err) {
      console.error("[PaymentFailedModal] Portal error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("[PaymentFailedModal] Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-full md:w-[90vw] bg-neutral-900 border-neutral-800 p-6 md:p-8"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showXIcon={false}
      >
        {/* Accessibility title */}
        <DialogTitle className="sr-only">Payment Issue</DialogTitle>

        <div className="flex flex-col items-center text-center space-y-5">
          {/* Warning icon */}
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              Payment Failed
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              We couldn&apos;t process your subscription payment. This usually
              happens when a card expires, gets declined, or has insufficient
              funds.
            </p>
          </div>

          {/* What to do */}
          <div className="w-full p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50 text-left space-y-2">
            <p className="text-sm font-medium text-neutral-300 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              How to fix this:
            </p>
            <ul className="text-sm text-neutral-400 space-y-1 pl-6 list-disc">
              <li>Update your payment method</li>
              <li>Make sure your card has sufficient funds</li>
              <li>Or subscribe again with a valid card</li>
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="w-full space-y-3 pt-1">
            <Button
              onClick={handleFixPayment}
              disabled={isLoading || isLoggingOut}
              className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              Update Payment Method
            </Button>

            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoading || isLoggingOut}
              className="w-full h-10 text-neutral-500 hover:text-neutral-300"
            >
              {isLoggingOut && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Log Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

