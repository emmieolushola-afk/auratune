import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-surface-deepest",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-neon-cyan text-surface-deepest",
        secondary:
          "border-transparent bg-surface-interactive text-text-secondary",
        destructive:
          "border-transparent bg-destructive text-white",
        outline: "text-text-secondary border-surface-border",
        neon: "border-neon-cyan text-neon-cyan bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
