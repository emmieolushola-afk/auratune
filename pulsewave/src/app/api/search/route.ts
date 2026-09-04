import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog";
import { getSessionUser } from "@/lib/api";
import { getRepo } from "@/lib/repo";
import { toCard } from "@/app/api/catalog/route";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ query: q, songs: [], albums: [], artists: [] });
  }

  const { songs, albums: albumResults, artists: artistResults } = searchCatalog(q);

  const user = getSessionUser(req);
  if (user) {
    const repo = await getRepo();
    await repo.addRecentSearch(user.id, q);
  }

  const albumCards = albumResults.map((a) => ({
    id: a.id,
    title: a.title,
    artist: a.artist,
    type: "Album" as const,
    trackCount: songs.filter((s) => s.albumId === a.id).length,
    artwork: a.artwork,
  }));

  return NextResponse.json({
    query: q,
    songs: songs.map((s) => ({ ...toCard(s), type: "Song" as const })),
    albums: albumCards,
    artists: artistResults.map((a) => ({
      id: a.id,
      name: a.name,
      genre: a.genre,
      monthlyListeners: a.monthlyListeners,
      type: "Artist" as const,
    })),
  });
}