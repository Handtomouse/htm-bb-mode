"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

interface AnimatedStatCounterProps {
  value: number;
  suffix?: string;
  label: string;
  duration?: number;
}

export default function AnimatedStatCounter({ value, suffix = "", label, duration = 2 }: AnimatedStatCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration,
        ease: "easeOut",
      });

      return controls.stop;
    }
  }, [isInView, count, value, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-[96px] md:text-[120px] font-black text-[var(--accent)] tabular-nums leading-none">
        {rounded.get()}
        <span className="text-white/70">{suffix}</span>
      </div>
      <div className="text-[24px] md:text-[28px] text-white/80 font-medium uppercase tracking-wide mt-6">
        {label}
      </div>
    </motion.div>
  );
}
