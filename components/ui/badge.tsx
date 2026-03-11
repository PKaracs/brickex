import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white text-neutral-900 shadow-[0_2px_10px_rgba(255,255,255,0.1)]",
        secondary:
          "border-neutral-700/50 bg-neutral-800 text-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
        destructive:
          "border-transparent bg-red-600 text-white shadow-[0_2px_10px_rgba(220,38,38,0.3)]",
        outline:
          "border-neutral-700 bg-transparent text-neutral-300",
        glow:
          "border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_2px_12px_rgba(139,92,246,0.4)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
