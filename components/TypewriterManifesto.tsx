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
  // Split text into two lines
  const line1 = "Everyone's chasing new —";
  const line2 = "we chase different.";
  const fullText = line1 + " " + line2;

  // Calculate character index from scroll progress (slowed down - multiplier < 1)
  const charCount = Math.floor(scrollProgress * fullText.length * 0.7);

  // Determine what to show on each line
  const line1Length = line1.length + 1; // +1 for the space
  const line1Display = fullText.slice(0, Math.min(charCount, line1Length)).replace(line1 + " ", line1);
  const line2Display = charCount > line1Length ? fullText.slice(line1Length, charCount) : "";

  // Cursor positioning
  const showCursor = scrollProgress > 0.001 && scrollProgress < 0.999;
  const cursorOnLine1 = charCount <= line1Length;

  // Notify completion when fully scrolled through
  useEffect(() => {
    if (scrollProgress >= 0.99 && onComplete) {
      onComplete();
    }
  }, [scrollProgress, onComplete]);

  // Subtle scale effect as typewriter completes (0.7 → 1.0 becomes scale 1.0 → 1.03)
  const scaleValue = scrollProgress >= 0.7 ? 1 + ((scrollProgress - 0.7) / 0.3) * 0.03 : 1;

  const textStyle = {
    fontFamily: '"argent-pixel-cf", sans-serif',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: '0.08em',
    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2), 0 0 24px rgba(255,157,35,0.15)'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        scale: scaleValue
      }}
      transition={{ duration: 0.8, scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
      className="relative text-[32px] md:text-[40px] lg:text-[48px] font-medium leading-[1.6] p-8 md:p-12"
      style={{
        transition: 'font-size 0.2s ease-out',
        border: '1px solid rgba(255,157,35,0.2)'
      }}
    >
      {/* Corner accents - BlackBerry frame */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--accent)]" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--accent)]" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--accent)]" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--accent)]" />

      {/* Character count indicator */}
      <div
        className="absolute top-2 right-2 text-[10px] opacity-40"
        style={{ fontFamily: '"argent-pixel-cf", sans-serif', letterSpacing: '0.12em' }}
      >
        {charCount}/{fullText.length}
      </div>

      {/* Line 1: Everyone's chasing new — */}
      <div style={textStyle}>
        {line1Display}
        {showCursor && cursorOnLine1 && (
          <motion.span
            animate={{ opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[var(--accent)]/90"
            style={{
              textShadow: '0 0 8px rgba(255,157,35,0.8), 0 0 16px rgba(255,157,35,0.4)'
            }}
          >
            |
          </motion.span>
        )}
      </div>

      {/* Line 2: we chase different. */}
      {charCount > line1Length && (
        <div
          className="text-[var(--accent)]/90 font-semibold"
          style={{
            ...textStyle,
            textShadow: '0 0 16px rgba(255,157,35,0.4), 0 2px 4px rgba(0,0,0,0.4)'
          }}
        >
          {line2Display}
          {showCursor && !cursorOnLine1 && (
            <motion.span
              animate={{ opacity: [0.9, 0.3, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                textShadow: '0 0 8px rgba(255,157,35,0.8), 0 0 16px rgba(255,157,35,0.4)'
              }}
            >
              |
            </motion.span>
          )}
        </div>
      )}
    </motion.div>
  );
}
