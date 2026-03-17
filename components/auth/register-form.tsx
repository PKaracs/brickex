"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import posthog from "posthog-js";
import { captureMetaTrackingData } from "@/lib/meta-tracking";
import { updateMetaTracking } from "@/lib/actions/update-meta-tracking";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Capture email in PostHog for session recordings
      if (data.email) {
        posthog.capture("$identify", {
          email: data.email,
          name: data.name,
        });
        posthog.people.set({
          email: data.email,
          name: data.name,
        });
      }

      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
        return;
      }

      // NOTE: Signup tracking removed - handled by server-side CAPI in database hook (lib/auth.ts)
      // to prevent double-counting (see META_PIXEL_AUDIT.md)

      // Capture Meta tracking data (fbp, fbc, userAgent) for enhanced match quality
      // This is stored in DB and used for server-side CompleteRegistration event
      const trackingData = captureMetaTrackingData();
      updateMetaTracking(trackingData).catch((err) =>
        console.error("[Meta Tracking] Failed to save at signup:", err)
      );

      router.push("/dashboard/new");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 sm:space-y-4"
      >
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          rules={{
            required: "Name is required",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-400 text-xs sm:text-sm">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Gordon Gekko"
                  className="h-10 sm:h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0 text-sm sm:text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-400 text-xs sm:text-sm">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="h-10 sm:h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0 text-sm sm:text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-400 text-xs sm:text-sm">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-10 sm:h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0 text-sm sm:text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          rules={{
            required: "Please confirm your password",
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-neutral-400 text-xs sm:text-sm">
                Confirm Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="h-10 sm:h-11 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0 text-sm sm:text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="white"
          size="default"
          className="w-full h-10 sm:h-11 text-sm sm:text-base"
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>
    </Form>
  );
}
