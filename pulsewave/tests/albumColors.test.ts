import { describe, it, expect } from "vitest";
import {
  paletteFromArtwork,
  brighten,
  trackColorVars,
  FALLBACK,
} from "../src/lib/art/albumColors";

describe("albumColors", () => {
  it("derives a palette from a from/to gradient", () => {
    const p = paletteFromArtwork("from-purple-500/30 to-blue-500/30");
    expect(p.primary).toBe("#A855F7");
    expect(p.secondary).toBe("#3B82F6");
    expect(p.accent).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("handles a single-token gradient", () => {
    const p = paletteFromArtwork("from-red-500/30 to-slate-500/30");
    expect(p.primary).toBe("#EF4444");
    expect(p.secondary).toBe("#64748B");
  });

  it("falls back gracefully on unknown tokens", () => {
    const p = paletteFromArtwork("from-mystery-500/30 to-unknown-500/30");
    expect(p.primary).toBe("#00CFFF");
    expect(p.vars).toBeDefined();
  });

  it("falls back to defaults on empty artwork", () => {
    const p = paletteFromArtwork("");
    expect(p.primary).toBe("#00CFFF");
  });

  it("brighten lightens hex toward white", () => {
    expect(brighten("#000000", 50)).toBe("#323232");
    expect(brighten("#FFFFFF", 10)).toBe("#ffffff");
    expect(brighten("not-a-color", 10)).toBe("not-a-color");
  });

  it("trackColorVars returns defaults when no track", () => {
    expect(trackColorVars(null)).toEqual(FALLBACK.vars);
  });

  it("trackColorVars uses track artwork", () => {
    const track = {
      id: "x",
      title: "t",
      artist: "a",
      album: "al",
      duration: 100,
      genre: "g",
      artwork: "from-violet-500/30 to-cyan-500/30",
    } as never;
    const vars = trackColorVars(track as never);
    expect(vars["--pw-c1"]).toBe("#8B5CF6");
    expect(vars["--pw-c2"]).toBe("#06B6D4");
  });

  it("covers every color used by the catalog", () => {
    const used = [
      "from-purple-500/30 to-blue-500/30",
      "from-violet-500/30 to-cyan-500/30",
      "from-yellow-500/30 to-pink-500/30",
      "from-green-500/30 to-teal-500/30",
      "from-orange-500/30 to-rose-500/30",
      "from-pink-500/30 to-purple-500/30",
      "from-amber-500/30 to-red-500/30",
      "from-rose-500/30 to-violet-500/30",
      "from-indigo-500/30 to-blue-500/30",
      "from-slate-500/30 to-blue-500/30",
      "from-emerald-500/30 to-yellow-500/30",
      "from-teal-500/30 to-purple-500/30",
      "from-lime-500/30 to-cyan-500/30",
      "from-fuchsia-500/30 to-blue-500/30",
      "from-red-500/30 to-slate-500/30",
      "from-sky-500/30 to-indigo-500/30",
      "from-rose-500/30 to-amber-500/30",
    ];
    for (const art of used) {
      const p = paletteFromArtwork(art);
      expect(p.primary).not.toBe("#00CFFF");
      expect(p.secondary).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
