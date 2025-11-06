"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface NowBlockProps {
  lastUpdated: string;
  currentFocus: string;
  status: string;
}

export default function NowBlock({ lastUpdated, currentFocus, status }: NowBlockProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-zinc-900/70 backdrop-blur-sm border-4 border-[#FF9D23]/30 rounded-lg p-16 md:p-20 space-y-10"
    >
      <div className="flex items-center gap-6 mb-8">
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[56px] md:text-[64px]"
        >
          📍
        </motion.span>
        <h3 className="text-[48px] md:text-[64px] font-black text-[#FF9D23] uppercase leading-tight">Now</h3>
      </div>

      <div className="space-y-8 text-[28px] md:text-[36px] font-medium text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-3">
          <span className="text-white/70">Status:</span>
          <span className="font-bold text-[#FF9D23]">{status}</span>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-3">
          <span className="text-white/70">Focus:</span>
          <span className="text-right md:max-w-[60%] leading-tight" style={{ lineHeight: "1.4" }}>{currentFocus}</span>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-3 pt-6 border-t-2 border-white/10">
          <span className="text-white/60 text-[20px] md:text-[24px]">Last updated:</span>
          <span className="text-white/60 text-[20px] md:text-[24px]">{lastUpdated}</span>
        </div>
      </div>
    </motion.div>
  );
}
