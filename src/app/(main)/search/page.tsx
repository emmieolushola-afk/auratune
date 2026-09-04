"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Music, Play, Clock, X, Loader2, Disc3, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlayer, type Track } from "@/lib/player-context";
import { useApiData } from "@/hooks/use-api-data";

const genres = [
  { name: "Pop", color: "from-pink-500 to-rose-400" },
  { name: "Hip-Hop", color: "from-orange-500 to-amber-500" },
  { name: "Rock", color: "from-red-600 to-red-400" },
  { name: "Electronic", color: "from-cyan-500 to-blue-500" },
  { name: "R&B", color: "from-purple-500 to-violet-400" },
  { name: "Jazz", color: "from-amber-600 to-yellow-500" },
  { name: "Classical", color: "from-emerald-600 to-teal-400" },
  { name: "Country", color: "from-amber-700 to-orange-400" },
  { name: "Latin", color: "from-red-500 to-pink-400" },
  { name: "Indie", color: "from-violet-500 to-purple-400" },
  { name: "Metal", color: "from-gray-600 to-gray-400" },
  { name: "Folk", color: "from-green-600 to-emerald-400" },
  { name: "K-Pop", color: "from-blue-500 to-sky-400" },
  { name: "Afrobeats", color: "from-yellow-500 to-amber-400" },
  { name: "Reggae", color: "from-green-500 to-lime-400" },
  { name: "Podcasts", color: "from-indigo-500 to-blue-400" },
];

interface SearchResponse {
  query: string;
  songs: (Track & { type: "Song" })[];
  albums: { id: string; title: string; artist: string; type: "Album"; trackCount: number; artwork: string }[];
  artists: { id: string; name: string; genre: string; monthlyListeners: number; type: "Artist" }[];
}

interface HomeData {
  quickPlay: Track[];
  playlists: unknown[];
}
interface LibraryData {
  recentSearches: string[];
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function SearchPage() {
  const { play } = usePlayer();
  const [query, setQuery] = useState("");
  const showResults = query.length > 0;

  const results = useApiData<SearchResponse>(
    showResults ? `/api/search?q=${encodeURIComponent(query)}` : null,
    { debounceMs: 250 }
  );
  const library = useApiData<LibraryData>("/api/library");
  const catalog = useApiData<HomeData>("/api/catalog");

  const totalResults =
    (results.data?.songs.length ?? 0) +
    (results.data?.albums.length ?? 0) +
    (results.data?.artists.length ?? 0);

  const recentlyPlayed = catalog.data?.quickPlay ?? [];
  const recentSearches = library.data?.recentSearches ?? [];

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <Input
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-12 rounded-full bg-surface-interactive text-base"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <h2 className="font-poppins text-lg font-bold text-text-primary">
                Results for &quot;{query}&quot;
              </h2>
              <Badge variant="secondary">
                {results.loading ? "…" : `${totalResults} found`}
              </Badge>
            </div>

            {results.loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 text-neon-cyan animate-spin" />
              </div>
            ) : totalResults === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Music className="h-12 w-12 text-text-muted mb-4" />
                <p className="text-sm text-text-secondary">
                  No results for &quot;{query}&quot;
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Try a different song, artist, or genre
                </p>
              </div>
            ) : (
              <>
                {results.data?.songs.length ? (
                  <section className="space-y-1">
                    {results.data.songs.map((result, i) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => play(result)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
                      >
                        <div
                          className={`h-12 w-12 rounded-lg bg-gradient-to-br ${result.artwork} flex items-center justify-center shrink-0 group-hover:bg-neon-cyan/10 transition-colors`}
                        >
                          <Music className="h-5 w-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-text-muted truncate">{result.artist}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          Song
                        </Badge>
                        <span className="text-xs text-text-muted shrink-0 hidden sm:flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(result.duration / 60)}:
                          {(result.duration % 60).toString().padStart(2, "0")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    ))}
                  </section>
                ) : null}

                {results.data?.albums.length ? (
                  <section className="space-y-1">
                    <h3 className="font-poppins text-sm font-semibold text-text-secondary px-3 pt-2">
                      Albums
                    </h3>
                    {results.data.albums.map((album, i) => (
                      <motion.div
                        key={album.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
                      >
                        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${album.artwork} flex items-center justify-center shrink-0`}>
                          <Disc3 className="h-5 w-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {album.title}
                          </p>
                          <p className="text-xs text-text-muted truncate">{album.artist}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          Album
                        </Badge>
                        <span className="text-xs text-text-muted shrink-0 hidden sm:flex items-center gap-1">
                          <Disc3 className="h-3 w-3" />
                          {album.trackCount} tracks
                        </span>
                      </motion.div>
                    ))}
                  </section>
                ) : null}

                {results.data?.artists.length ? (
                  <section className="space-y-1">
                    <h3 className="font-poppins text-sm font-semibold text-text-secondary px-3 pt-2">
                      Artists
                    </h3>
                    {results.data.artists.map((artist, i) => (
                      <motion.div
                        key={artist.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
                      >
                        <div className="h-12 w-12 rounded-lg bg-surface-interactive flex items-center justify-center shrink-0 group-hover:bg-neon-cyan/10 transition-colors">
                          <UserRound className="h-5 w-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {artist.name}
                          </p>
                          <p className="text-xs text-text-muted truncate">{artist.genre}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          Artist
                        </Badge>
                        <span className="text-xs text-text-muted shrink-0 hidden sm:flex">
                          {formatCount(artist.monthlyListeners)} monthly listeners
                        </span>
                      </motion.div>
                    ))}
                  </section>
                ) : null}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-poppins text-lg font-bold text-text-primary">
                  Recent Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full bg-surface-interactive text-sm text-text-secondary hover:text-text-primary hover:bg-surface-interactive/80 transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Recently played */}
            {recentlyPlayed.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-poppins text-lg font-bold text-text-primary">
                  Recently Played
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {recentlyPlayed.map((item, i) => (
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
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Browse genres */}
            <section className="space-y-4">
              <h2 className="font-poppins text-lg font-bold text-text-primary">
                Browse All
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {genres.map((genre, i) => (
                  <motion.div
                    key={genre.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setQuery(genre.name)}
                    className="relative h-36 rounded-xl overflow-hidden cursor-pointer group"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="absolute inset-0 bg-surface-card/20" />
                    <div className="relative h-full p-4 flex items-end">
                      <h3 className="font-poppins text-xl font-bold text-white drop-shadow-lg">
                        {genre.name}
                      </h3>
                    </div>
                    <div className="absolute -bottom-2 -right-4 h-16 w-16 rounded-lg bg-surface-card/60 border border-white/10 rotate-[25deg] group-hover:rotate-[30deg] transition-transform" />
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}