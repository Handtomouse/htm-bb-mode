"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/hooks";

/**
 * SettingsProvider - Applies accent color globally
 *
 * Single responsibility: Change site-wide accent color based on user selection
 * All components using var(--accent) will update automatically
 */
export default function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, , isLoaded] = useSettings();

  useEffect(() => {
    console.log("🔧 SettingsProvider useEffect triggered");
    console.log("   isLoaded:", isLoaded);
    console.log("   settings.accentColor:", settings.accentColor);

    if (!isLoaded) {
      console.log("   ⏸️ Waiting for settings to load...");
      return; // Wait for settings to load from localStorage
    }

    console.log("   ✨ Applying accent color:", settings.accentColor);
    applyAccentColor(settings.accentColor);
  }, [settings.accentColor, isLoaded]);

  return <>{children}</>;
}

/**
 * Apply accent color to CSS custom properties
 * Updates --accent and --accent-hover globally
 */
function applyAccentColor(color: string) {
  if (typeof window === "undefined") {
    console.log("   ⚠️ Window undefined, skipping apply");
    return;
  }

  const root = document.documentElement;

  console.log("   🎨 Setting --accent to:", color);
  // Update primary accent color
  root.style.setProperty("--accent", color);

  // Update hover variant (15% lighter)
  const hoverColor = lightenColor(color, 15);
  console.log("   🎨 Setting --accent-hover to:", hoverColor);
  root.style.setProperty("--accent-hover", hoverColor);

  // Verify it was set
  const computedAccent = getComputedStyle(root).getPropertyValue("--accent").trim();
  console.log("   ✅ Verified --accent is now:", computedAccent);
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
