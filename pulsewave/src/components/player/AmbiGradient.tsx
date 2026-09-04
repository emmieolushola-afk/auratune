"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePlayer } from "@/lib/player-context";
import { paletteFromArtwork } from "@/lib/art/albumColors";

/**
 * Animated, blurred gradient background layer that cross-fades with each
 * track change. Uses AnimatePresence keyed on track ID so the old layer
 * fades out over 3s while the new one fades in over 2.5s.
 */
export default function AmbiGradient() {
  const { currentTrack, isPlaying } = usePlayer();
  const palette = paletteFromArtwork(currentTrack?.artwork ?? "");

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentTrack?.id ?? "none"}
          initial={{ opacity: 0 }}
          animate={{ opacity: isPlaying ? 0.28 : 0.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, ${palette.primary}55 0%, transparent 60%),
              radial-gradient(ellipse at 80% 70%, ${palette.secondary}44 0%, transparent 55%),
              radial-gradient(ellipse at 50% 50%, ${palette.accent}22 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, #1a0b2e 0%, #05020a 100%)
            `,
          }}
        />
      </AnimatePresence>
    </div>
  );
}
