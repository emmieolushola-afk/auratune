import type { SupabaseClient } from "@supabase/supabase-js";
import { artists, albums, songs } from "@/lib/catalog";

let seeded = false;

/**
 * Idempotently upserts the deterministic demo catalog into Supabase so that
 * user-data tables (likes, downloads, playlist_tracks, identification_history,
 * listening_history) can satisfy their foreign-key references to songs/albums/artists.
 */
export async function ensureCatalogSeeded(client: SupabaseClient): Promise<void> {
  if (seeded) return;
  seeded = true;
  try {
    if (artists.length) {
      await client
        .from("artists")
        .upsert(
          artists.map((a) => ({
            id: a.id,
            name: a.name,
            genre: a.genre,
            monthly_listeners: a.monthlyListeners,
          })),
          { onConflict: "id" }
        );
    }
    if (albums.length) {
      await client
        .from("albums")
        .upsert(
          albums.map((a) => ({
            id: a.id,
            title: a.title,
            artist_id: a.artistId,
            artist: a.artist,
            year: a.year,
            artwork: a.artwork,
          })),
          { onConflict: "id" }
        );
    }
    if (songs.length) {
      await client
        .from("songs")
        .upsert(
          songs.map((s) => ({
            id: s.id,
            title: s.title,
            artist_id: s.artistId,
            album_id: s.albumId,
            genre: s.genre,
            duration: s.duration,
            plays: s.plays,
            released_at: s.releasedAt,
            preview_url: s.previewUrl,
            artwork: s.artwork,
          })),
          { onConflict: "id" }
        );
    }
  } catch {
    // Seeding is best-effort; the in-memory catalog keeps the app functional
    // even if the hosted DB is unavailable.
  }
}
