"use client";

import { useState } from "react";
import { PlayerProvider } from "@/lib/player-context";
import PageTransition from "@/components/PageTransition";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import PlayerBar from "@/components/layout/PlayerBar";
import AmbiGradient from "@/components/player/AmbiGradient";
import AudioMotionEffect from "@/components/player/AudioMotionEffect";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <PlayerProvider>
      <div className="h-screen flex flex-col bg-surface-deepest overflow-hidden relative">
        <AmbiGradient />
        <AudioMotionEffect />
        <div className="relative z-10 flex flex-1 min-h-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                setMobileOpen(!mobileOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>
        <div className="relative z-10">
          <PlayerBar />
        </div>
      </div>
    </PlayerProvider>
  );
}
