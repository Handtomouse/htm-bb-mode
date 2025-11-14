"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LuxuryCollapsibleSectionProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function LuxuryCollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  children
}: LuxuryCollapsibleSectionProps) {
  // Lazy load: Only render content after first open
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useEffect(() => {
    if (isOpen && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  }, [isOpen, hasBeenOpened]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-2 border-[#ff9d23]/30 bg-gradient-to-br from-black/40 to-black/20 hover:border-[#ff9d23]/50 transition-all duration-700"
    >
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
          if (e.key === 'Escape' && isOpen) {
            e.preventDefault();
            onToggle();
          }
        }}
        className="w-full flex items-center justify-between p-8 md:p-10 text-left hover:bg-[#ff9d23]/10 focus:outline-none focus:ring-2 focus:ring-[#ff9d23] focus:ring-offset-2 focus:ring-offset-black transition-all duration-700"
        aria-expanded={isOpen}
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${title} section`}
      >
        <div className="flex items-center gap-6">
          <span className="text-[28px] md:text-[32px]" aria-hidden="true">{icon}</span>
          <h3 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold text-white uppercase tracking-[0.08em]">{title}</h3>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[24px] md:text-[28px] text-[#ff9d23]"
          aria-hidden="true"
        >
          ▶
        </motion.span>
      </button>
      {isOpen && hasBeenOpened && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="border-t border-[#ff9d23]/30 p-8 md:p-10"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
