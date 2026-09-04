"use client";

import { useRef, useEffect } from "react";
import { usePlayer } from "@/lib/player-context";
import { getFrequencyBands } from "@/lib/audio/playerAudio";
import { paletteFromArtwork } from "@/lib/art/albumColors";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  alpha: number;
}

interface PulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const PARTICLE_COUNT = 70;
const CONNECT_DIST_RATIO = 0.12;
const BASS_THRESHOLD = 0.45;

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: 1.5,
    baseRadius: 1.5,
    alpha: 0.3 + Math.random() * 0.4,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return { r: 0, g: 207, b: 255 };
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

export default function AudioMotionEffect() {
  const { currentTrack, isPlaying, getAudioElement } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const pulseRings = useRef<PulseRing[]>([]);
  const smoothBands = useRef<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const lastBassSpike = useRef(0);
  const breathPhase = useRef(0);
  const drawRef = useRef<() => void>(() => {});

  useEffect(() => {
    drawRef.current = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        particles.current = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.current.push(createParticle(targetW, targetH));
        }
      }
      const w = canvas.width;
      const h = canvas.height;

      if (particles.current.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.current.push(createParticle(w, h));
        }
      }

      ctx.clearRect(0, 0, w, h);

      const audio = getAudioElement();
      const rawBands = audio ? getFrequencyBands(audio, 8) : new Array(8).fill(0.05);

      const lerpSpeed = isPlaying ? 0.18 : 0.04;
      for (let i = 0; i < 8; i++) {
        smoothBands.current[i] =
          smoothBands.current[i] * (1 - lerpSpeed) + rawBands[i] * lerpSpeed;
      }

      const bands = smoothBands.current;
      const bass = (bands[0] + bands[1] + bands[2]) / 3;
      const mids = (bands[3] + bands[4] + bands[5]) / 3;
      const treble = (bands[6] + bands[7]) / 2;
      const energy = (bass + mids + treble) / 3;

      const palette = paletteFromArtwork(currentTrack?.artwork ?? "");
      const accentRgb = hexToRgb(palette.accent);
      const primaryRgb = hexToRgb(palette.primary);

      breathPhase.current += isPlaying ? 0.015 + energy * 0.02 : 0.003;
      const breathAlpha = isPlaying
        ? 0.03 + energy * 0.08 + Math.sin(breathPhase.current) * 0.02
        : 0.015 + Math.sin(breathPhase.current) * 0.008;

      const cx = w / 2;
      const cy = h / 2;
      const maxBreathR = Math.max(w, h) * 0.6;
      if (maxBreathR > 0 && Number.isFinite(maxBreathR)) {
        const breathGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxBreathR);
        breathGrad.addColorStop(
          0,
          `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${breathAlpha * 1.5})`
        );
        breathGrad.addColorStop(
          0.5,
          `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${breathAlpha * 0.6})`
        );
        breathGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = breathGrad;
        ctx.fillRect(0, 0, w, h);
      }

      if (isPlaying && bass > BASS_THRESHOLD && Date.now() - lastBassSpike.current > 350) {
        lastBassSpike.current = Date.now();
        pulseRings.current.push({
          x: cx + (Math.random() - 0.5) * w * 0.3,
          y: cy + (Math.random() - 0.5) * h * 0.3,
          radius: 0,
          maxRadius: Math.max(w, h) * (0.2 + bass * 0.3),
          alpha: 0.25 + bass * 0.3,
        });
      }

      for (let i = pulseRings.current.length - 1; i >= 0; i--) {
        const ring = pulseRings.current[i];
        ring.radius += (isPlaying ? 3 + energy * 5 : 1.5) * dpr;
        ring.alpha *= isPlaying ? 0.97 : 0.94;

        if (ring.alpha < 0.005 || ring.radius > ring.maxRadius) {
          pulseRings.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${ring.alpha})`;
        ctx.lineWidth = dpr * 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${ring.alpha * 0.4})`;
        ctx.lineWidth = dpr * 0.8;
        ctx.stroke();
      }

      if (pulseRings.current.length > 12) {
        pulseRings.current = pulseRings.current.slice(-12);
      }

      const baseAlpha = isPlaying ? 0.2 + energy * 0.5 : 0.12;
      const connectDist = Math.min(w, h) * CONNECT_DIST_RATIO;
      const connectDistSq = connectDist * connectDist;

      for (const p of particles.current) {
        const drift = isPlaying ? 1 + mids * 3 : 0.5;
        p.x += p.vx * drift * dpr;
        p.y += p.vy * drift * dpr;

        if (isPlaying) {
          p.vx += (Math.random() - 0.5) * 0.08 * (1 + bass * 2);
          p.vy += (Math.random() - 0.5) * 0.08 * (1 + bass * 2);
        } else {
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        const maxSpeed = (isPlaying ? 1.5 + bass * 2 : 0.6) * dpr;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > maxSpeed) {
          p.vx = (p.vx / spd) * maxSpeed;
          p.vy = (p.vy / spd) * maxSpeed;
        }

        if (p.x < -20) p.x = w + 10;
        if (p.x > w + 20) p.x = -10;
        if (p.y < -20) p.y = h + 10;
        if (p.y > h + 20) p.y = -10;

        const shimmer = isPlaying ? 0.8 + treble * 0.4 * Math.sin(Date.now() * 0.005 + p.x * 0.01) : 0.9;
        p.alpha = baseAlpha * shimmer;
        p.radius = p.baseRadius * (0.7 + bass * 1.8) * dpr;
      }

      const lineThreshold = Math.floor(energy * 12);
      let linesDrawn = 0;

      for (let i = 0; i < particles.current.length; i++) {
        const a = particles.current[i];
        for (let j = i + 1; j < particles.current.length; j++) {
          if (linesDrawn >= lineThreshold) break;
          const b = particles.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > connectDistSq) continue;

          const dist = Math.sqrt(distSq);
          const lineAlpha =
            (1 - dist / connectDist) * energy * 0.5 * (isPlaying ? 1 : 0.15);

          if (lineAlpha < 0.008) continue;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${lineAlpha})`;
          ctx.lineWidth = dpr * 0.6;
          ctx.stroke();
          linesDrawn++;
        }
      }

      for (const p of particles.current) {
        if (p.alpha < 0.005) continue;

        const glowSize = p.radius * (2 + bass * 3);
        if (!Number.isFinite(glowSize) || glowSize <= 0) continue;
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
        glowGrad.addColorStop(
          0,
          `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${p.alpha * 0.6})`
        );
        glowGrad.addColorStop(
          0.4,
          `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${p.alpha * 0.15})`
        );
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${p.alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.7})`;
        ctx.fill();
      }
    };
  }, [currentTrack, isPlaying, getAudioElement]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      drawRef.current();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none" aria-hidden>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
