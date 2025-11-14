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

  return [settings, setSettings, isLoaded] as const;
}

// Undo/Redo hook with history stack
export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const setStateWithHistory = (newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof newState === "function" ? (newState as (prev: T) => T)(prev) : newState;

      // Remove any future states if we're not at the end
      const newHistory = history.slice(0, currentIndex + 1);

      // Add new state to history
      newHistory.push(next);

      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        setCurrentIndex(maxHistory - 1);
      } else {
        setCurrentIndex(newHistory.length - 1);
      }

      setHistory(newHistory);
      return next;
    });
  };

  const undo = () => {
    if (canUndo) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex]);
    }
  };

  const redo = () => {
    if (canRedo) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setState(history[newIndex]);
    }
  };

  const reset = () => {
    setHistory([initialState]);
    setCurrentIndex(0);
    setState(initialState);
  };

  return {
    state,
    setState: setStateWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
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
