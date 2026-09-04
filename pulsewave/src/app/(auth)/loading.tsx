export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-deepest">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center animate-pulse">
          <svg
            className="h-6 w-6 text-neon-cyan"
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
