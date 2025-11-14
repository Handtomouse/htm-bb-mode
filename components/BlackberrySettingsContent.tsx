"use client";

import { useState } from "react";
import { useHapticFeedback, useSettings } from "@/lib/hooks";
import BBPageHeader from "./BBPageHeader";
import BBButton from "./BBButton";

const ACCENT = "var(--accent)";

// Accent color options
const ACCENT_COLORS = [
  { name: "Orange", value: "var(--accent)" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Green", value: "#22c55e" },
  { name: "Pink", value: "#ec4899" },
];

export default function BlackberrySettingsContent() {
  const triggerHaptic = useHapticFeedback();
  const [settings, setSettings] = useSettings();
  const [brightness, setBrightness] = useState(80);
  const [contrast, setContrast] = useState(100);
  const [trackpadSensitivity, setTrackpadSensitivity] = useState(50);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div>
      <BBPageHeader title="SETTINGS" subtitle="Customize your experience" />

      <div className="space-y-12 md:space-y-16">
        {/* Accent Color */}
        <div className="h-12 md:h-16 lg:h-20" />
        <section>
          <h2 className="mb-2 text-base md:text-lg font-bold uppercase text-white/80">Accent Color</h2>
          <div className="space-y-3 border border-white/10 bg-black/30 p-4 md:p-5 lg:p-6">
            <p className="text-xs text-white/60 mb-3">Choose your accent color (changes all highlights site-wide)</p>
            <div className="grid grid-cols-5 gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    triggerHaptic(15);
                    setSettings({ ...settings, accentColor: color.value });
                  }}
                  className="relative aspect-square border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    borderColor: settings.accentColor === color.value ? "#fff" : "transparent",
                    boxShadow: settings.accentColor === color.value ? `0 0 20px ${color.value}` : "none",
                  }}
                  title={color.name}
                >
                  {settings.accentColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/40 mt-2">
              Current: {ACCENT_COLORS.find(c => c.value === settings.accentColor)?.name || "Orange"}
            </p>
          </div>
        </section>

        {/* Display Settings */}
        <div className="h-12 md:h-16 lg:h-20" />
        <section>
          <h2 className="mb-2 text-base md:text-lg font-bold uppercase text-white/80">Display</h2>
          <div className="space-y-3 border border-white/10 bg-black/30 p-4 md:p-5 lg:p-6">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <label className="text-sm md:text-base text-white/70">Brightness</label>
                <span className="text-[var(--accent)]">{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => {
                  triggerHaptic(10);
                  setBrightness(Number(e.target.value));
                }}
                className="w-full accent-[var(--accent)]"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <label className="text-sm md:text-base text-white/70">Contrast</label>
                <span className="text-[var(--accent)]">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => {
                  triggerHaptic(10);
                  setContrast(Number(e.target.value));
                }}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          </div>
        </section>

        <div className="h-12 md:h-16 lg:h-20" />

        {/* Trackpad Settings */}
        <section>
          <h2 className="mb-2 text-base md:text-lg font-bold uppercase text-white/80">Trackpad</h2>
          <div className="space-y-3 border border-white/10 bg-black/30 p-4 md:p-5 lg:p-6">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <label className="text-sm md:text-base text-white/70">Sensitivity</label>
                <span className="text-[var(--accent)]">
                  {trackpadSensitivity < 30 ? "Low" : trackpadSensitivity < 70 ? "Medium" : "High"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={trackpadSensitivity}
                onChange={(e) => {
                  triggerHaptic(10);
                  setTrackpadSensitivity(Number(e.target.value));
                }}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          </div>
        </section>

        <div className="h-12 md:h-16 lg:h-20" />

        {/* Sound & Haptics */}
        <section>
          <h2 className="mb-2 text-base md:text-lg font-bold uppercase text-white/80">Sound & Haptics</h2>
          <div className="space-y-2 border border-white/10 bg-black/30 p-4 md:p-5 lg:p-6">
            <label className="flex items-center justify-between text-xs">
              <span className="text-white/70">Sound Effects</span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => {
                  triggerHaptic(10);
                  setSoundEnabled(e.target.checked);
                }}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>

            <label className="flex items-center justify-between text-xs">
              <span className="text-white/70">Vibration</span>
              <input
                type="checkbox"
                checked={vibrateEnabled}
                onChange={(e) => {
                  triggerHaptic(10);
                  setVibrateEnabled(e.target.checked);
                }}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
          </div>
        </section>

        <div className="h-12 md:h-16 lg:h-20" />

        {/* Notifications */}
        <section>
          <h2 className="mb-2 text-base md:text-lg font-bold uppercase text-white/80">Notifications</h2>
          <div className="space-y-2 border border-white/10 bg-black/30 p-4 md:p-5 lg:p-6">
            <label className="flex items-center justify-between text-xs">
              <span className="text-white/70">Enable Notifications</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => {
                  triggerHaptic(10);
                  setNotifications(e.target.checked);
                }}
                className="h-4 w-4 accent-[var(--accent)]"
              />
            </label>
          </div>
        </section>

        <div className="h-12 md:h-16 lg:h-20" />

        {/* Device Info */}
        <section>
          <h2 className="mb-2 text-base md:text-lg font-bold uppercase text-white/80">About Device</h2>
          <div className="border border-white/10 bg-black/30 p-4 md:p-5 lg:p-6 text-xs text-white/60">
            <div className="mb-2 flex justify-between">
              <span>Model:</span>
              <span className="text-white/80">BB OS5 Portfolio</span>
            </div>
            <div className="mb-2 flex justify-between">
              <span>Version:</span>
              <span className="text-white/80">v1.0.0</span>
            </div>
            <div className="mb-2 flex justify-between">
              <span>Build:</span>
              <span className="text-white/80">2025.11.01</span>
            </div>
            <div className="flex justify-between">
              <span>Developer:</span>
              <span className="text-[var(--accent)]">HandToMouse</span>
            </div>
          </div>
        </section>

        <div className="h-12 md:h-16 lg:h-20" />

        {/* Actions */}
        <section className="pt-2">
          <BBButton
            variant="secondary"
            fullWidth
            onClick={() => {
              triggerHaptic(15);
              setBrightness(80);
              setContrast(100);
              setTrackpadSensitivity(50);
              setSoundEnabled(true);
              setVibrateEnabled(true);
              setNotifications(true);
            }}
          >
            Reset to Defaults
          </BBButton>
        </section>
      </div>
    </div>
  );
}
