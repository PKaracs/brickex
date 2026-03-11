import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-800 text-neutral-200 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_4px_0_0_rgba(0,0,0,0.5),0_8px_16px_-4px_rgba(0,0,0,0.5)] hover:bg-neutral-700 hover:text-white hover:-translate-y-1 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_0_0_1px_rgba(255,255,255,0.05)_inset,0_6px_0_0_rgba(0,0,0,0.5),0_12px_24px_-4px_rgba(0,0,0,0.5)] active:shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_0_0_rgba(0,0,0,0.5)] active:translate-y-1",
        black:
          "bg-neutral-950 text-neutral-200 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_4px_0_0_rgba(0,0,0,0.5),0_8px_16px_-4px_rgba(0,0,0,0.5)] hover:bg-neutral-900 hover:text-white hover:-translate-y-1 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_0_0_1px_rgba(255,255,255,0.05)_inset,0_6px_0_0_rgba(0,0,0,0.5),0_12px_24px_-4px_rgba(0,0,0,0.5)] active:shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_0_0_rgba(0,0,0,0.5)] active:translate-y-1",
        white:
          "bg-white text-neutral-900 shadow-[0_1px_0_0_rgba(0,0,0,0.05)_inset,0_0_0_1px_rgba(0,0,0,0.05)_inset,0_4px_0_0_rgba(0,0,0,0.1),0_8px_16px_-4px_rgba(0,0,0,0.1)] hover:bg-neutral-50 hover:-translate-y-1 hover:shadow-[0_1px_0_0_rgba(0,0,0,0.05)_inset,0_0_0_1px_rgba(0,0,0,0.05)_inset,0_6px_0_0_rgba(0,0,0,0.1),0_12px_24px_-4px_rgba(0,0,0,0.1)] active:shadow-[0_1px_0_0_rgba(0,0,0,0.05)_inset,0_0_0_1px_rgba(0,0,0,0.05)_inset,0_0_0_0_rgba(0,0,0,0.1)] active:translate-y-1",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
