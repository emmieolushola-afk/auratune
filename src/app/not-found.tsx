"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-deepest px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <motion.h1
          className="font-poppins text-8xl md:text-9xl font-bold text-neon-cyan/20"
          animate={{
            textShadow: [
              "0 0 20px rgba(0,207,255,0.1)",
              "0 0 40px rgba(0,207,255,0.2)",
              "0 0 20px rgba(0,207,255,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          404
        </motion.h1>
        <div className="space-y-2">
          <h2 className="font-poppins text-2xl font-bold text-text-primary">
            Lost in the frequency
          </h2>
          <p className="text-text-secondary max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back to the music.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link href="/home">
            <Button variant="neon" size="lg">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
