"use client";

import dynamic from "next/dynamic";
import AuthCard from "@/components/auth/AuthCard";
import FeatureHighlights from "@/components/auth/FeatureHighlights";
import PricingTeaser from "@/components/auth/PricingTeaser";
import SocialProof from "@/components/auth/SocialProof";

const BackgroundScene = dynamic(
  () => import("@/components/scene/BackgroundScene"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-surface-deepest z-0" />
    ),
  }
);

const GlowOrbs = dynamic(
  () => import("@/components/decorations/GlowOrbs"),
  { ssr: false }
);

const AudioWaveform = dynamic(
  () => import("@/components/decorations/AudioWaveform"),
  { ssr: false }
);

export default function AuthPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-deepest">
      <BackgroundScene />
      <GlowOrbs />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12">
          {/* Left side - Auth Card */}
          <div className="flex-1 w-full max-w-md">
            <AuthCard />
          </div>

          {/* Right side - Features & Social Proof */}
          <div className="flex-1 w-full max-w-lg space-y-8 hidden lg:block">
            <SocialProof />
            <FeatureHighlights />
            <PricingTeaser />
          </div>
        </div>
      </div>

      {/* Mobile: Features below auth */}
      <div className="relative z-10 lg:hidden px-4 pb-12 space-y-8">
        <SocialProof />
        <FeatureHighlights />
        <PricingTeaser />
      </div>

      <AudioWaveform />
    </div>
  );
}
