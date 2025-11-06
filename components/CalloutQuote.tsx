"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface CalloutQuoteProps {
  children: React.ReactNode;
  rotate?: number;
  delay?: number;
}

export default function CalloutQuote({ children, rotate = 0, delay = 0 }: CalloutQuoteProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, rotate: 0 }}
      animate={isInView ? { opacity: 1, scale: 1, rotate } : { opacity: 0, scale: 0.95, rotate: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02, rotate: rotate + 1 }}
      className="bg-[#FF9D23]/10 border-4 border-[#FF9D23] p-12 md:p-20 my-16"
    >
      <blockquote className="text-[56px] md:text-[72px] font-black text-[#FF9D23] uppercase leading-tight text-center">
        {children}
      </blockquote>
    </motion.div>
  );
}
