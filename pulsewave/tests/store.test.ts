import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db, setDbPathForTesting } from "@/lib/store";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "pw-store-test-"));
  setDbPathForTesting(path.join(dir, "db.json"));
});

afterEach(() => {
  setDbPathForTesting(path.join(process.cwd(), ".data", "db.json"));
  fs.rmSync(dir, { recursive: true, force: true });
});

function createUser(email = "person@example.com", name = "Person") {
  return db.createUser({
    email,
    name,
    passwordHash: "hash",
    passwordSalt: "salt",
  });
}

describe("users", () => {
  it("creates users that can be found by email (case-insensitive)", () => {
    const user = createUser("Person@Example.com");
    expect(db.findUserByEmail("person@example.com")?.id).toBe(user.id);
    expect(db.findUserById(user.id)?.name).toBe("Person");
  });

  it("starts empty", () => {
    expect(db.findUserByEmail("ghost@example.com")).toBeUndefined();
  });

  it("persists across cache resets", () => {
    const user = createUser();
    setDbPathForTesting(path.join(dir, "db.json"));
    expect(db.findUserByEmail("person@example.com")?.id).toBe(user.id);
  });
});

describe("history", () => {
  it("adds entries newest-first", () => {
    const user = createUser();
    db.addHistory(user.id, {
      songId: "a",
      songTitle: "A",
      artist: "X",
      artwork: "from-a",
      duration: 100,
      confidence: 90,
      identifiedAt: "2026-01-01T00:00:00.000Z",
    });
    db.addHistory(user.id, {
      songId: "b",
      songTitle: "B",
      artist: "Y",
      artwork: "from-b",
      duration: 120,
      confidence: 80,
      identifiedAt: "2026-01-02T00:00:00.000Z",
    });
    const history = db.getHistory(user.id);
    expect(history).toHaveLength(2);
    expect(history[0].songId).toBe("b");
    expect(history[0].id).toBeTruthy();
  });

  it("caps history at 50 entries", () => {
    const user = createUser();
    for (let i = 0; i < 55; i++) {
      db.addHistory(user.id, {
        songId: `s${i}`,
        songTitle: `Song ${i}`,
        artist: "X",
        artwork: "from-x",
        duration: 100,
        confidence: 50,
        identifiedAt: "2026-01-01T00:00:00.000Z",
      });
    }
    expect(db.getHistory(user.id)).toHaveLength(50);
  });

  it("clears history", () => {
    const user = createUser();
    db.addHistory(user.id, {
      songId: "a",
      songTitle: "A",
      artist: "X",
      artwork: "from-a",
      duration: 100,
      confidence: 90,
      identifiedAt: "2026-01-01T00:00:00.000Z",
    });
    db.clearHistory(user.id);
    expect(db.getHistory(user.id)).toHaveLength(0);
  });
});

describe("likes", () => {
  it("likes, checks, and unlikes songs", () => {
    const user = createUser();
    expect(db.isLiked(user.id, "blinding-lights")).toBe(false);
    db.likeSong(user.id, "blinding-lights");
    expect(db.isLiked(user.id, "blinding-lights")).toBe(true);
    expect(db.getLikes(user.id)).toHaveLength(1);
    db.likeSong(user.id, "blinding-lights");
    expect(db.getLikes(user.id)).toHaveLength(1);
    db.unlikeSong(user.id, "blinding-lights");
    expect(db.isLiked(user.id, "blinding-lights")).toBe(false);
    expect(db.getLikes(user.id)).toHaveLength(0);
  });
});

describe("playlists", () => {
  it("creates playlists and adds unique songs", () => {
    const user = createUser();
    const pl = db.createPlaylist(user.id, { name: "Roadtrip", color: "#00cfff" });
    expect(pl.songIds).toEqual([]);
    db.addToPlaylist(user.id, pl.id, "dos");
    db.addToPlaylist(user.id, pl.id, "uno");
    db.addToPlaylist(user.id, pl.id, "uno");
    const playlists = db.getPlaylists(user.id);
    expect(playlists).toHaveLength(1);
    expect(playlists[0].songIds).toEqual(["dos", "uno"]);
  });
});

describe("downloads", () => {
  it("marks and removes downloads without duplicates", () => {
    const user = createUser();
    expect(db.getDownloads(user.id)).toEqual([]);
    db.markDownloaded(user.id, "s1");
    db.markDownloaded(user.id, "s1");
    db.markDownloaded(user.id, "s2");
    expect(db.getDownloads(user.id)).toHaveLength(2);
    db.removeDownload(user.id, "s1");
    expect(db.getDownloads(user.id).map((d) => d.songId)).toEqual(["s2"]);
  });
});

describe("recent searches", () => {
  it("dedupes, trims, and caps at 8 terms", () => {
    const user = createUser();
    db.addRecentSearch(user.id, "weeknd");
    db.addRecentSearch(user.id, " weeknd ");
    db.addRecentSearch(user.id, "  ");
    expect(db.getRecentSearches(user.id)).toEqual(["weeknd"]);
    for (let i = 0; i < 10; i++) {
      db.addRecentSearch(user.id, `term${i}`);
    }
    const recent = db.getRecentSearches(user.id);
    expect(recent).toHaveLength(8);
    expect(recent[0]).toBe("term9");
  });
});

describe("play history", () => {
  it("records plays newest-first without duplicates", () => {
    const user = createUser();
    db.recordPlay(user.id, "a");
    db.recordPlay(user.id, "b");
    db.recordPlay(user.id, "a");
    const plays = db.getPlayHistory(user.id);
    expect(plays).toHaveLength(2);
    expect(plays[0].songId).toBe("a");
    expect(plays[1].songId).toBe("b");
  });

  it("caps play history at 50 entries", () => {
    const user = createUser();
    for (let i = 0; i < 55; i++) {
      db.recordPlay(user.id, `s${i}`);
    }
    expect(db.getPlayHistory(user.id)).toHaveLength(50);
  });

  it("clears play history", () => {
    const user = createUser();
    db.recordPlay(user.id, "a");
    db.clearPlayHistory(user.id);
    expect(db.getPlayHistory(user.id)).toHaveLength(0);
  });
});