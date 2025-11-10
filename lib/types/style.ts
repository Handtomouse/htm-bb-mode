/**
 * Shared TypeScript types for BB-Mode Style System
 *
 * These types enforce style guide compliance at compile-time
 */

// ============================================
// Color System Types
// ============================================

export type AccentColor = "#ff9d23";
export type AccentHoverColor = "#FFB84D";

export type BaseColor =
  | "#0b0b0b"  // --bg
  | "#131313"  // --panel
  | "#EDECEC"  // --ink
  | "#9A9A9A"  // --muted
  | "#2A2A2A"  // --grid
  | "#6b6b6b"; // --icon

export type SemanticColor =
  | "#22c55e"  // success
  | "#ef4444"  // error
  | "#fbbf24"  // warning
  | "#ff9d23"; // info (accent)

export type OpacityValue = 0.03 | 0.05 | 0.08 | 0.10 | 0.15 | 0.20 | 0.30 | 0.50;

export interface ColorWithOpacity {
  color: AccentColor | SemanticColor;
  opacity: OpacityValue;
}

// ============================================
// Spacing System Types
// ============================================

export type SpacingValue =
  | 4    // --space-1
  | 8    // --space-2
  | 12   // --space-3
  | 16   // --space-4
  | 20   // --space-5
  | 24   // --space-6
  | 32   // --space-8
  | 40   // --space-10
  | 48   // --space-12
  | 64   // --space-16
  | 80   // --space-20
  | 96   // --space-24
  | 128; // --space-32

export type TailwindSpacing =
  | "space-y-8" | "space-y-12" | "space-y-16" | "space-y-20" | "space-y-24"
  | "py-8" | "py-12" | "py-16" | "py-20" | "py-24"
  | "px-6" | "px-8" | "px-12" | "px-16" | "px-20" | "px-32"
  | "gap-2" | "gap-3" | "gap-4" | "gap-6" | "gap-8";

// ============================================
// Animation System Types
// ============================================

export type AnimationDuration =
  | 120   // instant
  | 300   // fast
  | 600   // normal
  | 1200  // slow
  | 1800; // dramatic

export type EasingFunction =
  | "ease-out"
  | "ease-in-out"
  | [number, number, number, number]; // cubic-bezier

export interface AnimationConfig {
  duration: AnimationDuration;
  ease: EasingFunction;
  delay?: number;
}

export const EASING_PRESETS = {
  standard: "ease-out" as const,
  luxury: [0.16, 1, 0.3, 1] as const,
  gentle: [0.25, 0.46, 0.45, 0.94] as const,
} as const;

// ============================================
// Typography System Types
// ============================================

export type FontFamily =
  | "var(--font-mono)"     // VT323
  | "var(--font-heading)"  // Pixelify Sans
  | "var(--font-handjet)"; // Handjet

export type LineHeight =
  | 1.2   // tight (headings)
  | 1.6   // normal (body)
  | 1.8;  // relaxed (long-form)

export type LetterSpacing =
  | -0.02  // tight (large headings)
  | 0      // normal
  | 0.08;  // wide (uppercase, emphasis)

export interface TypographyStyle {
  fontSize: string;  // e.g., "text-[24px] md:text-[32px] lg:text-[40px]"
  fontFamily: FontFamily;
  lineHeight?: LineHeight;
  letterSpacing?: LetterSpacing;
}

// ============================================
// Responsive System Types
// ============================================

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export interface ResponsiveValue<T> {
  base: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export type ResponsiveSize = {
  mobile: number | string;
  tablet: number | string;
  desktop: number | string;
};

// ============================================
// Z-Index System Types
// ============================================

export type ZIndexLevel =
  | 0   // base
  | 10  // dropdown
  | 20  // sticky
  | 30  // overlay
  | 40  // modal
  | 50  // toast
  | 60; // tooltip

export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
} as const;

// ============================================
// Component Pattern Types
// ============================================

export interface ButtonProps {
  variant: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface CardProps {
  variant: "elevated" | "accent" | "flat";
  hover?: boolean;
  className?: string;
}

// ============================================
// Utility Types
// ============================================

/**
 * Helper to create rgba colors with proper opacity
 */
export function accentWithOpacity(opacity: OpacityValue): string {
  return `rgba(255, 157, 35, ${opacity})`;
}

/**
 * Helper to create proper responsive class strings
 */
export function responsiveText(mobile: number, tablet: number, desktop: number): string {
  return `text-[${mobile}px] md:text-[${tablet}px] lg:text-[${desktop}px]`;
}

/**
 * Type guard for valid spacing values
 */
export function isValidSpacing(value: number): value is SpacingValue {
  const validSpacing: SpacingValue[] = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];
  return validSpacing.includes(value as SpacingValue);
}

/**
 * Type guard for valid animation durations
 */
export function isValidDuration(value: number): value is AnimationDuration {
  const validDurations: AnimationDuration[] = [120, 300, 600, 1200, 1800];
  return validDurations.includes(value as AnimationDuration);
}
