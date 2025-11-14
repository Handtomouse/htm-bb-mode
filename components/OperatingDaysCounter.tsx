"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function OperatingDaysCounter() {
  const [days, setDays] = useState(0);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const startDate = new Date("2020-03-01");
    const today = new Date();
    const diff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    setDays(diff);

    const controls = animate(count, diff, {
      duration: 2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count]);

  return (
    <div className="text-center">
      <motion.div className="text-[32px] md:text-[40px] font-bold text-[var(--accent)] tabular-nums">
        {rounded.get().toLocaleString()}
      </motion.div>
      <div className="text-[12px] md:text-[14px] text-[#E0E0E0]/60 uppercase tracking-wide">
        Days Operating
      </div>
    </div>
  );
}
