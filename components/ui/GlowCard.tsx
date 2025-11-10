"use client";

import React from "react";
import { motion } from "framer-motion";
import { scrollFade } from "@/lib/utils/animations";

interface GlowCardProps {
  children: React.ReactNode;
  variant?: "elevated" | "accent";
  hover?: boolean;
  className?: string;
}

/**
 * GlowCard - Reusable card with accent glow (About page pattern)
 *
 * @example
 * <GlowCard variant="accent" hover>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </GlowCard>
 */
export function GlowCard({
  children,
  variant = "elevated",
  hover = true,
  className = "",
}: GlowCardProps) {
  const baseStyles = "p-8 md:p-10 transition-all";

  const variantStyles = {
    elevated: "bg-panel border border-grid hover:border-accent/30 duration-300",
    accent:
      "border-2 border-[#ff9d23]/50 bg-gradient-to-br from-[#ff9d23]/10 to-[#ff9d23]/5 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(255,157,35,0.5)] duration-700",
  };

  const hoverStyles = hover ? variantStyles[variant] : "";

  return (
    <motion.div
      {...scrollFade}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
}
