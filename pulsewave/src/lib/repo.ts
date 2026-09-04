import type { SupabaseClient } from "@supabase/supabase-js";
import { db, type UserRecord, type HistoryEntry, type PlaylistRecord } from "@/lib/store";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ensureCatalogSeeded } from "@/lib/supabase/seed-catalog";
import { ensureUploadBucket, buildObjectUrl, removeObject } from "@/lib/supabase/storage";

export interface UserSong {
  id: string;
  ownerId: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string;
  fileName: string;
  storedPath: string;
  previewUrl: string;
  createdAt: string;
}

export interface Repo {
  // Users (Supabase mode uses auth.users + profiles)
  findUserByEmail(email: string): Promise<UserRecord | undefined>;
  findUserById(id: string): Promise<UserRecord | undefined>;
  createUser(input: {
    email: string;
    name: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<UserRecord>;

  // Identification history
  addHistory(
    userId: string,
    entry: Omit<HistoryEntry, "id">
  ): Promise<HistoryEntry>;
  getHistory(userId: string): Promise<HistoryEntry[]>;
  clearHistory(userId: string): Promise<void>;

  // Play history
  recordPlay(userId: string, songId: string): Promise<void>;
  getPlayHistory(userId: string): Promise<{ songId: string; playedAt: string }[]>;
  clearPlayHistory(userId: string): Promise<void>;

  // Likes
  likeSong(userId: string, songId: string): Promise<void>;
  unlikeSong(userId: string, songId: string): Promise<void>;
  getLikes(userId: string): Promise<{ songId: string; likedAt: string }[]>;
  isLiked(userId: string, songId: string): Promise<boolean>;

  // Playlists
  createPlaylist(
    userId: string,
    input: { name: string; color: string }
  ): Promise<PlaylistRecord>;
  addToPlaylist(userId: string, playlistId: string, songId: string): Promise<void>;
  getPlaylists(userId: string): Promise<PlaylistRecord[]>;

  // Downloads
  markDownloaded(userId: string, songId: string): Promise<void>;
  removeDownload(userId: string, songId: string): Promise<void>;
  getDownloads(userId: string): Promise<{ songId: string; downloadedAt: string }[]>;

  // Recent searches
  addRecentSearch(userId: string, term: string): Promise<void>;
  getRecentSearches(userId: string): Promise<string[]>;

  // User-uploaded tracks
  saveUserSong(input: {
    ownerId: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    artwork: string;
    fileName: string;
    storedPath: string;
  }): Promise<UserSong>;
  getUserSongs(ownerId: string): Promise<UserSong[]>;
  getUserSong(id: string, ownerId: string): Promise<UserSong | undefined>;
  deleteUserSong(id: string, ownerId: string): Promise<void>;
}

export function isSupabaseMode(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function getRepo(): Promise<Repo> {
  const client = getSupabaseServerClient();
  if (client) {
    await ensureCatalogSeeded(client);
    await ensureUploadBucket(client);
    return new SupabaseRepo(client);
  }
  return fileRepo;
}

// ---------------------------------------------------------------------------
// File-backed implementation (demo mode) — delegates to the existing store.
// ---------------------------------------------------------------------------
const fileRepo: Repo = {
  async findUserByEmail(email) {
    return db.findUserByEmail(email);
  },
  async findUserById(id) {
    return db.findUserById(id);
  },
  async createUser(input) {
    return db.createUser(input);
  },
  async addHistory(userId, entry) {
    return db.addHistory(userId, entry);
  },
  async getHistory(userId) {
    return db.getHistory(userId);
  },
  async clearHistory(userId) {
    db.clearHistory(userId);
  },
  async recordPlay(userId, songId) {
    db.recordPlay(userId, songId);
  },
  async getPlayHistory(userId) {
    return db.getPlayHistory(userId);
  },
  async clearPlayHistory(userId) {
    db.clearPlayHistory(userId);
  },
  async likeSong(userId, songId) {
    db.likeSong(userId, songId);
  },
  async unlikeSong(userId, songId) {
    db.unlikeSong(userId, songId);
  },
  async getLikes(userId) {
    return db.getLikes(userId);
  },
  async isLiked(userId, songId) {
    return db.isLiked(userId, songId);
  },
  async createPlaylist(userId, input) {
    return db.createPlaylist(userId, input);
  },
  async addToPlaylist(userId, playlistId, songId) {
    db.addToPlaylist(userId, playlistId, songId);
  },
  async getPlaylists(userId) {
    return db.getPlaylists(userId);
  },
  async markDownloaded(userId, songId) {
    db.markDownloaded(userId, songId);
  },
  async removeDownload(userId, songId) {
    db.removeDownload(userId, songId);
  },
  async getDownloads(userId) {
    return db.getDownloads(userId);
  },
  async addRecentSearch(userId, term) {
    db.addRecentSearch(userId, term);
  },
  async getRecentSearches(userId) {
    return db.getRecentSearches(userId);
  },
  async saveUserSong(input) {
    const rec = db.createUserSong(input);
    return {
      ...rec,
      previewUrl: `/api/uploads/files/${rec.id}`,
    };
  },
  async getUserSongs(ownerId) {
    return db.getUserSongs(ownerId).map((rec) => ({
      ...rec,
      previewUrl: `/api/uploads/files/${rec.id}`,
    }));
  },
  async getUserSong(id, ownerId) {
    const rec = db.getUserSong(id);
    if (!rec || rec.ownerId !== ownerId) return undefined;
    return { ...rec, previewUrl: `/api/uploads/files/${rec.id}` };
  },
  async deleteUserSong(id, ownerId) {
    const rec = db.getUserSong(id);
    if (!rec || rec.ownerId !== ownerId) return;
    db.deleteUserSong(id);
  },
};

// ---------------------------------------------------------------------------
// Supabase-backed implementation (hosted mode) — service-role, scoped to user.
// ---------------------------------------------------------------------------
class SupabaseRepo implements Repo {
  constructor(private client: SupabaseClient) {}

  // In Supabase mode, users are managed by Supabase Auth. Profile rows carry
  // the display name. passwordHash/Salt are not stored (managed by Auth); we
  // synthesize a record keyed on the auth user id.
  private async getProfile(email: string): Promise<UserRecord | undefined> {
    const { data } = await this.client
      .from("profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (!data) return undefined;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      passwordHash: "",
      passwordSalt: "",
      createdAt: data.created_at,
    };
  }

  async findUserByEmail(email: string): Promise<UserRecord | undefined> {
    return this.getProfile(email);
  }

  async findUserById(id: string): Promise<UserRecord | undefined> {
    const { data } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!data) return undefined;
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      passwordHash: "",
      passwordSalt: "",
      createdAt: data.created_at,
    };
  }

  async createUser(input: {
    email: string;
    name: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<UserRecord> {
    const { data, error } = await this.client.auth.admin.createUser({
      email: input.email,
      email_confirm: true,
      user_metadata: { name: input.name },
    });
    if (error || !data.user) {
      throw new Error(error?.message ?? "Failed to create user");
    }
    return {
      id: data.user.id,
      email: input.email,
      name: input.name,
      passwordHash: "",
      passwordSalt: "",
      createdAt: data.user.created_at ?? new Date().toISOString(),
    };
  }

  async addHistory(
    userId: string,
    entry: Omit<HistoryEntry, "id">
  ): Promise<HistoryEntry> {
    const { data, error } = await this.client
      .from("identification_history")
      .insert({
        user_id: userId,
        song_id: entry.songId,
        confidence: entry.confidence,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      songId: data.song_id,
      songTitle: entry.songTitle,
      artist: entry.artist,
      artwork: entry.artwork,
      duration: entry.duration,
      previewUrl: entry.previewUrl,
      confidence: data.confidence,
      identifiedAt: data.identified_at,
    };
  }

  async getHistory(userId: string): Promise<HistoryEntry[]> {
    const { data, error } = await this.client
      .from("identification_history")
      .select("*")
      .eq("user_id", userId)
      .order("identified_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const songs = await this.getSongMap();
    return (data ?? []).map((h) => {
      const song = songs[h.song_id];
      return {
        id: h.id,
        songId: h.song_id,
        songTitle: song?.title ?? "",
        artist: song?.artist ?? "",
        artwork: song?.artwork ?? "",
        duration: song?.duration ?? 0,
        previewUrl: song?.previewUrl,
        confidence: h.confidence,
        identifiedAt: h.identified_at,
      };
    });
  }

  async clearHistory(userId: string): Promise<void> {
    await this.client
      .from("identification_history")
      .delete()
      .eq("user_id", userId);
  }

  async recordPlay(userId: string, songId: string): Promise<void> {
    const { data: existing } = await this.client
      .from("listening_history")
      .select("id")
      .eq("user_id", userId)
      .eq("song_id", songId)
      .maybeSingle();
    if (existing) {
      await this.client
        .from("listening_history")
        .update({ played_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await this.client.from("listening_history").insert({
        user_id: userId,
        song_id: songId,
      });
    }
  }

  async getPlayHistory(
    userId: string
  ): Promise<{ songId: string; playedAt: string }[]> {
    const { data, error } = await this.client
      .from("listening_history")
      .select("song_id, played_at")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      songId: r.song_id,
      playedAt: r.played_at,
    }));
  }

  async clearPlayHistory(userId: string): Promise<void> {
    await this.client
      .from("listening_history")
      .delete()
      .eq("user_id", userId);
  }

  async likeSong(userId: string, songId: string): Promise<void> {
    const { error } = await this.client
      .from("likes")
      .upsert({ user_id: userId, song_id: songId }, { onConflict: "user_id,song_id" });
    if (error) throw new Error(error.message);
  }

  async unlikeSong(userId: string, songId: string): Promise<void> {
    await this.client
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("song_id", songId);
  }

  async getLikes(
    userId: string
  ): Promise<{ songId: string; likedAt: string }[]> {
    const { data, error } = await this.client
      .from("likes")
      .select("song_id, liked_at")
      .eq("user_id", userId)
      .order("liked_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      songId: r.song_id,
      likedAt: r.liked_at,
    }));
  }

  async isLiked(userId: string, songId: string): Promise<boolean> {
    const { data } = await this.client
      .from("likes")
      .select("song_id")
      .eq("user_id", userId)
      .eq("song_id", songId)
      .maybeSingle();
    return Boolean(data);
  }

  async createPlaylist(
    userId: string,
    input: { name: string; color: string }
  ): Promise<PlaylistRecord> {
    const { data, error } = await this.client
      .from("playlists")
      .insert({ user_id: userId, name: input.name, color: input.color })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      color: data.color,
      createdAt: data.created_at,
      songIds: [],
    };
  }

  async addToPlaylist(
    userId: string,
    playlistId: string,
    songId: string
  ): Promise<void> {
    const { data: pl } = await this.client
      .from("playlists")
      .select("id")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!pl) return;
    const { data: existing } = await this.client
      .from("playlist_tracks")
      .select("playlist_id")
      .eq("playlist_id", playlistId)
      .eq("song_id", songId)
      .maybeSingle();
    if (existing) return;
    await this.client.from("playlist_tracks").insert({
      playlist_id: playlistId,
      song_id: songId,
    });
  }

  async getPlaylists(userId: string): Promise<PlaylistRecord[]> {
    const { data, error } = await this.client
      .from("playlists")
      .select("*, playlist_tracks(song_id)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      createdAt: p.created_at,
      songIds: (p.playlist_tracks ?? []).map((t: { song_id: string }) => t.song_id),
    }));
  }

  async markDownloaded(userId: string, songId: string): Promise<void> {
    const { error } = await this.client
      .from("downloads")
      .upsert({ user_id: userId, song_id: songId }, { onConflict: "user_id,song_id" });
    if (error) throw new Error(error.message);
  }

  async removeDownload(userId: string, songId: string): Promise<void> {
    await this.client
      .from("downloads")
      .delete()
      .eq("user_id", userId)
      .eq("song_id", songId);
  }

  async getDownloads(
    userId: string
  ): Promise<{ songId: string; downloadedAt: string }[]> {
    const { data, error } = await this.client
      .from("downloads")
      .select("song_id, downloaded_at")
      .eq("user_id", userId)
      .order("downloaded_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      songId: r.song_id,
      downloadedAt: r.downloaded_at,
    }));
  }

  async addRecentSearch(userId: string, term: string): Promise<void> {
    const t = term.trim();
    if (!t) return;
    const { data: recent } = await this.client
      .from("recent_search")
      .select("id, term")
      .eq("user_id", userId)
      .order("searched_at", { ascending: false });
    const existing = (recent ?? []).find((r) => r.term === t);
    if (existing) {
      await this.client
        .from("recent_search")
        .update({ searched_at: new Date().toISOString() })
        .eq("id", existing.id);
      return;
    }
    await this.client.from("recent_search").insert({
      user_id: userId,
      term: t,
    });
  }

  async getRecentSearches(userId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("recent_search")
      .select("term")
      .eq("user_id", userId)
      .order("searched_at", { ascending: false })
      .limit(8);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.term);
  }

  async saveUserSong(input: {
    ownerId: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    artwork: string;
    fileName: string;
    storedPath: string;
  }): Promise<UserSong> {
    const { ownerId: userId, ...rest } = input;
    const { data, error } = await this.client
      .from("user_songs")
      .insert({ user_id: userId, ...rest })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const previewUrl = await this.resolvePreviewUrl(data.id, data.storage_path);
    return {
      id: data.id,
      ownerId: data.user_id,
      title: data.title,
      artist: data.artist,
      album: data.album,
      duration: data.duration,
      artwork: data.artwork,
      fileName: data.file_name,
      storedPath: data.storage_path,
      previewUrl,
      createdAt: data.created_at,
    };
  }

  async getUserSongs(ownerId: string): Promise<UserSong[]> {
    const { data, error } = await this.client
      .from("user_songs")
      .select("*")
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    return Promise.all(
      rows.map(async (r) => {
        const previewUrl = await this.resolvePreviewUrl(r.id, r.storage_path);
        return this.mapUserSong(r, previewUrl);
      })
    );
  }

  async getUserSong(id: string, ownerId: string): Promise<UserSong | undefined> {
    const { data, error } = await this.client
      .from("user_songs")
      .select("*")
      .eq("id", id)
      .eq("user_id", ownerId)
      .single();
    if (error || !data) return undefined;
    const previewUrl = await this.resolvePreviewUrl(data.id, data.storage_path);
    return this.mapUserSong(data, previewUrl);
  }

  async deleteUserSong(id: string, ownerId: string): Promise<void> {
    const song = await this.getUserSong(id, ownerId);
    if (!song) return;
    await removeObject(this.client, song.storedPath);
    await this.client
      .from("user_songs")
      .delete()
      .eq("id", id)
      .eq("user_id", ownerId);
  }

  private mapUserSong(r: Record<string, unknown>, previewUrl: string): UserSong {
    return {
      id: String(r.id),
      ownerId: String(r.user_id),
      title: String(r.title),
      artist: String(r.artist ?? ""),
      album: String(r.album ?? ""),
      duration: Number(r.duration ?? 0),
      artwork: String(r.artwork ?? ""),
      fileName: String(r.file_name),
      storedPath: String(r.storage_path),
      previewUrl,
      createdAt: String(r.created_at),
    };
  }

  private async resolvePreviewUrl(_id: string, storagePath: string): Promise<string> {
    return buildObjectUrl(this.client, storagePath);
  }

  private async getSongMap(): Promise<
    Record<string, { title: string; artist: string; artwork: string; duration: number; previewUrl?: string }>
  > {
    const { data: songs } = await this.client.from("songs").select("*");
    const map: Record<string, { title: string; artist: string; artwork: string; duration: number; previewUrl?: string }> = {};
    for (const s of songs ?? []) {
      map[s.id] = {
        title: s.title,
        artist: s.artist,
        artwork: s.artwork,
        duration: s.duration,
        previewUrl: s.preview_url,
      };
    }
    return map;
  }
}
