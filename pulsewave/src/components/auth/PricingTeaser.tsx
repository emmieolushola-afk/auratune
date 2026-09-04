"use client";

import { motion } from "motion/react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const freeFeatures = [
  "Ad-supported streaming",
  "Standard audio quality",
  "Limited song skips",
  "Shuffle-only playlists",
];

const proFeatures = [
  "Ad-free experience",
  "HiFi lossless quality",
  "Unlimited skips & replays",
  "Offline downloads",
  "Song recognition",
  "Spatial audio",
];

export default function PricingTeaser() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <p className="text-center text-sm text-text-secondary">
        Free forever. Upgrade anytime.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Free tier */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="space-y-1">
            <h4 className="font-poppins text-sm font-semibold text-text-primary">
              Free
            </h4>
            <p className="text-2xl font-bold text-text-primary">
              $0
              <span className="text-xs font-normal text-text-muted">
                /forever
              </span>
            </p>
          </div>
          <ul className="space-y-1.5">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Check className="h-3 w-3 text-text-muted shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="secondary" size="sm" className="w-full">
            Get Started
          </Button>
        </div>

        {/* Pro tier */}
        <div className="relative rounded-xl p-4 space-y-3 border-2 border-neon-cyan/50 bg-surface-card neon-border-subtle">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
            <span className="bg-neon-cyan text-surface-deepest text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" />
              POPULAR
            </span>
          </div>
          <div className="space-y-1 pt-1">
            <h4 className="font-poppins text-sm font-semibold text-neon-cyan">
              Pro
            </h4>
            <p className="text-2xl font-bold text-text-primary">
              $9.99
              <span className="text-xs font-normal text-text-muted">
                /month
              </span>
            </p>
          </div>
          <ul className="space-y-1.5">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Check className="h-3 w-3 text-neon-cyan shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="neon" size="sm" className="w-full">
            Go Pro
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
