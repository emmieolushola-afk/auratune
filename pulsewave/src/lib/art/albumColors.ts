import type { Track } from "@/lib/player-context";

export interface AlbumPalette {
  /** Primary warm color derived from the artwork gradient. */
  primary: string;
  /** Secondary cool color derived from the artwork gradient. */
  secondary: string;
  /** Brightened accent used for waveforms/fills. */
  accent: string;
  /** CSS variables injected into an element so children can consume them. */
  vars: Record<"--pw-c1" | "--pw-c2" | "--pw-accent", string>;
}

const TAILWIND_500: Record<string, string> = {
  slate: "#64748B",
  gray: "#6B7280",
  zinc: "#71717A",
  neutral: "#737373",
  stone: "#78716C",
  red: "#EF4444",
  orange: "#F97316",
  amber: "#F59E0B",
  yellow: "#EAB308",
  lime: "#84CC16",
  green: "#22C55E",
  emerald: "#10B981",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  sky: "#0EA5E9",
  blue: "#3B82F6",
  indigo: "#6366F1",
  violet: "#8B5CF6",
  purple: "#A855F7",
  fuchsia: "#D946EF",
  pink: "#EC4899",
  rose: "#F43F5E",
};

const FALLBACK: AlbumPalette = {
  primary: "#A855F7",
  secondary: "#3B82F6",
  accent: "#00CFFF",
  vars: { "--pw-c1": "#A855F7", "--pw-c2": "#3B82F6", "--pw-accent": "#00CFFF" },
};

/** Extracts the `from-<color>-500/30 to-<color>-500/30` classes and
 *  derives an RGB palette. Any unrecognized tokens fall back gracefully. */
export function paletteFromArtwork(artwork: string): AlbumPalette {
  const from = /from-([a-z]+)-500/.exec(artwork)?.[1];
  const to = /to-([a-z]+)-500/.exec(artwork)?.[1];

  const c1 = from ? TAILWIND_500[from] : null;
  const c2 = to ? TAILWIND_500[to] : null;

  const primary = c1 ?? c2 ?? "#00CFFF";
  const secondary = c2 ?? primary;

  return {
    primary,
    secondary,
    accent: brighten(primary, 78),
    vars: {
      "--pw-c1": primary,
      "--pw-c2": secondary,
      "--pw-accent": brighten(primary, 78),
    },
  };
}

/** Lightens a hex color toward white by `amount` (0..100) for glow accents. */
export function brighten(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/.exec(hex.toLowerCase());
  if (!m) return hex;
  const num = parseInt(m[1], 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** CSS variables string for the current track's palette. */
export function trackColorVars(track: Track | null): Record<string, string> {
  if (!track) return FALLBACK.vars;
  return paletteFromArtwork(track.artwork ?? "").vars;
}

export { FALLBACK };
