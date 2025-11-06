"use client";

import { motion } from "framer-motion";

interface AvailabilityCounterProps {
  slots: number;
  total?: number;
}

export default function AvailabilityCounter({ slots, total = 5 }: AvailabilityCounterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            className={`w-3 h-8 ${
              i < slots ? "bg-[#FF9D23]" : "bg-[#E0E0E0]/20"
            } transition-colors duration-300`}
          />
        ))}
      </div>
      <span className="text-[14px] md:text-[16px] text-[#E0E0E0]/70">
        {slots}/{total} slots available
      </span>
    </div>
  );
}
