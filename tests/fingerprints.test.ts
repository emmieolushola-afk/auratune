import { describe, expect, it } from "vitest";
import {
  cosineSimilarity,
  FINGERPRINT_DIM,
  hashString,
  mulberry32,
  normalizeVector,
  scoreToConfidence,
  songFingerprint,
} from "@/lib/fingerprints";

describe("mulberry32", () => {
  it("is deterministic for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces different streams for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });
});

describe("hashString", () => {
  it("is stable and differs for different input", () => {
    expect(hashString("blinding-lights")).toBe(hashString("blinding-lights"));
    expect(hashString("blinding-lights")).not.toBe(hashString("levitating"));
  });

  it("returns an unsigned 32-bit integer", () => {
    expect(hashString("song")).toBeGreaterThanOrEqual(0);
    expect(hashString("song")).toBeLessThan(2 ** 32);
  });
});

describe("songFingerprint", () => {
  const song = {
    id: "blinding-lights",
    genre: "R&B",
    duration: 200,
    title: "Blinding Lights",
  };

  it("is deterministic for the same song", () => {
    expect(songFingerprint(song)).toEqual(songFingerprint(song));
  });

  it("returns a normalized vector of dimension 16", () => {
    const v = songFingerprint(song);
    expect(v).toHaveLength(FINGERPRINT_DIM);
    const magnitude = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    expect(magnitude).toBeCloseTo(1, 5);
  });

  it("differs clearly between distinct songs", () => {
    const a = songFingerprint({ ...song, id: "levitating", genre: "Dance-pop" });
    const b = songFingerprint({ ...song, id: "heat-waves", genre: "Indie" });
    expect(cosineSimilarity(a, b)).toBeLessThan(0.99);
  });
});

describe("normalizeVector", () => {
  it("divides by magnitude", () => {
    const v = normalizeVector([3, 4]);
    expect(v).toEqual([0.6, 0.8]);
  });

  it("keeps zero vectors untouched", () => {
    expect(normalizeVector([0, 0, 0])).toEqual([0, 0, 0]);
  });
});

describe("cosineSimilarity", () => {
  it("is 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
  });

  it("is 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  it("returns 0 for different lengths", () => {
    expect(cosineSimilarity([1], [1, 0])).toBe(0);
  });

  it("returns 0 when a vector has zero magnitude", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

describe("scoreToConfidence", () => {
  it("maps the score range to 60-98", () => {
    expect(scoreToConfidence(0)).toBe(60);
    expect(scoreToConfidence(1)).toBe(98);
  });

  it("scales linearly in between", () => {
    expect(scoreToConfidence(0.5)).toBe(79);
    expect(scoreToConfidence(0.25)).toBe(70);
  });

  it("clamps out-of-range input", () => {
    expect(scoreToConfidence(-1)).toBe(60);
    expect(scoreToConfidence(5)).toBe(98);
  });
});