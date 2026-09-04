"use client";

let context: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let sourceCreated = false;
let sourceNode: MediaElementAudioSourceNode | null = null;
let boundElement: HTMLAudioElement | null = null;

let smoothing = 0;
let idleLevel = 0;

/**
 * Lazily initializes the Web Audio graph for visualisation.
 *
 * The shared HTMLAudioElement is routed through an AnalyserNode purely for
 * inspection; the analyser reconnects straight to the destination so audio is
 * preserved unchanged. Cross-origin media (SoundHelix previews) can throw a
 * SecurityError when createMediaElementSource is called — we swallow it so
 * playback always continues and only the visual layers degrade gracefully.
 */
export function ensureAnalyser(audio: HTMLAudioElement): AnalyserNode | null {
  if (typeof window === "undefined") return null;

  if (sourceCreated && boundElement === audio) {
    return analyser;
  }

  if (analyser) {
    analyser.disconnect();
    analyser = null;
  }
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  sourceCreated = false;

  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    context = context ?? new Ctor();
    if (context.state === "suspended") {
      void context.resume().catch(() => {});
    }
    const node = context.createMediaElementSource(audio);
    const an = context.createAnalyser();
    an.fftSize = 256;
    an.smoothingTimeConstant = 0.72;
    node.connect(an);
    an.connect(context.destination);
    analyser = an;
    sourceNode = node;
    sourceCreated = true;
    boundElement = audio;
  } catch {
    analyser = null;
    sourceCreated = false;
  }
  return analyser;
}

export function resumeAudioContext(): void {
  if (context && context.state === "suspended") {
    void context.resume().catch(() => {});
  }
}

/**
 * Returns `n` frequency bands as normalized values (0..1) derived from the
 * current FFT frame. Falls back to (or rides on) a smooth synthetic idle
 * level so the UI never looks dead before playback starts.
 */
export function getFrequencyBands(audio: HTMLAudioElement, n: number): number[] {
  const an = ensureAnalyser(audio);
  const out = new Array<number>(n).fill(0);

  if (!an || typeof an.getByteFrequencyData !== "function") {
    idleLevel = Math.max(0.02, Math.pow(idleLevel, 0.9));
    for (let i = 0; i < n; i++) {
      const wave =
        idleLevel * (0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + idleLevel * 20)));
      out[i] = Math.min(1, wave);
    }
    return out;
  }

  const data = new Uint8Array(an.frequencyBinCount);
  an.getByteFrequencyData(data);

  const usable = Math.floor(an.frequencyBinCount * 0.85);
  const per = usable / n;
  let overall = 0;
  for (let i = 0; i < n; i++) {
    const start = Math.floor(i * per);
    const end = Math.max(start + 1, Math.floor((i + 1) * per));
    let sum = 0;
    for (let k = start; k < end; k++) sum += data[k];
    const avg = sum / (end - start);
    const norm = Math.pow((avg - 20) / 255, 1.25);
    out[i] = Math.max(0, Math.min(1, norm));
    overall += out[i];
  }

  // Loudness normalization so a quiet track is still visibly animating but a
  // loud track doesn't clip to full.
  const mean = overall / n;
  smoothing = smoothing * 0.7 + mean * 0.3;
  const gain = smoothing > 0 ? Math.min(1, 0.28 / smoothing) : 1;
  for (let i = 0; i < n; i++) {
    out[i] = Math.min(1, out[i] * (0.35 + gain * 0.9));
  }

  if (mean < 0.03) {
    idleLevel = Math.min(1, idleLevel + 0.02);
  } else {
    idleLevel = Math.max(0.02, idleLevel - 0.05);
  }

  return out;
}

export function hasWebAudio(): boolean {
  return typeof window !== "undefined" && !!window.AudioContext;
}

export function resetAnalyser(): void {
  if (analyser) {
    analyser.disconnect();
    analyser = null;
  }
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  sourceCreated = false;
  boundElement = null;
}
