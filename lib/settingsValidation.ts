// Settings validation and migration utilities

import type { Settings } from "./hooks";

export const SETTINGS_VERSION = 1;

export interface SettingsWithVersion extends Settings {
  _version?: number;
  _lastModified?: number;
}

// Default settings
export const DEFAULT_SETTINGS: Settings = {
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
};

// Validate individual setting values
export function validateSettings(settings: Partial<Settings>): Settings {
  return {
    dockMode: ["mono", "bb"].includes(settings.dockMode as string)
      ? (settings.dockMode as "mono" | "bb")
      : DEFAULT_SETTINGS.dockMode,
    sound: typeof settings.sound === "boolean" ? settings.sound : DEFAULT_SETTINGS.sound,
    theme: ["dark", "light", "auto"].includes(settings.theme as string)
      ? (settings.theme as "dark" | "light" | "auto")
      : DEFAULT_SETTINGS.theme,
    accentColor:
      typeof settings.accentColor === "string" && /^#[0-9A-F]{6}$/i.test(settings.accentColor)
        ? settings.accentColor
        : DEFAULT_SETTINGS.accentColor,
    fontSize: ["small", "medium", "large"].includes(settings.fontSize as string)
      ? (settings.fontSize as "small" | "medium" | "large")
      : DEFAULT_SETTINGS.fontSize,
    reducedMotion:
      typeof settings.reducedMotion === "boolean"
        ? settings.reducedMotion
        : DEFAULT_SETTINGS.reducedMotion,
    animationSpeed:
      typeof settings.animationSpeed === "number" &&
      settings.animationSpeed >= 0.5 &&
      settings.animationSpeed <= 2.0
        ? settings.animationSpeed
        : DEFAULT_SETTINGS.animationSpeed,
    highContrast:
      typeof settings.highContrast === "boolean"
        ? settings.highContrast
        : DEFAULT_SETTINGS.highContrast,
    brightness:
      typeof settings.brightness === "number" &&
      settings.brightness >= 20 &&
      settings.brightness <= 100
        ? settings.brightness
        : DEFAULT_SETTINGS.brightness,
    volume:
      typeof settings.volume === "number" &&
      settings.volume >= 0 &&
      settings.volume <= 100
        ? settings.volume
        : DEFAULT_SETTINGS.volume,
    trackingEnabled:
      typeof settings.trackingEnabled === "boolean"
        ? settings.trackingEnabled
        : DEFAULT_SETTINGS.trackingEnabled,
    analyticsEnabled:
      typeof settings.analyticsEnabled === "boolean"
        ? settings.analyticsEnabled
        : DEFAULT_SETTINGS.analyticsEnabled,
  };
}

// Migrate old settings format to new version
export function migrateSettings(raw: any): SettingsWithVersion {
  const version = raw._version || 0;
  let settings = { ...raw };

  // Migration v0 -> v1: No changes yet, just add version
  if (version < 1) {
    // Future migrations go here
  }

  // Validate and return
  const validated = validateSettings(settings);
  return {
    ...validated,
    _version: SETTINGS_VERSION,
    _lastModified: Date.now(),
  };
}

// Load settings from localStorage with validation
export function loadSettings(key: string = "htm-bb-settings"): Settings {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(stored);
    const migrated = migrateSettings(parsed);

    // Save back with version if it was updated
    if (!parsed._version || parsed._version !== SETTINGS_VERSION) {
      localStorage.setItem(key, JSON.stringify(migrated));
    }

    return migrated;
  } catch (error) {
    console.error("Failed to load settings, using defaults:", error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings to localStorage
export function saveSettings(settings: Settings, key: string = "htm-bb-settings"): void {
  try {
    const toSave: SettingsWithVersion = {
      ...settings,
      _version: SETTINGS_VERSION,
      _lastModified: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(toSave));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

// Export settings as downloadable JSON
export function exportSettings(settings: Settings): string {
  const data: SettingsWithVersion = {
    ...settings,
    _version: SETTINGS_VERSION,
    _lastModified: Date.now(),
  };
  return JSON.stringify(data, null, 2);
}

// Import settings from JSON string
export function importSettings(jsonString: string): Settings | null {
  try {
    const parsed = JSON.parse(jsonString);
    const migrated = migrateSettings(parsed);
    return validateSettings(migrated);
  } catch (error) {
    console.error("Failed to import settings:", error);
    return null;
  }
}

// Detect system preferences
export function detectSystemPreferences(): Partial<Settings> {
  const preferences: Partial<Settings> = {};

  // Detect reduced motion preference
  if (typeof window !== "undefined" && window.matchMedia) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) {
      preferences.reducedMotion = true;
      preferences.animationSpeed = 0.5;
    }

    // Detect dark mode preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)");
    if (prefersDark.matches) {
      preferences.theme = "dark";
    } else if (prefersLight.matches) {
      preferences.theme = "light";
    }

    // Detect high contrast preference
    const prefersHighContrast = window.matchMedia("(prefers-contrast: more)");
    if (prefersHighContrast.matches) {
      preferences.highContrast = true;
    }
  }

  return preferences;
}
