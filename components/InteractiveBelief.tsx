"use client";

import { motion } from "framer-motion";

interface InteractiveBeliefProps {
  icon: string;
  text: string;
  delay?: number;
}

export default function InteractiveBelief({ icon, text, delay = 0 }: InteractiveBeliefProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{
        backgroundColor: "var(--accent)",
        color: "#000000",
        x: 15,
        transition: { duration: 0 }
      }}
      className="flex items-start gap-6 p-8 -mx-8 rounded cursor-pointer group"
    >
      <motion.span
        whileHover={{ scale: 1.3, rotate: 10 }}
        className="text-[48px] md:text-[56px] text-[var(--accent)] group-hover:text-black flex-shrink-0 transition-colors duration-0"
      >
        {icon}
      </motion.span>
      <p className="text-[32px] md:text-[36px] font-medium text-white group-hover:text-black leading-relaxed transition-colors duration-0" style={{ lineHeight: "2.2" }}>
        {text}
      </p>
    </motion.div>
  );
}
