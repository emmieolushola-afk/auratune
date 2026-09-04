"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Clock, Disc3, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer, type Track } from "@/lib/player-context";

interface HistoryItem extends Track {
  confidence: number;
  identifiedAt: string;
}

interface SongHistoryProps {
  refreshKey?: number;
}

export default function SongHistory({ refreshKey = 0 }: SongHistoryProps) {
  const { play } = usePlayer();
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { history: HistoryItem[] }) => {
        if (active) {
          setError(false);
          setItems(data.history);
        }
      })
      .catch(() => {
        if (active) {
          setItems([]);
          setError(true);
        }
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const clearHistory = async () => {
    try {
      await fetch("/api/history", { method: "DELETE" });
      setItems([]);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-poppins text-sm font-semibold text-text-secondary">
          Recently Identified
        </h3>
        {items && items.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-text-muted hover:text-red-400"
            onClick={clearHistory}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {items === null ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-neon-cyan animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-text-muted px-2 py-4 text-center">
            {error
              ? "Could not load history"
              : "Songs you identify will appear here"}
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((song, i) => (
              <motion.div
                key={song.id + i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => play(song)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
              >
                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${song.artwork ?? "from-neon-cyan/20 to-neon-blue-deep/20"} flex items-center justify-center shrink-0`}
                >
                  <Disc3 className="h-5 w-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {song.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">{song.artist}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-neon-cyan font-mono">
                    {song.confidence}%
                  </span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {timeAgo(song.identifiedAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}