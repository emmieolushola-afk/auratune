"use client";

import { use } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePlayer, type Track } from "@/lib/player-context";
import { useApiData, postJson } from "@/hooks/use-api-data";
import { useLikes } from "@/hooks/use-likes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Disc3, Heart, Download, Clock, ChevronLeft } from "lucide-react";
import AddToPlaylistMenu from "@/components/library/AddToPlaylistMenu";
import { Skeleton, SkeletonRowList } from "@/components/ui/Skeleton";

interface AlbumResponse {
  album: {
    id: string;
    title: string;
    artist: string;
    artistId: string;
    year: number;
    artwork: string;
    trackCount: number;
  };
  tracks: Track[];
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { play } = usePlayer();
  const { isLiked, toggleLike } = useLikes();
  const { data, loading } = useApiData<AlbumResponse>(`/api/albums/${id}`);

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <Skeleton className="h-40 w-40 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <SkeletonRowList count={6} />
      </div>
    );
  }
  if (!data) {
    return <p className="text-text-muted text-sm">Album not found.</p>;
  }

  const { album, tracks } = data;

  const download = async (songId: string) => {
    try {
      await postJson("/api/library", { action: "download", songId });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-8">
      <Link
        href="/search"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Search
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center md:items-end gap-6"
      >
        <div
          className={`h-44 w-44 rounded-2xl bg-gradient-to-br ${album.artwork} border border-neon-cyan/20 flex items-center justify-center shrink-0 shadow-2xl`}
        >
          <Disc3 className="h-20 w-20 text-neon-cyan" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <Badge variant="neon" className="text-[10px] mb-2">Album</Badge>
          <h1 className="font-poppins text-3xl md:text-4xl font-bold text-text-primary">
            {album.title}
          </h1>
          <p className="text-text-secondary mt-1">
            By{" "}
            <Link href={`/artist/${album.artistId}`} className="hover:underline">
              {album.artist}
            </Link>
          </p>
          <p className="text-xs text-text-muted mt-1">
            {album.year} · {album.trackCount} songs
          </p>
          <div className="mt-4 flex justify-center md:justify-start">
            <Button variant="neon" size="lg" onClick={() => tracks[0] && play(tracks[0])}>
              <Play className="h-4 w-4" /> Play
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="space-y-1">
        {tracks.map((track, i) => {
          const liked = isLiked(track.id);
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => play(track)}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
            >
              <span className="text-lg font-bold text-text-muted w-6 text-center font-mono">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {track.title}
                </p>
                <p className="text-xs text-text-muted truncate">{track.artist}</p>
              </div>
              <span className="text-xs text-text-muted hidden sm:flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(track.duration)}
              </span>
              <AddToPlaylistMenu songId={track.id} />
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${
                  liked ? "text-neon-cyan opacity-100" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(track.id);
                }}
                aria-label="Like"
              >
                <Heart className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  download(track.id);
                }}
                aria-label="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <Play className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
