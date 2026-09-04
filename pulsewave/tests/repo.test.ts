import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { setDbPathForTesting } from "@/lib/store";
import { getRepo, isSupabaseMode } from "@/lib/repo";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "pw-repo-test-"));
  setDbPathForTesting(path.join(dir, "db.json"));
});

afterEach(() => {
  setDbPathForTesting(path.join(process.cwd(), ".data", "db.json"));
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("demo mode", () => {
  it("is not in supabase mode without env vars", () => {
    expect(isSupabaseMode()).toBe(false);
  });

  it("returns a working file-backed repo", async () => {
    const repo = await getRepo();
    const user = await repo.createUser({
      email: "casey@example.com",
      name: "Casey",
      passwordHash: "hash",
      passwordSalt: "salt",
    });

    expect(await repo.findUserByEmail("casey@example.com")).toMatchObject({
      id: user.id,
      email: "casey@example.com",
      name: "Casey",
    });
    expect(await repo.findUserByEmail("ghost@example.com")).toBeUndefined();
  });

  it("creates playlists and adds songs through the repo", async () => {
    const repo = await getRepo();
    const user = await repo.createUser({
      email: "play@example.com",
      name: "Play",
      passwordHash: "h",
      passwordSalt: "s",
    });
    const pl = await repo.createPlaylist(user.id, { name: "Chill", color: "#00cfff" });
    await repo.addToPlaylist(user.id, pl.id, "levitating");
    await repo.markDownloaded(user.id, "blinding-lights");
    await repo.likeSong(user.id, "stay");

    const playlists = await repo.getPlaylists(user.id);
    expect(playlists[0].songIds).toEqual(["levitating"]);
    expect(await repo.getDownloads(user.id)).toHaveLength(1);
    expect(await repo.isLiked(user.id, "stay")).toBe(true);

    await repo.unlikeSong(user.id, "stay");
    expect(await repo.isLiked(user.id, "stay")).toBe(false);
  });

  it("records play history and searches through the repo", async () => {
    const repo = await getRepo();
    const user = await repo.createUser({
      email: "hist@example.com",
      name: "Hist",
      passwordHash: "h",
      passwordSalt: "s",
    });
    await repo.recordPlay(user.id, "shape-of-you");
    const plays = await repo.getPlayHistory(user.id);
    expect(plays[0].songId).toBe("shape-of-you");

    await repo.addRecentSearch(user.id, " weeknd ");
    await repo.addRecentSearch(user.id, "weeknd");
    expect(await repo.getRecentSearches(user.id)).toEqual(["weeknd"]);
  });
});
