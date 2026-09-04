export const FINGERPRINT_DIM = 16;

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const GENRE_PROFILES: Record<string, number[]> = {
  Pop: [0.55, 0.7, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.35, 0.3, 0.28, 0.25, 0.22, 0.2, 0.18, 0.16],
  "R&B": [0.7, 0.8, 0.75, 0.65, 0.55, 0.45, 0.4, 0.35, 0.3, 0.28, 0.25, 0.22, 0.2, 0.18, 0.16, 0.14],
  "Dance-pop": [0.6, 0.75, 0.9, 0.85, 0.75, 0.65, 0.55, 0.45, 0.38, 0.32, 0.28, 0.25, 0.22, 0.2, 0.18, 0.16],
  "Pop Rock": [0.5, 0.6, 0.7, 0.75, 0.8, 0.75, 0.65, 0.55, 0.45, 0.38, 0.3, 0.26, 0.22, 0.2, 0.18, 0.16],
  "Alt-pop": [0.45, 0.5, 0.6, 0.7, 0.75, 0.8, 0.7, 0.6, 0.5, 0.42, 0.35, 0.3, 0.26, 0.22, 0.2, 0.18],
  "Hip-Hop": [0.85, 0.8, 0.7, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.28, 0.25, 0.22, 0.2, 0.18, 0.16],
  Latin: [0.6, 0.72, 0.8, 0.82, 0.78, 0.7, 0.6, 0.5, 0.42, 0.36, 0.3, 0.27, 0.24, 0.22, 0.2, 0.18],
  Indie: [0.4, 0.48, 0.58, 0.64, 0.7, 0.72, 0.68, 0.6, 0.5, 0.42, 0.35, 0.3, 0.26, 0.22, 0.2, 0.18],
  "Pop Rap": [0.8, 0.82, 0.75, 0.68, 0.62, 0.55, 0.48, 0.42, 0.38, 0.34, 0.3, 0.28, 0.24, 0.22, 0.2, 0.18],
};

const DEFAULT_PROFILE = GENRE_PROFILES.Pop;

/** Deterministic 16-band "spectral" feature vector for a catalog song. */
export function songFingerprint(song: {
  id: string;
  genre: string;
  duration: number;
  title: string;
}): number[] {
  const profile = GENRE_PROFILES[song.genre] ?? DEFAULT_PROFILE;
  const rng = mulberry32(hashString(song.id));
  const tempo = Math.min(0.9, (60 / Math.max(60, song.duration)) + 0.25);
  const vector = profile.map((base, i) => {
    const lowEnd = i < 6;
    const wobble = (rng() - 0.5) * (lowEnd ? 0.28 : 0.45);
    const v = base * tempo + wobble + (rng() * 0.08 - 0.04);
    return Math.max(0.05, Math.min(1, v));
  });
  return normalizeVector(vector);
}

export function normalizeVector(v: number[]): number[] {
  const mag = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  if (mag === 0) return v.map(() => 0);
  return v.map((x) => x / mag);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA * magB);
  return denom === 0 ? 0 : dot / denom;
}

/** Maps a raw best-score into a believable confidence percentage (60-98). */
export function scoreToConfidence(score: number): number {
  const clamped = Math.max(0, Math.min(1, score));
  return Math.round(60 + clamped * 38);
}