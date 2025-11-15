"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterManifestoProps {
  onComplete?: () => void;
  scrollProgress: number; // 0-1
}

export default function TypewriterManifesto({
  onComplete,
  scrollProgress
}: TypewriterManifestoProps) {
  const fullText = "Everyone's chasing new — we chase different.";

  // Calculate character index from scroll progress
  const charCount = Math.floor(scrollProgress * fullText.length);
  const displayedText = fullText.slice(0, charCount);

  // Extended cursor visibility (Fix #9): Wider range, less flickering on mobile
  const showCursor = scrollProgress > 0.001 && scrollProgress < 0.999;

  // Notify completion when fully scrolled through
  useEffect(() => {
    if (scrollProgress >= 0.99 && onComplete) {
      onComplete();
    }
  }, [scrollProgress, onComplete]);

  // Split text to apply accent color to "— we chase different."
  const splitIndex = displayedText.indexOf("—");
  const beforeAccent = splitIndex >= 0 ? displayedText.slice(0, splitIndex) : displayedText;
  const accentPart = splitIndex >= 0 ? displayedText.slice(splitIndex) : "";

  // Subtle scale effect as typewriter completes (0.7 → 1.0 becomes scale 1.0 → 1.03)
  const scaleValue = scrollProgress >= 0.7 ? 1 + ((scrollProgress - 0.7) / 0.3) * 0.03 : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        scale: scaleValue
      }}
      transition={{ duration: 0.8, scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
      className="text-[32px] md:text-[40px] lg:text-[48px] font-medium leading-[1.4]"
      style={{
        fontFamily: '"argent-pixel-cf", sans-serif',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: '0.08em',
        textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2), 0 0 24px rgba(255,157,35,0.15)',
        minHeight: '1.4em',
        transition: 'font-size 0.2s ease-out'
      }}
    >
      {beforeAccent}
      <span
        className="text-[var(--accent)]/90 font-semibold"
        style={{ textShadow: '0 0 16px rgba(255,157,35,0.4), 0 2px 4px rgba(0,0,0,0.4)' }}
      >
        {accentPart}
      </span>
      {showCursor && (
        <motion.span
          animate={{ opacity: [0.9, 0.3, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[var(--accent)]/90"
        >
          |
        </motion.span>
      )}
    </motion.div>
  );
}
