import { NextRequest, NextResponse } from "next/server";
import { getSongById } from "@/lib/catalog";
import { requireUser, jsonError } from "@/lib/api";
import { getRepo } from "@/lib/repo";
import { toCard } from "@/app/api/catalog/route";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();

  const liked = (await repo.getLikes(user.id))
    .map((l) => {
      const song = getSongById(l.songId);
      return song ? toCard(song) : null;
    })
    .filter((s): s is ReturnType<typeof toCard> => s !== null);
  return NextResponse.json({ songs: liked });
}

interface LikeBody {
  songId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();

  let body: LikeBody;
  try {
    body = (await req.json()) as LikeBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }
  const song = body.songId && getSongById(body.songId);
  if (!song) return jsonError("Song not found", 404);

  const liked = await repo.isLiked(user.id, song.id);
  if (liked) {
    await repo.unlikeSong(user.id, song.id);
  } else {
    await repo.likeSong(user.id, song.id);
  }

  return NextResponse.json({ liked: !liked });
}
