"use client";

import { motion } from "motion/react";
import { Music, Search, Headphones, WifiOff } from "lucide-react";

const features = [
  {
    icon: Music,
    title: "100M+ Songs",
    desc: "Stream every song ever made in HiFi quality",
  },
  {
    icon: Search,
    title: "Song Recognition",
    desc: "Identify any track playing around you instantly",
  },
  {
    icon: Headphones,
    title: "Lossless Audio",
    desc: "Experience music the way artists intended",
  },
  {
    icon: WifiOff,
    title: "Offline Mode",
    desc: "Download and listen without internet",
  },
];

export default function FeatureHighlights() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 * i }}
          className="glass rounded-xl p-4 space-y-2 group hover:border-neon-cyan/20 transition-all duration-300"
        >
          <div className="h-9 w-9 rounded-lg bg-neon-cyan/10 flex items-center justify-center group-hover:bg-neon-cyan/20 transition-colors">
            <f.icon className="h-4 w-4 text-neon-cyan" />
          </div>
          <h3 className="font-poppins text-sm font-semibold text-text-primary">
            {f.title}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
