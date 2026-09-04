"use client";

import { use } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePlayer, type Track } from "@/lib/player-context";
import { useApiData } from "@/hooks/use-api-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, UserRound, Clock, ChevronLeft, Disc3 } from "lucide-react";
import { Skeleton, SkeletonRowList, SkeletonCardGrid } from "@/components/ui/Skeleton";

interface ArtistResponse {
  artist: {
    id: string;
    name: string;
    genre: string;
    monthlyListeners: number;
  };
  albums: { id: string; title: string; artist: string; year: number; artwork: string }[];
  topSongs: Track[];
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { play } = usePlayer();
  const { data, loading } = useApiData<ArtistResponse>(`/api/artists/${id}`);

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-6">
          <Skeleton className="h-40 w-40 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <section>
          <Skeleton className="h-6 w-36" />
          <div className="mt-4">
            <SkeletonRowList count={5} />
          </div>
        </section>
        <section>
          <Skeleton className="h-6 w-28" />
          <div className="mt-4">
            <SkeletonCardGrid count={6} />
          </div>
        </section>
      </div>
    );
  }
  if (!data) {
    return <p className="text-text-muted text-sm">Artist not found.</p>;
  }

  const { artist, albums, topSongs } = data;

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
        <div className="h-44 w-44 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-blue-deep/20 border border-neon-cyan/20 flex items-center justify-center shrink-0 shadow-2xl">
          <UserRound className="h-20 w-20 text-neon-cyan" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <Badge variant="neon" className="text-[10px] mb-2">Artist</Badge>
          <h1 className="font-poppins text-3xl md:text-4xl font-bold text-text-primary">
            {artist.name}
          </h1>
          <p className="text-text-secondary mt-1">{artist.genre}</p>
          <p className="text-xs text-text-muted mt-1">
            {formatCount(artist.monthlyListeners)} monthly listeners
          </p>
          <div className="mt-4 flex justify-center md:justify-start">
            <Button variant="neon" size="lg" onClick={() => topSongs[0] && play(topSongs[0])}>
              <Play className="h-4 w-4" /> Play
            </Button>
          </div>
        </div>
      </motion.div>

      {topSongs.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-poppins text-xl font-bold text-text-primary">Top Songs</h2>
          <div className="space-y-1">
            {topSongs.map((track, i) => (
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
                  <p className="text-xs text-text-muted truncate">{track.album}</p>
                </div>
                <span className="text-xs text-text-muted hidden sm:flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(track.duration)}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Play className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-poppins text-xl font-bold text-text-primary">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {albums.map((album, i) => (
              <Link key={album.id} href={`/album/${album.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer"
                >
                  <div className={`aspect-square rounded-xl bg-gradient-to-br ${album.artwork} flex items-center justify-center overflow-hidden border border-surface-border`}>
                    <Disc3 className="h-10 w-10 text-neon-cyan" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-text-primary truncate">
                    {album.title}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
