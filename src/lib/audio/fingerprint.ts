import { normalizeVector, FINGERPRINT_DIM } from "@/lib/fingerprints";

export interface MicCapture {
  /** Stops recording and returns the captured audio Blob. */
  stop: () => Promise<Blob>;
}

const CAPTURE_MS = 5000;
const SAMPLE_RATE = 22050;

/** Requests the microphone and starts recording.
 *  Recording auto-stops after CAPTURE_MS, or sooner if `stop()` is called. */
export async function startMicCapture(): Promise<MicCapture> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone access is not supported in this browser");
  }

  let stream: MediaStream | null = null;

  stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType: pickMimeType() });
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  const stopped = new Promise<void>((resolve) => {
    recorder.addEventListener("stop", () => resolve());
  });

  const autoTimer = setTimeout(() => {
    if (recorder.state !== "inactive") recorder.stop();
  }, CAPTURE_MS);

  const cleanup = () => {
    clearTimeout(autoTimer);
    stream?.getTracks().forEach((t) => t.stop());
  };

  const finish = (): Promise<Blob> =>
    stopped.then(() => {
      cleanup();
      return new Blob(chunks, { type: recorder.mimeType });
    });

  recorder.start();

  return {
    stop: () => {
      if (recorder.state !== "inactive") recorder.stop();
      return finish();
    },
  };
}

function pickMimeType(): string {
  if (typeof MediaRecorder !== "undefined") {
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus"))
      return "audio/webm;codecs=opus";
    if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  }
  return "audio/webm";
}

async function decodeToBuffer(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, SAMPLE_RATE);
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  return decoded;
}

/** Reduces an AudioBuffer into a 16-band normalized energy vector. */
export function computeFeatureVector(buffer: AudioBuffer): number[] {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;

  const bands = FINGERPRINT_DIM;
  const nyquist = sampleRate / 2;
  const minFreq = 40;
  const maxFreq = Math.min(8000, nyquist);
  const bandEdges: number[] = [];
  for (let i = 0; i <= bands; i++) {
    bandEdges.push(minFreq * Math.pow(maxFreq / minFreq, i / bands));
  }

  const energies = new Array(bands).fill(0);
  const counts = new Array(bands).fill(0);

  const frameSize = 2048;
  const hopSize = 1024;
  const window = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (frameSize - 1)));
  }

  const frameCount = Math.max(1, Math.floor((data.length - frameSize) / hopSize));

  for (let f = 0; f < frameCount; f++) {
    const offset = f * hopSize;
    const timed = new Float32Array(frameSize);
    for (let i = 0; i < frameSize; i++) {
      timed[i] = data[offset + i] * window[i];
    }
    const re = new Float32Array(frameSize);
    const im = new Float32Array(frameSize);
    fft(timed, re, im);

    const mag = new Float32Array(frameSize / 2);
    for (let i = 0; i < frameSize / 2; i++) {
      mag[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    }

    const binHz = sampleRate / frameSize;
    for (let b = 0; b < bands; b++) {
      const startBin = Math.max(1, Math.floor(bandEdges[b] / binHz));
      const endBin = Math.min(frameSize / 2, Math.ceil(bandEdges[b + 1] / binHz));
      if (endBin <= startBin) continue;
      let sum = 0;
      for (let k = startBin; k < endBin; k++) sum += mag[k];
      energies[b] += sum / (endBin - startBin);
      counts[b] += 1;
    }
  }

  const avg = energies.map((e, i) => (counts[i] > 0 ? e / counts[i] : 0));
  const max = Math.max(...avg, 1e-9);
  const scaled = avg.map((e) => Math.pow(e / max, 0.6));
  return normalizeVector(scaled);
}

/** Naive real FFT (Radix-2, Cooley-Tukey). Input size must be a power of two. */
function fft(input: Float32Array, reOut: Float32Array, imOut: Float32Array): void {
  const n = input.length;
  if ((n & (n - 1)) !== 0) throw new Error("FFT size must be a power of two");

  for (let i = 0; i < n; i++) {
    reOut[i] = input[i];
    imOut[i] = 0;
  }

  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      const tr = reOut[j];
      const ti = imOut[j];
      reOut[j] = reOut[i];
      imOut[j] = imOut[i];
      reOut[i] = tr;
      imOut[i] = ti;
    }
    let m = n >> 1;
    while (j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      const half = len >> 1;
      for (let k = 0; k < half; k++) {
        const uRe = reOut[i + k];
        const uIm = imOut[i + k];
        const vRe = reOut[i + k + half] * curRe - imOut[i + k + half] * curIm;
        const vIm = reOut[i + k + half] * curIm + imOut[i + k + half] * curRe;
        reOut[i + k] = uRe + vRe;
        imOut[i + k] = uIm + vIm;
        reOut[i + k + half] = uRe - vRe;
        imOut[i + k + half] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

export async function fingerprintFromBlob(blob: Blob): Promise<number[]> {
  const buffer = await decodeToBuffer(blob);
  return computeFeatureVector(buffer);
}

export { CAPTURE_MS, SAMPLE_RATE };