import { NextRequest, NextResponse } from "next/server";
import { songs } from "@/lib/catalog";
import {
  songFingerprint,
  cosineSimilarity,
  scoreToConfidence,
  FINGERPRINT_DIM,
} from "@/lib/fingerprints";
import { db } from "@/lib/store";
import { getSessionUser, jsonError } from "@/lib/api";
import { toCard } from "@/app/api/catalog/route";

export const runtime = "nodejs";

interface IdentifyBody {
  signature?: number[];
  durationMs?: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: IdentifyBody;
  try {
    body = (await req.json()) as IdentifyBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const signature = body.signature;
  if (
    !Array.isArray(signature) ||
    signature.length !== FINGERPRINT_DIM ||
    signature.some((v) => typeof v !== "number" || !Number.isFinite(v))
  ) {
    return jsonError(
      `Signature must be an array of ${FINGERPRINT_DIM} numbers`,
      400
    );
  }

  let best: { songId: string; score: number } | null = null;
  for (const song of songs) {
    const candidate = songFingerprint(song);
    const score = cosineSimilarity(signature, candidate);
    if (!best || score > best.score) best = { songId: song.id, score };
  }

  if (!best || best.score < 0.35) {
    return NextResponse.json({
      match: false,
      message: "Could not identify the song. Try again with clearer audio.",
    });
  }

  const song = songs.find((s) => s.id === best.songId)!;
  const confidence = scoreToConfidence(best.score);

  const user = getSessionUser(req);
  if (user) {
    db.addHistory(user.id, {
      songId: song.id,
      songTitle: song.title,
      artist: song.artist,
      artwork: song.artwork,
      duration: song.duration,
      previewUrl: song.previewUrl,
      confidence,
      identifiedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    match: true,
    song: toCard(song),
    confidence,
  });
}