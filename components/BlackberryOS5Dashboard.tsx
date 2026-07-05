"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSettings, useHapticFeedback } from "@/lib/hooks";
import BBTrackpad from "./BBTrackpad";
import { BBSkeletonCard } from "./BBSkeleton";
import BlackberryAboutContent from "./BlackberryAboutContent";
import BlackberryWormholeContent from "./BlackberryWormholeContent";
import BlackberryClientsContent from "./BlackberryClientsContent";
import BlackberryPortfolioContent from "./BlackberryPortfolioContent";
import BlackberryDonateContent from "./BlackberryDonateContent";
import BlackberryMessageContent from "./BlackberryMessageContent";
import NeonCity from "./NeonCityOptimized";
import { ResponsiveStage, HwButton, NotiDot } from "./BlackberryUIComponents";
import {
  VolumeIcon,
  SignalBars,
  Battery,
  PixelCallIcon,
  PixelMenuIcon,
  PixelBackIcon,
  PixelPowerIcon,
  AppGlyph
} from "./BlackberryIcons";
import { BBIcon } from "./BBIcon";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load content components for better performance
const BlackberryContactContent = lazy(() => import("./BlackberryContactContent"));
const BlackberrySettingsContentNew = lazy(() => import("./BlackberrySettingsContentNew"));
const BlackberryShowreelContent = lazy(() => import("./BlackberryShowreelContent"));
const BlackberryFavouritesContent = lazy(() => import("./BlackberryFavouritesContent"));
const BlackberryGamesContent = lazy(() => import("./BlackberryGamesContent"));
const BlackberryWebContent = lazy(() => import("./BlackberryWebContent"));

// Accent colour (global)
const ACCENT = "var(--accent)";
export const __ACCENT = ACCENT;

// BlackBerry OS5 Emulator → Portfolio Shell
// - Bold-style homescreen (bottom dock overlay) + menu grid
// - Hardware row (L→R): Call • Menu • Trackpad (paused) • Back • Power
// - Power truly turns the device OFF (blacks out screen; hardware row remains; non‑power buttons disabled)
// - Trackpad functionality is PAUSED by request (placeholder only)
// - Menu items wired to portfolio routes (adjust paths if needed)
// - Entire device (screen + hardware) scales responsively to the window

// =====================
// ResponsiveStage, Helper Components now imported from BlackberryUIComponents and BlackberryIcons
// =====================

// =====================
// Root Component
// =====================
export default function BlackberryOS5Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [settings] = useSettings();

  // Get current accent color (changes trigger re-render)
  const accentColor = settings.accentColor;

  // Screen state
  const [mode, setMode] = useState<"home" | "menu">("home");
  const [selectedMenu, setSelectedMenu] = useState(0); // menu grid selection index
  const [selectedDock, setSelectedDock] = useState(0); // dock selection index
  const [openAppIndex, setOpenAppIndex] = useState<number | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [poweredOn, setPoweredOn] = useState(true);
  const [showPowerOnAnimation, setShowPowerOnAnimation] = useState(false);
  const [openApp, setOpenApp] = useState<string | null>(null); // Track which app is open
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false); // Keyboard shortcuts overlay
  const [isLocked, setIsLocked] = useState(false); // Lock screen state
  const [unlockSwipeProgress, setUnlockSwipeProgress] = useState(0); // 0-100
  const [konamiActive, setKonamiActive] = useState(false); // Easter egg state
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]); // Track key sequence

  // Boot sequence state — show once per device via localStorage
  const [showBoot, setShowBoot] = useState(false);

  // Time/UI state
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState<{ message: string; type?: "info" | "success" | "warning" | "error" } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Top bar state
  const [signalStrength, setSignalStrength] = useState(4);
  const [batteryLevel, setBatteryLevel] = useState(82);
  const [networkType, setNetworkType] = useState<"3G" | "4G" | "5G" | "WiFi">("3G");
  const [showBatteryTooltip, setShowBatteryTooltip] = useState(false);
  const [isCharging, setIsCharging] = useState(false);

  // Battery saver mode (auto-enables when battery < 20%)
  const isBatterySaverMode = batteryLevel < 20 && !isCharging;

  // Refs
  const screenRef = useRef<HTMLDivElement | null>(null);

  // Mount and clock tick
  useEffect(() => {
    setMounted(true);

    // Boot sequence: show once per device
    if (!localStorage.getItem('htm_booted')) {
      setShowBoot(true);
    }

    // Detect touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes to motion preference
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    const id = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(id);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // CRT power-on animation trigger
  const prevPoweredOn = useRef(poweredOn);
  useEffect(() => {
    if (!prevPoweredOn.current && poweredOn) {
      // Power just turned on
      setShowPowerOnAnimation(true);
      const timer = setTimeout(() => setShowPowerOnAnimation(false), 200);
      return () => clearTimeout(timer);
    }
    prevPoweredOn.current = poweredOn;
  }, [poweredOn]);

  // Easter egg: Konami code (↑ ↑ ↓ ↓ ← → ← → B A)
  useEffect(() => {
    const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

    const handleKonami = (e: KeyboardEvent) => {
      if (isLocked || showContext || showKeyboardHelp) return;

      const key = e.key;
      const newSequence = [...konamiSequence, key].slice(-10);
      setKonamiSequence(newSequence);

      // Check if sequence matches
      const matches = konamiCode.every((code, i) => newSequence[i] === code);
      if (matches) {
        setKonamiActive(true);
        setKonamiSequence([]);

        // Trigger confetti using dynamic import
        if (typeof window !== "undefined") {
          import("canvas-confetti").then((confetti) => {
            const duration = 3000;
            const end = Date.now() + duration;

            const colors = ["var(--accent)", "var(--accent-hover)", "#FFC266", "#FFD699"];

            // HTM logo shape for confetti (simple square representing the logo icon)
            const htmShape = confetti.default.shapeFromPath({
              path: 'M0 0 L10 0 L10 10 L0 10 Z'
            });

            (function frame() {
              // Regular confetti from sides
              confetti.default({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: colors
              });
              confetti.default({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors: colors
              });

              // HTM brand confetti from center (less frequent for subtlety)
              if (Math.random() > 0.6) {
                confetti.default({
                  particleCount: 1,
                  angle: 90,
                  spread: 80,
                  origin: { x: 0.5, y: 0.4 },
                  colors: ["#F7A835"],
                  shapes: [htmShape],
                  scalar: 1.5,
                  gravity: 0.6,
                  drift: 0
                });
              }

              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            })();
          });
        }

        // Reset after 5 seconds
        setTimeout(() => setKonamiActive(false), 5000);
      }
    };

    window.addEventListener("keydown", handleKonami);
    return () => window.removeEventListener("keydown", handleKonami);
  }, [konamiSequence, isLocked, showContext, showKeyboardHelp]);

  // Simulate dynamic signal and network changes
  useEffect(() => {
    // Randomly fluctuate signal every 10-20 seconds
    const signalInterval = setInterval(() => {
      const change = Math.random();
      if (change > 0.7) {
        setSignalStrength(prev => Math.max(1, Math.min(4, prev + (Math.random() > 0.5 ? 1 : -1))));
      }
    }, 15000);

    // Battery simulation: drain until dead, power off, charge, power back on
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => {
        if (prev <= 0) {
          // Battery dead - power off and start charging
          setPoweredOn(false);
          setIsCharging(true);
          return 1;
        } else if (!poweredOn && prev < 10) {
          // Charging while off - continue charging until 10%
          return Math.min(10, prev + 1);
        } else if (!poweredOn && prev >= 10) {
          // Charged enough - power back on
          setPoweredOn(true);
          return prev;
        } else if (prev <= 20 && poweredOn) {
          // Low battery - start charging
          setIsCharging(true);
          return Math.min(100, prev + 1);
        } else if (prev >= 95) {
          // Full battery - start draining
          setIsCharging(false);
          return Math.max(0, prev - 1);
        } else {
          // Normal charge/drain cycle
          return isCharging ? Math.min(100, prev + 1) : Math.max(0, prev - 1);
        }
      });
    }, 30000); // 30 seconds for realistic battery simulation

    // Occasionally cycle network types
    const networkInterval = setInterval(() => {
      const types: Array<"3G" | "4G" | "5G" | "WiFi"> = ["3G", "4G", "5G", "WiFi"];
      const current = types.indexOf(networkType);
      const next = types[(current + 1) % types.length];
      setNetworkType(next);
    }, 30000);

    return () => {
      clearInterval(signalInterval);
      clearInterval(batteryInterval);
      clearInterval(networkInterval);
    };
  }, [networkType, isCharging, poweredOn]);

  // Apps (portfolio routes) - mapping to existing HTM routes
  type App = { name: string; icon: React.ReactNode; path?: string; external?: boolean };
  const apps: App[] = useMemo(
    () => [
      { name: "About", icon: <BBIcon name="info" variant="solid" size={48} />, path: "/about" },
      { name: "Work", icon: <BBIcon name="folder" variant="solid" size={48} />, path: "/portfolio" },
      { name: "Clients", icon: <BBIcon name="users" variant="solid" size={48} />, path: "/clients" },
      { name: "Favourites", icon: <BBIcon name="heart" variant="solid" size={48} />, path: "/favourites" },
      { name: "Showreel", icon: <BBIcon name="video" variant="solid" size={48} />, path: "/showreel" },
      { name: "Settings", icon: <BBIcon name="settings" variant="solid" size={48} />, path: "/settings" },
      { name: "Donate", icon: <BBIcon name="heart" variant="solid" size={48} color="accent" />, path: "/contact" },
      { name: "Wormhole", icon: <BBIcon name="wormhole" variant="solid" size={48} color="accent" glow />, path: "/wormhole" },
      { name: "Contact", icon: <BBIcon name="mail" variant="solid" size={48} />, path: "/contact" },
      { name: "Message", icon: <BBIcon name="message" variant="solid" size={48} />, path: "/notes" },
      { name: "Games", icon: <BBIcon name="games" variant="solid" size={48} />, path: "/games" },
      { name: "Instagram", icon: <BBIcon name="instagram" variant="solid" size={48} />, path: "https://www.instagram.com/handtomouse.studio", external: true },
    ],
    []
  );

  // Bold-style dock overlay (pick 5 key entries)
  const dockNames = ["About", "Work", "Clients", "Contact", "Instagram"] as const;
  const dockApps = useMemo(
    () => dockNames.map((n) => apps.find((a) => a.name === n)!).filter(Boolean),
    [apps]
  );

  // Notification badges (hardcoded for demo - would come from real data)
  const notificationCounts: Record<string, number> = {
    "Contact": 1,
    "Message": 3,
  };

  // Derived
  const COLUMNS = 3;
  const rows = Math.ceil(apps.length / COLUMNS);

  // Navigation - open apps inside BB device
  const navigateTo = (app: App) => {
    if (app.external) {
      window.open(app.path, "_blank");
      return;
    }

    // Map app names to internal app identifiers
    const appMap: Record<string, string> = {
      "Work": "portfolio",
      "Clients": "clients",
      "Message": "message",
      "About": "about",
      "Settings": "settings",
      "Contact": "contact",
      "Showreel": "showreel",
      "Favourites": "favourites",
      "Games": "games",
      "Wormhole": "wormhole",
      "Donate": "donate"
    };

    const appId = appMap[app.name];
    if (appId) {
      setOpenApp(appId);
      setMode("home");
    } else {
      setOpenAppIndex(apps.findIndex((a) => a.name === app.name));
    }
  };

  const openSelected = () => {
    if (!poweredOn) return;
    if (mode === "home") {
      const app = dockApps[selectedDock];
      if (app) navigateTo(app);
    } else {
      const app = apps[selectedMenu];
      if (app) navigateTo(app);
    }
  };
  const goHome = () => {
    if (!poweredOn) return;
    setShowContext(false);
    setOpenAppIndex(null);
    setOpenApp(null); // Close any open app
    setMode("home");
  };
  const goMenu = () => {
    if (!poweredOn) return;
    setShowContext(false);
    setOpenAppIndex(null);
    setOpenApp(null); // Close any open app
    // Toggle between menu and home
    setMode((prev) => (prev === "menu" ? "home" : "menu"));
  };
  const goBack = () => {
    if (!poweredOn) return;
    // Priority: close app > close fallback modal > close context > return to home from menu
    if (openApp !== null) {
      setOpenApp(null); // Close current app
      return;
    }
    if (openAppIndex !== null) {
      setOpenAppIndex(null);
      return;
    }
    if (showContext) {
      setShowContext(false);
      return;
    }
    if (mode === "menu") {
      setMode("home");
      return;
    }
  };
  const togglePower = () => {
    setPoweredOn((p) => !p);
    setShowContext(false);
    setOpenAppIndex(null);
    setOpenApp(null); // Close any open app
    setToast(null);
  };

  // Stable callback for boot sequence — must not change on re-render (clock ticks every second)
  const handleBootComplete = useCallback(() => {
    setShowBoot(false);
    localStorage.setItem('htm_booted', '1');
  }, []);

  // Auto-lock after inactivity (2 minutes)
  useEffect(() => {
    let lockTimer: NodeJS.Timeout;
    const resetLockTimer = () => {
      clearTimeout(lockTimer);
      if (poweredOn && !isLocked) {
        lockTimer = setTimeout(() => {
          setIsLocked(true);
        }, 120000); // 2 minutes
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", resetLockTimer);
      window.addEventListener("keydown", resetLockTimer);
      window.addEventListener("touchstart", resetLockTimer);
      resetLockTimer();

      return () => {
        clearTimeout(lockTimer);
        window.removeEventListener("mousemove", resetLockTimer);
        window.removeEventListener("keydown", resetLockTimer);
        window.removeEventListener("touchstart", resetLockTimer);
      };
    }
  }, [poweredOn, isLocked]);

  // Keyboard navigation (disabled when OFF)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Check if user is typing in an input field FIRST: the ?/Shift+L
      // shortcuts below must never swallow characters typed into forms
      const activeEl = document.activeElement as HTMLElement;
      const isTyping = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA" || activeEl?.tagName === "SELECT" || activeEl?.isContentEditable;

      // Keyboard help overlay
      if (e.key === "?" && poweredOn && !isLocked && !isTyping) {
        setShowKeyboardHelp(prev => !prev);
        e.preventDefault();
        return;
      }

      // Close keyboard help
      if (showKeyboardHelp && e.key === "Escape") {
        setShowKeyboardHelp(false);
        e.preventDefault();
        return;
      }

      // Lock screen - unlock with L key
      if (isLocked) {
        if (e.key.toLowerCase() === "l") {
          setIsLocked(false);
          e.preventDefault();
        }
        return;
      }

      if (!poweredOn) {
        if (e.key.toLowerCase() === "p") togglePower();
        return;
      }

      // Lock with L key
      if (e.key.toLowerCase() === "l" && e.shiftKey && !isTyping) {
        setIsLocked(true);
        e.preventDefault();
        return;
      }

      // If an app is open, ESC/Backspace closes it (unless typing)
      if (openApp !== null) {
        if (["Escape", "Backspace"].includes(e.key)) {
          if (!isTyping || e.key === "Escape") {
            setOpenApp(null);
            e.preventDefault();
          }
        }
        return;
      }
      if (openAppIndex !== null) {
        if (["Escape", "Backspace"].includes(e.key)) {
          if (!isTyping || e.key === "Escape") {
            setOpenAppIndex(null);
            e.preventDefault();
          }
        }
        return;
      }
      if (showContext) {
        if (["Escape", "Backspace"].includes(e.key)) {
          setShowContext(false);
          e.preventDefault();
        }
        return;
      }

      if (mode === "home") {
        if (e.key === "ArrowRight") {
          setSelectedDock((d) => Math.min(dockApps.length - 1, d + 1));
          e.preventDefault();
        }
        if (e.key === "ArrowLeft") {
          setSelectedDock((d) => Math.max(0, d - 1));
          e.preventDefault();
        }
        if (e.key === "Enter" || e.key === " ") {
          openSelected();
          e.preventDefault();
        }
        if (e.key === "ArrowUp" || e.key.toLowerCase() === "m") {
          goMenu();
          e.preventDefault();
        }
        if (e.key.toLowerCase() === "h") {
          goHome();
          e.preventDefault();
        }
        return;
      }

      // Menu grid
      const col = selectedMenu % COLUMNS;
      const row = Math.floor(selectedMenu / COLUMNS);
      const move = (dx: number, dy: number) => {
        let newRow = Math.max(0, Math.min(rows - 1, row + dy));
        let newCol = Math.max(0, Math.min(COLUMNS - 1, col + dx));
        let idx = newRow * COLUMNS + newCol;
        if (idx >= apps.length) idx = apps.length - 1;
        setSelectedMenu(idx);
      };
      if (e.key === "ArrowRight") {
        move(1, 0);
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") {
        move(-1, 0);
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        move(0, 1);
        e.preventDefault();
      }
      if (e.key === "ArrowUp") {
        move(0, -1);
        e.preventDefault();
      }
      if (e.key === "Enter" || e.key === " ") {
        openSelected();
        e.preventDefault();
      }
      if (e.key === "Escape" || e.key === "Backspace") {
        if (!isTyping || e.key === "Escape") {
          setMode("home");
          e.preventDefault();
        }
      }
      if (e.key.toLowerCase() === "m") {
        setShowContext(true);
        e.preventDefault();
      }
      if (e.key.toLowerCase() === "h") {
        goHome();
        e.preventDefault();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [poweredOn, openApp, openAppIndex, showContext, mode, selectedMenu, rows, COLUMNS, apps.length, dockApps.length, showKeyboardHelp, isLocked]);

  // Time strings (only render on client to avoid hydration mismatch)
  const timeStr = mounted
    ? now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: settings.timeFormat === "12hr"
      })
    : "--:--";
  const dateStr = mounted ? now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) : "Loading...";

  // Dynamic wallpaper colors based on time of day
  const getWallpaperColors = () => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 8) {
      // Dawn: purple and pink
      return {
        primary: "rgba(120, 50, 150, 0.85)",
        secondary: "rgba(255, 100, 150, 0.4)"
      };
    } else if (hour >= 8 && hour < 12) {
      // Morning: bright blue
      return {
        primary: "rgba(9, 20, 40, 0.85)",
        secondary: "rgba(0, 180, 255, 0.25)"
      };
    } else if (hour >= 12 && hour < 17) {
      // Afternoon: warm blue
      return {
        primary: "rgba(20, 40, 80, 0.85)",
        secondary: "rgba(100, 200, 255, 0.2)"
      };
    } else if (hour >= 17 && hour < 20) {
      // Evening: orange and purple
      return {
        primary: "rgba(40, 20, 60, 0.9)",
        secondary: "rgba(255, 140, 0, 0.3)"
      };
    } else {
      // Night: deep blue
      return {
        primary: "rgba(5, 10, 25, 0.95)",
        secondary: "rgba(0, 80, 180, 0.15)"
      };
    }
  };

  const wallpaperColors = getWallpaperColors();

  // =====================
  // Render
  // =====================
  return (
    <ResponsiveStage margin={24}>
      {/* Device body */}
      <div
        className="relative w-screen h-[100dvh] rounded-none shadow-2xl ring-1 ring-white/10 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(180%_120% at 50% -20%, #0a1220 10%, #000 70%), linear-gradient(180deg, rgba(255,255,255,0.06), transparent)",
        }}
      >
        {/* Top bezel */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between text-white/60 text-[11px]">
          <div className={`h-1.5 w-16 rounded-none ${poweredOn ? "bg-white/10" : "bg-transparent"}`} />
          <div
            className={`h-2 w-2 rounded-none ${poweredOn ? "bg-[#F7A835] shadow-[0_0_12px_3px_rgba(247, 168, 53,0.8)] animate-pulse" : "bg-transparent"}`}
            title="Notification LED"
          />
        </div>

        {/* Screen */}
        <div ref={screenRef} className="mx-8 rounded-none overflow-hidden ring-1 ring-white/15 relative h-[calc(100dvh-180px)]">
          {/* Wallpaper with static effect - time-based colors */}
          <div
            className="absolute inset-0 transition-colors duration-[3000ms]"
            style={{
              backgroundImage: `radial-gradient(150%_120% at 50% 20%, ${wallpaperColors.primary}, rgba(0,0,0,0.95)),
                               linear-gradient(135deg, ${wallpaperColors.secondary}, rgba(0,0,0,0) 60%),
                               repeating-linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px)`,
            }}
          />
          {/* Moving static overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
              animation: "staticMove 8s linear infinite"
            }}
          />
          {/* NEON CITY CANVAS - 3D Wireframe Maze - Blur when menu/app open */}
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              filter: (mode === "menu" || openApp !== null) ? "blur(8px)" : "blur(0px)",
              opacity: (mode === "menu" || openApp !== null) ? 0.3 : 1,
              willChange: "filter, opacity"
            }}
          >
            <NeonCity />
          </div>

          {/* Radial Pulse - Center outward */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(247, 168, 53, 0.6) 0%, transparent 50%)",
              animation: "radialPulse 3s ease-out infinite"
            }}
          />
          <style>{`
            @keyframes staticMove {
              0% { transform: translate(0, 0); }
              25% { transform: translate(-5%, -5%); }
              50% { transform: translate(-10%, 0); }
              75% { transform: translate(-5%, 5%); }
              100% { transform: translate(0, 0); }
            }

            /* NEON SCAN */
            @keyframes neonScan {
              0% {
                transform: translateY(-100%);
              }
              100% {
                transform: translateY(100%);
              }
            }

            /* RADIAL PULSE */
            @keyframes radialPulse {
              0% {
                transform: scale(0.8);
                opacity: 0;
              }
              50% {
                transform: scale(1.5);
                opacity: 0.08;
              }
              100% {
                transform: scale(2.5);
                opacity: 0;
              }
            }
          `}</style>

          {/* Status bar - BlackBerry OS style */}
          {poweredOn && (
            <div className="relative z-10 flex items-center justify-between text-[20px] text-[#E0E0E0] px-8 py-4 bg-[#000000] border-b border-white/10" style={{ fontFamily: 'var(--font-source-code)' }}>
              {/* Left: Sound + Signal */}
              <div className="flex items-center gap-4">
                <VolumeIcon />
                <SignalBars strength={signalStrength as 0 | 1 | 2 | 3 | 4} />
              </div>

              {/* Center: Wordmark on homescreen, App+Time otherwise */}
              {(openApp !== null || mode === "menu" || pathname !== '/') ? (
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-[16px] sm:text-[18px] md:text-[20px] overflow-hidden">
                  <img src="/logos/HTM-LOGO-ICON-01.svg" alt="HTM" className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" style={{ imageRendering: 'pixelated' }} />
                  {openApp !== null && (
                    <>
                      <span className="font-extrabold text-[var(--accent)] truncate max-w-[80px] sm:max-w-[120px] md:max-w-none" style={{ fontFamily: 'var(--font-source-code)' }}>
                        {apps.find(a => a.path?.includes(openApp))?.name || openApp.toUpperCase()}
                      </span>
                      <span className="text-[#E0E0E0]/30">•</span>
                    </>
                  )}
                  <span className="font-bold" style={{ fontFamily: 'var(--font-source-code)' }}>{timeStr}</span>
                  <span className="hidden md:inline text-[#E0E0E0]/50 font-light truncate" style={{ fontFamily: 'var(--font-source-code)' }}>{dateStr}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ paddingLeft: '40px' }}>
                  <img
                    src="/logos/HTM-LOGOS-FULLWORDMARK-small.svg?v=5"
                    alt="HandToMouse"
                    width="160"
                    height="32"
                    className="opacity-80"
                    style={{
                      height: '32px',
                      width: 'auto',
                      maxWidth: '160px',
                      objectFit: "contain",
                      imageRendering: 'pixelated',
                    }}
                  />
                </div>
              )}

              {/* Right: Network + Battery */}
              <div className="flex items-center gap-4">
                <div className="border border-[#E0E0E0] px-2 py-1 bg-transparent min-w-[32px] sm:min-w-[40px] md:min-w-[48px] flex items-center justify-center flex-shrink-0" style={{ imageRendering: 'pixelated' }}>
                  <span className="font-heading text-[12px] sm:text-[14px] md:text-[16px] font-black text-[#E0E0E0] whitespace-nowrap" style={{ fontFamily: 'var(--font-source-code)' }}>{networkType}</span>
                </div>
                <div
                  className="relative"
                  onMouseEnter={() => setShowBatteryTooltip(true)}
                  onMouseLeave={() => setShowBatteryTooltip(false)}
                >
                  <Battery level={batteryLevel} charging={isCharging} />
                  {showBatteryTooltip && (
                    <div className="absolute -bottom-7 right-0 bg-black/95 text-white text-[18px] px-4 py-2 rounded-sm whitespace-nowrap z-50 border border-white/20 shadow-lg" style={{ fontFamily: 'var(--font-source-code)' }}>
                      {batteryLevel}% {isCharging && "⚡ Charging"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Time Display - BlackBerry OS style (only on homepage) */}
          {poweredOn && mode === "home" && openApp === null && pathname === '/' && (
            <div className="relative z-10 w-full text-white text-center bg-gradient-to-b from-transparent via-black/10 to-transparent">
              {/* Time and Date - Compact */}
              <div className="px-4 py-8 md:py-10">
                {/* Large centered time */}
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight mb-1 animate-[fadeIn_0.5s_ease-in-out]" style={{
                  fontFamily: 'var(--font-source-code)',
                  textShadow: "0 2px 12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(247, 168, 53, 0.1)"
                }}>
                  {timeStr}
                </div>
                {/* Date below */}
                <div className="text-xs mt-2 opacity-80 tracking-wide font-light" style={{ fontFamily: 'var(--font-source-code)' }}>{dateStr}</div>
                {/* Notifications indicator */}
                {mounted && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-white/50 font-extralight" style={{ fontFamily: 'var(--font-source-code)' }}>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                      <span>No notifications</span>
                    </div>
                  </div>
                )}
                {/* Ambient identity copy — owner info line */}
                <div
                  className="mt-5 text-[11px] tracking-wide text-center"
                  style={{ fontFamily: 'var(--font-source-code)', color: '#4A4A4A' }}
                >
                  Independent creative direction. Sydney.
                </div>
              </div>
            </div>
          )}

          {/* Main area */}
          <AnimatePresence mode="wait">
            {openApp !== null ? (
              // App is open - render content inside BB screen
              <main role="main" key="app-content">
                <AppContent appId={openApp} prefersReducedMotion={prefersReducedMotion} />
              </main>
            ) : mode === "home" ? (
              <HomeDockOverlay
                key="home-dock"
                apps={apps}
                dockApps={dockApps}
                selectedDock={selectedDock}
                setSelectedDock={setSelectedDock}
                navigateTo={navigateTo}
                goMenu={goMenu}
                isTouchDevice={isTouchDevice}
                notificationCounts={notificationCounts}
              />
            ) : (
              <MenuGrid
                key="menu-grid"
                apps={apps}
                selected={selectedMenu}
                setSelected={setSelectedMenu}
                navigateTo={navigateTo}
                setShowContext={setShowContext}
              />
            )}
          </AnimatePresence>


          {/* LOCK SCREEN */}
          {isLocked && poweredOn && (
            <div
              className="absolute inset-0 bg-black/95 backdrop-blur-lg grid place-items-center"
              aria-label="Device locked"
              onTouchStart={(e) => {
                const startY = e.touches[0].clientY;
                let rafId: number;

                const handleTouchMove = (moveEvent: TouchEvent) => {
                  cancelAnimationFrame(rafId);
                  rafId = requestAnimationFrame(() => {
                    const currentY = moveEvent.touches[0].clientY;
                    const distance = startY - currentY;
                    const progress = Math.min(100, Math.max(0, (distance / 100) * 100));
                    setUnlockSwipeProgress(progress);

                    if (distance > 100) {
                      setIsLocked(false);
                      setUnlockSwipeProgress(0);
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    }
                  });
                };

                const handleTouchEnd = () => {
                  cancelAnimationFrame(rafId);
                  setUnlockSwipeProgress(0);
                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };

                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd);
              }}
            >
              <div className="text-center px-6">
                <div className="mb-4 flex justify-center">
                  <img
                    src="/logos/HTM-LOGO-ICON-01.svg"
                    alt="Locked"
                    className="h-16 w-16 opacity-60 animate-pulse"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(247, 168, 53, 0.4))' }}
                  />
                </div>
                <div className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-source-code)' }}>{timeStr}</div>
                <div className="text-sm text-white/60 mb-6 font-light" style={{ fontFamily: 'var(--font-source-code)' }}>{dateStr}</div>
                <div className="text-xs text-white/40 mt-8 flex flex-col gap-2" style={{ fontFamily: 'var(--font-source-code)' }}>
                  <div className="animate-pulse">Swipe up to unlock</div>
                  <div className="opacity-60">Press L to unlock</div>
                </div>
              </div>

              {/* Swipe progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[var(--accent)]/60 via-[var(--accent)] to-[var(--accent)]/60 transition-all duration-100"
                  style={{
                    width: `${unlockSwipeProgress}%`,
                    boxShadow: unlockSwipeProgress > 0 ? '0 0 12px rgba(247, 168, 53, 0.6)' : 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* POWER OFF OVERLAY (full screen OFF) */}
          {!poweredOn && (
            <div className="absolute inset-0 bg-black grid place-items-center" aria-label="Device off">
              <div className="uppercase tracking-[0.2em] text-xs sm:text-sm" style={{ color: ACCENT, fontFamily: 'var(--font-source-code)' }}>System Off</div>
            </div>
          )}

          {/* CRT POWER-ON ANIMATION */}
          {showPowerOnAnimation && !prefersReducedMotion && (
            <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
              <motion.div
                initial={{ scaleY: 0, scaleX: 1 }}
                animate={{ scaleY: 1, scaleX: 1 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute inset-0 bg-black"
                style={{
                  transformOrigin: "center",
                  boxShadow: "inset 0 0 100px 20px rgba(247, 168, 53, 0.3)"
                }}
              />
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, transparent 0%, rgba(247, 168, 53, 0.2) 48%, rgba(247, 168, 53, 0.3) 50%, rgba(247, 168, 53, 0.2) 52%, transparent 100%)"
                }}
              />
            </div>
          )}

          {/* BB BOOT SEQUENCE — first-visit only */}
          {showBoot && (
            <BBBootSequence
              onComplete={handleBootComplete}
            />
          )}

          {/* BATTERY SAVER MODE OVERLAY */}
          {isBatterySaverMode && poweredOn && (
            <div className="absolute inset-0 bg-black/30 pointer-events-none z-40">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-900/80 border border-yellow-600/60 px-4 py-2 rounded-sm backdrop-blur-sm">
                <div className="flex items-center gap-2 text-yellow-200 text-xs font-mono">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span>Battery Saver Mode ({batteryLevel}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gap between screen and hardware */}
        <div className="h-6" />

        {/* Hardware row (Call • Menu • Trackpad(paused) • Back • Power) */}
        <div
          className="px-8 pt-5 pb-7"
          style={{
            background: "linear-gradient(180deg, rgba(12,12,12,0.85) 0%, rgba(8,8,8,0.95) 50%, rgba(4,4,4,0.98) 100%)",
            boxShadow: "inset 0 3px 10px rgba(0,0,0,0.7), 0 -1px 0 rgba(247, 168, 53,0.2), inset 0 0 40px rgba(0,0,0,0.4)",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
          }}
        >
          <div className="w-full flex items-stretch justify-between text-white">
            <HwButton label="Call" onClick={() => navigateTo(apps.find(a => a.name === "Contact")!)} disabled={!poweredOn}>
              <PixelCallIcon />
            </HwButton>
            <HwButton label="Menu" onClick={goMenu} disabled={!poweredOn}>
              <PixelMenuIcon />
            </HwButton>
            {/* Trackpad */}
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0 group/trackpad">
              <div
                className="flex items-center justify-center w-full h-[88px] sm:h-[104px] rounded-none border-2 backdrop-blur-sm transition-all duration-300 ease-out"
                style={{
                  background: "linear-gradient(145deg, #141414 0%, #0f0f0f 25%, #0a0a0a 50%, #060606 75%, #000000 100%)",
                  borderColor: poweredOn ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.25)",
                  boxShadow: poweredOn
                    ? "3px 3px 8px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.08), inset 0 0 8px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(247, 168, 53,0.1)"
                    : "3px 3px 6px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.05), inset 0 0 6px rgba(0,0,0,0.8)",
                  padding: "0",
                }}
              >
                <div className="scale-75 sm:scale-100 transition-transform">
                  <BBTrackpad size={80} disabled={!poweredOn} />
                </div>
              </div>
              <div
                className="text-[13px] leading-none opacity-85 mt-1 font-extrabold transition-all duration-300"
                style={{
                  fontFamily: 'var(--font-source-code)',
                  letterSpacing: "0.02em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)"
                }}
              >
                Trackpad
              </div>
            </div>
            <HwButton label="Back" onClick={goBack} disabled={!poweredOn}>
              <PixelBackIcon />
            </HwButton>
            <HwButton label="Power" onClick={togglePower} className={!poweredOn ? "animate-pulse" : ""} data-brand-sound="power-on">
              <PixelPowerIcon />
            </HwButton>
          </div>
        </div>
      </div>

      {/* Context menu */}
      {showContext && openAppIndex === null && poweredOn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-start p-4">
          <div className="w-48 rounded-none border border-white/15 bg-black/80 text-white shadow-xl overflow-hidden">
            <div className="px-3 py-2 text-[14px] font-bold border-b border-white/10 text-blue-400">Menu</div>
            <ul className="text-[14px] divide-y divide-white/10">
              {[
                { label: "Open", action: () => openSelected() },
                { label: "Go Home", action: () => goHome() },
                { label: "Settings", action: () => navigateTo(apps.find((a) => a.name === "Settings")!) },
              ].map((item) => (
                <li key={item.label}>
                  <button className="w-full text-left px-3 py-2 hover:bg-white/10" onClick={() => { item.action(); setShowContext(false); }}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-3 py-2 text-[10px] text-white/40 border-t border-white/10 text-center font-mono">
              Made in Sydney by HTM
            </div>
          </div>
        </div>
      )}

      {/* App window (fallback if no path) */}
      {openAppIndex !== null && poweredOn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-none border border-white/15 bg-black/85 text-white shadow-2xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-[14px]">
              <div className="flex items-center gap-2">
                <AppGlyph name={apps[openAppIndex].name} />
                <span className="font-semibold">{apps[openAppIndex].name}</span>
              </div>
              <button className="opacity-70 hover:opacity-100" onClick={() => setOpenAppIndex(null)}>
                ✕
              </button>
            </div>
            <div className="p-4 text-[13px] leading-relaxed text-white/90">
              <p className="mb-3">No route configured for <span className="font-semibold">{apps[openAppIndex].name}</span>. Replace with a page or handler.</p>
              <button className="mt-2 px-3 py-1.5 rounded-none bg-white/10 hover:bg-white/20 border border-white/15" onClick={() => setOpenAppIndex(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Overlay */}
      {showKeyboardHelp && poweredOn && !isLocked && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setShowKeyboardHelp(false)}>
          <div className="w-full max-w-md rounded-sm border border-white/20 bg-black/90 text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-2">
                <span className="text-lg">⌨️</span>
                <span className="font-mono text-sm uppercase font-extrabold">Keyboard Shortcuts</span>
              </div>
              <button className="opacity-70 hover:opacity-100 text-lg" onClick={() => setShowKeyboardHelp(false)}>✕</button>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {[
                { keys: "Arrow Keys", desc: "Navigate apps/icons" },
                { keys: "Enter / Space", desc: "Open selected app" },
                { keys: "Escape / Backspace", desc: "Go back / Close app" },
                { keys: "M", desc: "Open menu" },
                { keys: "H", desc: "Go to home screen" },
                { keys: "P", desc: "Power on/off" },
                { keys: "Shift + L", desc: "Lock screen" },
                { keys: "L", desc: "Unlock screen" },
                { keys: "?", desc: "Show/hide this help" },
              ].map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="font-mono text-xs font-semibold" style={{ color: ACCENT }}>{shortcut.keys}</span>
                  <span className="text-xs text-white/70">{shortcut.desc}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-white/10 bg-gradient-to-t from-white/5 to-transparent">
              <div className="text-[10px] text-white/40 text-center">Press ? or Esc to close</div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: -100, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4"
          >
            <div className="bg-black/95 border border-white/20 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 p-4">
                {/* Icon based on type */}
                <div className="flex-shrink-0">
                  {toast.type === "success" && (
                    <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                      <span className="text-green-400 text-sm">✓</span>
                    </div>
                  )}
                  {toast.type === "error" && (
                    <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                      <span className="text-red-400 text-sm">✕</span>
                    </div>
                  )}
                  {toast.type === "warning" && (
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                      <span className="text-yellow-400 text-sm">!</span>
                    </div>
                  )}
                  {(!toast.type || toast.type === "info") && (
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center">
                      <span className="text-[var(--accent)] text-sm">i</span>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="flex-1 text-white text-[13px] font-mono leading-relaxed">
                  {toast.message}
                </div>

                {/* Close button */}
                <button
                  onClick={() => setToast(null)}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors duration-200"
                  aria-label="Dismiss notification"
                >
                  <div className="relative w-3 h-3">
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 rotate-45" />
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 -rotate-45" />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ResponsiveStage>
  );
}

// =====================
// Subcomponents
// =====================

// BBBootSequence — first-visit startup animation (one-time, tracked via localStorage)
function BBBootSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = React.useState<"black" | "logo" | "bar" | "ready" | "done">("black");
  const [barWidth, setBarWidth] = React.useState(0);

  React.useEffect(() => {
    // black (0.3s) → logo (0.5s) → bar (0.8s) → ready (0.4s) → done (0.5s)
    const t1 = setTimeout(() => setPhase("logo"), 300);
    const t2 = setTimeout(() => { setPhase("bar"); setBarWidth(0); }, 800);
    const t3 = setTimeout(() => setBarWidth(100), 850); // start bar fill immediately after phase change
    const t4 = setTimeout(() => setPhase("ready"), 1600);
    const t5 = setTimeout(() => setPhase("done"), 2000);
    const t6 = setTimeout(() => onComplete(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50"
          style={{ fontFamily: 'var(--font-source-code)' }}
        >
          {/* BB logo flash */}
          <AnimatePresence>
            {(phase === "logo" || phase === "bar" || phase === "ready") && (
              <motion.div
                key="boot-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-8"
              >
                <div
                  className="text-2xl font-bold tracking-[0.25em] uppercase"
                  style={{ color: '#F7A835', fontFamily: "'argent-pixel-cf', var(--font-source-code)" }}
                >
                  HANDTOMOUSE
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading bar */}
          <AnimatePresence>
            {(phase === "bar" || phase === "ready") && (
              <motion.div
                key="boot-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="w-48 h-[3px] bg-white/10 relative overflow-hidden"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[#F7A835] transition-all"
                  style={{ width: `${barWidth}%`, transitionDuration: '800ms', transitionTimingFunction: 'linear' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* System ready text */}
          <AnimatePresence>
            {phase === "ready" && (
              <motion.div
                key="boot-ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-6 text-[11px] tracking-[0.3em] uppercase"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                SYSTEM READY
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// AppContent - renders page content inside BB screen
function AppContent({ appId, prefersReducedMotion = false }: { appId: string; prefersReducedMotion?: boolean }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFadeIn(false);

    // Trigger fade-in after a brief delay
    const fadeTimer = setTimeout(() => setFadeIn(true), 50);

    // Load data for portfolio, clients, services, notes, about
    if (appId === "portfolio") {
      fetch("/data/projects.json")
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        });
    } else if (appId === "clients") {
      fetch("/data/clients.json")
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        });
    } else if (appId === "notes") {
      fetch("/data/posts.json")
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        });
    } else if (appId === "about") {
      fetch("/data/about.json")
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => clearTimeout(fadeTimer);
  }, [appId]);

  // Scrollable container that fills the BB screen (below status bar, above hints)
  // Wormhole gets full screen (no status bar, no bottom padding)
  const isFullscreen = appId === "wormhole";
  return (
    <motion.div
      key={appId}
      role="dialog"
      aria-modal="true"
      aria-label={`${appId} app`}
      initial={prefersReducedMotion ? { opacity: 1 } : { x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%", opacity: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 200 }}
      className={`scrollable-content absolute left-0 right-0 ${isFullscreen ? "top-0 bottom-0" : "top-[72px] bottom-[32px]"} overflow-y-auto ${isFullscreen ? "" : "bg-black/40 backdrop-blur-sm"} ${appId === "message" ? "flex flex-col" : ""}`}
    >
      <div className={appId === "wormhole" || appId === "about" || appId === "clients" || appId === "portfolio" || appId === "message" ? "h-full" : "p-4"}>
        {loading ? (
          <BBSkeletonCard />
        ) : appId === "portfolio" ? (
          <BlackberryPortfolioContent />
        ) : appId === "clients" ? (
          <BlackberryClientsContent />
        ) : appId === "notes" ? (
          <NotesContent posts={data} />
        ) : appId === "about" ? (
          <BlackberryAboutContent />
        ) : appId === "settings" ? (
          <Suspense fallback={<BBSkeletonCard />}>
            <BlackberrySettingsContentNew />
          </Suspense>
        ) : appId === "contact" ? (
          <Suspense fallback={<BBSkeletonCard />}>
            <BlackberryContactContent />
          </Suspense>
        ) : appId === "showreel" ? (
          <Suspense fallback={<BBSkeletonCard />}>
            <BlackberryShowreelContent />
          </Suspense>
        ) : appId === "favourites" ? (
          <Suspense fallback={<BBSkeletonCard />}>
            <BlackberryFavouritesContent />
          </Suspense>
        ) : appId === "games" ? (
          <Suspense fallback={<BBSkeletonCard />}>
            <BlackberryGamesContent />
          </Suspense>
        ) : appId === "wormhole" ? (
          <BlackberryWormholeContent />
        ) : appId === "web" ? (
          <Suspense fallback={<BBSkeletonCard />}>
            <BlackberryWebContent />
          </Suspense>
        ) : appId === "donate" ? (
          <BlackberryDonateContent />
        ) : appId === "message" ? (
          <BlackberryMessageContent />
        ) : (
          <PlaceholderContent title="Unknown App" />
        )}
      </div>
    </motion.div>
  );
}

// Content components for each app
function PortfolioContent({ projects }: { projects: any[] }) {
  const [filter, setFilter] = useState<string>("all");
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach((p: any) => p.tags?.forEach((t: string) => tags.add(t)));
    return ["all", ...Array.from(tags).sort()];
  }, [projects]);

  const filtered = filter === "all" ? projects : projects.filter((p: any) => p.tags?.includes(filter));

  return (
    <div>
      <h1 className="mb-3 font-mono text-2xl uppercase text-white">
        <span style={{ color: ACCENT }}>/</span> PORTFOLIO
      </h1>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`px-2 py-1 font-mono text-xs uppercase border ${
              filter === tag
                ? "bg-white/20 border-white/40 text-white"
                : "border-white/20 text-white/70 hover:border-white/40"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Projects */}
      <div className="space-y-3">
        {filtered.map((project: any) => (
          <div
            key={project.slug}
            className="border border-white/15 bg-white/5 p-3 hover:border-white/30 transition-all"
          >
            <h2 className="font-mono text-sm uppercase text-white mb-1">{project.title}</h2>
            <div className="text-xs text-white/60 mb-2">
              {project.client} • {project.year}
            </div>
            <div className="flex flex-wrap gap-1">
              {project.tags?.map((tag: string) => (
                <span key={tag} className="font-mono text-[10px] uppercase" style={{ color: ACCENT }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-8 text-center text-white/40 text-sm">No projects found</div>
      )}
    </div>
  );
}

function ClientsContent({ clients }: { clients: any[] }) {
  const featured = clients.filter((c: any) => c.featured);
  const others = clients.filter((c: any) => !c.featured);

  return (
    <div>
      <h1 className="mb-3 font-mono text-2xl uppercase text-white">
        <span style={{ color: ACCENT }}>/</span> CLIENTS
      </h1>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 font-mono text-sm uppercase text-white/60">Featured</h2>
          <div className="space-y-2">
            {featured.map((client: any) => (
              <div
                key={client.name}
                className="border border-white/15 bg-white/5 p-3 hover:border-white/30 transition-all"
              >
                <h3 className="font-mono text-sm uppercase text-white mb-1">{client.name}</h3>
                <div className="text-xs text-white/60 mb-1">{client.sector}</div>
                <div className="font-mono text-[10px]" style={{ color: ACCENT }}>
                  {client.projects} PROJECT{client.projects !== 1 ? "S" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Others */}
      {others.length > 0 && (
        <div>
          <h2 className="mb-3 font-mono text-sm uppercase text-white/60">All Clients</h2>
          <div className="space-y-2">
            {others.map((client: any) => (
              <div
                key={client.name}
                className="border border-white/15 bg-white/5 p-2 hover:border-white/30 transition-all"
              >
                <h3 className="font-mono text-xs uppercase text-white">{client.name}</h3>
                <div className="text-[10px] text-white/60">{client.sector}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotesContent({ posts }: { posts: any[] }) {
  return (
    <div>
      <h1 className="mb-3 font-mono text-2xl uppercase text-white">
        <span style={{ color: ACCENT }}>/</span> NOTES
      </h1>

      <div className="space-y-4">
        {posts.map((post: any) => (
          <article
            key={post.slug}
            className="border-b border-white/15 pb-4 last:border-0"
          >
            <h2 className="font-mono text-sm uppercase text-white mb-1 hover:opacity-80">
              {post.title}
            </h2>
            <div className="font-mono text-[10px] text-white/50 mb-2">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <p className="text-xs leading-relaxed text-white/70 mb-2">{post.excerpt}</p>
            <div className="flex flex-wrap gap-1">
              {post.tags?.map((tag: string) => (
                <span key={tag} className="font-mono text-[10px] uppercase" style={{ color: ACCENT }}>
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="py-8 text-center text-white/40 text-sm">No posts yet</div>
        )}
      </div>
    </div>
  );
}

function AboutContent() {
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const [showIdleOverlay, setShowIdleOverlay] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [emailPulsed, setEmailPulsed] = React.useState(false);

  const handleEmailClick = () => {
    navigator.clipboard.writeText('hello@handtomouse.com').then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    });
  };

  // 10s idle overlay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowIdleOverlay(true);
      setTimeout(() => setShowIdleOverlay(false), 2000);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll progress bar
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollableElement = document.querySelector('.scrollable-content');
      if (scrollableElement) {
        const scrollTop = scrollableElement.scrollTop;
        const scrollHeight = scrollableElement.scrollHeight - scrollableElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(progress);
      }
    };

    const scrollableElement = document.querySelector('.scrollable-content');
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
      return () => scrollableElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Email glow on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setEmailPulsed(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const beliefs = [
    "Culture rewards originality, not volume.",
    "Research is the opposite of guessing.",
    "Simplicity is the final stage of intelligence.",
    "The best work doesn't need an explanation.",
    "If it doesn't feel original, it isn't finished."
  ];

  return (
    <div className="relative w-full h-full" style={{ fontFamily: "var(--font-mono)" }}>
      {/* Scroll progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-[#1f1f1f] z-50">
        <div
          className="h-full bg-[var(--accent)] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Idle overlay */}
      {showIdleOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
          <div className="text-[var(--accent)] text-2xl font-bold animate-pulse" style={{ fontFamily: "var(--font-handjet)" }}>
            Thinking…
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_minmax(0,90%)_1fr] w-full h-full">
        <div></div>
        <div className="space-y-12 py-8 px-6 max-w-[90%] mx-auto shadow-[inset_0_0_20px_#000000] ring-1 ring-[#1f1f1f]">
          {/* Hero Header */}
          <header className="space-y-4 pb-8 border-b border-[#1f1f1f]">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/logos/HTM-LOGO-ICON-01.svg"
                alt="HandToMouse"
                className="h-8 w-8 opacity-80"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))' }}
              />
            </div>
            <h1 className="text-2xl font-semibold uppercase tracking-wide leading-tight text-[var(--accent)]" style={{ fontFamily: "var(--font-handjet)" }}>
              About
            </h1>
            <h2 className="text-xl font-bold leading-relaxed text-white max-w-prose">
              Everyone's chasing new — we chase <span style={{ color: ACCENT }}>different.</span>
            </h2>
            <p className="text-sm text-white/60 italic leading-relaxed max-w-prose">
              Independent creative direction and cultural strategy from Sydney.
            </p>
          </header>

        {/* Main Philosophy */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
            Philosophy
          </h3>
          <div className="space-y-6 text-sm leading-relaxed text-white/80 max-w-prose">
            <p>
              I work where ideas meet culture — finding the small, precise angle no one else has noticed yet.
            </p>
            <p>
              Anyone can make something that looks current; the work is making something that still feels right in five years.<br />
              That comes from research, reference, and restraint — knowing what to leave out, not just what to put in.
            </p>
            <p>
              I'm not interested in trends or templates. I'm interested in ideas with backbone — things that stick because they mean something.
            </p>
            <p className="italic text-white/60">
              Because sameness kills curiosity.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[#1f1f1f]"></div>

        {/* Quote */}
        <section className="py-6 text-center border-y border-[#1f1f1f]">
          <blockquote className="text-lg font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
            Good ideas don't shout.<br />
            They hum until everyone hears them.
          </blockquote>
        </section>

        {/* Philosophy Detail */}
        <section className="space-y-6 text-sm leading-relaxed text-white/80 max-w-prose">
          <p>
            The best creative work comes from paying attention — to language, to subcultures, to what people care about.
          </p>
          <p>
            Every project is a small act of anthropology: studying how something already lives in the world, then finding a smarter way to express it.
          </p>
          <div className="space-y-1 text-white/90">
            <p>No jargon.</p>
            <p>No decks that explain what should be obvious.</p>
            <p>Just thinking, timing, and taste.</p>
          </div>
        </section>

        {/* Contact Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — How I Work */}
          <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-sm p-4 flex flex-col space-y-3 shadow-[inset_0_0_12px_#000] hover:border-[var(--accent)] transition-colors relative group">
            {/* Status LED */}
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#333] group-hover:bg-[var(--accent)] transition-colors"></div>

            <header className="flex items-center space-x-2">
              <span className="text-[var(--accent)] text-lg">💡</span>
              <h3 className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold" style={{ fontFamily: "var(--font-handjet)" }}>
                How I Work
              </h3>
            </header>

            <div className="text-xs text-gray-300 leading-relaxed space-y-3">
              <div className="space-y-1">
                <p>Research deeply.</p>
                <p>Write clearly.</p>
                <p>Design like it matters.</p>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <p><strong>•</strong> Cultural strategy — finding the signal in the clutter.</p>
                <p><strong>•</strong> Concept development — building the idea everything else orbits.</p>
                <p><strong>•</strong> Creative direction — giving it form, tone, and presence.</p>
              </div>
            </div>
          </div>

          {/* Card 2 — Beliefs */}
          <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-sm p-4 flex flex-col space-y-3 shadow-[inset_0_0_12px_#000] hover:border-[var(--accent)] transition-colors relative group">
            {/* Status LED */}
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#333] group-hover:bg-[var(--accent)] transition-colors"></div>

            <header className="flex items-center space-x-2">
              <span className="text-[var(--accent)] text-lg">∴</span>
              <h3 className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold" style={{ fontFamily: "var(--font-handjet)" }}>
                Beliefs
              </h3>
            </header>

            <div className="text-xs text-gray-300 leading-relaxed space-y-2">
              {beliefs.map((belief, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-[var(--accent)] flex-shrink-0">∴</span>
                  <span>{belief}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Card 3 — Who With */}
          <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-sm p-4 flex flex-col space-y-3 shadow-[inset_0_0_12px_#000] hover:border-[var(--accent)] transition-colors relative group">
            {/* Status LED */}
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#333] group-hover:bg-[var(--accent)] transition-colors"></div>

            <header className="flex items-center space-x-2">
              <span className="text-[var(--accent)] text-lg">👥</span>
              <h3 className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold" style={{ fontFamily: "var(--font-handjet)" }}>
                Who With
              </h3>
            </header>

            <div className="text-xs text-gray-300 leading-relaxed space-y-2">
              <p><strong className="text-[var(--accent)]">S'WICH</strong> — turning Sydney sandwiches into iconography.</p>
              <p><strong className="text-[var(--accent)]">MapleMoon</strong> — making carob feel like mythology.</p>
              <p><strong className="text-[var(--accent)]">Jac+Jack</strong> — giving quiet luxury a language.</p>
              <p><strong className="text-[var(--accent)]">Aura Therapeutics</strong> — where wellness met weird.</p>
              <p className="text-white/60 italic pt-2">Independent. Idea-led. Occasionally obsessive.</p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[#1f1f1f]"></div>

        {/* Footer */}
        <footer className="space-y-4 text-sm text-white/70 max-w-prose">
          <div>
            <p className="font-bold text-white">HandToMouse / Nate Don</p>
            <p>Sydney, Australia</p>
          </div>
          <button
            onClick={handleEmailClick}
            className={`hover:opacity-80 transition-all duration-1000 cursor-pointer block ${
              !emailPulsed ? 'animate-pulse drop-shadow-[0_0_8px_rgba(247, 168, 53,0.6)]' : ''
            }`}
            style={{ color: ACCENT }}
          >
            {copiedEmail ? '✓ Copied!' : 'hello@handtomouse.com'}
          </button>
          <div className="space-y-1 text-white/60 text-xs italic pt-4">
            <p>Not "creative solutions." Just better ideas.</p>
            <p>Built for people who think before they brief.</p>
            <p className="text-white/40">(Updated Oct 2025)</p>
          </div>
        </footer>
      </div>
      <div></div>
    </div>
    </div>
  );
}

function PlaceholderContent({ title }: { title: string }) {
  return (
    <div>
      <h1 className="mb-3 font-mono text-2xl uppercase text-white">
        <span style={{ color: ACCENT }}>/</span> {title}
      </h1>
      <div className="border border-white/15 bg-white/5 p-4">
        <p className="text-sm text-white/70 leading-relaxed">
          This app is coming soon. Check back later for updates.
        </p>
      </div>
    </div>
  );
}

function HomeDockOverlay({
  apps,
  dockApps,
  selectedDock,
  setSelectedDock,
  navigateTo,
  goMenu,
  isTouchDevice,
  notificationCounts,
}: {
  apps: { name: string; icon: React.ReactNode; path?: string; external?: boolean }[];
  dockApps: { name: string; icon: React.ReactNode; path?: string; external?: boolean }[];
  selectedDock: number;
  setSelectedDock: React.Dispatch<React.SetStateAction<number>>;
  navigateTo: (app: { name: string; icon: React.ReactNode; path?: string; external?: boolean }) => void;
  goMenu: () => void;
  isTouchDevice: boolean;
  notificationCounts: Record<string, number>;
}) {
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) { // Swipe threshold
      if (diff > 0) {
        // Swipe left - next app
        setSelectedDock((prev) => Math.min(dockApps.length - 1, prev + 1));
      } else {
        // Swipe right - previous app
        setSelectedDock((prev) => Math.max(0, prev - 1));
      }
    }
    setTouchStart(null);
  };

  return (
    <div
      className="absolute inset-0 flex items-end justify-center pb-6 px-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Bold-style bottom dock overlay */}
      <div className="w-full max-w-[95%] sm:max-w-[90%] mx-auto rounded-none border border-white/20 bg-gradient-to-b from-black/60 via-black/55 to-black/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_80px_rgba(247, 168, 53,0.05),0_0_2px_rgba(247, 168, 53,0.3)]">
        {/* Hints at top of dock bar with gradient */}
        <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-2 sm:pb-2.5 text-center text-white/80 text-[11px] sm:text-[13px] border-b border-white/15 bg-gradient-to-b from-white/8 to-transparent tracking-widest" style={{ fontFamily: 'var(--font-source-code)' }}>
          {isTouchDevice ? (
            <>
              <span className="opacity-90 font-semibold">Swipe Up = Menu</span>
              <span className="mx-2 opacity-50">•</span>
              <span className="opacity-90 font-semibold">Swipe ◀▶ Navigate</span>
              <span className="mx-2 opacity-50">•</span>
              <span className="opacity-90 font-semibold">Tap = Open</span>
            </>
          ) : (
            <>
              <span className="opacity-90 font-semibold">▲ Menu</span>
              <span className="mx-2 opacity-50">•</span>
              <span className="opacity-90 font-semibold">◀▶ Navigate</span>
              <span className="mx-2 opacity-50">•</span>
              <span className="opacity-90 font-semibold">Enter/Tap=Open</span>
            </>
          )}
        </div>
        <div className="grid grid-cols-5 gap-0.5 sm:gap-2 md:gap-2.5 p-1.5 sm:p-3 md:p-5 place-items-stretch transition-all duration-300" style={{ gridAutoRows: '1fr' }}>
          {dockApps.map((app, idx) => (
            <button
              key={app.name}
              className={[
                "group relative flex flex-col items-center justify-center rounded-none border-2 p-3 sm:p-3 md:p-4 h-full w-full",
                selectedDock === idx
                  ? "border-[var(--accent)] bg-gradient-to-b from-white/20 to-white/15 backdrop-blur-sm"
                  : "border-white/20 bg-gradient-to-b from-white/8 to-white/5 hover:border-white/30 hover:from-white/10 hover:to-white/7 hover:scale-105",
                "transition-all duration-300 active:scale-95",
              ].join(" ")}
              style={{
                boxShadow: selectedDock === idx
                  ? "0 0 0 2px rgba(247, 168, 53,0.3), 0 0 16px rgba(247, 168, 53,0.4), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
              }}
              onMouseEnter={() => setSelectedDock(idx)}
              onFocus={() => setSelectedDock(idx)}
              onClick={() => navigateTo(app)}
              aria-label={app.name}
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={`h-16 w-16 sm:h-16 sm:w-16 md:h-20 md:w-20 transition-all duration-300 ${
                      selectedDock === idx
                        ? "brightness-130 drop-shadow-[0_0_12px_rgba(247, 168, 53,0.8)]"
                        : "brightness-100 group-hover:brightness-110"
                    }`}
                  >
                    {app.icon}
                  </motion.div>
                  {/* Notification badge */}
                  {notificationCounts[app.name] > 0 && (
                    <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 min-w-[14px] sm:min-w-[18px] h-[14px] sm:h-[18px] rounded-full bg-red-500 border-2 border-black flex items-center justify-center">
                      <span className="text-[8px] sm:text-[10px] font-bold text-white px-0.5 sm:px-1" style={{ fontFamily: 'var(--font-source-code)' }}>
                        {notificationCounts[app.name] > 9 ? '9+' : notificationCounts[app.name]}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`text-[9px] sm:text-[11px] md:text-[13px] leading-none text-center font-medium transition-all duration-300 ${
                  selectedDock === idx ? "text-[var(--accent)]" : "text-white/90 group-hover:text-white"
                }`} style={{ fontFamily: 'var(--font-source-code)' }}>
                  {app.name}
                </div>
              </div>
              {selectedDock === idx && (
                <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_18px_rgba(247, 168, 53,0.2)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuGrid({
  apps,
  selected,
  setSelected,
  navigateTo,
  setShowContext,
}: {
  apps: { name: string; icon: React.ReactNode; path?: string; external?: boolean }[];
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  navigateTo: (app: { name: string; icon: React.ReactNode; path?: string; external?: boolean }) => void;
  setShowContext: (b: boolean) => void;
}) {
  return (
    <div className="absolute inset-0 top-16 bottom-8 px-18 py-12 flex items-center justify-center overflow-y-auto" style={{ overflow: "visible" }}>
      <div className="grid grid-cols-3 gap-7 select-none w-full" style={{ gridAutoRows: "minmax(140px, 1fr)", padding: "20px" }}>
        {apps.map((app, idx) => (
          <button
            key={app.name}
            className={[
              "group relative flex flex-col items-center justify-center rounded-none border p-6 backdrop-blur-md",
              selected === idx
                ? "ring-2 ring-[var(--accent)] border-[var(--accent)]/70 shadow-[0_0_0_2px_rgba(247, 168, 53,0.5),0_0_24px_rgba(247, 168, 53,0.5)] bg-gradient-to-b from-white/20 to-white/12"
                : "border-white/15 bg-gradient-to-b from-white/10 to-white/6 hover:border-white/35 hover:shadow-[0_0_20px_rgba(247, 168, 53,0.4)] hover:from-white/14 hover:to-white/9",
              "transition-all duration-300 active:scale-93",
            ].join(" ")}
            style={{
              overflow: "visible",
              transformOrigin: "center",
              transform: selected === idx ? "scale(1.05)" : "scale(1)",
              boxShadow: selected === idx
                ? "0 0 0 2px rgba(247, 168, 53,0.5), 0 0 32px rgba(247, 168, 53,0.65), 0 8px 18px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.12), inset 0 0 30px rgba(247, 168, 53,0.15)"
                : "0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 20px rgba(255,255,255,0.02)"
            }}
            onMouseEnter={() => setSelected(idx)}
            onFocus={() => setSelected(idx)}
            onClick={() => navigateTo(app)}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowContext(true);
            }}
            aria-label={app.name}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`h-18 w-18 transition-all duration-300 ${
                selected === idx
                  ? "brightness-135 drop-shadow-[0_0_12px_rgba(247, 168, 53,0.8)] scale-115"
                  : "brightness-100 group-hover:brightness-120 group-hover:drop-shadow-[0_0_8px_rgba(247, 168, 53,0.5)] group-hover:scale-108"
              }`}
              style={{ transformOrigin: "center" }}
            >
              {app.icon}
            </motion.div>
            <div
              className={`mt-3 text-[14px] leading-none text-center font-bold transition-all duration-300 ${
                selected === idx ? "text-[var(--accent)] scale-105" : "text-white/90 group-hover:text-white"
              }`}
              style={{
                fontFamily: 'var(--font-source-code)',
                letterSpacing: "0.02em",
                textShadow: selected === idx
                  ? "0 0 8px rgba(247, 168, 53,0.6), 0 1px 2px rgba(0,0,0,0.8)"
                  : "0 1px 2px rgba(0,0,0,0.5)"
              }}
            >
              {app.name}
            </div>
            {selected === idx && (
              <div className="pointer-events-none absolute inset-0 rounded-none ring-1 ring-[var(--accent)]/60 shadow-[inset_0_0_30px_rgba(247, 168, 53,0.35)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

