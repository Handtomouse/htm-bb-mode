"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring } from "framer-motion";

interface LuxuryStatCardProps {
  label: string;
  value: string;
  delay: number;
  index: number;
  // New props — GROUP 1
  benchmark?: string;
  trend?: number[];
  priority?: boolean;
  story?: string;
  shareText?: string;
  // Section-level feature props
  isSpotlit?: boolean;
}

export default function LuxuryStatCard({
  label,
  value,
  delay,
  index,
  benchmark,
  trend,
  priority,
  story,
  shareText,
  isSpotlit,
}: LuxuryStatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasFlippedBefore, setHasFlippedBefore] = useState(false);
  const [showViewed, setShowViewed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);
  const [countedValue, setCountedValue] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // GROUP 2 new state
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // GROUP 4 — #22 particle burst
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; vx: number; vy: number }[]
  >([]);

  // GROUP 4 — #39 drag-to-compare
  const [compareMode, setCompareMode] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // #21 — Sparkline animation ref
  const sparklineRef = useRef<SVGPolylineElement>(null);
  const sparklineLength = useRef<number>(0);

  // Improvement #14: Auto-flip first card as demo
  useEffect(() => {
    if (index === 0 && typeof window !== "undefined") {
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
  const contextMap: Record<
    string,
    { text: string; comparison?: string; since?: string }
  > = {
    Projects: {
      text: "60+ brands since 2020. S'WICH, MapleMoon, Jac+Jack among them. Hospitality, fashion, tech — never the same approach twice.",
    },
    Retention: {
      text: "3 in 4 clients return. Systems that outlast the engagement.",
    },
    "Repeat Clients": {
      text: "45% return within 18 months. Long-term partnerships over one-off projects.",
    },
    "Years Active": {
      text: "6 years. 38+ brands. Built for the long game.",
    },
    Response: {
      text: "48hr average. Usually within 4hr. Clear communication, efficient delivery.",
    },
    Industries: {
      text: "8 sectors. Hospitality to healthcare. Diverse experience, focused execution.",
    },
  };

  const contextData = contextMap[label] || { text: "More context coming soon" };
  const context = contextData.text;

  // Parse number and unit separately for styling
  const parseValue = (val: string) => {
    const numericMatch = val.match(/[\d.]+/);
    if (!numericMatch) return { prefix: "", number: val, suffix: "" };
    const prefix = val.substring(0, numericMatch.index);
    const suffix = val.substring(numericMatch.index! + numericMatch[0].length);
    return { prefix, number: numericMatch[0], suffix };
  };

  const { prefix, number, suffix } = parseValue(value);

  // Count-up animation for numbers
  useEffect(() => {
    const numericValue = parseFloat(number);
    if (isNaN(numericValue) || hasAnimated) return;

    const duration = 2000;
    const startTime = Date.now() + delay * 1000;
    let animationFrame: number;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
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

  // GROUP 4 — #22: Particle burst when hasAnimated transitions to true
  useEffect(() => {
    if (!hasAnimated) return;
    const newParticles = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return {
        id: Date.now() + i,
        x: 50,
        y: 50,
        vx: Math.cos(angle),
        vy: Math.sin(angle),
      };
    });
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 650);
    return () => clearTimeout(timer);
  }, [hasAnimated]);

  // GROUP 2 — #28: Sparkline draw animation
  useEffect(() => {
    if (!sparklineRef.current || !trend) return;
    const el = sparklineRef.current;
    const len = el.getTotalLength ? el.getTotalLength() : 200;
    sparklineLength.current = len;
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    // Trigger animation after mount
    const raf = requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 800ms ease-out";
      el.style.strokeDashoffset = "0";
    });
    return () => cancelAnimationFrame(raf);
  }, [trend]);

  // Improvement #11: Enhanced flip feedback
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!hasFlippedBefore) {
      setHasFlippedBefore(true);
      setShowViewed(true);
      setTimeout(() => setShowViewed(false), 3000);
    }
  };

  // Swipe gesture support
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

  // GROUP 2 — #40: Share / copy interaction
  const handleNumberClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = shareText || `${label}: ${value}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Prefers reduced motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Parse first sentence for emphasis
  const parseFirstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/);
    if (match) {
      return {
        firstSentence: match[0],
        rest: text.substring(match[0].length).trim(),
      };
    }
    return { firstSentence: text, rest: "" };
  };

  const { firstSentence, rest } = parseFirstSentence(context);

  // GROUP 4 — #21: Odometer digit display
  // Extract digits + suffix from the displayed count value
  const displayNumber = hasAnimated ? number : countedValue > 0 ? String(countedValue) : "";
  const digits = displayNumber.split("");

  // GROUP 2 — #28: Sparkline SVG path computation
  const buildSparklinePoints = (trendData: number[]): string => {
    const w = 100;
    const h = 24;
    const minVal = Math.min(...trendData);
    const maxVal = Math.max(...trendData);
    const range = maxVal - minVal || 1;
    return trendData
      .map((v, i) => {
        const x = (i / (trendData.length - 1)) * w;
        const y = h - ((v - minVal) / range) * (h - 4) - 2;
        return `${x},${y}`;
      })
      .join(" ");
  };

  // GROUP 4 — #39: Card body click → toggle compare mode
  const handleCardBodyClick = (e: React.MouseEvent) => {
    // Only toggle compare on direct card background click, not number
    const target = e.target as HTMLElement;
    if (target.closest("[data-number-el]")) return;
    if (isFlipped) return; // only on front face
    setCompareMode((prev) => !prev);
  };

  // Determine display value for odometer
  const numericForOdometer = hasAnimated ? number : countedValue > 0 ? String(countedValue) : "0";

  // #33 — Priority card styling extras
  const priorityStyle = priority
    ? {
        transform: "scale(1.05)",
        borderColor: "rgba(247, 168, 53, 0.3)",
        boxShadow: "0 0 24px rgba(247, 168, 53, 0.15)",
      }
    : {};

  // #35 spotlight effect
  const spotlitStyle =
    isSpotlit && !isHovered
      ? {
          boxShadow:
            "0 0 40px rgba(247, 168, 53,0.35), 0 0 80px rgba(247, 168, 53,0.1)",
        }
      : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, z: 20 }}
      whileInView={{ opacity: 1, y: 0, z: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "-150px" }}
      transition={{
        delay,
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      // #35 spotlight pulse
      animate={
        isSpotlit
          ? { scale: [1, 1.03, 1], transition: { duration: 0.4 } }
          : undefined
      }
      className="relative w-full"
      style={{
        perspective: "1000px",
        aspectRatio: "4 / 3",
        ...priorityStyle,
      }}
    >
      {/* Improvement #13: "Tap to explore" hint on mobile (first 3s) */}
      {showTapHint && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 md:hidden text-[11px] text-[var(--accent)] uppercase tracking-widest z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
          transition={{ opacity: { duration: 1.5, repeat: Infinity } }}
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
        >
          Tap to explore
        </motion.div>
      )}

      {/* GROUP 4 — #22: Particle burst */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: p.vx * 60, y: p.vy * 60, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "#F7A835",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      ))}

      {/* Flip Container */}
      <motion.div
        animate={{ rotateY: prefersReducedMotion ? 0 : isFlipped ? 180 : 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.4,
          ease: [0.16, 1, 0.3, 1],
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        style={{
          transformStyle: "preserve-3d",
          position: "relative",
          width: "100%",
          height: "100%",
          cursor: "pointer",
          transform: prefersReducedMotion && isFlipped ? "none" : undefined,
        }}
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
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
          onClick={handleCardBodyClick}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "var(--card-padding)",
            backfaceVisibility: "hidden",
            border: "var(--card-border)",
            borderRadius: "var(--card-radius)",
            boxShadow: isHovered
              ? `0 0 14px rgba(247, 168, 53,0.25), var(--card-shadow)`
              : `var(--card-shadow)`,
            background: isHovered
              ? "rgba(0,0,0,0.85)"
              : "rgba(0,0,0,0.75)",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            ...spotlitStyle,
          }}
        >
          {/* Improvement #12: Corner Fold Hint */}
          {isHovered && !isFlipped && (
            <motion.div
              className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                background:
                  "linear-gradient(225deg, rgba(247, 168, 53,0.3) 0%, transparent 50%)",
                clipPath: "polygon(100% 0, 100% 100%, 0 0)",
              }}
            />
          )}

          {/* GROUP 2 — #32: Tooltip above number (story) */}
          <div className="relative w-full flex flex-col items-center">
            {tooltipVisible && story && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 right-0 mb-2 z-50"
                style={{
                  background: "#131313",
                  border: "1px solid #F7A835",
                  borderLeft: "3px solid #F7A835",
                  padding: "8px 12px",
                  fontSize: "11px",
                  fontFamily: "Roboto Mono, monospace",
                  color: "#EDECEC",
                  lineHeight: 1.5,
                }}
              >
                {story}
              </motion.div>
            )}

            {/* GROUP 4 — #21: Odometer digit flip + GROUP 2 #40: Share interaction */}
            <motion.div
              data-number-el="true"
              className="text-[38px] md:text-[73px] lg:text-[92px] font-extrabold relative flex items-baseline gap-0 cursor-pointer select-none"
              style={{
                letterSpacing: "-0.04em",
                filter: isHovered
                  ? "drop-shadow(0 0 28px rgba(247, 168, 53,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                  : "drop-shadow(0 0 14px rgba(247, 168, 53,0.2)) drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                willChange: "transform",
              }}
              animate={{
                scale: copied ? [1, 1.15, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              onClick={handleNumberClick}
            >
              {/* COPIED toast */}
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    top: "-28px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "10px",
                    fontFamily: "Roboto Mono, monospace",
                    color: "#F7A835",
                    background: "#131313",
                    border: "1px solid #F7A835",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.1em",
                    zIndex: 60,
                  }}
                >
                  COPIED
                </motion.div>
              )}

              {/* Prefix (e.g. "$") */}
              {prefix && (
                <span
                  style={{
                    background:
                      "linear-gradient(160deg, #ffd700 0%, var(--accent) 30%, #ffaa35 70%, #ffd700 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: copied ? "#FFFFFF" : "transparent",
                    backgroundClip: "text",
                    transition: "all 0.3s",
                  }}
                >
                  {prefix}
                </span>
              )}

              {/* GROUP 4 — #21: Per-digit slot animation */}
              {numericForOdometer.split("").map((digit, di) => (
                <div
                  key={`${di}-${digit}`}
                  style={{
                    overflow: "hidden",
                    height: "1.1em",
                    display: "inline-block",
                  }}
                >
                  <motion.span
                    initial={{ y: "-100%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: Math.max(0.25, 0.4 - di * 0.04),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      display: "inline-block",
                      background: copied
                        ? "none"
                        : "linear-gradient(160deg, #ffd700 0%, var(--accent) 30%, #ffaa35 70%, #ffd700 100%)",
                      WebkitBackgroundClip: copied ? undefined : "text",
                      WebkitTextFillColor: copied ? "#FFFFFF" : "transparent",
                      backgroundClip: copied ? undefined : "text",
                      color: copied ? "#FFFFFF" : undefined,
                      transition: "all 0.3s",
                    }}
                  >
                    {digit}
                  </motion.span>
                </div>
              ))}

              {/* Suffix */}
              {suffix && (
                <span
                  className="text-[24px] md:text-[49px] lg:text-[59px]"
                  style={{
                    opacity: 0.9,
                    marginLeft: "0.1em",
                    background: copied
                      ? "none"
                      : "linear-gradient(160deg, #ffd700 0%, var(--accent) 30%, #ffaa35 70%, #ffd700 100%)",
                    WebkitBackgroundClip: copied ? undefined : "text",
                    WebkitTextFillColor: copied ? "#FFFFFF" : "transparent",
                    backgroundClip: copied ? undefined : "text",
                    color: copied ? "#FFFFFF" : undefined,
                    transition: "all 0.3s",
                  }}
                >
                  {suffix}
                </span>
              )}
            </motion.div>

            {/* GROUP 2 — #28: Mini sparkline */}
            {trend && trend.length > 1 && (
              <div style={{ width: "100%", marginTop: "8px" }}>
                <svg
                  width="100%"
                  height="24"
                  viewBox="0 0 100 24"
                  preserveAspectRatio="none"
                  style={{ overflow: "visible" }}
                >
                  <polyline
                    ref={sparklineRef}
                    points={buildSparklinePoints(trend)}
                    stroke="#F7A835"
                    strokeOpacity="0.5"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* GROUP 2 — #29: Comparison badge */}
            {benchmark && (
              <span
                style={{
                  marginTop: "6px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  color: "#94b039",
                  border: "1px solid rgba(148,176,57,0.3)",
                  padding: "2px 8px",
                  display: "inline-block",
                }}
              >
                ↑ {benchmark}
              </span>
            )}
          </div>

          {/* Label */}
          <div
            className="text-[14px] md:text-[22px] lg:text-[26px] uppercase tracking-[0.095em] mt-3 sm:mt-6"
            style={{
              color: isHovered
                ? "rgba(255,255,255,0.6)"
                : "rgba(255,255,255,0.5)",
              transition: "color 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              fontWeight: 500,
            }}
          >
            {label}
          </div>

          {/* "Since" badge */}
          {contextData.since && !isFlipped && (
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                height: "var(--badge-height)",
                display: "flex",
                alignItems: "center",
                padding: "0 8px",
                fontSize: "10px",
                background: "rgba(247, 168, 53,0.15)",
                color: "rgba(247, 168, 53,0.8)",
                border: "0.5px solid rgba(247, 168, 53,0.3)",
                borderRadius: "2px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
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
                background: "rgba(247, 168, 53,0.2)",
                color: "var(--accent)",
                border: "1px solid rgba(247, 168, 53,0.4)",
                fontWeight: 600,
              }}
            >
              VIEWED
            </motion.div>
          )}

          {/* GROUP 4 — #39: Drag-to-compare slider */}
          {compareMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "rgba(0,0,0,0.92)",
                borderTop: "1px solid rgba(247, 168, 53,0.3)",
                padding: "10px 12px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "10px",
                  fontFamily: "Roboto Mono, monospace",
                  color: "#9A9A9A",
                  letterSpacing: "0.08em",
                }}
              >
                <span style={{ color: "#F7A835", fontWeight: 700 }}>
                  YOU: {value}
                </span>
                <div
                  ref={sliderRef}
                  style={{
                    flex: 1,
                    height: "20px",
                    background: "rgba(247, 168, 53,0.1)",
                    border: "1px solid rgba(247, 168, 53,0.25)",
                    borderRadius: "2px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    drag="x"
                    dragConstraints={sliderRef}
                    dragElastic={0}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%,-50%)",
                      width: "12px",
                      height: "12px",
                      background: "#F7A835",
                      borderRadius: "2px",
                      cursor: "grab",
                      zIndex: 2,
                    }}
                    whileDrag={{ cursor: "grabbing" }}
                  />
                </div>
                <span>AVG: {benchmark ?? "N/A"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompareMode(false);
                  }}
                  style={{
                    color: "#9A9A9A",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    lineHeight: 1,
                    padding: "0 2px",
                  }}
                  aria-label="Close compare"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Back Side */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "var(--card-padding)",
            backfaceVisibility: "hidden",
            transform: prefersReducedMotion ? "scaleX(-1)" : "rotateY(180deg)",
            border: "var(--card-border)",
            borderRadius: "var(--card-radius)",
            boxShadow: "var(--card-shadow)",
            background:
              "radial-gradient(circle at center, rgba(247, 168, 53,0.10) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        >
          <motion.div
            className="w-full px-2 sm:px-3 md:px-4"
            initial={{ opacity: 0 }}
            animate={{
              opacity:
                isFlipped || (prefersReducedMotion && isFlipped) ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-[300px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[500px] mx-auto text-center">
              <div
                className="text-[17px] sm:text-[20px] md:text-[22px]"
                style={{
                  margin: "var(--heading-mt) 0 var(--heading-mb) 0",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  letterSpacing: "-0.005em",
                  color: "#ffa940",
                  textShadow:
                    "0 1px 2px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.8)",
                  textAlign: "center",
                }}
              >
                {firstSentence}
              </div>

              {contextData.comparison && (
                <motion.div
                  className="inline-block mb-2 px-2 py-1 text-[11px] sm:text-[12px] rounded-sm uppercase tracking-wider"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(247, 168, 53,0.2))",
                    color: "#ffd700",
                    border: "1px solid rgba(255,215,0,0.4)",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(255,215,0,0.2)",
                  }}
                >
                  {contextData.comparison}
                </motion.div>
              )}

              {rest && (
                <div
                  className="text-[15px] sm:text-[17px] md:text-[19px]"
                  style={{
                    margin: "0 0 var(--body-mb) 0",
                    fontWeight: 300,
                    lineHeight: 1.68,
                    letterSpacing: "0.02em",
                    color: "rgba(255,255,255,0.9)",
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)",
                    textAlign: "center",
                    wordBreak: "normal",
                  }}
                >
                  {rest}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              bottom: 16,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: "11px",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
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
