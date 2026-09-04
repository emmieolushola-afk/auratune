"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextPath = searchParams.get("next") || "/home";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === 1 && email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address");
        return;
      }
      setStep(2);
    } else if (step === 2 && password) {
      startTransition(async () => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error || "Login failed");
            return;
          }
          router.push(nextPath);
          router.refresh();
        } catch {
          setError("Network error. Please try again.");
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-poppins text-2xl font-bold text-text-primary">
          Welcome back
        </h2>
        <p className="text-sm text-text-secondary">
          Sign in to continue to PulseWave
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" variant="neon" className="w-full" size="lg">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-text-secondary bg-surface-interactive/50 rounded-xl px-4 py-2.5">
                <span className="truncate flex-1">{email}</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-neon-cyan hover:underline text-xs cursor-pointer"
                >
                  Change
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11"
                  autoFocus
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-surface-border accent-neon-cyan"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-neon-cyan hover:underline text-xs cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                variant="neon"
                className="w-full"
                size="lg"
                disabled={isPending || !password}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Log In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-card px-3 text-text-muted">
            or continue with
          </span>
        </div>
      </div>

      <SocialButtons />

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <button
          onClick={onSwitchToSignup}
          className="text-neon-cyan hover:underline font-medium cursor-pointer"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="secondary" size="lg" className="w-full">
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google
      </Button>
      <Button variant="secondary" size="lg" className="w-full">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        Apple
      </Button>
    </div>
  );
}