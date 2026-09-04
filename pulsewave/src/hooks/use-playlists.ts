"use client";

import { useCallback } from "react";
import { useApiData, postJson } from "@/hooks/use-api-data";

export interface Playlist {
  id: string;
  name: string;
  color: string;
  isSpecial: boolean;
  count: number;
}

interface PlaylistResponse {
  playlists: Playlist[];
}

export function usePlaylists() {
  const { data, loading, refresh } = useApiData<PlaylistResponse>("/api/library");

  const addToPlaylist = useCallback(
    async (songId: string, playlistId: string) => {
      await postJson(`/api/library/playlists/${playlistId}`, { songId });
      refresh("/api/library");
    },
    [refresh]
  );

  const createPlaylist = useCallback(
    async (name: string) => {
      await postJson("/api/library", { action: "playlist", name });
      refresh("/api/library");
    },
    [refresh]
  );

  return {
    playlists: data?.playlists ?? [],
    loading,
    createPlaylist,
    addToPlaylist,
    refresh,
  };
}
