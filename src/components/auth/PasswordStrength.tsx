"use client";

import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

const requirements = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password: string) {
  if (!password) return 0;
  return requirements.filter((r) => r.test(password)).length;
}

const strengthConfig = [
  { label: "", color: "bg-transparent", width: "0%" },
  { label: "Very Weak", color: "bg-red-500", width: "20%" },
  { label: "Weak", color: "bg-orange-500", width: "40%" },
  { label: "Fair", color: "bg-yellow-500", width: "60%" },
  { label: "Strong", color: "bg-neon-blue-dim", width: "80%" },
  { label: "Very Strong", color: "bg-neon-cyan", width: "100%" },
];

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);
  const config = strengthConfig[strength];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{config.label}</span>
        <span className="text-xs text-text-muted">{strength}/5</span>
      </div>
      <div className="h-1 w-full rounded-full bg-surface-interactive overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", config.color)}
          style={{ width: config.width }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                req.test(password) ? "bg-neon-cyan" : "bg-surface-border"
              )}
            />
            <span
              className={cn(
                "text-[10px] transition-colors duration-300",
                req.test(password) ? "text-text-secondary" : "text-text-muted"
              )}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
