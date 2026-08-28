"use client";

import { motion } from "motion/react";
import { Mic, Loader2 } from "lucide-react";

type MicState = "idle" | "listening" | "processing" | "result" | "error";

interface MicButtonProps {
  state: MicState;
  onClick: () => void;
}

export default function MicButton({ state, onClick }: MicButtonProps) {
  const isListening = state === "listening";
  const isProcessing = state === "processing";

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings */}
      {isListening && (
        <>
          <div className="absolute h-32 w-32 rounded-full border-2 border-neon-cyan/40 animate-pulse-ring" />
          <div
            className="absolute h-32 w-32 rounded-full border-2 border-neon-cyan/30 animate-pulse-ring"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute h-32 w-32 rounded-full border-2 border-neon-cyan/20 animate-pulse-ring"
            style={{ animationDelay: "1s" }}
          />
        </>
      )}

      {/* Glow backdrop */}
      <div
        className={`absolute h-24 w-24 rounded-full transition-all duration-500 ${
          isListening
            ? "bg-neon-cyan/20 blur-xl scale-150"
            : isProcessing
              ? "bg-neon-blue-deep/20 blur-xl scale-125"
              : "bg-neon-cyan/5 blur-lg scale-100"
        }`}
      />

      {/* Main button */}
      <motion.button
        onClick={onClick}
        whileHover={state === "idle" ? { scale: 1.05 } : {}}
        whileTap={state === "idle" ? { scale: 0.95 } : {}}
        animate={
          isListening
            ? {
                boxShadow: [
                  "0 0 20px rgba(0,207,255,0.4), 0 0 60px rgba(0,207,255,0.2)",
                  "0 0 30px rgba(0,207,255,0.6), 0 0 80px rgba(0,207,255,0.3)",
                  "0 0 20px rgba(0,207,255,0.4), 0 0 60px rgba(0,207,255,0.2)",
                ],
              }
            : {}
        }
        transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
        className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          state === "idle"
            ? "bg-surface-card border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 cursor-pointer"
            : "bg-neon-cyan text-surface-deepest"
        } ${state !== "idle" ? "cursor-default" : ""}`}
        disabled={isProcessing || isListening}
      >
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
      </motion.button>

      {/* Label */}
      <motion.p
        className="absolute -bottom-12 text-sm font-medium text-text-secondary"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {state === "idle" && "Tap to identify a song"}
        {state === "listening" && "Listening..."}
        {state === "processing" && "Analyzing frequencies..."}
        {state === "result" && "Song found!"}
        {state === "error" && "Tap to try again"}
      </motion.p>
    </div>
  );
}