"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function LiveSydneyTime() {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const sydneyTime = new Date().toLocaleTimeString("en-AU", {
        timeZone: "Australia/Sydney",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(sydneyTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <span className="text-[#E0E0E0]/40">--:--:--</span>;

  return (
    <motion.span
      key={time}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-mono text-[#FF9D23] tabular-nums"
    >
      {time} AET
    </motion.span>
  );
}
