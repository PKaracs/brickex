"use client";
import React from "react";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type Plan = {
  id: string;
  name: string;
  price: number | string;
  subText?: string;
  currency: string;
  features: string[];
  featured?: boolean;
  buttonText?: string;
  additionalFeatures?: string[];
  onClick: () => void;
};

export function PricingCard({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-1 sm:p-4 md:p-4",
        plan.featured
          ? "border-white/15 bg-zinc-900"
          : "border-zinc-800 bg-zinc-900/50",
      )}
    >
      <div className="flex h-full flex-col justify-start gap-4">
        <div
          className={cn(
            "shadow-input w-full rounded-2xl p-4",
            plan.featured
              ? "bg-zinc-800 shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.05)]"
              : "bg-zinc-800/50 shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.03)]",
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium text-white">
                {plan.name}
              </p>
            </div>

            {plan.featured && (
              <div className="relative rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                <div className="absolute inset-x-0 bottom-0 mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-white to-transparent" />
                Popular
              </div>
            )}
          </div>
          <div className="mt-8">
            <div className="flex items-end">
              <span className="text-lg font-bold text-zinc-400">
                {plan.currency}
              </span>
              <div className="flex items-start gap-2">
                <span className="text-3xl font-bold text-white md:text-7xl">
                  {plan?.price}
                </span>
              </div>
              <span className="mb-1 text-base font-normal text-zinc-400 md:mb-2">
                {plan.subText}
              </span>
            </div>
          </div>
          <button
            className={cn(
              "mt-10 mb-4 w-full rounded-lg px-2 py-2.5 font-medium md:w-full transition-all",
              plan.featured
                ? "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10"
                : "bg-zinc-700 text-white hover:bg-zinc-600 border border-zinc-600",
            )}
            onClick={onClick}
          >
            {plan.buttonText}
          </button>
        </div>
        <div className="mt-1 p-4">
          {plan.features.map((feature, idx) => (
            <Step key={idx}>{feature}</Step>
          ))}
        </div>
        {plan.additionalFeatures && plan.additionalFeatures.length > 0 && (
          <Divider />
        )}
        {plan.additionalFeatures && plan.additionalFeatures.length > 0 && (
          <div className="p-4">
            {plan.additionalFeatures.map((feature, idx) => (
              <Step additional key={idx}>
                {feature}
              </Step>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Step({
  children,
  additional,
}: {
  children: React.ReactNode;
  additional?: boolean;
}) {
  return (
    <div className="my-4 flex items-start justify-start gap-2">
      <div
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
          additional ? "bg-white" : "bg-zinc-700",
        )}
      >
        <IconCheck className={cn("h-3 w-3 stroke-[4px]", additional ? "text-black" : "text-zinc-300")} />
      </div>
      <div className="text-sm font-medium text-zinc-200">
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="relative">
      <div className="h-px w-full bg-zinc-950" />
      <div className="h-px w-full bg-zinc-800" />
      <div className="absolute inset-0 m-auto flex h-5 w-5 items-center justify-center rounded-xl bg-zinc-800 shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.05)]">
        <IconPlus className="h-3 w-3 stroke-[4px] text-zinc-300" />
      </div>
    </div>
  );
}
