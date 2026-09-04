import { NextRequest, NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { requireUser, jsonError } from "@/lib/api";
import { getRepo } from "@/lib/repo";
import { getUploadsDir } from "@/lib/store";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadObject } from "@/lib/supabase/storage";
import { gradientFor, toUploadTrack } from "@/lib/uploads";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
  "audio/mp4",
]);
const MAX_SIZE = 15 * 1024 * 1024;

function extFor(type: string): string {
  const map: Record<string, string> = {
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/ogg": ".ogg",
    "audio/webm": ".webm",
    "audio/aac": ".aac",
    "audio/mp4": ".m4a",
  };
  return map[type] ?? "";
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();
  const songs = await repo.getUserSongs(user.id);
  return NextResponse.json({ songs: songs.map(toUploadTrack) });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Missing audio file", 400);
  if (!ALLOWED_TYPES.has(file.type) || !extFor(file.type)) {
    return jsonError("Unsupported audio type", 415);
  }
  if (file.size > MAX_SIZE) return jsonError("File too large (max 15 MB)", 413);

  const title = String(form.get("title") ?? "").trim() || file.name.replace(/\.[^.]+$/, "");
  const artist = String(form.get("artist") ?? "").trim();
  const album = String(form.get("album") ?? "").trim();

  const id = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadBuf = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const repo = await getRepo();
  const supabase = getSupabaseServerClient();

  let storedPath: string;
  let localPath = "";
  if (supabase) {
    const storagePath = `user/${user.id}/${id}${extFor(file.type)}`;
    const ok = await uploadObject(
      supabase,
      storagePath,
      uploadBuf,
      file.type
    );
    if (!ok) return jsonError("Upload failed", 500);
    storedPath = storagePath;
  } else {
    const uploadsDir = getUploadsDir();
    fs.mkdirSync(uploadsDir, { recursive: true });
    localPath = path.join(/*turbopackIgnore: true*/ uploadsDir, `${id}${extFor(file.type)}`);
    fs.writeFileSync(localPath, buffer);
    storedPath = localPath;
  }

  try {
    const song = await repo.saveUserSong({
      ownerId: user.id,
      title,
      artist,
      album,
      duration: 0,
      artwork: gradientFor(id),
      fileName: file.name,
      storedPath,
    });
    return NextResponse.json({ song: toUploadTrack(song) }, { status: 201 });
  } catch (err) {
    if (localPath) fs.rmSync(localPath, { force: true });
    return jsonError(err instanceof Error ? err.message : "Failed to save", 500);
  }
}
