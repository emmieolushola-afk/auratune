import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";
import { getSongById } from "@/lib/catalog";
import { requireUser, jsonError } from "@/lib/api";
import { toCard } from "@/app/api/catalog/route";

export const runtime = "nodejs";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const liked = db
    .getLikes(user.id)
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

  let body: LikeBody;
  try {
    body = (await req.json()) as LikeBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }
  const song = body.songId && getSongById(body.songId);
  if (!song) return jsonError("Song not found", 404);

  const liked = db.isLiked(user.id, song.id);
  if (liked) {
    db.unlikeSong(user.id, song.id);
  } else {
    db.likeSong(user.id, song.id);
  }

  return NextResponse.json({ liked: !liked });
}