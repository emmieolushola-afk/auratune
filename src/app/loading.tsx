export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-deepest">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing logo */}
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center animate-pulse">
            <svg
              className="h-8 w-8 text-neon-cyan"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-2xl border border-neon-cyan/20 animate-pulse-ring" />
        </div>

        {/* Loading text */}
        <div className="flex items-center gap-1">
          <span className="font-poppins text-lg font-bold text-text-primary">
            Pulse
          </span>
          <span className="font-poppins text-lg font-bold text-neon-cyan animate-pulse">
            Wave
          </span>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-neon-cyan"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
