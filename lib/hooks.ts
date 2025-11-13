"use client";

import { useEffect, useRef, useState } from "react";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "./settingsValidation";

// Settings hook with localStorage persistence
export interface Settings {
  dockMode: "mono" | "bb";
  sound: boolean;
  theme: "dark" | "light" | "auto";
  accentColor: string;
  fontSize: "small" | "medium" | "large";
  reducedMotion: boolean;
  animationSpeed: number; // 0.5 to 2.0
  highContrast: boolean;
  brightness: number; // 0 to 100
  volume: number; // 0 to 100
  trackingEnabled: boolean;
  analyticsEnabled: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount with validation
  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change (with validation)
  useEffect(() => {
    if (!isLoaded) return; // Don't save initial state
    saveSettings(settings);
  }, [settings, isLoaded]);

  return [settings, setSettings] as const;
}

// Click sound hook with Web Audio API
export function useClickSound(enabled: boolean) {
  const enabledRef = useRef(enabled);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  return () => {
    if (!enabledRef.current) return;

    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;

      const ctx = ctxRef.current || new AC();
      ctxRef.current = ctx;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = 280;

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + 0.06
      );

      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Silently fail if Web Audio not supported
    }
  };
}
