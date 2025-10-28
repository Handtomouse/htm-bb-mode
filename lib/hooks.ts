"use client";

import { useEffect, useRef, useState } from "react";

// Settings hook with localStorage persistence
export interface Settings {
  dockMode: "mono" | "bb";
  sound: boolean;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    dockMode: "mono",
    sound: true,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("htm-bb-settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          dockMode: parsed.dockMode ?? "mono",
          sound: typeof parsed.sound === "boolean" ? parsed.sound : true,
        });
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("htm-bb-settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings]);

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
