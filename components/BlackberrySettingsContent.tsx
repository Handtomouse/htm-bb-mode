"use client";

import { useHapticFeedback, useSettings } from "@/lib/hooks";
import BBPageHeader from "./BBPageHeader";

// Accent color options
const ACCENT_COLORS = [
  { name: "Orange", value: "#ff9d23" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Green", value: "#22c55e" },
  { name: "Pink", value: "#ec4899" },
];

export default function BlackberrySettingsContent() {
  const triggerHaptic = useHapticFeedback();
  const [settings, setSettings, isLoaded] = useSettings();

  const handleColorChange = (color: { name: string; value: string }) => {
    console.log("🎨 Color clicked:", color.name, color.value);
    console.log("📦 Current settings:", settings);
    triggerHaptic(15);
    setSettings({ ...settings, accentColor: color.value });
    console.log("✅ Settings updated to:", { ...settings, accentColor: color.value });
  };

  return (
    <div>
      <BBPageHeader title="Settings" subtitle="Choose your accent color" />

      <div className="space-y-8 md:space-y-12">
        {/* Accent Color */}
        <div className="h-8 md:h-12" />
        <section>
          <h2 className="mb-4 text-lg md:text-xl font-bold uppercase text-white">Accent Color</h2>
          <div className="space-y-4 border border-white/10 bg-black/30 p-6 md:p-8">
            <p className="text-sm text-white/70 mb-4">
              Choose your accent color — changes all highlights, buttons, and links site-wide
            </p>

            {/* Debug info */}
            <div className="text-xs text-white/50 mb-4 font-mono">
              {isLoaded ? (
                <p>Current: {settings.accentColor}</p>
              ) : (
                <p>Loading settings...</p>
              )}
            </div>

            <div className="grid grid-cols-5 gap-4">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color)}
                  className="relative aspect-square border-3 transition-all hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: color.value,
                    borderColor: settings.accentColor === color.value ? "#fff" : color.value,
                    boxShadow: settings.accentColor === color.value
                      ? `0 0 30px ${color.value}, 0 0 60px ${color.value}40`
                      : `0 0 10px ${color.value}40`,
                  }}
                  title={color.name}
                >
                  {settings.accentColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white font-black text-2xl drop-shadow-lg">✓</div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 font-mono">
                Selected: {ACCENT_COLORS.find(c => c.value === settings.accentColor)?.name || "Unknown"}
              </p>
              <p className="text-xs text-white/40 font-mono">
                {settings.accentColor}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
