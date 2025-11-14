"use client";

import { motion } from "framer-motion";

const ACCENT = "var(--accent)";

interface LuxuryBeliefProps {
  icon: string;
  text: string;
  delay: number;
}

export default function LuxuryBelief({ icon, text, delay }: LuxuryBeliefProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 10, borderColor: ACCENT, backgroundColor: 'rgba(255,157,35,0.05)' }}
      className="flex items-start gap-6 border-l-2 border-[var(--accent)]/40 pl-6 py-4 transition-all duration-700"
    >
      <span className="text-[28px] md:text-[32px] flex-shrink-0">{icon}</span>
      <p
        className="text-[16px] md:text-[20px] lg:text-[24px] leading-loose"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.05em'
        }}
      >{text}</p>
    </motion.div>
  );
}
