import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import { requireUser } from "@/lib/api";
import { getRepo } from "@/lib/repo";
import { getUploadsDir } from "@/lib/store";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".webm": "audio/webm",
  ".aac": "audio/aac",
  ".m4a": "audio/mp4",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = requireUser(req);
  if (!session.user) return session.res;
  const { id } = await params;

  const repo = await getRepo();
  // In demo mode we serve the binary directly from disk; in Supabase mode the
  // repo already returns a storage-backed previewUrl, so this route is only hit
  // in demo mode. Verify ownership before serving.
  const song = await repo.getUserSong(id, session.user.id);
  if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const full = path.resolve(getUploadsDir(), path.basename(song.storedPath));
  if (!full.startsWith(path.resolve(getUploadsDir()))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!fs.existsSync(full)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(full).toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";
  const buffer = fs.readFileSync(full);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
