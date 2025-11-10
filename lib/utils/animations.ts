/**
 * Animation Utility Functions
 *
 * Reusable animation configurations following the BB-Mode style guide
 */

import type { AnimationConfig } from "../types/style";

// ============================================
// Framer Motion Variant Presets
// ============================================

/**
 * Fade in from bottom (most common pattern)
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

/**
 * Fade in (no movement)
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, ease: "easeOut" },
};

/**
 * Scroll-driven fade (About page pattern)
 */
export const scrollFade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
};

/**
 * Hover lift (cards, buttons)
 */
export const hoverLift = {
  whileHover: { y: -8, scale: 1.02 },
  transition: { duration: 0.3 },
};

/**
 * Accent button hover (with glow)
 */
export const accentButtonHover = {
  whileHover: {
    boxShadow: "0 0 40px rgba(255, 157, 35, 0.8)",
    scale: 1.05,
  },
  transition: { duration: 0.3 },
};

/**
 * Scale in (modals, popovers)
 */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/**
 * Slide in from right (side panels)
 */
export const slideInRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

/**
 * Stagger children (lists, grids)
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Create a custom animation config with style guide compliance
 */
export function createAnimation(config: Partial<AnimationConfig>) {
  return {
    duration: config.duration || 600,
    ease: config.ease || "easeOut",
    delay: config.delay || 0,
  };
}

/**
 * Create a scroll-driven animation with custom settings
 */
export function createScrollAnimation(
  offset: [string, string] = ["start end", "end start"],
  duration = 1200
) {
  return {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: duration / 1000, ease: [0.16, 1, 0.3, 1] },
  };
}

/**
 * Create responsive fade zones for scroll animations
 */
export function createFadeZones(isMobile: boolean) {
  return {
    fadeInZonePercent: isMobile ? 0.10 : 0.15,
    fadeOutZonePercent: isMobile ? 0.20 : 0.30,
  };
}

/**
 * Generate accent glow shadow (for hover states)
 */
export function accentGlow(intensity: "subtle" | "medium" | "intense" = "medium") {
  const glowMap = {
    subtle: "0 0 20px rgba(255, 157, 35, 0.3)",
    medium: "0 0 40px rgba(255, 157, 35, 0.5)",
    intense: "0 0 60px rgba(255, 157, 35, 0.8)",
  };
  return glowMap[intensity];
}

/**
 * Generate text shadow with accent glow
 */
export function accentTextGlow(intensity: "subtle" | "medium" | "intense" = "medium") {
  const glowMap = {
    subtle: "0 0 30px rgba(255, 157, 35, 0.3)",
    medium: "0 0 40px rgba(255, 157, 35, 0.5)",
    intense: "0 0 60px rgba(255, 157, 35, 0.6), 0 0 100px rgba(255, 157, 35, 0.3)",
  };
  return glowMap[intensity];
}

// ============================================
// Keyframe Animations (for CSS)
// ============================================

/**
 * Generate @keyframes for custom CSS animations
 */
export const keyframes = {
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideInUp: `
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  glow: `
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(255, 157, 35, 0.3);
      }
      50% {
        box-shadow: 0 0 40px rgba(255, 157, 35, 0.6);
      }
    }
  `,
};
