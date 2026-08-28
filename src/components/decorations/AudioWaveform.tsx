"use client";

export default function AudioWaveform() {
  const bars = 50;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2] flex items-end justify-center gap-[3px] h-12 pointer-events-none px-4 opacity-40">
      {Array.from({ length: bars }).map((_, i) => {
        const centerDist = Math.abs(i - bars / 2) / (bars / 2);
        const maxHeight = 30 * (1 - centerDist * 0.6);
        const delay = (i * 0.08) % 2;

        return (
          <div
            key={i}
            className="w-[3px] rounded-full bg-neon-cyan"
            style={{
              height: "5px",
              animation: `waveform 0.8s ease-in-out ${delay}s infinite alternate`,
              "--wave-height": `${maxHeight}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
