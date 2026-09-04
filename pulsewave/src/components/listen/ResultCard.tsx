"use client";

import { motion } from "motion/react";
import { Play, Plus, Heart, Download, Clock, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlayer, type Track } from "@/lib/player-context";
import { useLikes } from "@/hooks/use-likes";
import { postJson } from "@/hooks/use-api-data";
import AddToPlaylistMenu from "@/components/library/AddToPlaylistMenu";

interface IdentifiedSong extends Track {
  confidence: number;
}

interface ResultCardProps {
  song: IdentifiedSong;
  onClose: () => void;
  onPlay: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ResultCard({ song, onClose, onPlay }: ResultCardProps) {
  const { addToQueue } = usePlayer();
  const { isLiked, toggleLike } = useLikes();
  const liked = isLiked(song.id);

  const downloadSong = async () => {
    try {
      await postJson("/api/library", { action: "download", songId: song.id });
    } catch {
      /* ignore */
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="glass-strong rounded-2xl p-6 w-full max-w-md mx-auto space-y-4"
    >
      <div className="flex items-start gap-4">
        <div
          className={`h-20 w-20 rounded-xl bg-gradient-to-br ${song.artwork ?? "from-neon-cyan/20 to-neon-blue-deep/20"} border border-neon-cyan/20 flex items-center justify-center shrink-0`}
        >
          <Disc3 className="h-10 w-10 text-neon-cyan" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="neon" className="text-[10px]">
              {song.confidence}% match
            </Badge>
          </div>
          <h3 className="font-poppins text-lg font-bold text-text-primary truncate">
            {song.title}
          </h3>
          <p className="text-sm text-text-secondary truncate">{song.artist}</p>
          <p className="text-xs text-text-muted">{song.album}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDuration(song.duration)}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {song.genre || "Unknown genre"}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button variant="neon" size="lg" className="flex-1" onClick={onPlay}>
          <Play className="h-4 w-4" />
          Play Preview
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => addToQueue(song)}
          aria-label="Add to queue"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => toggleLike(song.id)}
          className={liked ? "text-neon-cyan" : ""}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={downloadSong}
          aria-label="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
        <AddToPlaylistMenu songId={song.id} />
      </div>

      <button
        onClick={onClose}
        className="w-full text-center text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
      >
        Dismiss
      </button>
    </motion.div>
  );
}