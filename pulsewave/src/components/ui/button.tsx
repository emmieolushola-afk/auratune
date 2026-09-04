import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-deepest disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-neon-cyan text-surface-deepest font-semibold hover:bg-neon-cyan/90 neon-border-subtle hover:neon-border",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-surface-border bg-transparent text-text-primary hover:bg-surface-interactive hover:border-neon-cyan/30",
        secondary:
          "bg-surface-interactive text-text-primary hover:bg-surface-interactive/80 border border-surface-border",
        ghost:
          "text-text-secondary hover:bg-surface-interactive hover:text-text-primary",
        link: "text-neon-cyan underline-offset-4 hover:underline",
        neon:
          "border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-surface-deepest font-semibold shadow-[0_0_8px_#00CFFF,0_0_24px_rgba(0,207,255,0.3)] hover:shadow-[0_0_12px_#00CFFF,0_0_36px_rgba(0,207,255,0.5)]",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        xl: "h-14 rounded-full px-10 text-lg",
        icon: "h-10 w-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
