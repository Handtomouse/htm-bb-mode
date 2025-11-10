"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface FadeSectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FadeSection - Scroll-driven fade in/out wrapper (About page pattern)
 *
 * Fades content in as it enters viewport, holds opacity while centered,
 * and fades out as it exits the top.
 *
 * @example
 * <FadeSection>
 *   <section className="min-h-screen py-[10vh]">
 *     Content here
 *   </section>
 * </FadeSection>
 */
export function FadeSection({ children, className = "" }: FadeSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"], // Track from entering to leaving viewport
  });

  // Fade in when approaching center, fade out only in top 25%
  // 0 = section entering viewport bottom
  // 0.5 = section centered in viewport
  // 0.75 = section scrolled past center, approaching top quarter
  // 0.9 = section in top 25%, fade out complete
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.75, 0.9], // Scroll positions
    [0, 1, 1, 0] // Opacity: fade in -> hold through center -> fade out late
  );

  return (
    <motion.div ref={ref} style={{ opacity }} className={className}>
      {children}
    </motion.div>
  );
}
