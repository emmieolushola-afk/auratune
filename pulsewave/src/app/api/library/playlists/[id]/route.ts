import { NextRequest, NextResponse } from "next/server";
import { requireUser, jsonError } from "@/lib/api";
import { getRepo } from "@/lib/repo";
import { serializePlaylist } from "@/app/api/library/route";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();

  const { id } = await ctx.params;
  const playlist = (await repo.getPlaylists(user.id)).find((p) => p.id === id);
  if (!playlist) return jsonError("Playlist not found", 404);

  let body: { songId?: string };
  try {
    body = (await req.json()) as { songId?: string };
  } catch {
    return jsonError("Invalid request body", 400);
  }
  if (!body.songId) return jsonError("songId is required", 400);

  await repo.addToPlaylist(user.id, id, body.songId);
  const updated = (await repo.getPlaylists(user.id)).find((p) => p.id === id)!;
  return NextResponse.json({ playlist: serializePlaylist(updated) });
}
