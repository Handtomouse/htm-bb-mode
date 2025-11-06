/**
 * Shared theme constants for consistent styling across all Blackberry components
 */

export const ACCENT = "#FF9D23";
export const ACCENT_HOVER = "#FFB84D";
export const ACCENT_DARK = "#F4A259";

export const SPACING = {
  xs: "0.5rem",    // 8px
  sm: "0.75rem",   // 12px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
  "3xl": "4rem",   // 64px
  "4xl": "6rem",   // 96px
  "5xl": "8rem",   // 128px
} as const;

export const BORDER_RADIUS = {
  none: "0",
  sm: "0.125rem",
  md: "0.25rem",
  lg: "0.5rem",
  full: "9999px",
} as const;

export const TRANSITIONS = {
  fast: "150ms",
  normal: "250ms",
  slow: "350ms",
} as const;

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  overlay: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
} as const;
