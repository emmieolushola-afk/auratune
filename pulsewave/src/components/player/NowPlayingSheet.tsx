"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Disc3,
  Heart,
  Download,
  X,
  ListMusic,
  Music2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/player-context";
import { useLikes } from "@/hooks/use-likes";
import { postJson } from "@/hooks/use-api-data";
import { paletteFromArtwork } from "@/lib/art/albumColors";
import WaveformSeeker from "@/components/player/WaveformSeeker";
import ArtworkPulse from "@/components/player/ArtworkPulse";
import AddToPlaylistMenu from "@/components/library/AddToPlaylistMenu";
import { useState } from "react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface NowPlayingSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function NowPlayingSheet({ open, onClose }: NowPlayingSheetProps) {
  const {
    currentTrack,
    isPlaying,
    progress,
    isShuffled,
    repeatMode,
    queue,
    togglePlay,
    toggleShuffle,
    cycleRepeat,
    next,
    previous,
    play,
  } = usePlayer();
  const { isLiked, toggleLike } = useLikes();
  const [activeTab, setActiveTab] = useState<"queue" | "info">("queue");

  if (!currentTrack) return null;

  const isTrackLiked = isLiked(currentTrack.id);
  const { accent } = paletteFromArtwork(currentTrack.artwork ?? "");
  const currentTime = (progress / 100) * currentTrack.duration;

  const downloadCurrent = async () => {
    try {
      await postJson("/api/library", { action: "download", songId: currentTrack.id });
    } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260, mass: 0.8 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/[0.08] rounded-t-3xl overflow-hidden"
            style={{ height: "70vh", maxHeight: "70vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col overflow-hidden">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2 shrink-0 cursor-pointer" onClick={onClose}>
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-3 shrink-0">
                <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">
                  Now Playing
                </span>
                <button
                  onClick={onClose}
                  className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin px-6 pb-6">
                {/* Artwork */}
                <div className="relative w-52 h-52 mx-auto mb-6">
                  <ArtworkPulse artwork={currentTrack.artwork ?? ""} playing={isPlaying} />
                  <motion.div
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={isPlaying ? { duration: 8, repeat: Infinity, ease: "linear" } : {}}
                    className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-br from-neon-cyan/15 to-neon-blue-deep/15 border border-white/[0.08] flex items-center justify-center shadow-xl"
                  >
                    <Disc3 className="h-20 w-20 text-neon-cyan/70" />
                  </motion.div>
                </div>

                {/* Track info */}
                <div className="text-center mb-5">
                  <h2 className="font-poppins text-xl font-bold text-text-primary truncate">
                    {currentTrack.title}
                  </h2>
                  <p className="text-sm text-text-secondary mt-0.5">{currentTrack.artist}</p>
                  <p className="text-xs text-text-muted mt-0.5">{currentTrack.album}</p>
                </div>

                {/* Waveform seeker */}
                <div className="mb-3">
                  <WaveformSeeker artwork={currentTrack.artwork ?? ""} />
                </div>

                {/* Time display */}
                <div className="flex justify-between text-[10px] text-text-muted tabular-nums mb-4 px-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(currentTrack.duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-5 mb-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 ${isShuffled ? "text-neon-cyan" : "text-text-secondary"}`}
                    onClick={toggleShuffle}
                    aria-label="Shuffle"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={previous} aria-label="Previous">
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <motion.div whileTap={{ scale: 0.88 }} transition={{ type: "spring", damping: 15, stiffness: 400 }}>
                    <Button
                      variant="neon"
                      size="icon"
                      className="h-14 w-14"
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      style={{ boxShadow: `0 0 20px ${accent}50, 0 4px 15px rgba(0,0,0,0.3)` }}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                    </Button>
                  </motion.div>
                  <Button variant="ghost" size="icon" className="h-10 w-10" onClick={next} aria-label="Next">
                    <SkipForward className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 ${repeatMode !== "off" ? "text-neon-cyan" : "text-text-secondary"}`}
                    onClick={cycleRepeat}
                    aria-label="Repeat"
                  >
                    {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Action row */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.div whileTap={{ scale: 0.85 }} transition={{ type: "spring", damping: 12, stiffness: 300 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-9 w-9 ${isTrackLiked ? "text-neon-cyan" : "text-text-muted"}`}
                      onClick={() => toggleLike(currentTrack.id)}
                      aria-label={isTrackLiked ? "Unlike" : "Like"}
                    >
                      <Heart className="h-4 w-4" fill={isTrackLiked ? "currentColor" : "none"} />
                    </Button>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-text-muted hover:text-text-primary"
                    onClick={downloadCurrent}
                    aria-label="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <AddToPlaylistMenu songId={currentTrack.id} />
                </div>

                {/* Tabs */}
                <div className="border-t border-white/[0.06] pt-4">
                  <div className="flex gap-1 mb-3 bg-surface-interactive/50 rounded-xl p-1">
                    <button
                      onClick={() => setActiveTab("queue")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "queue"
                          ? "bg-surface-card text-text-primary shadow-sm"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      <ListMusic className="h-3.5 w-3.5" />
                      Queue
                    </button>
                    <button
                      onClick={() => setActiveTab("info")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "info"
                          ? "bg-surface-card text-text-primary shadow-sm"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                    >
                      <Music2 className="h-3.5 w-3.5" />
                      Info
                    </button>
                  </div>

                  {activeTab === "queue" && (
                    <div className="space-y-1">
                      {queue.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-4">Queue is empty</p>
                      ) : (
                        queue.map((track) => {
                          const isActive = track.id === currentTrack.id;
                          return (
                            <div
                              key={track.id}
                              onClick={() => play(track)}
                              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                isActive
                                  ? "bg-white/[0.06]"
                                  : "hover:bg-white/[0.03]"
                              }`}
                            >
                              <div className={`h-8 w-8 rounded bg-gradient-to-br ${track.artwork ?? currentTrack.artwork ?? ""} flex items-center justify-center shrink-0 ${isActive ? "border border-neon-cyan/30" : ""}`}>
                                <Disc3 className={`h-4 w-4 ${isActive ? "text-neon-cyan" : "text-text-muted"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium truncate ${isActive ? "text-neon-cyan" : "text-text-primary"}`}>
                                  {track.title}
                                </p>
                                <p className="text-[10px] text-text-muted truncate">{track.artist}</p>
                              </div>
                              {isActive && isPlaying && (
                                <div className="flex gap-[2px] items-end h-3">
                                  {[0, 1, 2].map((b) => (
                                    <div
                                      key={b}
                                      className="w-[3px] bg-neon-cyan rounded-full"
                                      style={{
                                        animation: `queueWave 0.8s ease-in-out ${b * 0.15}s infinite`,
                                        height: "8px",
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {activeTab === "info" && (
                    <div className="space-y-3 text-sm">
                      <InfoRow label="Title" value={currentTrack.title} />
                      <InfoRow label="Artist" value={currentTrack.artist} />
                      <InfoRow label="Album" value={currentTrack.album} />
                      <InfoRow label="Genre" value={currentTrack.genre} />
                      <InfoRow label="Duration" value={formatTime(currentTrack.duration)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-muted text-xs">{label}</span>
      <span className="text-text-primary text-xs font-medium truncate ml-4">{value}</span>
    </div>
  );
}
