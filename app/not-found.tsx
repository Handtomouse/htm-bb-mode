"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ACCENT = "var(--accent)";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          router.push("/");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 md:p-8" style={{ fontFamily: "var(--font-mono)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Glitchy 404 */}
        <motion.div
          animate={{
            textShadow: [
              "0 0 10px rgba(255,157,35,0.5)",
              "0 0 40px rgba(255,157,35,0.8), 4px 0 4px rgba(255,0,0,0.6), -4px 0 4px rgba(0,255,255,0.6)",
              "0 0 10px rgba(255,157,35,0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-9xl md:text-[12rem] font-black text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          404
        </motion.div>

        {/* Error message in BB style */}
        <div className="border-2 border-white/10 bg-black/50 p-6 md:p-8 space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
            Page Not Found
          </h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            This page doesn't exist in our system. Maybe it never did. Or maybe it's hiding from you.
            <br />
            Either way, you shouldn't be here.
          </p>

          {/* Progress bar */}
          <div className="mt-6 space-y-2">
            <div className="text-xs text-white/50">
              Redirecting to home in {countdown}s...
            </div>
            <div className="h-2 bg-white/10 w-full">
              <motion.div
                className="h-full"
                style={{ backgroundColor: ACCENT }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 10, ease: "linear" }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => router.back()}
              className="flex-1 border-2 border-white/20 bg-black/20 px-6 py-3 text-sm font-semibold text-white hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all uppercase tracking-wider"
            >
              ← Go Back
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 border-2 border-[var(--accent)]/50 bg-[var(--accent)]/10 px-6 py-3 text-sm font-semibold text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all uppercase tracking-wider"
            >
              Go Home →
            </button>
          </div>
        </div>

        {/* ASCII art or BB-style decoration */}
        <div className="text-white/20 text-xs md:text-sm font-mono">
          <pre className="inline-block text-left">
{`┌─────────────────────┐
│ ERROR: 404          │
│ STATUS: NOT_FOUND   │
│ ACTION: REDIRECTING │
└─────────────────────┘`}
          </pre>
        </div>
      </motion.div>
    </div>
  );
}
