import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-xl border border-surface-border bg-surface-interactive/50 px-4 py-3 text-sm text-text-primary transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-neon-cyan focus-visible:shadow-[0_0_8px_rgba(0,207,255,0.3),0_0_24px_rgba(0,207,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
