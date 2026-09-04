"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Music,
  Plus,
  Clock,
  Heart,
  Disc3,
  ListMusic,
  Download,
  Play,
  Loader2,
  Trash2,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { usePlayer, type Track } from "@/lib/player-context";
import { useApiData, postJson } from "@/hooks/use-api-data";

interface Playlist {
  id: string;
  name: string;
  color: string;
  isSpecial: boolean;
  count: number;
  tracks: Track[];
}

interface LibraryData {
  playlists: Playlist[];
  downloads: (Track & { downloadedAt: string })[];
  downloadsSizeMb: string;
  recentSearches: string[];
}

interface AlbumsResponse {
  albums: { id: string; title: string; artist: string; year: number; artwork: string; trackCount: number }[];
}

export interface HistoryResponse {
  history: { id: string; songId: string; songTitle: string; artist: string; artwork: string; duration: number; previewUrl?: string; confidence: number; identifiedAt: string }[];
}

export default function LibraryPage() {
  const { play } = usePlayer();
  const [activeTab, setActiveTab] = useState("playlists");
  const [creating, setCreating] = useState(false);
  const [playlistName, setPlaylistName] = useState("");

  const library = useApiData<LibraryData>("/api/library");
  const albums = useApiData<AlbumsResponse>("/api/catalog?section=albums");
  const history = useApiData<HistoryResponse>("/api/history");

  const playlists = library.data?.playlists ?? [];
  const downloads = library.data?.downloads ?? [];

  const createPlaylist = async () => {
    if (playlistName.trim().length < 2) return;
    try {
      await postJson("/api/library", { action: "playlist", name: playlistName.trim() });
      setPlaylistName("");
      setCreating(false);
      library.refresh("/api/library");
    } catch (e) {
      console.error(e);
    }
  };

  const removeDownload = async (songId: string) => {
    await fetch(`/api/library?songId=${encodeURIComponent(songId)}`, { method: "DELETE" }).catch(() => {});
    library.refresh("/api/library");
  };

  const clearRecent = async () => {
    await fetch("/api/history", { method: "DELETE" }).catch(() => {});
    history.refresh("/api/history");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-poppins text-3xl font-bold text-text-primary">
          Your Library
        </h1>
        <Button variant="neon" size="sm" onClick={() => setCreating((c) => !c)}>
          <Plus className="h-4 w-4" />
          New Playlist
        </Button>
      </div>

      {creating && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 max-w-md"
        >
          <Input
            placeholder="Playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createPlaylist()}
            autoFocus
          />
          <Button variant="neon" size="sm" onClick={createPlaylist}>
            Create
          </Button>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="space-y-2 mt-4">
          {library.loading && !playlists.length ? (
            <LoadingRow />
          ) : (
            playlists.map((pl, i) => (
              <motion.div
                key={pl.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
                onClick={() => pl.tracks[0] && play(pl.tracks[0])}
              >
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${pl.color} flex items-center justify-center shrink-0`}
                >
                  {pl.isSpecial ? (
                    <Heart className="h-5 w-5 text-white" />
                  ) : (
                    <ListMusic className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {pl.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    Playlist · {pl.count} songs
                  </p>
                </div>
                {pl.isSpecial && (
                  <Badge variant="neon" className="text-[10px] shrink-0">
                    Auto
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))
          )}
          {!library.loading && playlists.length === 0 && (
            <EmptyState
              icon={<ListMusic className="h-12 w-12 text-text-muted mb-4" />}
              title="No playlists yet"
              subtitle="Create your first playlist to get started"
            />
          )}
        </TabsContent>

        <TabsContent value="albums" className="space-y-2 mt-4">
          {albums.loading && !albums.data ? (
            <LoadingRow />
          ) : (
            (albums.data?.albums ?? []).map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
              >
                <div
                  className={`h-12 w-12 rounded-lg bg-gradient-to-br ${album.artwork} border border-neon-cyan/10 flex items-center justify-center shrink-0`}
                >
                  <Disc3 className="h-5 w-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {album.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    Album · {album.artist} · {album.year}
                  </p>
                </div>
                <span className="text-xs text-text-muted shrink-0 hidden sm:flex items-center gap-1">
                  <Disc3 className="h-3 w-3" />
                  {album.trackCount} tracks
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {history.data?.history.length ?? 0} recently identified songs
            </span>
            {(history.data?.history.length ?? 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-text-muted"
                onClick={clearRecent}
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
          {history.loading && !history.data ? (
            <LoadingRow />
          ) : (history.data?.history ?? []).length === 0 ? (
            <EmptyState
              icon={<Mic className="h-12 w-12 text-text-muted mb-4" />}
              title="Nothing identified yet"
              subtitle="Head to Listen and identify a song to see it here"
            />
          ) : (
            (history.data?.history ?? []).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => play({ id: item.songId, title: item.songTitle, artist: item.artist, album: item.songTitle, duration: item.duration, genre: "", previewUrl: item.previewUrl, artwork: item.artwork })}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
              >
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${item.artwork} flex items-center justify-center shrink-0`}>
                  <Music className="h-5 w-5 text-text-muted group-hover:text-neon-cyan transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {item.songTitle}
                  </p>
                  <p className="text-xs text-text-muted">{item.artist}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {item.confidence}% match
                </Badge>
                <span className="text-[10px] text-text-muted flex items-center gap-1 shrink-0">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo(item.identifiedAt)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="downloads" className="space-y-2 mt-4">
          {downloads.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted">
                  {downloads.length} downloaded tracks · {library.data?.downloadsSizeMb ?? "0"} MB
                </span>
                <span />
              </div>
              {downloads.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => play(track)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-interactive/50 transition-colors group cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                    <Download className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-text-muted">{track.artist}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-text-muted hover:text-red-400 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDownload(track.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </>
          ) : (
            <EmptyState
              icon={<Download className="h-12 w-12 text-text-muted mb-4" />}
              title="No downloaded tracks yet"
              subtitle="Download songs to listen offline"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 text-neon-cyan animate-spin" />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon}
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-xs text-text-muted mt-1">{subtitle}</p>
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