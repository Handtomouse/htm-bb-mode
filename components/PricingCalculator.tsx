"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function PricingCalculator() {
  const [weeks, setWeeks] = useState(6);
  const [scope, setScope] = useState<"small" | "medium" | "large">("medium");

  const baseRates = {
    small: 2000,
    medium: 3000,
    large: 4500,
  };

  const estimate = weeks * baseRates[scope];

  return (
    <div className="bg-[#0A0A0A] border border-[#E0E0E0]/30 p-6 space-y-6">
      <h4 className="text-[18px] md:text-[22px] font-bold text-[#FF9D23] uppercase">
        Project Estimator
      </h4>

      {/* Weeks Slider */}
      <div>
        <label className="block text-[14px] text-[#E0E0E0]/70 mb-2">
          Project Duration: <span className="text-[#FF9D23] font-bold">{weeks} weeks</span>
        </label>
        <input
          type="range"
          min="2"
          max="12"
          value={weeks}
          onChange={(e) => setWeeks(parseInt(e.target.value))}
          className="w-full h-2 bg-[#E0E0E0]/20 appearance-none cursor-pointer accent-[#FF9D23]"
        />
      </div>

      {/* Scope Selector */}
      <div>
        <label className="block text-[14px] text-[#E0E0E0]/70 mb-2">Scope:</label>
        <div className="grid grid-cols-3 gap-2">
          {(["small", "medium", "large"] as const).map((size) => (
            <button
              key={size}
              onClick={() => setScope(size)}
              className={`py-2 px-4 border transition-all uppercase text-[12px] md:text-[14px] ${
                scope === size
                  ? "border-[#FF9D23] bg-[#FF9D23]/20 text-[#FF9D23]"
                  : "border-[#E0E0E0]/30 text-[#E0E0E0]/70 hover:border-[#E0E0E0]/50"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Estimate Display */}
      <motion.div
        key={estimate}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="border-t border-[#E0E0E0]/20 pt-4"
      >
        <div className="flex justify-between items-baseline">
          <span className="text-[14px] text-[#E0E0E0]/70">Estimated Investment:</span>
          <span className="text-[28px] md:text-[36px] font-bold text-[#FF9D23] tabular-nums">
            ${estimate.toLocaleString()}
          </span>
        </div>
        <p className="text-[12px] text-[#E0E0E0]/50 mt-2">
          *Estimate only. Actual pricing depends on specific requirements.
        </p>
      </motion.div>
    </div>
  );
}
