"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/hooks";

/**
 * SettingsProvider - Applies user settings to the DOM/CSS
 *
 * Makes settings actually work by:
 * 1. Accent Color - Updates CSS custom property --accent
 * 2. Reduced Motion - Adds data attribute for CSS to disable animations
 * 3. Brightness - Updates CSS custom property for filter
 * 4. Font Size - Updates CSS custom property for base font size
 * 5. Settings persist via useSettings hook (localStorage)
 */
export default function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, , isLoaded] = useSettings();

  useEffect(() => {
    if (!isLoaded) return; // Wait for settings to load from localStorage

    applySettings(settings);
  }, [settings, isLoaded]);

  return <>{children}</>;
}

/**
 * Apply settings to DOM and CSS custom properties
 */
function applySettings(settings: ReturnType<typeof useSettings>[0]) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const body = document.body;

  // ============================================
  // Win 1: Accent Color
  // ============================================
  // Updates --accent CSS variable globally
  // All components using var(--accent) will update automatically
  root.style.setProperty("--accent", settings.accentColor);

  // Also update hover variant
  const hoverColor = lightenColor(settings.accentColor, 15);
  root.style.setProperty("--accent-hover", hoverColor);

  // ============================================
  // Win 2: Reduced Motion
  // ============================================
  // Adds data attribute for CSS to target
  // CSS will disable animations via [data-reduced-motion="true"]
  body.dataset.reducedMotion = settings.reducedMotion.toString();

  // ============================================
  // Win 4: Brightness
  // ============================================
  // Sets brightness filter on content
  // Applied to .scrollable-content in CSS
  root.style.setProperty("--brightness", `${settings.brightness / 100}`);

  // ============================================
  // Win 5: Font Size
  // ============================================
  // Updates base font size for entire site
  // Uses rem units for proportional scaling
  const fontSizeMap = {
    small: "14px",
    medium: "16px",
    large: "18px",
  };
  root.style.setProperty("--font-size-base", fontSizeMap[settings.fontSize]);
  body.dataset.fontSize = settings.fontSize;

  // ============================================
  // Bonus: High Contrast (if enabled)
  // ============================================
  // Increases text contrast for accessibility
  body.dataset.highContrast = settings.highContrast.toString();
  if (settings.highContrast) {
    root.style.setProperty("--ink", "#FFFFFF"); // Pure white text
    root.style.setProperty("--muted", "#B0B0B0"); // Brighter muted
  } else {
    root.style.setProperty("--ink", "#EDECEC"); // Default
    root.style.setProperty("--muted", "#9A9A9A"); // Default
  }

  // ============================================
  // Bonus: Theme support (dark/light/auto)
  // ============================================
  applyTheme(settings.theme);
}

/**
 * Apply theme (dark/light/auto)
 */
function applyTheme(theme: "dark" | "light" | "auto") {
  if (typeof window === "undefined") return;

  let effectiveTheme = theme;

  // Auto mode: detect system preference
  if (theme === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    effectiveTheme = prefersDark ? "dark" : "light";
  }

  const root = document.documentElement;

  if (effectiveTheme === "light") {
    // Light theme
    root.style.setProperty("--bg", "#FAFAFA");
    root.style.setProperty("--panel", "#FFFFFF");
    root.style.setProperty("--ink", "#0b0b0b");
    root.style.setProperty("--muted", "#6b6b6b");
    root.style.setProperty("--grid", "#E5E5E5");
    document.body.dataset.theme = "light";
  } else {
    // Dark theme (default)
    root.style.setProperty("--bg", "#0b0b0b");
    root.style.setProperty("--panel", "#131313");
    root.style.setProperty("--ink", "#EDECEC");
    root.style.setProperty("--muted", "#9A9A9A");
    root.style.setProperty("--grid", "#2A2A2A");
    document.body.dataset.theme = "dark";
  }
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Lighten
  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
