// Settings presets for quick configuration

import type { Settings } from "./hooks";

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  settings: Settings;
}

export const PRESETS: Preset[] = [
  {
    id: "performance",
    name: "Performance",
    description: "Optimized for speed and responsiveness",
    icon: "⚡",
    settings: {
      dockMode: "mono",
      sound: false,
      theme: "dark",
      accentColor: "#ff9d23",
      fontSize: "medium",
      reducedMotion: true,
      animationSpeed: 0.5,
      highContrast: false,
      brightness: 100,
      volume: 0,
      trackingEnabled: false,
      analyticsEnabled: false,
    },
  },
  {
    id: "accessibility",
    name: "Accessibility",
    description: "High contrast, large text, reduced motion",
    icon: "♿",
    settings: {
      dockMode: "mono",
      sound: true,
      theme: "dark",
      accentColor: "#06ffa5", // High contrast green
      fontSize: "large",
      reducedMotion: true,
      animationSpeed: 0.5,
      highContrast: true,
      brightness: 100,
      volume: 100,
      trackingEnabled: false,
      analyticsEnabled: false,
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean and distraction-free",
    icon: "◻️",
    settings: {
      dockMode: "mono",
      sound: false,
      theme: "dark",
      accentColor: "#ffffff",
      fontSize: "medium",
      reducedMotion: true,
      animationSpeed: 1.0,
      highContrast: false,
      brightness: 70,
      volume: 0,
      trackingEnabled: false,
      analyticsEnabled: false,
    },
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Bright colors and fast animations",
    icon: "🎨",
    settings: {
      dockMode: "bb",
      sound: true,
      theme: "dark",
      accentColor: "#ff006e", // Hot pink
      fontSize: "medium",
      reducedMotion: false,
      animationSpeed: 1.5,
      highContrast: false,
      brightness: 100,
      volume: 80,
      trackingEnabled: false,
      analyticsEnabled: true,
    },
  },
  {
    id: "default",
    name: "Default",
    description: "Original factory settings",
    icon: "🏠",
    settings: {
      dockMode: "mono",
      sound: true,
      theme: "dark",
      accentColor: "#ff9d23",
      fontSize: "medium",
      reducedMotion: false,
      animationSpeed: 1.0,
      highContrast: false,
      brightness: 80,
      volume: 70,
      trackingEnabled: false,
      analyticsEnabled: false,
    },
  },
];

// Get preset by ID
export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

// Check if current settings match a preset
export function matchesPreset(settings: Settings, preset: Preset): boolean {
  const keys = Object.keys(preset.settings) as (keyof Settings)[];
  return keys.every((key) => settings[key] === preset.settings[key]);
}

// Find matching preset for current settings
export function findMatchingPreset(settings: Settings): Preset | null {
  return PRESETS.find((preset) => matchesPreset(settings, preset)) || null;
}
