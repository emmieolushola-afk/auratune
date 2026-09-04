"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Star, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah K.",
    text: "Best music app I've ever used. The sound quality is unreal.",
    rating: 5,
  },
  {
    name: "Marcus L.",
    text: "Song recognition works flawlessly. Identified a track in 2 seconds.",
    rating: 5,
  },
  {
    name: "Priya M.",
    text: "Finally something that competes with Spotify. The UI is gorgeous.",
    rating: 5,
  },
];

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}+</span>;
}

export default function SocialProof() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
        <Users className="h-4 w-4 text-neon-cyan" />
        <span>
          Join <AnimatedCounter target={2000000} /> music lovers
        </span>
      </div>

      <div className="space-y-2">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
            className="flex items-start gap-3 glass rounded-xl p-3"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>{t.name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-3 w-3 fill-neon-cyan text-neon-cyan"
                  />
                ))}
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {t.text}
              </p>
              <p className="text-[10px] text-text-muted font-medium">
                {t.name}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
