"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface AboutSectionProps {
  icon?: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function AboutSection({
  icon,
  title,
  children,
  delay = 0,
  className = ""
}: AboutSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`bg-zinc-900/70 backdrop-blur-sm border-2 border-[#E0E0E0]/20 rounded-lg p-16 md:p-24 space-y-12 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
        className="flex items-center gap-6"
      >
        {icon && (
          <motion.span
            whileHover={{ scale: 1.2, rotate: 5 }}
            className="text-[56px] md:text-[64px] flex-shrink-0"
          >
            {icon}
          </motion.span>
        )}
        <h2 className="text-[48px] md:text-[64px] font-extrabold text-white uppercase tracking-wide leading-tight">
          {title}
        </h2>
      </motion.div>

      <div className="space-y-8 text-[28px] md:text-[36px] font-medium text-[#F5F5F5] leading-relaxed" style={{ lineHeight: "2.3" }}>
        {children}
      </div>
    </motion.section>
  );
}
