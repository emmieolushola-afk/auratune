"use client";

import { paletteFromArtwork } from "@/lib/art/albumColors";
import { usePlayer } from "@/lib/player-context";

interface ArtworkPulseProps {
  artwork: string;
  playing: boolean;
  className?: string;
}

/**
 * Neon pulse ring that radiates outward behind album art while music is
 * playing. Uses the track's derived palette color.
 */
export default function ArtworkPulse({ artwork, playing, className = "" }: ArtworkPulseProps) {
  const { isPlaying } = usePlayer();
  const active = playing ?? isPlaying;
  const { accent } = paletteFromArtwork(artwork);

  if (!active) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-2xl"
          style={{
            background: accent,
            opacity: 0,
            transform: "scale(1)",
            animation: `pulseWave 2.2s ease-out ${i * 0.6}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
