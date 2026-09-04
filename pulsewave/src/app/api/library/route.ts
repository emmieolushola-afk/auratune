import { NextRequest, NextResponse } from "next/server";
import { getSongById, songs } from "@/lib/catalog";
import { requireUser, jsonError } from "@/lib/api";
import { getRepo } from "@/lib/repo";
import { toCard } from "@/app/api/catalog/route";

export const runtime = "nodejs";

const PLAYLIST_COLORS = [
  "from-purple-600 to-blue-500",
  "from-green-600 to-emerald-400",
  "from-cyan-600 to-blue-400",
  "from-teal-500 to-cyan-400",
  "from-orange-500 to-red-400",
  "from-amber-600 to-yellow-400",
];

export function serializePlaylist(
  pl: {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    songIds: string[];
  },
  isSpecial = false
) {
  const tracks = pl.songIds
    .map((id) => getSongById(id))
    .filter((s): s is NonNullable<ReturnType<typeof getSongById>> => Boolean(s))
    .map((s) => toCard(s));
  return {
    id: pl.id,
    name: pl.name,
    color: pl.color,
    createdAt: pl.createdAt,
    isSpecial,
    count: pl.songIds.length,
    tracks,
  };
}

async function defaultPlaylists(userId: string) {
  const repo = await getRepo();
  const likes = await repo.getLikes(userId);
  return [
    {
      id: "pw-liked",
      name: "Liked Songs",
      color: "from-purple-600 to-blue-500",
      songIds: likes.map((l) => l.songId),
      createdAt: likes[0]?.likedAt ?? new Date().toISOString(),
    },
    {
      id: "pw-discover",
      name: "Discover Weekly",
      color: "from-green-600 to-emerald-400",
      songIds: songs.slice(0, 8).map((s) => s.id),
      createdAt: new Date().toISOString(),
    },
  ];
}

async function serializeDownloads(userId: string) {
  const repo = await getRepo();
  const downloads = await repo.getDownloads(userId);
  return downloads
    .map((d) => {
      const song = getSongById(d.songId);
      return song ? { ...toCard(song), downloadedAt: d.downloadedAt } : null;
    })
    .filter(
      (s): s is NonNullable<ReturnType<typeof toCard>> & { downloadedAt: string } =>
        s !== null
    );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();

  const custom = (await repo.getPlaylists(user.id)).map((pl) =>
    serializePlaylist(pl)
  );
  const playlists = [
    ...(await defaultPlaylists(user.id)).map((pl) => serializePlaylist(pl, true)),
    ...custom,
  ];
  const downloads = await serializeDownloads(user.id);
  const recentSearches = await repo.getRecentSearches(user.id);

  const totalMb = downloads.reduce((sum, s) => sum + s.duration * 0.04, 0);

  return NextResponse.json({
    playlists,
    downloads,
    downloadsSizeMb: totalMb.toFixed(1),
    recentSearches,
  });
}

interface LibraryBody {
  action?: "playlist" | "download";
  name?: string;
  color?: string;
  songId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();

  let body: LibraryBody;
  try {
    body = (await req.json()) as LibraryBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  if (body.action === "playlist") {
    const name = body.name?.trim() ?? "";
    if (name.length < 2) return jsonError("Playlist name is too short", 400);
    const color =
      body.color ??
      PLAYLIST_COLORS[(await repo.getPlaylists(user.id)).length % PLAYLIST_COLORS.length];
    const pl = await repo.createPlaylist(user.id, { name, color });
    if (body.songId) await repo.addToPlaylist(user.id, pl.id, body.songId);
    return NextResponse.json({ playlist: serializePlaylist(pl) }, { status: 201 });
  }

  if (body.action === "download") {
    const song = body.songId && getSongById(body.songId);
    if (!song) return jsonError("Song not found", 404);
    await repo.markDownloaded(user.id, song.id);
    return NextResponse.json({ ok: true });
  }

  return jsonError("Unknown action", 400);
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const { user, res } = requireUser(req);
  if (!user) return res;
  const repo = await getRepo();
  const songId = req.nextUrl.searchParams.get("songId");
  if (songId) await repo.removeDownload(user.id, songId);
  return NextResponse.json({ ok: true });
}
