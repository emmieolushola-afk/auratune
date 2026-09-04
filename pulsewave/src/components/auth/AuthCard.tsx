"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import NeonLogo from "./NeonLogo";

export default function AuthCard() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[420px] mx-auto"
    >
      {/* Animated neon border */}
      <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-neon-cyan via-neon-blue-deep to-neon-cyan bg-[length:400%_400%] animate-border-glow opacity-60" />

      {/* Glass card */}
      <div className="relative glass-strong rounded-3xl p-8 space-y-6">
        <div className="flex justify-center">
          <NeonLogo />
        </div>

        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <LoginForm onSwitchToSignup={() => setMode("signup")} />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <SignupForm onSwitchToLogin={() => setMode("login")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
