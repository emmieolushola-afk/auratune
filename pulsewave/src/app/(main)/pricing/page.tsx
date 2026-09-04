"use client";

import { motion } from "motion/react";
import { Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    highlight: false,
    features: [
      "Ad-supported streaming",
      "Standard audio quality",
      "Limited song skips",
      "Shuffle-only playlists",
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    highlight: true,
    badge: "POPULAR",
    icon: Zap,
    features: [
      "Ad-free experience",
      "HiFi lossless quality",
      "Unlimited skips & replays",
      "Offline downloads",
      "Song recognition",
      "Spatial audio",
    ],
  },
  {
    name: "Premium",
    price: "$14.99",
    period: "/month",
    highlight: false,
    badge: "BEST VALUE",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Family sharing (6 accounts)",
      "Lossless + 24-bit audio",
      "Exclusive early releases",
      "Priority support",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="font-poppins text-3xl md:text-4xl font-bold text-text-primary">
          Pricing
        </h1>
        <p className="text-text-secondary">
          Free forever. Upgrade anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={
              tier.highlight
                ? "relative rounded-2xl p-6 space-y-5 border-2 border-neon-cyan/50 bg-surface-card neon-border-subtle"
                : "relative rounded-2xl p-6 space-y-5 glass"
            }
          >
            {tier.badge && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span
                  className={
                    tier.highlight
                      ? "bg-neon-cyan text-surface-deepest text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                      : "bg-neon-blue-deep text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  }
                >
                  {tier.icon && <tier.icon className="h-2.5 w-2.5" />}
                  {tier.badge}
                </span>
              </div>
            )}
            <div className="space-y-1 pt-1">
              <h2
                className={`font-poppins text-lg font-semibold ${
                  tier.highlight ? "text-neon-cyan" : "text-text-primary"
                }`}
              >
                {tier.name}
              </h2>
              <p className="text-3xl font-bold text-text-primary">
                {tier.price}
                <span className="text-xs font-normal text-text-muted">
                  {tier.period}
                </span>
              </p>
            </div>
            <ul className="space-y-2">
              {tier.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-text-secondary"
                >
                  <Check
                    className={`h-4 w-4 shrink-0 ${
                      tier.highlight ? "text-neon-cyan" : "text-text-muted"
                    }`}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={tier.highlight ? "neon" : "secondary"}
              size="lg"
              className="w-full"
            >
              {tier.name === "Free" ? "Get Started" : `Go ${tier.name}`}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
