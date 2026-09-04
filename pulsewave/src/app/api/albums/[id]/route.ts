import { NextRequest, NextResponse } from "next/server";
import { getAlbumById, songsByAlbum } from "@/lib/catalog";
import { jsonError } from "@/lib/api";
import { toCard } from "@/app/api/catalog/route";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const album = getAlbumById(id);
  if (!album) return jsonError("Album not found", 404);
  const tracks = songsByAlbum(id).map(toCard);
  return NextResponse.json({
    album: {
      id: album.id,
      title: album.title,
      artist: album.artist,
      artistId: album.artistId,
      year: album.year,
      artwork: album.artwork,
      trackCount: tracks.length,
    },
    tracks,
  });
}
