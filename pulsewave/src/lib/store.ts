import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  songId: string;
  songTitle: string;
  artist: string;
  artwork: string;
  duration: number;
  previewUrl?: string;
  confidence: number;
  identifiedAt: string;
}

export interface PlaylistRecord {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  songIds: string[];
}

export interface DownloadRecord {
  songId: string;
  downloadedAt: string;
}

export interface LikedRecord {
  songId: string;
  likedAt: string;
}

export interface PlayRecord {
  songId: string;
  playedAt: string;
}

export interface UserSongRecord {
  id: string;
  ownerId: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string;
  fileName: string;
  storedPath: string;
  createdAt: string;
}

interface DbShape {
  users: UserRecord[];
  history: Record<string, HistoryEntry[]>;
  playHistory: Record<string, PlayRecord[]>;
  likes: Record<string, LikedRecord[]>;
  playlists: Record<string, PlaylistRecord[]>;
  downloads: Record<string, DownloadRecord[]>;
  recentSearches: Record<string, string[]>;
  userSongs: UserSongRecord[];
}

const emptyDb = (): DbShape => ({
  users: [],
  history: {},
  playHistory: {},
  likes: {},
  playlists: {},
  downloads: {},
  recentSearches: {},
  userSongs: [],
});

let dbPath = path.join(process.cwd(), ".data", "db.json");
let cache: DbShape | null = null;

export function getDataDir(): string {
  return path.dirname(dbPath);
}

/** Directory where demo-mode uploaded audio files are stored on disk. */
export function getUploadsDir(): string {
  return path.join(getDataDir(), "uploads");
}

export function setDbPathForTesting(p: string): void {
  dbPath = p;
  cache = null;
}

function load(): DbShape {
  if (cache) return cache;
  if (fs.existsSync(/*turbopackIgnore: true*/ dbPath)) {
    try {
      const raw = fs.readFileSync(/*turbopackIgnore: true*/ dbPath, "utf8");
      const parsed = JSON.parse(raw) as Partial<DbShape>;
      cache = {
        users: parsed.users ?? [],
        history: parsed.history ?? {},
        playHistory: parsed.playHistory ?? {},
        likes: parsed.likes ?? {},
        playlists: parsed.playlists ?? {},
        downloads: parsed.downloads ?? {},
        recentSearches: parsed.recentSearches ?? {},
        userSongs: parsed.userSongs ?? [],
      };
      return cache;
    } catch {
      cache = emptyDb();
      return cache;
    }
  }
  cache = emptyDb();
  return cache;
}

function persist(): void {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmp = `${dbPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2), "utf8");
  try {
    try {
      fs.renameSync(tmp, dbPath);
    } catch {
      if (fs.existsSync(/*turbopackIgnore: true*/ dbPath)) fs.unlinkSync(dbPath);
      fs.renameSync(tmp, dbPath);
    }
  } catch {
    fs.writeFileSync(dbPath, JSON.stringify(cache, null, 2), "utf8");
  }
}

function mutate<T>(fn: (db: DbShape) => T): T {
  const db = load();
  const result = fn(db);
  persist();
  return result;
}

export const db = {
  load,

  findUserByEmail(email: string): UserRecord | undefined {
    return load().users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  },

  findUserById(id: string): UserRecord | undefined {
    return load().users.find((u) => u.id === id);
  },

  createUser(input: {
    email: string;
    name: string;
    passwordHash: string;
    passwordSalt: string;
  }): UserRecord {
    const user: UserRecord = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      passwordSalt: input.passwordSalt,
      createdAt: new Date().toISOString(),
    };
    mutate((d) => {
      d.users.push(user);
    });
    return user;
  },

  addHistory(userId: string, entry: Omit<HistoryEntry, "id">): HistoryEntry {
    const record: HistoryEntry = { ...entry, id: randomUUID() };
    mutate((d) => {
      d.history[userId] = [record, ...(d.history[userId] ?? [])].slice(0, 50);
    });
    return record;
  },

  getHistory(userId: string): HistoryEntry[] {
    return load().history[userId] ?? [];
  },

  clearHistory(userId: string): void {
    mutate((d) => {
      d.history[userId] = [];
    });
  },

  recordPlay(userId: string, songId: string): void {
    const playedAt = new Date().toISOString();
    mutate((d) => {
      const list = d.playHistory[userId] ?? [];
      d.playHistory[userId] = [
        { songId, playedAt },
        ...list.filter((p) => p.songId !== songId),
      ].slice(0, 50);
    });
  },

  getPlayHistory(userId: string): PlayRecord[] {
    return load().playHistory[userId] ?? [];
  },

  clearPlayHistory(userId: string): void {
    mutate((d) => {
      d.playHistory[userId] = [];
    });
  },

  likeSong(userId: string, songId: string): void {
    mutate((d) => {
      d.likes[userId] = [
        { songId, likedAt: new Date().toISOString() },
        ...(d.likes[userId] ?? []).filter((l) => l.songId !== songId),
      ];
    });
  },

  unlikeSong(userId: string, songId: string): void {
    mutate((d) => {
      d.likes[userId] = (d.likes[userId] ?? []).filter((l) => l.songId !== songId);
    });
  },

  getLikes(userId: string): LikedRecord[] {
    return load().likes[userId] ?? [];
  },

  isLiked(userId: string, songId: string): boolean {
    return (load().likes[userId] ?? []).some((l) => l.songId === songId);
  },

  createPlaylist(userId: string, input: { name: string; color: string }): PlaylistRecord {
    const record: PlaylistRecord = {
      id: randomUUID(),
      name: input.name,
      color: input.color,
      createdAt: new Date().toISOString(),
      songIds: [],
    };
    mutate((d) => {
      d.playlists[userId] = [record, ...(d.playlists[userId] ?? [])];
    });
    return record;
  },

  addToPlaylist(userId: string, playlistId: string, songId: string): void {
    mutate((d) => {
      const list = d.playlists[userId] ?? [];
      const pl = list.find((p) => p.id === playlistId);
      if (pl && !pl.songIds.includes(songId)) pl.songIds.push(songId);
    });
  },

  getPlaylists(userId: string): PlaylistRecord[] {
    return load().playlists[userId] ?? [];
  },

  markDownloaded(userId: string, songId: string): void {
    mutate((d) => {
      const existing = d.downloads[userId] ?? [];
      if (existing.some((x) => x.songId === songId)) return;
      d.downloads[userId] = [
        { songId, downloadedAt: new Date().toISOString() },
        ...existing,
      ];
    });
  },

  removeDownload(userId: string, songId: string): void {
    mutate((d) => {
      d.downloads[userId] = (d.downloads[userId] ?? []).filter(
        (x) => x.songId !== songId
      );
    });
  },

  getDownloads(userId: string): DownloadRecord[] {
    return load().downloads[userId] ?? [];
  },

  addRecentSearch(userId: string, term: string): void {
    const t = term.trim();
    if (!t) return;
    mutate((d) => {
      d.recentSearches[userId] = [
        t,
        ...(d.recentSearches[userId] ?? []).filter((x) => x !== t),
      ].slice(0, 8);
    });
  },

  getRecentSearches(userId: string): string[] {
    return load().recentSearches[userId] ?? [];
  },

  createUserSong(input: {
    ownerId: string;
    title: string;
    artist: string;
    album: string;
    duration: number;
    artwork: string;
    fileName: string;
    storedPath: string;
  }): UserSongRecord {
    const record: UserSongRecord = {
      id: randomUUID(),
      ownerId: input.ownerId,
      title: input.title,
      artist: input.artist,
      album: input.album,
      duration: input.duration,
      artwork: input.artwork,
      fileName: input.fileName,
      storedPath: input.storedPath,
      createdAt: new Date().toISOString(),
    };
    mutate((d) => {
      d.userSongs.push(record);
    });
    return record;
  },

  getUserSongs(ownerId: string): UserSongRecord[] {
    return load().userSongs.filter((s) => s.ownerId === ownerId);
  },

  getUserSong(id: string): UserSongRecord | undefined {
    return load().userSongs.find((s) => s.id === id);
  },

  deleteUserSong(id: string): UserSongRecord | undefined {
    let removed: UserSongRecord | undefined;
    mutate((d) => {
      const idx = d.userSongs.findIndex((s) => s.id === id);
      if (idx >= 0) {
        removed = d.userSongs[idx];
        d.userSongs.splice(idx, 1);
      }
    });
    return removed;
  },
};