import type { UserSong } from "@/lib/repo";

/** Small deterministic palette for auto-assigned upload artwork. */
export const UPLOAD_GRADIENTS = [
  "from-purple-500/30 to-blue-500/30",
  "from-red-500/30 to-orange-500/30",
  "from-pink-500/30 to-purple-500/30",
  "from-teal-500/30 to-cyan-500/30",
  "from-amber-500/30 to-red-500/30",
  "from-indigo-500/30 to-blue-500/30",
];

/** Picks a gradient deterministically from a string (e.g. the song id). */
export function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return UPLOAD_GRADIENTS[hash % UPLOAD_GRADIENTS.length];
}

export interface UploadTrack {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  genre: string;
  duration: number;
  previewUrl: string;
  artwork: string;
  uploaded: boolean;
}

export function toUploadTrack(s: UserSong): UploadTrack {
  return {
    id: `upload-${s.id}`,
    title: s.title,
    artist: s.artist || "Unknown Artist",
    artistId: "",
    album: s.album || "My Uploads",
    albumId: s.id,
    genre: "Upload",
    duration: s.duration,
    previewUrl: s.previewUrl,
    artwork: s.artwork,
    uploaded: true,
  };
}
