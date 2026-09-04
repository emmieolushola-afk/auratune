"use client";

import { Music } from "lucide-react";

export default function NeonLogo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const sizeClasses = size === "lg" ? "h-12 w-12" : "h-8 w-8";
  const textSize = size === "lg" ? "text-3xl" : "text-xl";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses} rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center neon-border-subtle`}
      >
        <Music className={`${size === "lg" ? "h-6 w-6" : "h-4 w-4"} text-neon-cyan`} />
      </div>
      <span className={`font-poppins ${textSize} font-bold tracking-tight text-text-primary animate-neon-text`}>
        Pulse<span className="text-neon-cyan">Wave</span>
      </span>
    </div>
  );
}
