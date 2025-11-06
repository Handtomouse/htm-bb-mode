"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollDepthTracker() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      setScrollPercent(Math.round(latest * 100));
    });
  }, [smoothProgress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed bottom-8 right-8 bg-black/95 border-2 border-[#FF9D23] px-8 py-6 z-50 backdrop-blur-md"
      style={{ fontFamily: "VT323, monospace" }}
    >
      <div className="text-[24px] md:text-[28px] text-white font-medium">
        <span className="text-[#FF9D23] font-black tabular-nums text-[32px] md:text-[36px]">{scrollPercent}%</span> complete
      </div>
    </motion.div>
  );
}
