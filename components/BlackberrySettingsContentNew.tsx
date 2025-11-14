"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings, useUndoRedo, useHapticFeedback } from "@/lib/hooks";
import { DEFAULT_SETTINGS } from "@/lib/settingsValidation";
import { PRESETS, type Preset } from "@/lib/settingsPresets";
import { exportSettings, importSettings } from "@/lib/settingsValidation";
import BBPageHeader from "./BBPageHeader";
import ConfirmationModal from "./ConfirmationModal";
import EnhancedSlider from "./EnhancedSlider";
import SettingsSkeleton from "./SettingsSkeleton";
import type { Settings } from "@/lib/hooks";

const ACCENT = "var(--accent)";

const ACCENT_COLORS = [
  { name: "Orange", value: "var(--accent)" },
  { name: "Blue", value: "#3a86ff" },
  { name: "Purple", value: "#9b5de5" },
  { name: "Green", value: "#06ffa5" },
  { name: "Pink", value: "#ff006e" },
  { name: "Yellow", value: "#ffbe0b" },
];

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

export default function BlackberrySettingsContentNew() {
  const [settings, setSettings, isLoaded] = useSettings();
  const triggerHaptic = useHapticFeedback();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Undo/Redo system
  const undoRedo = useUndoRedo<Settings>(settings, 50);

  // Sync undo/redo state with settings when settings load
  useEffect(() => {
    if (isLoaded) {
      undoRedo.setState(settings);
    }
  }, [isLoaded]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd+Z / Ctrl+Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (undoRedo.canUndo) {
          undoRedo.undo();
          const prevState = undoRedo.state;
          setSettings(prevState);
          showToast("Undo", "info");
        }
      }
      // Cmd+Shift+Z / Ctrl+Shift+Z for redo
      else if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        if (undoRedo.canRedo) {
          undoRedo.redo();
          const nextState = undoRedo.state;
          setSettings(nextState);
          showToast("Redo", "info");
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [undoRedo.canUndo, undoRedo.canRedo]);

  const showToast = (message: string, type: ToastMessage["type"] = "success") => {
    const id = Date.now();
    // Queue system: max 3 toasts
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type }];
      return newToasts.slice(-3); // Keep only last 3
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    undoRedo.setState(newSettings);
    showToast(`${String(key)} updated`, "success");
  };

  const confirmResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setShowResetModal(false);
    showToast("Settings reset to defaults", "info");
  };

  const handleExportSettings = () => {
    try {
      const json = exportSettings(settings);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `htm-bb-settings-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Settings exported", "success");
    } catch (error) {
      showToast("Export failed", "error");
    }
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const imported = importSettings(json);
        if (imported) {
          setSettings(imported);
          showToast("Settings imported", "success");
        } else {
          showToast("Invalid settings file", "error");
        }
      } catch (error) {
        showToast("Import failed", "error");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const applyPreset = (preset: Preset) => {
    setSettings(preset.settings);
    setShowPresetsModal(false);
    showToast(`Applied "${preset.name}" preset`, "success");
  };

  // Show loading skeleton while settings load
  if (!isLoaded) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="relative">
      {/* Toast Notifications with Queue System */}
      <div className="fixed top-2 right-2 z-50 space-y-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              layout
              className={`pointer-events-auto px-3 py-2 border backdrop-blur-sm text-xs flex items-center gap-2 ${
                toast.type === "success"
                  ? "border-[#06ffa5]/30 bg-[#06ffa5]/10 text-[#06ffa5]"
                  : toast.type === "error"
                  ? "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]"
                  : toast.type === "warning"
                  ? "border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#fbbf24]"
                  : "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]"
              }`}
              onClick={() => {
                triggerHaptic(10);
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
            >
              {/* Icon */}
              <span className="text-sm">
                {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : toast.type === "warning" ? "⚠" : "ℹ"}
              </span>
              {/* Message */}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset All Settings"
        message="Are you sure you want to reset all settings to their default values? This action cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={confirmResetSettings}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Presets Modal */}
      <AnimatePresence>
        {showPresetsModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                triggerHaptic(10);
                setShowPresetsModal(false);
              }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-black border border-white/20 p-6 pointer-events-auto max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-medium text-white uppercase tracking-wider mb-4">
                  Preset Themes
                </h2>
                <div className="space-y-3">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        triggerHaptic(15);
                        applyPreset(preset);
                      }}
                      className="w-full text-left p-4 border border-white/10 bg-black/20 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{preset.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white uppercase tracking-wider mb-1">
                            {preset.name}
                          </div>
                          <div className="text-xs text-white/60">{preset.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    setShowPresetsModal(false);
                  }}
                  className="mt-4 w-full transition-all hover:scale-110 active:scale-95"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "capitalize",
                    background: "transparent",
                    color: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    boxShadow: "none",
                    filter: "none"
                  }}
                >
                  Close
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportSettings}
        className="hidden"
      />

      <BBPageHeader title="SETTINGS" subtitle="Customize your experience" />

      {/* Live Preview Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-xs text-white/70 uppercase tracking-[0.12em] font-medium">
            Live Preview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Theme Preview */}
            <div className="space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Theme</div>
              <div
                className={`h-16 border border-white/10 flex items-center justify-center text-xs transition-all duration-300 ${
                  settings.theme === "dark"
                    ? "bg-black text-white"
                    : settings.theme === "light"
                    ? "bg-white text-black"
                    : "bg-gradient-to-r from-black to-white text-white"
                }`}
              >
                {settings.theme.toUpperCase()}
              </div>
            </div>

            {/* Accent Color Preview */}
            <div className="space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Accent</div>
              <div className="h-16 border border-white/10 flex flex-col items-center justify-center gap-1">
                <div
                  className="w-8 h-8 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: settings.accentColor,
                    boxShadow: `0 0 12px ${settings.accentColor}60`,
                  }}
                />
                <div className="text-[9px] text-white/40 tabular-nums">
                  {settings.accentColor.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Font Size Preview */}
            <div className="space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Font Size</div>
              <div className="h-16 border border-white/10 flex items-center justify-center">
                <span
                  className={`text-white/80 transition-all duration-300 ${
                    settings.fontSize === "small"
                      ? "text-xs"
                      : settings.fontSize === "medium"
                      ? "text-sm"
                      : "text-base"
                  }`}
                >
                  Aa
                </span>
              </div>
            </div>

            {/* Brightness Preview */}
            <div className="space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Brightness</div>
              <div className="h-16 border border-white/10 flex items-center justify-center bg-black">
                <div
                  className="w-full h-full bg-white transition-opacity duration-300"
                  style={{ opacity: settings.brightness / 100 }}
                />
              </div>
            </div>
          </div>

          {/* Motion Preview */}
          {!settings.reducedMotion && (
            <div className="mt-4 space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Animation Speed</div>
              <div className="h-16 border border-white/10 bg-black/40 overflow-hidden relative">
                <motion.div
                  animate={{
                    x: ["0%", "calc(100% - 40px)", "0%"],
                  }}
                  transition={{
                    duration: 2 / settings.animationSpeed,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
                  style={{
                    backgroundColor: settings.accentColor,
                    boxShadow: `0 0 12px ${settings.accentColor}80`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="space-y-6 max-w-3xl pb-8">
        {/* Appearance Section */}
        <SettingCard title="Appearance" delay={0.1}>
          {/* Theme */}
          <div>
            <label className="block text-xs text-white/70 uppercase tracking-wider mb-2.5">
              Theme
            </label>
            <div className="flex gap-2">
              {(["dark", "light", "auto"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    triggerHaptic(10);
                    updateSetting("theme", theme);
                  }}
                  className="flex-1 transition-all hover:scale-110 active:scale-95"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "capitalize",
                    background: settings.theme === theme ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    color: settings.theme === theme ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    boxShadow: "none",
                    filter: "none"
                  }}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-xs text-white/70 uppercase tracking-wider mb-2.5">
              Accent Color
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    triggerHaptic(10);
                    updateSetting("accentColor", color.value);
                  }}
                  className={`relative aspect-square border transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-black group ${
                    settings.accentColor === color.value
                      ? "border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                  style={{
                    backgroundColor: `${color.value}15`,
                  }}
                  onMouseEnter={(e) => {
                    if (settings.accentColor !== color.value) {
                      e.currentTarget.style.boxShadow = `0 0 16px ${color.value}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (settings.accentColor !== color.value) {
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <div
                    className="absolute inset-2 rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: color.value }}
                  />
                  {settings.accentColor === color.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-xs text-white/70 uppercase tracking-wider mb-2.5">
              Font Size
            </label>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    triggerHaptic(10);
                    updateSetting("fontSize", size);
                  }}
                  className="flex-1 transition-all hover:scale-110 active:scale-95"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "capitalize",
                    background: settings.fontSize === size ? "rgba(255, 255, 255, 0.1)" : "transparent",
                    color: settings.fontSize === size ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    boxShadow: "none",
                    filter: "none"
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Brightness Slider */}
          <EnhancedSlider
            label="Brightness"
            value={settings.brightness}
            min={20}
            max={100}
            unit="%"
            onChange={(value) => {
              triggerHaptic(10);
              updateSetting("brightness", value);
            }}
          />
        </SettingCard>

        {/* Behavior Section */}
        <SettingCard title="Behavior" delay={0.2}>
          {/* Dock Mode */}
          <div>
            <label className="block text-xs text-white/70 uppercase tracking-wider mb-2.5">
              Dock Icons
            </label>
            <div className="flex gap-2">
              {(["mono", "bb"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    triggerHaptic(10);
                    updateSetting("dockMode", mode);
                  }}
                  className={`flex-1 px-3 py-2.5 border text-xs uppercase tracking-wide transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-black ${
                    settings.dockMode === mode
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_10px_rgba(255,157,35,0.2)]"
                      : "border-white/10 text-white/60 hover:border-white/20 hover:bg-white/[0.02]"
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
            onChange={(value) => {
              triggerHaptic(10);
              updateSetting("sound", value);
            }}
          />

          {/* Volume Slider */}
          <EnhancedSlider
            label="Volume"
            value={settings.volume}
            min={0}
            max={100}
            unit="%"
            onChange={(value) => {
              triggerHaptic(10);
              updateSetting("volume", value);
            }}
            disabled={!settings.sound}
          />

          {/* Reduced Motion */}
          <ToggleSetting
            label="Reduced Motion"
            value={settings.reducedMotion}
            onChange={(value) => {
              triggerHaptic(10);
              updateSetting("reducedMotion", value);
            }}
            description="Minimize animations"
          />

          {/* Animation Speed */}
          <EnhancedSlider
            label="Animation Speed"
            value={settings.animationSpeed}
            min={0.5}
            max={2.0}
            step={0.1}
            unit="×"
            onChange={(value) => {
              triggerHaptic(10);
              updateSetting("animationSpeed", value);
            }}
            disabled={settings.reducedMotion}
            formatValue={(v) => `${v.toFixed(1)}×`}
          />

          {/* High Contrast */}
          <ToggleSetting
            label="High Contrast"
            value={settings.highContrast}
            onChange={(value) => {
              triggerHaptic(10);
              updateSetting("highContrast", value);
            }}
            description="Increase text contrast"
          />
        </SettingCard>

        {/* Privacy Section */}
        <SettingCard title="Privacy" delay={0.3}>
          <ToggleSetting
            label="Analytics"
            value={settings.analyticsEnabled}
            onChange={(value) => {
              triggerHaptic(10);
              updateSetting("analyticsEnabled", value);
            }}
            description="Help improve the site"
          />
          <ToggleSetting
            label="Tracking"
            value={settings.trackingEnabled}
            onChange={(value) => {
              triggerHaptic(10);
              updateSetting("trackingEnabled", value);
            }}
            description="Third-party cookies"
          />
          <div className="pt-3 border-t border-white/10">
            <p className="text-[10px] text-white/50 leading-relaxed">
              All settings stored locally in your browser. No data sent to external servers.
            </p>
          </div>
        </SettingCard>

        {/* About Section */}
        <SettingCard title="About" delay={0.4}>
          <div className="text-xs text-white/60 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span>Model:</span>
              <span className="text-white/90">BB OS5 Portfolio</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span>Version:</span>
              <span className="text-white/90 tabular-nums">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span>Build:</span>
              <span className="text-white/90 tabular-nums">2025.11.13</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Developer:</span>
              <span className="text-[var(--accent)]">HandToMouse</span>
            </div>
          </div>
        </SettingCard>

        {/* Actions Section */}
        <div className="pt-8 mt-2" role="region" aria-label="Settings actions">
          {/* Divider */}
          <div className="mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="space-y-3">
            {/* Undo/Redo */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  if (undoRedo.canUndo) {
                    triggerHaptic(10);
                    undoRedo.undo();
                    setSettings(undoRedo.state);
                    showToast("Undo", "info");
                  }
                }}
                disabled={!undoRedo.canUndo}
                aria-label="Undo last change (Cmd+Z)"
                className={`px-4 py-3 border text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-black ${
                  undoRedo.canUndo
                    ? "border-white/20 hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/5 text-white/70 hover:text-[var(--accent)]"
                    : "border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <span className="inline-block mr-1.5">↶</span>
                Undo
              </button>
              <button
                onClick={() => {
                  if (undoRedo.canRedo) {
                    triggerHaptic(10);
                    undoRedo.redo();
                    setSettings(undoRedo.state);
                    showToast("Redo", "info");
                  }
                }}
                disabled={!undoRedo.canRedo}
                aria-label="Redo last change (Cmd+Shift+Z)"
                className={`px-4 py-3 border text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-black ${
                  undoRedo.canRedo
                    ? "border-white/20 hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/5 text-white/70 hover:text-[var(--accent)]"
                    : "border-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <span className="inline-block mr-1.5">↷</span>
                Redo
              </button>
            </div>

            {/* Presets */}
            <button
              onClick={() => {
                triggerHaptic(10);
                setShowPresetsModal(true);
              }}
              aria-label="Open preset themes menu"
              className="w-full px-5 py-3.5 border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 text-xs uppercase tracking-[0.12em] transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-black shadow-[0_0_10px_rgba(255,157,35,0.15)] hover:shadow-[0_0_16px_rgba(255,157,35,0.25)]"
            >
              <span className="inline-block mr-2">🎨</span>
              Load Preset Theme
            </button>

            {/* Import/Export */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  handleExportSettings();
                }}
                aria-label="Export settings to JSON file"
                className="px-4 py-3 border border-white/20 hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/5 text-xs text-white/70 hover:text-[var(--accent)] uppercase tracking-wider transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                <span className="inline-block mr-1.5">↓</span>
                Export
              </button>
              <button
                onClick={() => {
                  triggerHaptic(10);
                  fileInputRef.current?.click();
                }}
                aria-label="Import settings from JSON file"
                className="px-4 py-3 border border-white/20 hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/5 text-xs text-white/70 hover:text-[var(--accent)] uppercase tracking-wider transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                <span className="inline-block mr-1.5">↑</span>
                Import
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                triggerHaptic(10);
                setShowResetModal(true);
              }}
              aria-label="Reset all settings to default values"
              className="w-full px-5 py-3 border border-white/20 hover:border-[#ef4444]/60 hover:bg-[#ef4444]/5 text-xs text-white/60 hover:text-[#ef4444] uppercase tracking-wider transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50 focus:ring-offset-2 focus:ring-offset-black"
            >
              <span className="inline-block mr-2">⟲</span>
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Setting Card Component with Collapsible Sections
function SettingCard({
  title,
  delay,
  children,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

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
      className="border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden"
    >
      {/* Clickable Header */}
      <button
        onClick={() => {
          triggerHaptic(10);
          setIsOpen(!isOpen);
        }}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] active:bg-white/[0.03] transition-all duration-200 group"
        aria-expanded={isOpen}
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${title} section`}
      >
        <h2 className="text-sm text-white/90 uppercase tracking-[0.12em] font-medium">
          {title}
        </h2>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] }}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-white/50 group-hover:text-white/70 transition-colors duration-200"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      {/* Animated Content */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          height: {
            duration: 0.4,
            ease: [0.43, 0.13, 0.23, 0.96],
          },
          opacity: {
            duration: 0.3,
            ease: "easeInOut",
          },
        }}
        style={{ overflow: "hidden" }}
      >
        <div className="px-6 pb-6 pt-2">
          <div className="space-y-5">{children}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Toggle Setting Component with Accessibility
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
  const toggleId = `toggle-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const descId = description ? `${toggleId}-desc` : undefined;

  return (
    <div className="flex items-center justify-between">
      <div>
        <label
          htmlFor={toggleId}
          className="text-xs text-white/70 uppercase tracking-wider cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <div id={descId} className="text-[10px] text-white/40 mt-0.5">
            {description}
          </div>
        )}
      </div>
      <button
        id={toggleId}
        role="switch"
        aria-checked={value}
        aria-describedby={descId}
        aria-label={`${label}: ${value ? "enabled" : "disabled"}`}
        onClick={() => {
          triggerHaptic(10);
          onChange(!value);
        }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            triggerHaptic(10);
            onChange(!value);
          }
        }}
        className={`relative w-12 h-6 border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-black ${
          value
            ? "border-[var(--accent)] bg-[var(--accent)]/20"
            : "border-white/20 bg-white/5"
        }`}
      >
        <motion.div
          animate={{ x: value ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 left-0.5 w-5 h-5 ${
            value ? "bg-[var(--accent)]" : "bg-white/40"
          }`}
        />
      </button>
    </div>
  );
}
