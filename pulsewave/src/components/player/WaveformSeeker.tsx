"use client";

import { useRef, useEffect, useCallback } from "react";
import { usePlayer } from "@/lib/player-context";
import { getFrequencyBands } from "@/lib/audio/playerAudio";
import { paletteFromArtwork } from "@/lib/art/albumColors";

const BAR_COUNT = 48;

interface WaveformSeekerProps {
  artwork: string;
  compact?: boolean;
}

export default function WaveformSeeker({ artwork, compact = false }: WaveformSeekerProps) {
  const { isPlaying, progress, setProgress, getAudioElement } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothBands = useRef<number[]>(new Array(BAR_COUNT).fill(0));
  const artRef = useRef(artwork);
  const drawRef = useRef<() => void>(() => {});

  useEffect(() => {
    artRef.current = artwork;
  }, [artwork]);

  useEffect(() => {
    drawRef.current = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const audio = getAudioElement();
    if (!canvas || !ctx || !audio) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const { accent: accentColor } = paletteFromArtwork(artRef.current);
    const rawBands = getFrequencyBands(audio, BAR_COUNT);
    const current = smoothBands.current;
    const lerp = isPlaying ? 0.3 : 0.02;
    for (let i = 0; i < BAR_COUNT; i++) {
      current[i] = current[i] * (1 - lerp) + (rawBands[i] ?? 0) * lerp;
    }

    const gap = dpr * 2;
    const barW = (w - gap * (BAR_COUNT - 1)) / BAR_COUNT;
    const minH = dpr * 2;
    const maxH = h * 0.95;

    const playIdx = Math.floor((progress / 100) * BAR_COUNT);

    ctx.shadowBlur = 0;
    for (let i = 0; i < BAR_COUNT; i++) {
      const amp = current[i] ?? 0;
      const bh = Math.max(minH, amp * maxH);
      const x = i * (barW + gap);
      const y = (h - bh) / 2;

      if (i < playIdx) {
        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = dpr * 3;
      } else if (i === playIdx) {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = dpr * 5;
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.shadowBlur = 0;
      }

      const r = Math.min(barW / 2, dpr * 2);
      roundRect(ctx, x, y, barW, bh, r);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  };
  }, [artwork, isPlaying, progress, getAudioElement]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      drawRef.current();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setProgress(Math.max(0, Math.min(100, pct)));
    },
    [setProgress]
  );

  return (
    <div
      className={`w-full cursor-pointer group relative ${compact ? "h-6" : "h-8"}`}
      onClick={handleSeek}
      role="slider"
      aria-label="Seek track"
      aria-valuenow={Math.round(progress)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setProgress(Math.max(0, progress - 2));
        if (e.key === "ArrowRight") setProgress(Math.min(100, progress + 2));
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
