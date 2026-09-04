"use client";

export default function GlowOrbs() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full animate-float"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 207, 255, 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 67, 255, 0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "float 6s ease-in-out infinite 2s",
        }}
      />
      <div
        className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 207, 255, 0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "float 5s ease-in-out infinite 1s",
        }}
      />
    </div>
  );
}
