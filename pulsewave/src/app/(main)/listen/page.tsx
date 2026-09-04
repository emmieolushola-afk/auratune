"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import MicButton from "@/components/listen/MicButton";
import ResultCard from "@/components/listen/ResultCard";
import SongHistory from "@/components/listen/SongHistory";
import { usePlayer, type Track } from "@/lib/player-context";
import {
  startMicCapture,
  fingerprintFromBlob,
  type MicCapture,
} from "@/lib/audio/fingerprint";

const WaveformVisualizer = dynamic(
  () => import("@/components/listen/WaveformVisualizer"),
  { ssr: false }
);

type ListenState = "idle" | "listening" | "processing" | "result" | "error";

interface IdentifyResponse {
  match: boolean;
  song?: Track;
  confidence?: number;
  message?: string;
}

const CAPTURE_WAIT_MS = 5500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ListenPage() {
  const { play } = usePlayer();
  const [state, setState] = useState<ListenState>("idle");
  const [result, setResult] = useState<(Track & { confidence: number }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const captureRef = useRef<MicCapture | null>(null);
  const busyRef = useRef(false);

  const handleClick = useCallback(() => {
    if (busyRef.current) return;
    if (state === "result" || state === "idle" || state === "error") {
      busyRef.current = true;
      setState("listening");
      setResult(null);
      setError(null);
      (async () => {
        let capture: MicCapture | null = null;
        try {
          capture = await startMicCapture();
          captureRef.current = capture;
          await sleep(CAPTURE_WAIT_MS);
          const blob = await capture.stop();
          setState("processing");
          const signature = await fingerprintFromBlob(blob);
          const res = await fetch("/api/identify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ signature }),
          });
          const data = (await res.json()) as IdentifyResponse;
          if (!res.ok || !data.match || !data.song) {
            setError(data.message ?? "Could not identify the song");
            setState("error");
            return;
          }
          setResult({ ...data.song, confidence: data.confidence ?? 0 });
          setMatchCount((c) => c + 1);
          setRefreshKey((k) => k + 1);
          setState("result");
        } catch (err) {
          let message = "Microphone access is required to identify songs.";
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            message = "Microphone permission was denied. Allow access to identify songs.";
          } else if (err instanceof Error && err.message) {
            message = err.message;
          }
          setError(message);
          setState("error");
        } finally {
          captureRef.current = null;
          busyRef.current = false;
        }
      })();
    }
  }, [state]);

  const handlePlayResult = useCallback(() => {
    if (result) {
      play(result);
    }
  }, [result, play]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 w-full max-w-lg"
      >
        <div className="space-y-2">
          <h1 className="font-poppins text-3xl font-bold text-text-primary">
            Identify Any Song
          </h1>
          <p className="text-text-secondary">
            Tap the button and let PulseWave listen
          </p>
          {matchCount > 0 && (
            <p className="text-xs text-neon-cyan">
              {matchCount} song{matchCount !== 1 ? "s" : ""} identified this session
            </p>
          )}
        </div>

        <div className="relative flex justify-center" style={{ marginBottom: "3.5rem" }}>
          <MicButton state={state} onClick={handleClick} />
        </div>

        <div className="flex justify-center">
          <WaveformVisualizer
            isAnimating={state === "listening" || state === "processing"}
          />
        </div>

        <AnimatePresence>
          {state === "result" && result && (
            <ResultCard
              song={result}
              onClose={() => {
                setState("idle");
                setResult(null);
              }}
              onPlay={handlePlayResult}
            />
          )}
          {state === "error" && error && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md mx-auto border border-red-500/20"
            >
              <p className="text-sm text-text-primary font-medium mb-1">
                Couldn&apos;t identify the song
              </p>
              <p className="text-xs text-text-muted">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          <SongHistory refreshKey={refreshKey} />
        </div>
      </motion.div>
    </div>
  );
}