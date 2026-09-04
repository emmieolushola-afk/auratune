"use client";

import { useRef, useEffect } from "react";

interface WaveformVisualizerProps {
  isAnimating: boolean;
}

export default function WaveformVisualizer({ isAnimating }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (isAnimating) {
        ctx.beginPath();
        ctx.strokeStyle = "#00CFFF";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#00CFFF";
        ctx.shadowBlur = 10;

        for (let x = 0; x < width; x++) {
          const amplitude = 30 + Math.sin(phase * 0.5) * 10;
          const y =
            height / 2 +
            Math.sin(x * 0.02 + phase) * amplitude * 0.6 +
            Math.sin(x * 0.05 + phase * 1.5) * amplitude * 0.3 +
            Math.sin(x * 0.01 + phase * 0.3) * amplitude * 0.4 +
            (Math.random() - 0.5) * 4;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Second waveform layer
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 207, 255, 0.3)";
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x++) {
          const y =
            height / 2 +
            Math.sin(x * 0.03 + phase * 0.7) * 25 +
            Math.sin(x * 0.015 + phase * 1.2) * 15 +
            (Math.random() - 0.5) * 2;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.shadowBlur = 0;
        phase += 0.05;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isAnimating]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className="w-full max-w-[600px] h-[120px]"
    />
  );
}
