import { describe, expect, it } from "vitest";
import {
  albums,
  artists,
  getAlbumById,
  getArtistById,
  getSongById,
  newReleases,
  searchCatalog,
  songs,
  songsByAlbum,
  songsByArtist,
  trendingByPlays,
} from "@/lib/catalog";

describe("catalog shape", () => {
  it("has a seeded catalog with unique song ids", () => {
    expect(songs.length).toBeGreaterThan(40);
    const ids = new Set(songs.map((s) => s.id));
    expect(ids.size).toBe(songs.length);
  });

  it("has 23 albums and 21 artists", () => {
    expect(albums.length).toBe(23);
    expect(artists.length).toBe(21);
  });

  it("hydrates every song with preview and artwork", () => {
    for (const song of songs) {
      expect(song.previewUrl).toMatch(/^https:\/\/www\.soundhelix\.com\//);
      expect(song.artwork).toMatch(/^from-/);
      expect(song.duration).toBeGreaterThan(0);
    }
  });
});

describe("getSongById", () => {
  it("returns a known song", () => {
    const song = getSongById("blinding-lights");
    expect(song).toBeDefined();
    expect(song?.title).toBe("Blinding Lights");
    expect(song?.artist).toBe("The Weeknd");
    expect(song?.genre).toBe("R&B");
    expect(song?.duration).toBe(200);
  });

  it("returns undefined for an unknown id", () => {
    expect(getSongById("nope")).toBeUndefined();
  });
});

describe("getAlbumById / getArtistById", () => {
  it("resolves seed entities", () => {
    expect(getAlbumById("future-nostalgia")?.title).toBe("Future Nostalgia");
    expect(getArtistById("dua-lipa")?.name).toBe("Dua Lipa");
    expect(getAlbumById("missing")).toBeUndefined();
    expect(getArtistById("missing")).toBeUndefined();
  });
});

describe("searchCatalog", () => {
  it("matches songs, albums and artists by name", () => {
    const r = searchCatalog("weeknd");
    expect(r.songs.map((s) => s.id)).toContain("blinding-lights");
    expect(r.albums.map((a) => a.id)).toContain("after-hours");
    expect(r.artists.map((a) => a.id)).toContain("the-weeknd");
  });

  it("is case-insensitive", () => {
    expect(searchCatalog("WEEKND").songs.length).toBe(
      searchCatalog("weeknd").songs.length
    );
  });

  it("matches by genre too", () => {
    const r = searchCatalog("indie");
    expect(r.songs.map((s) => s.id)).toContain("heat-waves");
    expect(r.songs.every((s) => s.genre === "Indie")).toBe(true);
  });

  it("returns empty results for a blank query", () => {
    const blank = searchCatalog("   ");
    expect(blank.songs).toHaveLength(0);
    expect(blank.albums).toHaveLength(0);
    expect(blank.artists).toHaveLength(0);
  });

  it("returns empty results for gibberish", () => {
    expect(searchCatalog("zzzqqq").songs).toHaveLength(0);
  });
});

describe("trendingByPlays", () => {
  it("returns the top N songs sorted by plays desc", () => {
    const top = trendingByPlays(3);
    expect(top).toHaveLength(3);
    expect(top[0].id).toBe("shape-of-you");
    expect(top[0].plays).toBeGreaterThanOrEqual(top[1].plays);
    expect(top[1].plays).toBeGreaterThanOrEqual(top[2].plays);
  });

  it("defaults to 10", () => {
    expect(trendingByPlays()).toHaveLength(10);
  });
});

describe("newReleases", () => {
  it("returns the newest songs first", () => {
    const r = newReleases(2);
    expect(r).toHaveLength(2);
    expect(r[0].releasedAt >= r[1].releasedAt).toBe(true);
    expect(r[0].id).toBe("kill-bill");
  });
});

describe("songsByAlbum / songsByArtist", () => {
  it("groups songs by album", () => {
    expect(songsByAlbum("future-nostalgia")).toHaveLength(3);
  });

  it("groups songs by artist", () => {
    expect(songsByArtist("the-weeknd")).toHaveLength(5);
  });
});