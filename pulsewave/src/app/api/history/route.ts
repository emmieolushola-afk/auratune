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

  const type = req.nextUrl.searchParams.get("type") ?? "identify";

  if (type === "plays") {
    const plays = (await repo.getPlayHistory(user.id))
      .map((p) => {
        const song = getSongById(p.songId);
        return song ? { ...toCard(song), playedAt: p.playedAt } : null;
      })
      .filter(
        (s): s is NonNullable<ReturnType<typeof toCard>> & { playedAt: string } =>
          s !== null
      );
    return NextResponse.json({ plays });
  }

  const history = await repo.getHistory(user.id);
  return NextResponse.json({ history });
}

interface PlayBody {
  songId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();

  let body: PlayBody;
  try {
    body = (await req.json()) as PlayBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }
  if (!body.songId) return jsonError("songId is required", 400);
  if (!getSongById(body.songId)) return jsonError("Song not found", 404);

  await repo.recordPlay(user.id, body.songId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();
  const type = req.nextUrl.searchParams.get("type") ?? "identify";
  if (type === "plays") {
    await repo.clearPlayHistory(user.id);
  } else {
    await repo.clearHistory(user.id);
  }
  return NextResponse.json({ ok: true });
}
