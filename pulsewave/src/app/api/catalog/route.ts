import { NextResponse } from "next/server";
import {
  songs,
  albums,
  trendingByPlays,
  newReleases,
  searchCatalog,
  getAlbumById,
  type Song,
} from "@/lib/catalog";

export const runtime = "nodejs";

const UI_COLORS = [
  "from-purple-500/30 to-blue-500/30",
  "from-red-500/30 to-orange-500/30",
  "from-pink-500/30 to-purple-500/30",
  "from-teal-500/30 to-cyan-500/30",
  "from-amber-500/30 to-red-500/30",
  "from-indigo-500/30 to-blue-500/30",
];

export function buildFeaturedPlaylists() {
  const picks = [
    { title: "Today's Top Hits", desc: "The biggest songs right now", albumIds: ["after-hours", "future-nostalgia", "harry-house", "sour"] },
    { title: "RapCaviar", desc: "New hip-hop and R&B", albumIds: ["clb", "damn", "hollywoods-bleeding"] },
    { title: "All Out 2010s", desc: "The biggest songs of the 2010s", albumIds: ["divide", "fine-line", "happier-than-ever", "damn"] },
    { title: "Chill Hits", desc: "Kick back to the best new chill music", albumIds: ["fine-line", "sos", "happier-than-ever", "positions"] },
    { title: "Rock Classics", desc: "Rock legends & iconic songs", albumIds: ["fine-line", "divide", "happier-than-ever"] },
    { title: "Peaceful Piano", desc: "Relax and indulge with beautiful piano", albumIds: ["dreamland", "midnights", "positions"] },
  ];

  return picks.map((p, i) => {
    const collected = p.albumIds
      .map((id) => getAlbumById(id))
      .filter(Boolean);
    const trackCount = collected.reduce(
      (sum, a) => sum + (songs.filter((s) => s.albumId === a!.id).length),
      0
    );
    return {
      id: `pl-${i}`,
      title: p.title,
      desc: p.desc,
      color: UI_COLORS[i % UI_COLORS.length],
      trackCount,
      songIds: collected
        .flatMap((a) => songs.filter((s) => s.albumId === a!.id).map((s) => s.id))
        .slice(0, 12),
    };
  });
}

export function getHomeData() {
  const trending = trendingByPlays(10);
  const featured = newReleases(8);
  return {
    quickPlay: trending.slice(0, 6).map(toCard),
    playlists: buildFeaturedPlaylists(),
    trending: trending.map((s) => ({
      ...toCard(s),
      plays: s.plays,
    })),
    newReleases: featured.map((s) => ({
      ...toCard(s),
      releasedAt: s.releasedAt,
    })),
  };
}

export function toCard(song: Song) {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    artistId: song.artistId,
    album: song.album,
    albumId: song.albumId,
    genre: song.genre,
    duration: song.duration,
    previewUrl: song.previewUrl,
    artwork: song.artwork,
  };
}

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const section = url.searchParams.get("section") ?? "home";

  if (section === "search" && q) {
    const { songs: songResults, albums: albumResults, artists: artistResults } =
      searchCatalog(q);
    return NextResponse.json({
      query: q,
      songs: songResults.map((s) => ({ ...toCard(s), type: "Song" })),
      albums: albumResults.map((a) => ({
        id: a.id,
        title: a.title,
        artist: a.artist,
        type: "Album",
        trackCount: songs.filter((s) => s.albumId === a.id).length,
        artwork: a.artwork,
      })),
      artists: artistResults.map((a) => ({
        id: a.id,
        name: a.name,
        genre: a.genre,
        monthlyListeners: a.monthlyListeners,
        type: "Artist",
      })),
    });
  }

  if (section === "albums") {
    return NextResponse.json({
      albums: albums.map((a) => ({
        id: a.id,
        title: a.title,
        artist: a.artist,
        year: a.year,
        artwork: a.artwork,
        trackCount: songs.filter((s) => s.albumId === a.id).length,
      })),
    });
  }

  return NextResponse.json(getHomeData());
}