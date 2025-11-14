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
        fontFamily: 'var(--font-mono)',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: '0.08em',
        textShadow: '0 1px 2px rgba(255,157,35,0.1)',
        minHeight: '1.4em',
        transition: 'font-size 0.2s ease-out',
        whiteSpace: 'nowrap'
      }}
    >
      {beforeAccent}
      <span className="text-[#ff9d23]/90 font-semibold">
        {accentPart}
      </span>
      {showCursor && (
        <motion.span
          animate={{ opacity: [0.9, 0.3, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#ff9d23]/90"
        >
          |
        </motion.span>
      )}
    </motion.div>
  );
}
