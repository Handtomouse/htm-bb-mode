"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  showTooltip?: boolean;
}

export default function EnhancedSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  disabled = false,
  formatValue,
  showTooltip = true,
}: EnhancedSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const sliderRef = useRef<HTMLInputElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  const percentage = ((value - min) / (max - min)) * 100;
  const sliderId = `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Update tooltip position when dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setTooltipPosition((x / rect.width) * 100);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", () => setIsDragging(false));
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", () => setIsDragging(false));
      };
    }
  }, [isDragging]);

  return (
    <div className={`transition-opacity duration-300 ${disabled ? "opacity-50" : "opacity-100"}`}>
      {/* Label and Value */}
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={sliderId} className="text-xs text-white/70 uppercase tracking-wider">
          {label}
        </label>
        <span
          id={`${sliderId}-value`}
          className="text-[var(--accent)] text-xs tabular-nums"
          aria-live="polite"
        >
          {displayValue}
        </span>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Track with gradient fill */}
        <div className="relative h-1 bg-white/10" role="presentation">
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--accent)]/50 to-[var(--accent)] ${
              prefersReducedMotion ? "" : "transition-all duration-150"
            }`}
            style={{ width: `${percentage}%` }}
            role="presentation"
          />
        </div>

        {/* Slider Input */}
        <input
          id={sliderId}
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          disabled={disabled}
          aria-label={`${label}: ${displayValue}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={displayValue}
          aria-describedby={`${sliderId}-value`}
          className={`absolute top-0 left-0 w-full h-1 appearance-none cursor-pointer bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-[var(--accent)]
            [&::-webkit-slider-thumb]:border
            [&::-webkit-slider-thumb]:border-white/20
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,157,35,0.6)]
            ${prefersReducedMotion ? "" : "[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150"}
            hover:[&::-webkit-slider-thumb]:scale-110
            active:[&::-webkit-slider-thumb]:scale-125
            disabled:opacity-50
            disabled:cursor-not-allowed
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[var(--accent)]
            focus-visible:ring-offset-2
            focus-visible:ring-offset-black`}
        />

        {/* Tooltip on drag */}
        {showTooltip && (
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -top-8 px-2 py-1 bg-[var(--accent)] text-black text-xs font-medium whitespace-nowrap pointer-events-none"
                style={{
                  left: `${tooltipPosition}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {displayValue}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
