import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { requireUser, jsonError } from "@/lib/api";
import { serializePlaylist } from "@/app/api/library/route";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;

  const { id } = await ctx.params;
  const playlist = db.getPlaylists(user.id).find((p) => p.id === id);
  if (!playlist) return jsonError("Playlist not found", 404);

  let body: { songId?: string };
  try {
    body = (await req.json()) as { songId?: string };
  } catch {
    return jsonError("Invalid request body", 400);
  }
  if (!body.songId) return jsonError("songId is required", 400);

  db.addToPlaylist(user.id, id, body.songId);
  return NextResponse.json({ playlist: serializePlaylist(playlist) });
}