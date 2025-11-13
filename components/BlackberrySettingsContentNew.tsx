"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSettings } from "@/lib/hooks";
import BBPageHeader from "./BBPageHeader";

const ACCENT = "#FF9D23";

const ACCENT_COLORS = [
  { name: "Orange", value: "#ff9d23" },
  { name: "Blue", value: "#3a86ff" },
  { name: "Purple", value: "#9b5de5" },
  { name: "Green", value: "#06ffa5" },
  { name: "Pink", value: "#ff006e" },
  { name: "Yellow", value: "#ffbe0b" },
];

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "info";
}

export default function BlackberrySettingsContentNew() {
  const [settings, setSettings] = useSettings();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings({ ...settings, [key]: value });
    showToast(`${String(key)} updated`, "success");
  };

  const resetSettings = () => {
    setSettings({
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
    });
    showToast("Settings reset", "info");
  };

  return (
    <div className="relative">
      {/* Toast Notifications */}
      <div className="fixed top-2 right-2 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`pointer-events-auto px-3 py-2 border backdrop-blur-sm text-xs ${
              toast.type === "success"
                ? "border-[#06ffa5]/30 bg-[#06ffa5]/10 text-[#06ffa5]"
                : "border-[#ff9d23]/30 bg-[#ff9d23]/10 text-[#ff9d23]"
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </div>

      <BBPageHeader title="SETTINGS" subtitle="Customize your experience" />

      <div className="space-y-6 mt-6">
        {/* Appearance Section */}
        <SettingCard title="Appearance" delay={0.1}>
          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                Theme
              </label>
              <div className="flex gap-2">
                {(["dark", "light", "auto"] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSetting("theme", theme)}
                    className={`flex-1 px-3 py-2 border text-xs uppercase transition-all duration-300 ${
                      settings.theme === theme
                        ? "border-[#ff9d23] bg-[#ff9d23]/10 text-[#ff9d23]"
                        : "border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                Accent Color
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateSetting("accentColor", color.value)}
                    className={`relative aspect-square border transition-all duration-300 hover:scale-105 ${
                      settings.accentColor === color.value
                        ? "border-white/40"
                        : "border-white/10"
                    }`}
                    style={{
                      backgroundColor: `${color.value}15`,
                    }}
                  >
                    <div
                      className="absolute inset-2 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    {settings.accentColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                Font Size
              </label>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting("fontSize", size)}
                    className={`flex-1 px-3 py-2 border text-xs uppercase transition-all duration-300 ${
                      settings.fontSize === size
                        ? "border-[#ff9d23] bg-[#ff9d23]/10 text-[#ff9d23]"
                        : "border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Brightness Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/70 uppercase tracking-wider">
                  Brightness
                </label>
                <span className="text-[#ff9d23] text-xs tabular-nums">
                  {settings.brightness}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={settings.brightness}
                onChange={(e) =>
                  updateSetting("brightness", Number(e.target.value))
                }
                className="w-full h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff9d23] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20"
              />
            </div>
          </div>
        </SettingCard>

        {/* Behavior Section */}
        <SettingCard title="Behavior" delay={0.2}>
          <div className="space-y-4">
            {/* Dock Mode */}
            <div>
              <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                Dock Icons
              </label>
              <div className="flex gap-2">
                {(["mono", "bb"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting("dockMode", mode)}
                    className={`flex-1 px-3 py-2 border text-xs uppercase transition-all duration-300 ${
                      settings.dockMode === mode
                        ? "border-[#ff9d23] bg-[#ff9d23]/10 text-[#ff9d23]"
                        : "border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {mode === "mono" ? "MONO" : "BB PIXEL"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Toggle */}
            <ToggleSetting
              label="Click Sound"
              value={settings.sound}
              onChange={(value) => updateSetting("sound", value)}
            />

            {/* Volume Slider */}
            <div
              className={`transition-opacity duration-300 ${
                settings.sound ? "opacity-100" : "opacity-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/70 uppercase tracking-wider">
                  Volume
                </label>
                <span className="text-[#ff9d23] text-xs tabular-nums">
                  {settings.volume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => updateSetting("volume", Number(e.target.value))}
                disabled={!settings.sound}
                className="w-full h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff9d23] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Reduced Motion */}
            <ToggleSetting
              label="Reduced Motion"
              value={settings.reducedMotion}
              onChange={(value) => updateSetting("reducedMotion", value)}
              description="Minimize animations"
            />

            {/* Animation Speed */}
            <div
              className={`transition-opacity duration-300 ${
                settings.reducedMotion ? "opacity-50" : "opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/70 uppercase tracking-wider">
                  Animation Speed
                </label>
                <span className="text-[#ff9d23] text-xs tabular-nums">
                  {settings.animationSpeed.toFixed(1)}×
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.animationSpeed}
                onChange={(e) =>
                  updateSetting("animationSpeed", Number(e.target.value))
                }
                disabled={settings.reducedMotion}
                className="w-full h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff9d23] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* High Contrast */}
            <ToggleSetting
              label="High Contrast"
              value={settings.highContrast}
              onChange={(value) => updateSetting("highContrast", value)}
              description="Increase text contrast"
            />
          </div>
        </SettingCard>

        {/* Privacy Section */}
        <SettingCard title="Privacy" delay={0.3}>
          <div className="space-y-4">
            <ToggleSetting
              label="Analytics"
              value={settings.analyticsEnabled}
              onChange={(value) => updateSetting("analyticsEnabled", value)}
              description="Help improve the site"
            />
            <ToggleSetting
              label="Tracking"
              value={settings.trackingEnabled}
              onChange={(value) => updateSetting("trackingEnabled", value)}
              description="Third-party cookies"
            />
            <div className="pt-3 border-t border-white/10">
              <p className="text-[10px] text-white/50 leading-relaxed">
                All settings stored locally in your browser. No data sent to external servers.
              </p>
            </div>
          </div>
        </SettingCard>

        {/* About Section */}
        <SettingCard title="About" delay={0.4}>
          <div className="space-y-3 text-xs text-white/60">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span>Model:</span>
              <span className="text-white/90">BB OS5 Portfolio</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span>Version:</span>
              <span className="text-white/90 tabular-nums">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span>Build:</span>
              <span className="text-white/90 tabular-nums">2025.11.13</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Developer:</span>
              <span className="text-[#ff9d23]">HandToMouse</span>
            </div>
          </div>
        </SettingCard>

        {/* Reset Button */}
        <div className="pt-4">
          <button
            onClick={resetSettings}
            className="w-full px-4 py-3 border border-white/20 hover:border-[#ff9d23] hover:bg-[#ff9d23]/5 text-xs text-white/70 hover:text-[#ff9d23] uppercase tracking-wider transition-all duration-500"
          >
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Setting Card Component
function SettingCard({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      className="border border-white/10 bg-black/20 p-4"
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-sm text-white uppercase tracking-wider">
          {title}
        </h2>
      </div>

      {/* Content */}
      <div>{children}</div>
    </motion.div>
  );
}

// Toggle Setting Component
function ToggleSetting({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-white/70 uppercase tracking-wider">
          {label}
        </div>
        {description && (
          <div className="text-[10px] text-white/40 mt-0.5">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 border transition-all duration-300 ${
          value
            ? "border-[#ff9d23] bg-[#ff9d23]/20"
            : "border-white/20 bg-white/5"
        }`}
      >
        <motion.div
          animate={{ x: value ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 left-0.5 w-5 h-5 ${
            value ? "bg-[#ff9d23]" : "bg-white/40"
          }`}
        />
      </button>
    </div>
  );
}
