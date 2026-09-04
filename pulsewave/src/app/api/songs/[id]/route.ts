import { NextRequest, NextResponse } from "next/server";
import { getSongById, songsByAlbum, songsByArtist } from "@/lib/catalog";
import { jsonError } from "@/lib/api";
import { toCard } from "@/app/api/catalog/route";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const song = getSongById(id);
  if (!song) return jsonError("Song not found", 404);

  const related = [
    ...songsByAlbum(song.albumId),
    ...songsByArtist(song.artistId).filter((s) => s.albumId !== song.albumId),
  ]
    .filter((s) => s.id !== song.id)
    .slice(0, 8)
    .map((s) => toCard(s));

  return NextResponse.json({
    song: toCard(song),
    album: {
      id: song.albumId,
      title: song.album,
      artwork: song.artwork,
    },
    related,
  });
}