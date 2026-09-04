"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, TrendingUp, Sparkles, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCardGrid, SkeletonRowList } from "@/components/ui/Skeleton";
import { usePlayer, type Track } from "@/lib/player-context";
import { useApiData } from "@/hooks/use-api-data";

type SongCard = Track;

interface PlaylistCard {
  id: string;
  title: string;
  desc: string;
  color: string;
  trackCount: number;
  songIds: string[];
}

interface HomeData {
  quickPlay: SongCard[];
  playlists: PlaylistCard[];
  trending: (SongCard & { plays: number })[];
  newReleases: (SongCard & { releasedAt: string })[];
}

interface PlaysResponse {
  plays: Track[];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatPlays(plays: number): string {
  if (plays >= 1_000_000_000) return `${(plays / 1_000_000_000).toFixed(1)}B`;
  if (plays >= 1_000_000) return `${(plays / 1_000_000).toFixed(1)}M`;
  if (plays >= 1_000) return `${(plays / 1_000).toFixed(1)}K`;
  return String(plays);
}

export default function HomePage() {
  const { play } = usePlayer();
  const router = useRouter();
  const { data, loading } = useApiData<HomeData>("/api/catalog");
  const plays = useApiData<PlaysResponse>("/api/history?type=plays");

  const quickPlay =
    (plays.data?.plays.length ? plays.data.plays : data?.quickPlay) ?? [];

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-poppins text-3xl font-bold text-text-primary"
      >
        {getGreeting()}
      </motion.h1>

      {loading && !data ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
          <section>
            <Skeleton className="h-6 w-40" />
            <div className="mt-4">
              <SkeletonCardGrid count={6} />
            </div>
          </section>
          <section>
            <Skeleton className="h-6 w-36" />
            <div className="mt-4">
              <SkeletonRowList count={6} />
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* Quick Play Grid */}
          {quickPlay.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {quickPlay.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => play(item)}
                  className="flex items-center gap-3 bg-surface-interactive/60 hover:bg-surface-interactive rounded-lg overflow-hidden group cursor-pointer transition-colors"
                >
                  <div
                    className={`h-12 w-12 bg-gradient-to-br ${item.artwork} flex items-center justify-center shrink-0`}
                  >
                    <Music className="h-5 w-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-text-primary truncate pr-2">
                    {item.title}
                  </span>
                  <Button
                    variant="neon"
                    size="icon"
                    className="h-8 w-8 mr-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 shrink-0"
                  >
                    <Play className="h-3.5 w-3.5 ml-0.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : null}

          {/* Featured Playlists */}
          {data?.playlists.length ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-poppins text-xl font-bold text-text-primary">
                  Made For You
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-secondary"
                  asChild
                >
                  <Link href="/library">Show all</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {data.playlists.map((pl, i) => (
                  <motion.div
                    key={pl.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => router.push("/library")}
                  >
                    <div
                      className={`aspect-square rounded-xl bg-gradient-to-br ${pl.color} p-4 flex items-end relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-surface-card/40" />
                      <div className="relative z-10 w-full">
                        <p className="font-poppins text-sm font-bold text-text-primary line-clamp-2">
                          {pl.title}
                        </p>
                        <p className="text-[10px] text-text-secondary mt-1">
                          {pl.trackCount} songs
                        </p>
                      </div>
                      <Button
                        variant="neon"
                        size="icon"
                        className="absolute bottom-3 right-3 h-10 w-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg z-10"
                      >
                        <Play className="h-4 w-4 ml-0.5" />
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-text-muted line-clamp-1">
                      {pl.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Trending */}
          {data?.trending.length ? (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-cyan" />
                <h2 className="font-poppins text-xl font-bold text-text-primary">
                  Trending Now
                </h2>
              </div>
              <div className="space-y-1">
                {data.trending.map((song, i) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => play(song)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
                  >
                    <span className="text-lg font-bold text-text-muted w-6 text-center font-mono">
                      {i + 1}
                    </span>
                    <div
                      className={`h-10 w-10 rounded-lg bg-gradient-to-br ${song.artwork} flex items-center justify-center shrink-0`}
                    >
                      <Music className="h-4 w-4 text-text-muted group-hover:text-neon-cyan transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-text-muted truncate">{song.artist}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {formatPlays(song.plays)} plays
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </section>
          ) : null}

          {/* New Releases Banner */}
          {data?.newReleases.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6 flex items-center gap-6 border border-neon-cyan/10"
            >
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-blue-deep/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-8 w-8 text-neon-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-poppins text-lg font-bold text-text-primary">
                  New Releases This Week
                </h3>
                <p className="text-sm text-text-secondary">
                  Hot off the press from{" "}
                  {data.newReleases[0]?.artist ?? "your favorite artists"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="neon"
                  size="icon"
                  className="h-11 w-11"
                  onClick={() => play(data.newReleases[0])}
                >
                  <Play className="h-4 w-4 ml-0.5" />
                </Button>
                <Link href="/search">
                  <Button variant="secondary" size="lg" className="hidden md:flex">
                    Explore
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : null}
        </>
      )}
    </div>
  );
}