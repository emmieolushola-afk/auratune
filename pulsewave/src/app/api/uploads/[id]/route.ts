import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import { requireUser } from "@/lib/api";
import { getRepo } from "@/lib/repo";
import { getUploadsDir } from "@/lib/store";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = requireUser(req);
  if (!session.user) return session.res;
  const { id } = await params;

  const repo = await getRepo();
  const song = await repo.getUserSong(id, session.user.id);
  if (!song) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await repo.deleteUserSong(id, session.user.id);

  // In demo mode also remove the on-disk binary. The path guard keeps this a
  // no-op for Supabase mode (where storedPath is a storage path, not local).
  const full = path.resolve(getUploadsDir(), path.basename(song.storedPath));
  if (full.startsWith(path.resolve(getUploadsDir()))) {
    fs.rmSync(full, { force: true });
  }

  return NextResponse.json({ ok: true });
}
