"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSettings } from "@/lib/hooks";

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

export default function SettingsPage() {
  const [settings, setSettings] = useSettings();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Scroll tracking for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Custom cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings({ ...settings, [key]: value });
    showToast(`${key} updated`, "success");
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
    showToast("Settings reset to defaults", "info");
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white scroll-smooth">
      {/* Custom Cursor */}
      <motion.div
        aria-hidden="true"
        role="presentation"
        className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference hidden md:block"
        animate={{
          x: cursorPos.x - 16,
          y: cursorPos.y - 16,
          scale: isHovering ? 1.8 : 1,
          opacity: isHovering ? 1 : 0.6,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.6,
        }}
      >
        <div className="w-full h-full rounded-full border border-white/60" />
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Toast Notifications */}
      <div className="fixed top-8 right-8 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`pointer-events-auto px-6 py-3 border backdrop-blur-sm text-sm ${
              toast.type === "success"
                ? "border-[#06ffa5]/30 bg-[#06ffa5]/10 text-[#06ffa5]"
                : "border-[#ff9d23]/30 bg-[#ff9d23]/10 text-[#ff9d23]"
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="h-[70vh] flex items-center justify-center px-12 md:px-16 lg:px-20">
        <div className="max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-[70px] md:text-[100px] lg:text-[130px] font-light text-[#ff9d23] mb-12 leading-[0.9]"
              style={{
                textShadow:
                  "0 0 40px rgba(255, 157, 35, 0.4), 0 0 80px rgba(255, 157, 35, 0.2)",
                WebkitTextStroke: "0.5px rgba(255, 157, 35, 0.3)",
                transform: `translateY(${scrollY * 0.3}px)`,
                opacity: 1 - scrollY / 800,
              }}
            >
              Settings
            </h1>
            <p
              className="text-[17px] md:text-[19px] lg:text-[21px] text-white/75 leading-[2.4] font-light tracking-wide max-w-3xl"
              style={{
                transform: `translateY(${scrollY * 0.15}px)`,
                opacity: 1 - scrollY / 1000,
              }}
            >
              Customize your experience. All preferences are saved locally in your browser.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Luxury Divider */}
      <motion.div
        className="max-w-[1600px] mx-auto px-16 md:px-20 lg:px-24 mb-20"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ff9d23]/40 to-transparent" />
      </motion.div>

      {/* Settings Grid */}
      <div className="max-w-[1200px] mx-auto px-12 md:px-16 lg:px-20 pb-40 md:pb-48">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Appearance Section */}
          <SettingCard
            title="Appearance"
            description="Visual preferences"
            delay={0.1}
            onHoverChange={setIsHovering}
          >
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-[14px] text-white/80 uppercase tracking-[0.15em] mb-3">
                  Theme
                </label>
                <div className="flex gap-2">
                  {(["dark", "light", "auto"] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateSetting("theme", theme)}
                      className={`flex-1 px-4 py-3 border transition-all duration-500 uppercase text-[13px] tracking-wider ${
                        settings.theme === theme
                          ? "border-[#ff9d23] bg-[#ff9d23]/10 text-[#ff9d23]"
                          : "border-white/10 text-white/60 hover:border-white/30"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-[14px] text-white/80 uppercase tracking-[0.15em] mb-3">
                  Accent Color
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateSetting("accentColor", color.value)}
                      className={`relative group aspect-square border transition-all duration-500 hover:scale-105 ${
                        settings.accentColor === color.value
                          ? "border-white/40"
                          : "border-white/10"
                      }`}
                      style={{
                        backgroundColor: `${color.value}15`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 20px ${color.value}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        className="absolute inset-4 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      {settings.accentColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
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
                <label className="block text-[14px] text-white/80 uppercase tracking-[0.15em] mb-3">
                  Font Size
                </label>
                <div className="flex gap-2">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting("fontSize", size)}
                      className={`flex-1 px-4 py-3 border transition-all duration-500 uppercase text-[13px] tracking-wider ${
                        settings.fontSize === size
                          ? "border-[#ff9d23] bg-[#ff9d23]/10 text-[#ff9d23]"
                          : "border-white/10 text-white/60 hover:border-white/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brightness Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[14px] text-white/80 uppercase tracking-[0.15em]">
                    Brightness
                  </label>
                  <span className="text-[#ff9d23] tabular-nums">{settings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={settings.brightness}
                  onChange={(e) =>
                    updateSetting("brightness", Number(e.target.value))
                  }
                  className="w-full h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff9d23] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,157,35,0.6)]"
                />
              </div>
            </div>
          </SettingCard>

          {/* Behavior Section */}
          <SettingCard
            title="Behavior"
            description="Interactions & feedback"
            delay={0.2}
            onHoverChange={setIsHovering}
          >
            <div className="space-y-6">
              {/* Dock Mode */}
              <div>
                <label className="block text-[14px] text-white/80 uppercase tracking-[0.15em] mb-3">
                  Dock Icons
                </label>
                <div className="flex gap-2">
                  {(["mono", "bb"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSetting("dockMode", mode)}
                      className={`flex-1 px-4 py-3 border transition-all duration-500 uppercase text-[13px] tracking-wider ${
                        settings.dockMode === mode
                          ? "border-[#ff9d23] bg-[#ff9d23]/10 text-[#ff9d23]"
                          : "border-white/10 text-white/60 hover:border-white/30"
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
              <div className={`transition-opacity duration-500 ${settings.sound ? "opacity-100" : "opacity-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[14px] text-white/80 uppercase tracking-[0.15em]">
                    Volume
                  </label>
                  <span className="text-[#ff9d23] tabular-nums">{settings.volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => updateSetting("volume", Number(e.target.value))}
                  disabled={!settings.sound}
                  className="w-full h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff9d23] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,157,35,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className={`transition-opacity duration-500 ${settings.reducedMotion ? "opacity-50" : "opacity-100"}`}>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[14px] text-white/80 uppercase tracking-[0.15em]">
                    Animation Speed
                  </label>
                  <span className="text-[#ff9d23] tabular-nums">{settings.animationSpeed.toFixed(1)}×</span>
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
                  className="w-full h-1 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ff9d23] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/20 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,157,35,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
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
          <SettingCard
            title="Privacy"
            description="Data & analytics"
            delay={0.3}
            onHoverChange={setIsHovering}
          >
            <div className="space-y-6">
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
              <div className="pt-4 border-t border-white/10">
                <p className="text-[12px] text-white/50 leading-relaxed">
                  All settings are stored locally in your browser. No data is
                  sent to external servers.
                </p>
              </div>
            </div>
          </SettingCard>

          {/* About Section */}
          <SettingCard
            title="About"
            description="Device information"
            delay={0.4}
            onHoverChange={setIsHovering}
          >
            <div className="space-y-4 text-[13px] text-white/60">
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
                <span className="text-[#ff9d23]">HandToMouse</span>
              </div>
            </div>
          </SettingCard>
        </div>

        {/* Reset Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <button
            onClick={resetSettings}
            onMouseEnter={(e) => setIsHovering(true)}
            onMouseLeave={(e) => setIsHovering(false)}
            className="inline-block px-16 py-5 border border-white/20 hover:border-[#ff9d23] hover:bg-[#ff9d23]/5 text-[14px] text-white/70 hover:text-[#ff9d23] font-light uppercase tracking-[0.25em] transition-all duration-700 active:scale-95"
            style={{
              boxShadow: "0 0 0 0 transparent",
              transition: "all 0.7s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 20px #ff9d2330";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
            }}
          >
            Reset All Settings
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// Setting Card Component
function SettingCard({
  title,
  description,
  delay,
  children,
  onHoverChange,
}: {
  title: string;
  description: string;
  delay: number;
  children: React.ReactNode;
  onHoverChange: (hovering: boolean) => void;
}) {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.02;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.02;
    setLocalMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setLocalMousePos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => onHoverChange(true)}
      onMouseExit={() => onHoverChange(false)}
      className="relative group border border-white/5 bg-[#0a0a0a] p-8 md:p-10 transition-all duration-700 hover:border-white/20"
      style={{
        transform: `translate(${localMousePos.x}px, ${localMousePos.y}px)`,
        boxShadow: "0 0 0 0 transparent",
        transition: "all 0.7s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 0 20px #ff9d2310, 0 0 40px #ff9d2305";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
      }}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-700"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #ff9d23 50%, transparent 100%)",
        }}
      />

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[20px] md:text-[24px] font-light text-white uppercase tracking-[0.15em] mb-2">
          {title}
        </h2>
        <p className="text-[12px] text-white/50 tracking-wide">{description}</p>
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
        <div className="text-[14px] text-white/80 uppercase tracking-[0.15em]">
          {label}
        </div>
        {description && (
          <div className="text-[11px] text-white/40 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-14 h-7 border transition-all duration-500 ${
          value
            ? "border-[#ff9d23] bg-[#ff9d23]/20"
            : "border-white/20 bg-white/5"
        }`}
      >
        <motion.div
          animate={{ x: value ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 left-0.5 w-6 h-6 ${
            value ? "bg-[#ff9d23]" : "bg-white/40"
          }`}
          style={{
            boxShadow: value ? "0 0 12px #ff9d2360" : "none",
          }}
        />
      </button>
    </div>
  );
}
