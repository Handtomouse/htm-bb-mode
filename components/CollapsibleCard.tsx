"use client";

import { useState, useEffect } from "react";

interface CollapsibleCardProps {
  title: string;
  icon?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function CollapsibleCard({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  className = "",
}: CollapsibleCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`border border-[#E0E0E0] bg-transparent transition-all duration-300 ${
        isOpen ? "border-[var(--accent)]" : "hover:border-[#E0E0E0]/70"
      } ${className}`}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Header - Clickable */}
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 group focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls={`panel-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-[20px] text-[var(--accent)]" aria-hidden="true">
              {icon}
            </span>
          )}
          <h3
            className="font-heading text-[16px] md:text-[18px] font-bold text-[#E0E0E0] uppercase tracking-wide group-hover:text-[var(--accent)] transition-colors"
            style={{ fontFamily: "VT323, monospace" }}
          >
            {title}
          </h3>
        </div>

        {/* Chevron Indicator */}
        <span
          className="text-[var(--accent)] text-[20px] font-bold transition-transform duration-300 flex-shrink-0"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            fontFamily: "VT323, monospace",
          }}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {/* Content - Expandable */}
      {mounted && (
        <div
          id={`panel-${title.toLowerCase().replace(/\s+/g, "-")}`}
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
          role="region"
          aria-labelledby={`header-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <div className="px-6 pb-6 pt-2 border-t border-[#E0E0E0]/30">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
