"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ACCENT = "var(--accent)";

interface LuxuryStatCardProps {
  label: string;
  value: string;
  delay: number;
  index: number;
}

export default function LuxuryStatCard({ label, value, delay, index }: LuxuryStatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasFlippedBefore, setHasFlippedBefore] = useState(false);
  const [showViewed, setShowViewed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);
  const [countedValue, setCountedValue] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Improvement #14: Auto-flip first card as demo
  useEffect(() => {
    if (index === 0 && typeof window !== 'undefined') {
      const timer1 = setTimeout(() => setIsFlipped(true), 2000);
      const timer2 = setTimeout(() => setIsFlipped(false), 5000);
      const timer3 = setTimeout(() => setShowTapHint(true), 500);
      const timer4 = setTimeout(() => setShowTapHint(false), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [index]);

  // Context mapping for each stat
  const contextMap: Record<string, { text: string; comparison?: string; since?: string }> = {
    "Projects": { text: "60+ brands since 2020. S'WICH, MapleMoon, Jac+Jack among them. Hospitality, fashion, tech — never the same approach twice." },
    "Retention": { text: "3 in 4 clients return. Systems that outlast the engagement." },
    "Repeat Clients": { text: "45% return within 18 months. Long-term partnerships over one-off projects." },
    "Years Active": { text: "6 years. 38+ brands. Built for the long game." },
    "Response": { text: "48hr average. Usually within 4hr. Clear communication, efficient delivery." },
    "Industries": { text: "8 sectors. Hospitality to healthcare. Diverse experience, focused execution." }
  };

  const contextData = contextMap[label] || { text: "More context coming soon" };
  const context = contextData.text;

  // Parse number and unit separately for styling
  const parseValue = (val: string) => {
    const numericMatch = val.match(/[\d.]+/);
    if (!numericMatch) return { prefix: '', number: val, suffix: '' };

    const prefix = val.substring(0, numericMatch.index);
    const suffix = val.substring(numericMatch.index! + numericMatch[0].length);
    return { prefix, number: numericMatch[0], suffix };
  };

  const { prefix, number, suffix } = parseValue(value);

  // Count-up animation for numbers
  useEffect(() => {
    const numericValue = parseFloat(number);
    if (isNaN(numericValue) || hasAnimated) return;

    const duration = 2000; // 2 seconds
    const startTime = Date.now() + (delay * 1000); // Delay matches card appearance
    let animationFrame: number;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * numericValue);

      setCountedValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setHasAnimated(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [number, delay, hasAnimated]);

  // Improvement #11: Enhanced flip feedback
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!hasFlippedBefore) {
      setHasFlippedBefore(true);
      setShowViewed(true);
      setTimeout(() => setShowViewed(false), 3000);
    }
  };

  // Improvement #22: Swipe gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      handleFlip();
    }
  };

  // Improvement #23: Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parse first sentence for emphasis
  const parseFirstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/);
    if (match) {
      return {
        firstSentence: match[0],
        rest: text.substring(match[0].length).trim()
      };
    }
    return { firstSentence: text, rest: '' };
  };

  const { firstSentence, rest } = parseFirstSentence(context);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, z: 20 }}
      whileInView={{ opacity: 1, y: 0, z: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "-150px" }}
      transition={{
        delay,
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="relative w-full"
      style={{
        perspective: '1000px',
        aspectRatio: '4 / 3'
      }}
    >
      {/* Improvement #13: "Tap to explore" hint on mobile (first 3s) */}
      {showTapHint && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 md:hidden text-[11px] text-[var(--accent)] uppercase tracking-widest z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
          transition={{ opacity: { duration: 1.5, repeat: Infinity } }}
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        >
          Tap to explore
        </motion.div>
      )}

      {/* Flip Container */}
      <motion.div
        animate={{ rotateY: prefersReducedMotion ? 0 : (isFlipped ? 180 : 0) }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.4,
          ease: [0.16, 1, 0.3, 1],
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          transform: prefersReducedMotion && isFlipped ? 'none' : undefined
        }}
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${label}: ${value}. Click to reveal more information.`}
      >
        {/* Front Side */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--card-padding)',
            backfaceVisibility: 'hidden',
            border: 'var(--card-border)',
            borderRadius: 'var(--card-radius)',
            boxShadow: isHovered
              ? '0 0 14px rgba(255,157,35,0.25), var(--card-shadow)'
              : 'var(--card-shadow)',
            background: isHovered ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.75)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Improvement #12: Corner Fold Hint with fade-in */}
          {isHovered && !isFlipped && (
            <motion.div
              className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'linear-gradient(225deg, rgba(255,157,35,0.3) 0%, transparent 50%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
              }}
            />
          )}

          {/* Number Display with Improvements #1/#8: Optical kerning & Gold foil effect */}
          <div className="relative">
            <div
              className="text-[38px] md:text-[73px] lg:text-[92px] font-extrabold relative"
              style={{
                letterSpacing: '-0.04em',
                background: 'linear-gradient(160deg, #ffd700 0%, var(--accent) 30%, #ffaa35 70%, #ffd700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: isHovered
                  ? 'drop-shadow(0 0 28px rgba(255,157,35,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  : 'drop-shadow(0 0 14px rgba(255,157,35,0.2)) drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                transform: isHovered ? 'scale(1.02) translateZ(5px)' : 'scale(1)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform'
              }}
            >
              {prefix}{hasAnimated ? number : (countedValue > 0 ? countedValue : '')}
              {suffix && (
                <span
                  className="text-[24px] md:text-[49px] lg:text-[59px]"
                  style={{
                    opacity: 0.9,
                    marginLeft: '0.1em',
                    background: 'linear-gradient(160deg, #ffd700 0%, var(--accent) 30%, #ffaa35 70%, #ffd700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {suffix}
                </span>
              )}
            </div>
          </div>

          {/* Label with Improvement #5: Refined tracking for luxury magazine feel */}
          <div
            className="text-[14px] md:text-[22px] lg:text-[26px] uppercase tracking-[0.095em] mt-3 sm:mt-6"
            style={{
              color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)',
              transition: 'color 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              fontWeight: 500
            }}
          >
            {label}
          </div>

          {/* Improvement #17: "Since 2020" time badges */}
          {contextData.since && !isFlipped && (
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                height: 'var(--badge-height)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                fontSize: '10px',
                background: 'rgba(255,157,35,0.15)',
                color: 'rgba(255,157,35,0.8)',
                border: '0.5px solid rgba(255,157,35,0.3)',
                borderRadius: '2px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {contextData.since}
            </div>
          )}

          {/* Viewed Badge */}
          {showViewed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] px-3 py-1.5 rounded uppercase tracking-wider"
              style={{
                background: 'rgba(255,157,35,0.2)',
                color: 'var(--accent)',
                border: '1px solid rgba(255,157,35,0.4)',
                fontWeight: 600
              }}
            >
              VIEWED
            </motion.div>
          )}
        </div>

        {/* Back Side with Improvement #9: Subtle border radius */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--card-padding)',
            backfaceVisibility: 'hidden',
            transform: prefersReducedMotion ? 'scaleX(-1)' : 'rotateY(180deg)',
            border: 'var(--card-border)',
            borderRadius: 'var(--card-radius)',
            boxShadow: 'var(--card-shadow)',
            background: 'radial-gradient(circle at center, rgba(255,157,35,0.10) 0%, rgba(0,0,0,0.85) 100%)'
          }}
        >
          {/* Context Text with Improvements #2/#3: Better line-height & 2-layer shadows */}
          <motion.div
            className="w-full px-2 sm:px-3 md:px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: (isFlipped || (prefersReducedMotion && isFlipped)) ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-[300px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[500px] mx-auto text-center">
              {/* First Sentence - Larger, Bold, Gold Tint, Own Line */}
              <div
                className="text-[17px] sm:text-[20px] md:text-[22px]"
                style={{
                  margin: 'var(--heading-mt) 0 var(--heading-mb) 0',
                  fontWeight: 600,
                  lineHeight: 1.5,
                  letterSpacing: '-0.005em',
                  color: '#ffa940',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.8)',
                  textAlign: 'center'
                }}
              >
                {firstSentence}
              </div>

              {/* Improvement #16: Comparison badge */}
              {contextData.comparison && (
                <motion.div
                  className="inline-block mb-2 px-2 py-1 text-[11px] sm:text-[12px] rounded-sm uppercase tracking-wider"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,157,35,0.2))',
                    color: '#ffd700',
                    border: '1px solid rgba(255,215,0,0.4)',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(255,215,0,0.2)'
                  }}
                >
                  {contextData.comparison}
                </motion.div>
              )}

              {/* Rest - Smaller, Regular, White, Line Below with Improvement #2: Better line-height (1.68) */}
              {rest && (
                <div
                  className="text-[15px] sm:text-[17px] md:text-[19px]"
                  style={{
                    margin: '0 0 var(--body-mb) 0',
                    fontWeight: 400,
                    lineHeight: 1.68,
                    letterSpacing: '0',
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)',
                    textAlign: 'center',
                    wordBreak: 'normal'
                  }}
                >
                  {rest}
                </div>
              )}
            </div>
          </motion.div>

          {/* Flip Back Hint */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Tap to flip back
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
