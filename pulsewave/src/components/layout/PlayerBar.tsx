"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Disc3,
  Heart,
  Download,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/player-context";
import { useLikes } from "@/hooks/use-likes";
import { postJson } from "@/hooks/use-api-data";
import { paletteFromArtwork } from "@/lib/art/albumColors";
import WaveformSeeker from "@/components/player/WaveformSeeker";
import NowPlayingSheet from "@/components/player/NowPlayingSheet";
import AddToPlaylistMenu from "@/components/library/AddToPlaylistMenu";

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isShuffled,
    repeatMode,
    togglePlay,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    next,
    previous,
  } = usePlayer();
  const { isLiked, toggleLike } = useLikes();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!currentTrack) return null;

  const isTrackLiked = isLiked(currentTrack.id);
  const { accent } = paletteFromArtwork(currentTrack.artwork ?? "");

  const downloadCurrent = async () => {
    try {
      await postJson("/api/library", {
        action: "download",
        songId: currentTrack.id,
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <div className="h-16 md:h-20 glass-strong border-t border-surface-border flex items-center px-3 md:px-4 gap-2 md:gap-4">
        {/* Song info */}
        <div className="flex items-center gap-3 w-44 md:w-72 shrink-0">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : {}}
            transition={
              isPlaying ? { duration: 4, repeat: Infinity, ease: "linear" } : {}
            }
            className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-blue-deep/20 border border-neon-cyan/20 flex items-center justify-center shrink-0 relative overflow-hidden"
          >
            <Disc3 className="h-5 w-5 md:h-6 md:w-6 text-neon-cyan" />
          </motion.div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-text-primary truncate">
              {currentTrack.title}
            </p>
            <p className="text-[10px] md:text-xs text-text-muted truncate">
              {currentTrack.artist}
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.82 }} transition={{ type: "spring", damping: 12, stiffness: 350 }}>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 shrink-0 hidden sm:flex ${
                isTrackLiked ? "text-neon-cyan" : ""
              }`}
              onClick={() => toggleLike(currentTrack.id)}
              aria-label={isTrackLiked ? "Unlike" : "Like"}
            >
              <Heart
                className="h-4 w-4 transition-colors"
                fill={isTrackLiked ? "currentColor" : "none"}
              />
            </Button>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hidden sm:flex text-text-muted hover:text-neon-cyan"
            onClick={downloadCurrent}
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <div className="hidden sm:flex">
            <AddToPlaylistMenu songId={currentTrack.id} />
          </div>
        </div>

        {/* Controls + Waveform */}
        <div className="flex-1 flex flex-col items-center gap-1 md:gap-2">
          <div className="flex items-center gap-1 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 md:h-8 md:w-8 hidden md:flex ${
                isShuffled ? "text-neon-cyan" : "text-text-secondary"
              }`}
              onClick={toggleShuffle}
            >
              <Shuffle className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8"
              onClick={previous}
            >
              <SkipBack className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            <motion.div whileTap={{ scale: 0.85 }} transition={{ type: "spring", damping: 14, stiffness: 380 }}>
              <Button
                variant="neon"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
                onClick={togglePlay}
                style={{ boxShadow: `0 0 12px ${accent}40` }}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8"
              onClick={next}
            >
              <SkipForward className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 md:h-8 md:w-8 hidden md:flex ${
                repeatMode !== "off" ? "text-neon-cyan" : "text-text-secondary"
              }`}
              onClick={cycleRepeat}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              ) : (
                <Repeat className="h-3.5 w-3.5 md:h-4 md:w-4" />
              )}
            </Button>
          </div>

          {/* Waveform seeker (replaces static progress bar) */}
          <div className="w-full max-w-lg">
            <WaveformSeeker artwork={currentTrack.artwork ?? ""} compact />
          </div>
        </div>

        {/* Volume & extras */}
        <div className="hidden md:flex items-center gap-2 w-40 shrink-0">
          <button
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            onClick={() => setVolume(volume > 0 ? 0 : 75)}
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <div
            className="flex-1 h-1 bg-surface-interactive rounded-full overflow-hidden group cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = ((e.clientX - rect.left) / rect.width) * 100;
              setVolume(Math.max(0, Math.min(100, pct)));
            }}
          >
            <div
              className="h-full bg-text-secondary rounded-full group-hover:bg-neon-cyan transition-colors"
              style={{ width: `${volume}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-text-secondary group-hover:bg-neon-cyan opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-secondary"
            onClick={() => setSheetOpen(true)}
            aria-label="Now playing"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <NowPlayingSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
