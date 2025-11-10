"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AccentButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

/**
 * AccentButton - Reusable button following BB-Mode style guide
 *
 * @example
 * <AccentButton variant="primary" onClick={handleClick}>
 *   Get Started
 * </AccentButton>
 */
export function AccentButton({
  variant = "primary",
  children,
  className = "",
  ...props
}: AccentButtonProps) {
  const baseStyles = "font-medium px-8 py-4 text-lg transition-all duration-300";

  const variantStyles = {
    primary: "bg-[#ff9d23] hover:bg-[#FFB84D] text-black hover:shadow-[0_0_40px_rgba(255,157,35,0.8)]",
    secondary: "border-2 border-[#ff9d23] hover:border-[#FFB84D] text-white hover:bg-[#ff9d23]/10",
  };

  return (
    <motion.button
      whileHover={{
        boxShadow: "0 0 40px rgba(255, 157, 35, 0.8)",
        scale: 1.05,
      }}
      transition={{ duration: 0.3 }}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
