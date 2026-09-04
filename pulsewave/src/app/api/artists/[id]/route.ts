import { NextRequest, NextResponse } from "next/server";
import { getArtistById, songsByArtist, songs } from "@/lib/catalog";
import { jsonError } from "@/lib/api";
import { toCard } from "@/app/api/catalog/route";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const artist = getArtistById(id);
  if (!artist) return jsonError("Artist not found", 404);

  const artistAlbumIds = Array.from(
    new Set(
      songs
        .filter((s) => s.artistId === artist.id)
        .map((s) => s.albumId)
    )
  );
  const albums = artistAlbumIds
    .map((albumId) => songs.find((s) => s.albumId === albumId))
    .filter(Boolean)
    .map((s) => ({
      id: s!.albumId,
      title: s!.album,
      artist: artist.name,
      year: 0,
      artwork: s!.artwork,
    }));

  const topSongs = songsByArtist(artist.id).map(toCard);

  return NextResponse.json({
    artist: {
      id: artist.id,
      name: artist.name,
      genre: artist.genre,
      monthlyListeners: artist.monthlyListeners,
    },
    albums,
    topSongs,
  });
}
