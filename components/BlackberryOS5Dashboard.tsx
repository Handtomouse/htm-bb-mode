"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import BBTrackpad from "./BBTrackpad";
import { BBSkeletonCard } from "./BBSkeleton";
import BlackberryAboutContent from "./BlackberryAboutContent";
import BlackberryWormholeContent from "./BlackberryWormholeContent";
import BlackberryClientsContent from "./BlackberryClientsContent";
import BlackberryPortfolioContent from "./BlackberryPortfolioContent";
import { ResponsiveStage, HwButton, NotiDot } from "./BlackberryUIComponents";
import {
  VolumeIcon,
  SignalBars,
  Battery,
  PixelCallIcon,
  PixelMenuIcon,
  PixelBackIcon,
  PixelPowerIcon,
  AboutIcon,
  WorkIcon,
  ClientsIcon,
  FavouritesIcon,
  ShowreelIcon,
  SettingsIcon,
  DonateIcon,
  WormholeIcon,
  ContactIcon,
  MessageIcon,
  GamesIcon,
  InstagramIcon,
  AppGlyph
} from "./BlackberryIcons";

// Lazy load content components for better performance
const BlackberryContactContent = lazy(() => import("./BlackberryContactContent"));
const BlackberrySettingsContent = lazy(() => import("./BlackberrySettingsContent"));
const BlackberrySettingsContentNew = lazy(() => import("./BlackberrySettingsContentNew"));
const BlackberryShowreelContent = lazy(() => import("./BlackberryShowreelContent"));
const BlackberryFavouritesContent = lazy(() => import("./BlackberryFavouritesContent"));
const BlackberryGamesContent = lazy(() => import("./BlackberryGamesContent"));
const BlackberryWebContent = lazy(() => import("./BlackberryWebContent"));

// Accent colour (global)
const ACCENT = "#ff9d23";
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

  // Screen state
  const [mode, setMode] = useState<"home" | "menu">("home");
  const [selectedMenu, setSelectedMenu] = useState(0); // menu grid selection index
  const [selectedDock, setSelectedDock] = useState(0); // dock selection index
  const [openAppIndex, setOpenAppIndex] = useState<number | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [poweredOn, setPoweredOn] = useState(true);
  const [openApp, setOpenApp] = useState<string | null>(null); // Track which app is open
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false); // Keyboard shortcuts overlay
  const [isLocked, setIsLocked] = useState(false); // Lock screen state
  const [konamiActive, setKonamiActive] = useState(false); // Easter egg state
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]); // Track key sequence

  // Time/UI state
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Top bar state
  const [signalStrength, setSignalStrength] = useState(4);
  const [batteryLevel, setBatteryLevel] = useState(82);
  const [networkType, setNetworkType] = useState<"3G" | "4G" | "5G" | "WiFi">("3G");
  const [showBatteryTooltip, setShowBatteryTooltip] = useState(false);
  const [isCharging, setIsCharging] = useState(false);

  // Refs
  const screenRef = useRef<HTMLDivElement | null>(null);

  // Mount and clock tick
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

            const colors = ["#FF9D23", "#FFB84D", "#FFC266", "#FFD699"];

            (function frame() {
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
    }, 3000); // Faster for demo (3 seconds)

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
      { name: "About", icon: <AboutIcon />, path: "/about" },
      { name: "Work", icon: <WorkIcon />, path: "/portfolio" },
      { name: "Clients", icon: <ClientsIcon />, path: "/clients" },
      { name: "Favourites", icon: <FavouritesIcon />, path: "/favourites" },
      { name: "Showreel", icon: <ShowreelIcon />, path: "/showreel" },
      { name: "Settings", icon: <SettingsIcon />, path: "/settings" },
      { name: "Donate", icon: <DonateIcon />, path: "/contact" },
      { name: "Wormhole", icon: <WormholeIcon />, path: "/wormhole" },
      { name: "Contact", icon: <ContactIcon />, path: "/contact" },
      { name: "Message", icon: <MessageIcon />, path: "/notes" },
      { name: "Games", icon: <GamesIcon />, path: "/games" },
      { name: "Instagram", icon: <InstagramIcon />, path: "https://www.instagram.com/handtomouse_studio", external: true },
    ],
    []
  );

  // Bold-style dock overlay (pick 5 key entries)
  const dockNames = ["About", "Work", "Clients", "Contact", "Instagram"] as const;
  const dockApps = useMemo(
    () => dockNames.map((n) => apps.find((a) => a.name === n)!).filter(Boolean),
    [apps]
  );

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
      "Message": "notes",
      "About": "about",
      "Settings": "settings",
      "Contact": "contact",
      "Showreel": "showreel",
      "Favourites": "favourites",
      "Games": "games",
      "Wormhole": "wormhole",
      "Donate": "contact" // Map Donate to contact as well
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
      // Keyboard help overlay
      if (e.key === "?" && poweredOn && !isLocked) {
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
      if (e.key.toLowerCase() === "l" && e.shiftKey) {
        setIsLocked(true);
        e.preventDefault();
        return;
      }

      // Check if user is typing in an input field
      const activeEl = document.activeElement as HTMLElement;
      const isTyping = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA" || activeEl?.tagName === "SELECT" || activeEl?.isContentEditable;

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
  const timeStr = mounted ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
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
        className="relative w-screen h-screen rounded-none shadow-2xl ring-1 ring-white/10 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(180%_120% at 50% -20%, #0a1220 10%, #000 70%), linear-gradient(180deg, rgba(255,255,255,0.06), transparent)",
        }}
      >
        {/* Top bezel */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between text-white/60 text-[11px]">
          <div className={`h-1.5 w-16 rounded-none ${poweredOn ? "bg-white/10" : "bg-transparent"}`} />
          <div
            className={`h-2 w-2 rounded-none ${poweredOn ? "bg-emerald-400 shadow-[0_0_12px_3px_rgba(16,185,129,0.8)]" : "bg-transparent"}`}
            title="Notification LED"
          />
        </div>

        {/* Screen */}
        <div ref={screenRef} className="mx-8 rounded-none overflow-hidden ring-1 ring-white/15 relative h-[calc(100vh-180px)]">
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
          {/* INFINITE CITY CORRIDOR - Perspective Tunnel */}
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none overflow-hidden"
            style={{
              perspective: "600px",
              perspectiveOrigin: "50% 50%"
            }}
          >
            {/* Corridor Floor Grid */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 38px,
                  rgba(255, 157, 35, 0.4) 38px,
                  rgba(255, 157, 35, 0.4) 40px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent 0px,
                  transparent 38px,
                  rgba(255, 157, 35, 0.3) 38px,
                  rgba(255, 157, 35, 0.3) 40px
                )`,
                transform: "rotateX(70deg) translateZ(-300px) translateY(30%)",
                transformOrigin: "center center",
                animation: "corridorFlow 5s linear infinite",
                willChange: "transform",
                filter: "blur(0.5px)"
              }}
            />

            {/* Vanishing Point Glow */}
            <div
              className="absolute"
              style={{
                width: "40%",
                height: "40%",
                top: "30%",
                left: "30%",
                background: "radial-gradient(circle, rgba(255, 157, 35, 0.5) 0%, transparent 70%)",
                filter: "blur(30px)",
                animation: "vanishingPulse 3s ease-in-out infinite"
              }}
            />
          </div>

          {/* BUILDING WALLS - Left Side Parallax */}
          <div className="absolute inset-0 opacity-[0.25] pointer-events-none overflow-hidden">
            {/* Left Building Layer 1 - Close */}
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: "25%",
                background: "linear-gradient(90deg, rgba(255, 157, 35, 0.3) 0%, transparent 100%)",
                borderRight: "2px solid rgba(255, 157, 35, 0.6)",
                animation: "buildingSlideLeft1 3s linear infinite"
              }}
            >
              {/* Windows - Left Close */}
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 60px, rgba(255, 157, 35, 0.5) 60px, rgba(255, 157, 35, 0.5) 65px, transparent 65px, transparent 100px)`,
                animation: "windowsScroll 2s linear infinite"
              }} />
            </div>

            {/* Left Building Layer 2 - Mid */}
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: "20%",
                background: "linear-gradient(90deg, rgba(255, 157, 35, 0.2) 0%, transparent 100%)",
                borderRight: "1px solid rgba(255, 157, 35, 0.4)",
                animation: "buildingSlideLeft2 5s linear infinite"
              }}
            >
              {/* Windows - Left Mid */}
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 80px, rgba(255, 157, 35, 0.3) 80px, rgba(255, 157, 35, 0.3) 84px, transparent 84px, transparent 120px)`,
                animation: "windowsScroll 3s linear infinite"
              }} />
            </div>

            {/* Left Building Layer 3 - Far */}
            <div
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: "15%",
                background: "linear-gradient(90deg, rgba(255, 157, 35, 0.1) 0%, transparent 100%)",
                borderRight: "1px solid rgba(255, 157, 35, 0.2)",
                animation: "buildingSlideLeft3 8s linear infinite"
              }}
            />
          </div>

          {/* BUILDING WALLS - Right Side Parallax */}
          <div className="absolute inset-0 opacity-[0.25] pointer-events-none overflow-hidden">
            {/* Right Building Layer 1 - Close */}
            <div
              className="absolute right-0 top-0 bottom-0"
              style={{
                width: "25%",
                background: "linear-gradient(270deg, rgba(255, 157, 35, 0.3) 0%, transparent 100%)",
                borderLeft: "2px solid rgba(255, 157, 35, 0.6)",
                animation: "buildingSlideRight1 3s linear infinite"
              }}
            >
              {/* Windows - Right Close */}
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 60px, rgba(255, 157, 35, 0.5) 60px, rgba(255, 157, 35, 0.5) 65px, transparent 65px, transparent 100px)`,
                animation: "windowsScroll 2s linear infinite"
              }} />
            </div>

            {/* Right Building Layer 2 - Mid */}
            <div
              className="absolute right-0 top-0 bottom-0"
              style={{
                width: "20%",
                background: "linear-gradient(270deg, rgba(255, 157, 35, 0.2) 0%, transparent 100%)",
                borderLeft: "1px solid rgba(255, 157, 35, 0.4)",
                animation: "buildingSlideRight2 5s linear infinite"
              }}
            >
              {/* Windows - Right Mid */}
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 80px, rgba(255, 157, 35, 0.3) 80px, rgba(255, 157, 35, 0.3) 84px, transparent 84px, transparent 120px)`,
                animation: "windowsScroll 3s linear infinite"
              }} />
            </div>

            {/* Right Building Layer 3 - Far */}
            <div
              className="absolute right-0 top-0 bottom-0"
              style={{
                width: "15%",
                background: "linear-gradient(270deg, rgba(255, 157, 35, 0.1) 0%, transparent 100%)",
                borderLeft: "1px solid rgba(255, 157, 35, 0.2)",
                animation: "buildingSlideRight3 8s linear infinite"
              }}
            />
          </div>

          {/* OVERHEAD STRUCTURES - Creating ceiling depth */}
          <div className="absolute inset-0 opacity-[0.2] pointer-events-none overflow-hidden">
            {/* Ceiling Beams */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: "30%",
                background: "linear-gradient(180deg, rgba(255, 157, 35, 0.3) 0%, transparent 100%)",
                borderBottom: "2px solid rgba(255, 157, 35, 0.5)",
                backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 100px, rgba(255, 157, 35, 0.4) 100px, rgba(255, 157, 35, 0.4) 105px)`,
                animation: "ceilingBeams 4s linear infinite"
              }}
            />
          </div>

          {/* FLYING DEBRIS - Architectural fragments */}
          <div className="absolute inset-0 opacity-[0.18] pointer-events-none overflow-hidden">
            {/* Fragment 1 - Rectangle flying past */}
            <div
              className="absolute"
              style={{
                width: "120px",
                height: "80px",
                left: "-120px",
                top: "15%",
                background: "rgba(255, 157, 35, 0.4)",
                border: "2px solid rgba(255, 157, 35, 0.7)",
                animation: "debrisPass1 6s linear infinite",
                transform: "perspective(400px) rotateY(20deg)",
                filter: "drop-shadow(0 0 10px rgba(255, 157, 35, 0.6))"
              }}
            >
              {/* Fragment windows */}
              <div style={{
                position: "absolute",
                inset: 8,
                border: "1px solid rgba(255, 157, 35, 0.5)",
                background: "rgba(0, 0, 0, 0.3)"
              }} />
            </div>

            {/* Fragment 2 - Tall structure */}
            <div
              className="absolute"
              style={{
                width: "60px",
                height: "200px",
                right: "-60px",
                top: "30%",
                background: "linear-gradient(180deg, rgba(255, 157, 35, 0.5) 0%, rgba(255, 157, 35, 0.2) 100%)",
                border: "2px solid rgba(255, 157, 35, 0.6)",
                animation: "debrisPass2 8s linear infinite 2s",
                transform: "perspective(400px) rotateY(-20deg)",
                filter: "drop-shadow(0 0 12px rgba(255, 157, 35, 0.7))"
              }}
            />

            {/* Fragment 3 - Square panel */}
            <div
              className="absolute"
              style={{
                width: "100px",
                height: "100px",
                left: "-100px",
                bottom: "25%",
                background: "rgba(255, 157, 35, 0.3)",
                border: "2px solid rgba(255, 157, 35, 0.8)",
                animation: "debrisPass3 7s linear infinite 4s",
                transform: "perspective(400px) rotateZ(45deg)",
                filter: "drop-shadow(0 0 15px rgba(255, 157, 35, 0.8))"
              }}
            />
          </div>

          {/* Neon Scan Lines - Fast sweep */}
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 2px,
                rgba(255, 157, 35, 0.3) 2px,
                rgba(255, 157, 35, 0.3) 3px
              )`,
              animation: "neonScan 2s linear infinite"
            }}
          />

          {/* Radial Pulse - Center outward */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(255, 157, 35, 0.6) 0%, transparent 50%)",
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

            /* VAPORWAVE ANIMATIONS */
            @keyframes gridFlowVertical {
              0% {
                transform: rotateX(75deg) translateZ(-200px) translateY(0px);
              }
              100% {
                transform: rotateX(75deg) translateZ(-200px) translateY(50px);
              }
            }

            @keyframes floatUp1 {
              0% {
                transform: translateY(0px) scale(1);
                opacity: 0.6;
              }
              50% {
                transform: translateY(-400px) scale(1.3);
                opacity: 0.8;
              }
              100% {
                transform: translateY(-800px) scale(1.6);
                opacity: 0;
              }
            }

            @keyframes floatUp2 {
              0% {
                transform: translateY(0px) scale(1) rotate(0deg);
                opacity: 0.5;
              }
              50% {
                transform: translateY(-350px) scale(1.2) rotate(180deg);
                opacity: 0.7;
              }
              100% {
                transform: translateY(-700px) scale(1.5) rotate(360deg);
                opacity: 0;
              }
            }

            @keyframes rotateCube {
              0% {
                transform: rotate(0deg) scale(1);
              }
              50% {
                transform: rotate(180deg) scale(1.2);
              }
              100% {
                transform: rotate(360deg) scale(1);
              }
            }

            @keyframes pulseDiamond {
              0%, 100% {
                transform: scale(1) rotate(0deg);
                opacity: 0.4;
              }
              50% {
                transform: scale(1.3) rotate(45deg);
                opacity: 0.8;
              }
            }

            @keyframes neonScan {
              0% {
                transform: translateY(-100%);
              }
              100% {
                transform: translateY(100%);
              }
            }

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
            <div className="relative z-10 flex items-center justify-between text-[20px] text-[#E0E0E0] px-8 py-4 bg-[#000000] border-b border-white/10" style={{ fontFamily: 'VT323, monospace' }}>
              {/* Left: Sound + Signal */}
              <div className="flex items-center gap-4">
                <VolumeIcon />
                <SignalBars strength={signalStrength as 0 | 1 | 2 | 3 | 4} />
              </div>

              {/* Center: Wordmark on homescreen, Logo+Time otherwise */}
              {(openApp !== null || mode === "menu" || pathname !== '/') ? (
                <div className="flex items-center gap-6 text-[20px]">
                  <img src="/logos/HTM-LOGO-ICON-01.svg" alt="HTM" className="h-6 w-6 opacity-80" style={{ imageRendering: 'pixelated' }} />
                  <span className="font-mono font-semibold">{timeStr}</span>
                  <span className="text-[#E0E0E0]/50">{dateStr}</span>
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
                <div className="border border-[#E0E0E0] px-2 py-1 bg-transparent min-w-[48px] flex items-center justify-center flex-shrink-0" style={{ imageRendering: 'pixelated' }}>
                  <span className="font-heading text-[14px] md:text-[16px] font-medium text-[#E0E0E0] whitespace-nowrap" style={{ fontFamily: 'VT323, monospace' }}>{networkType}</span>
                </div>
                <div
                  className="relative"
                  onMouseEnter={() => setShowBatteryTooltip(true)}
                  onMouseLeave={() => setShowBatteryTooltip(false)}
                >
                  <Battery level={batteryLevel} charging={isCharging} />
                  {showBatteryTooltip && (
                    <div className="absolute -bottom-7 right-0 bg-black/95 text-white text-[18px] px-4 py-2 rounded-sm whitespace-nowrap z-50 border border-white/20 shadow-lg">
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
                <div className="text-3xl md:text-4xl font-extralight tabular-nums tracking-tight mb-1 animate-[fadeIn_0.5s_ease-in-out]" style={{
                  textShadow: "0 2px 12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 157, 35, 0.1)"
                }}>
                  {timeStr}
                </div>
                {/* Date below */}
                <div className="text-xs mt-2 opacity-80 tracking-wide font-medium">{dateStr}</div>
                {/* Notifications indicator */}
                {mounted && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-white/50">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                      <span>No notifications</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main area */}
          {openApp !== null ? (
            // App is open - render content inside BB screen
            <main role="main">
              <AppContent appId={openApp} />
            </main>
          ) : mode === "home" ? (
            <HomeDockOverlay
              apps={apps}
              dockApps={dockApps}
              selectedDock={selectedDock}
              setSelectedDock={setSelectedDock}
              navigateTo={navigateTo}
              goMenu={goMenu}
            />
          ) : (
            <MenuGrid
              apps={apps}
              selected={selectedMenu}
              setSelected={setSelectedMenu}
              navigateTo={navigateTo}
              setShowContext={setShowContext}
            />
          )}


          {/* LOCK SCREEN */}
          {isLocked && poweredOn && (
            <div
              className="absolute inset-0 bg-black/95 backdrop-blur-lg grid place-items-center"
              aria-label="Device locked"
              onTouchStart={(e) => {
                const startY = e.touches[0].clientY;
                const handleTouchMove = (moveEvent: TouchEvent) => {
                  const currentY = moveEvent.touches[0].clientY;
                  if (startY - currentY > 100) { // Swipe up to unlock
                    setIsLocked(false);
                  }
                };
                document.addEventListener('touchmove', handleTouchMove, { once: true });
              }}
            >
              <div className="text-center px-6">
                <div className="text-6xl mb-4 animate-pulse">🔒</div>
                <div className="text-2xl font-light text-white mb-2">{timeStr}</div>
                <div className="text-sm text-white/60 mb-6">{dateStr}</div>
                <div className="text-xs text-white/40 mt-8 flex flex-col gap-2">
                  <div className="animate-pulse">Swipe up to unlock</div>
                  <div className="opacity-60">Press L to unlock</div>
                </div>
              </div>
            </div>
          )}

          {/* POWER OFF OVERLAY (full screen OFF) */}
          {!poweredOn && (
            <div className="absolute inset-0 bg-black grid place-items-center" aria-label="Device off">
              <div className="uppercase tracking-[0.2em] text-xs sm:text-sm" style={{ color: ACCENT }}>System Off</div>
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
            boxShadow: "inset 0 3px 10px rgba(0,0,0,0.7), 0 -1px 0 rgba(255,157,35,0.2), inset 0 0 40px rgba(0,0,0,0.4)",
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
                    ? "3px 3px 8px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.08), inset 0 0 8px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(255,157,35,0.1)"
                    : "3px 3px 6px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.05), inset 0 0 6px rgba(0,0,0,0.8)",
                  padding: "0",
                }}
              >
                <div className="scale-75 sm:scale-100 transition-transform">
                  <BBTrackpad size={80} disabled={!poweredOn} />
                </div>
              </div>
              <div
                className="text-[13px] leading-none opacity-85 mt-1 font-bold transition-all duration-300"
                style={{
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
            <HwButton label="Power" onClick={togglePower} className={!poweredOn ? "animate-pulse" : ""}>
              <PixelPowerIcon />
            </HwButton>
          </div>
        </div>
      </div>

      {/* Context menu */}
      {showContext && openAppIndex === null && poweredOn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-start p-4">
          <div className="w-48 rounded-none border border-white/15 bg-black/80 text-white shadow-xl overflow-hidden">
            <div className="px-3 py-2 text-[14px] font-semibold border-b border-white/10">Menu</div>
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
                <span className="font-mono text-sm uppercase font-semibold">Keyboard Shortcuts</span>
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
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[14px] px-3 py-1.5 rounded-none border border-white/15 shadow-lg">
          {toast}
        </div>
      )}
    </ResponsiveStage>
  );
}

// =====================
// Subcomponents
// =====================

// AppContent - renders page content inside BB screen
function AppContent({ appId }: { appId: string }) {
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
    <div
      className={`scrollable-content absolute left-0 right-0 ${isFullscreen ? "top-0 bottom-0" : "top-[72px] bottom-[32px]"} overflow-y-auto transition-opacity duration-300 ${
        fadeIn ? "opacity-100" : "opacity-0"
      } ${isFullscreen ? "" : "bg-black/40 backdrop-blur-sm"}`}
    >
      <div className={appId === "wormhole" || appId === "about" || appId === "clients" || appId === "portfolio" ? "" : "p-4"}>
        {loading ? (
          <div className="text-white/60 text-sm">Loading...</div>
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
          <PlaceholderContent title="Donate" />
        ) : (
          <PlaceholderContent title="Unknown App" />
        )}
      </div>
    </div>
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
          className="h-full bg-[#ff9d23] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Idle overlay */}
      {showIdleOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
          <div className="text-[#ff9d23] text-2xl font-bold animate-pulse" style={{ fontFamily: "var(--font-handjet)" }}>
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
            <h1 className="text-2xl font-semibold uppercase tracking-wide leading-tight text-[#ff9d23]" style={{ fontFamily: "var(--font-handjet)" }}>
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
          <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-sm p-4 flex flex-col space-y-3 shadow-[inset_0_0_12px_#000] hover:border-[#ff9d23] transition-colors relative group">
            {/* Status LED */}
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#333] group-hover:bg-[#ff9d23] transition-colors"></div>

            <header className="flex items-center space-x-2">
              <span className="text-[#ff9d23] text-lg">💡</span>
              <h3 className="text-xs uppercase tracking-wide text-[#ff9d23] font-semibold" style={{ fontFamily: "var(--font-handjet)" }}>
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
          <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-sm p-4 flex flex-col space-y-3 shadow-[inset_0_0_12px_#000] hover:border-[#ff9d23] transition-colors relative group">
            {/* Status LED */}
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#333] group-hover:bg-[#ff9d23] transition-colors"></div>

            <header className="flex items-center space-x-2">
              <span className="text-[#ff9d23] text-lg">∴</span>
              <h3 className="text-xs uppercase tracking-wide text-[#ff9d23] font-semibold" style={{ fontFamily: "var(--font-handjet)" }}>
                Beliefs
              </h3>
            </header>

            <div className="text-xs text-gray-300 leading-relaxed space-y-2">
              {beliefs.map((belief, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-[#ff9d23] flex-shrink-0">∴</span>
                  <span>{belief}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Card 3 — Who With */}
          <div className="bg-[#0d0d0d] border border-[#1f1f1f] rounded-sm p-4 flex flex-col space-y-3 shadow-[inset_0_0_12px_#000] hover:border-[#ff9d23] transition-colors relative group">
            {/* Status LED */}
            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#333] group-hover:bg-[#ff9d23] transition-colors"></div>

            <header className="flex items-center space-x-2">
              <span className="text-[#ff9d23] text-lg">👥</span>
              <h3 className="text-xs uppercase tracking-wide text-[#ff9d23] font-semibold" style={{ fontFamily: "var(--font-handjet)" }}>
                Who With
              </h3>
            </header>

            <div className="text-xs text-gray-300 leading-relaxed space-y-2">
              <p><strong className="text-[#ff9d23]">S'WICH</strong> — turning Sydney sandwiches into iconography.</p>
              <p><strong className="text-[#ff9d23]">MapleMoon</strong> — making carob feel like mythology.</p>
              <p><strong className="text-[#ff9d23]">Jac+Jack</strong> — giving quiet luxury a language.</p>
              <p><strong className="text-[#ff9d23]">Aura Therapeutics</strong> — where wellness met weird.</p>
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
              !emailPulsed ? 'animate-pulse drop-shadow-[0_0_8px_rgba(255,157,35,0.6)]' : ''
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
}: {
  apps: { name: string; icon: React.ReactNode; path?: string; external?: boolean }[];
  dockApps: { name: string; icon: React.ReactNode; path?: string; external?: boolean }[];
  selectedDock: number;
  setSelectedDock: React.Dispatch<React.SetStateAction<number>>;
  navigateTo: (app: { name: string; icon: React.ReactNode; path?: string; external?: boolean }) => void;
  goMenu: () => void;
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
      <div className="w-full max-w-[90%] mx-auto rounded-none border border-white/20 bg-gradient-to-b from-black/60 via-black/55 to-black/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_80px_rgba(255,157,35,0.05),0_0_2px_rgba(255,157,35,0.3)]">
        {/* Hints at top of dock bar with gradient */}
        <div className="px-4 pt-3 pb-2.5 text-center text-white/80 text-[13px] border-b border-white/15 bg-gradient-to-b from-white/8 to-transparent tracking-widest">
          <span className="opacity-90 font-bold">▲ Menu</span>
          <span className="mx-2 opacity-50">•</span>
          <span className="opacity-90 font-bold">◀▶ Navigate</span>
          <span className="mx-2 opacity-50">•</span>
          <span className="opacity-90 font-bold">Enter/Tap=Open</span>
        </div>
        <div className="grid grid-cols-5 gap-4 p-5 place-items-center transition-all duration-300">
          {dockApps.map((app, idx) => (
            <button
              key={app.name}
              className={[
                "group relative flex flex-col items-center justify-center rounded-none border-2 p-3 min-h-[100px]",
                selectedDock === idx
                  ? "border-[#ff9d23] bg-gradient-to-b from-white/20 to-white/15 backdrop-blur-sm"
                  : "border-white/20 bg-gradient-to-b from-white/8 to-white/5 hover:border-white/30 hover:from-white/10 hover:to-white/7 hover:scale-105",
                "transition-all duration-300 active:scale-95",
              ].join(" ")}
              style={{
                boxShadow: selectedDock === idx
                  ? "0 0 0 2px rgba(255,157,35,0.3), 0 0 16px rgba(255,157,35,0.4), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
              }}
              onMouseEnter={() => setSelectedDock(idx)}
              onFocus={() => setSelectedDock(idx)}
              onClick={() => navigateTo(app)}
              aria-label={app.name}
            >
              <div className={`h-18 w-18 transition-all duration-300 ${
                selectedDock === idx
                  ? "brightness-130 drop-shadow-[0_0_12px_rgba(255,157,35,0.8)]"
                  : "brightness-100 group-hover:brightness-110"
              }`}>
                {app.icon}
              </div>
              <div className={`font-heading mt-4 text-[13px] leading-none text-center font-semibold transition-all duration-300 ${
                selectedDock === idx ? "text-[#ff9d23]" : "text-white/90 group-hover:text-white"
              }`}>
                {app.name}
              </div>
              {selectedDock === idx && (
                <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_18px_rgba(255,157,35,0.2)]" />
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
                ? "ring-2 ring-[#ff9d23] border-[#ff9d23]/70 shadow-[0_0_0_2px_rgba(255,157,35,0.5),0_0_24px_rgba(255,157,35,0.5)] bg-gradient-to-b from-white/20 to-white/12"
                : "border-white/15 bg-gradient-to-b from-white/10 to-white/6 hover:border-white/35 hover:shadow-[0_0_20px_rgba(255,157,35,0.4)] hover:from-white/14 hover:to-white/9",
              "transition-all duration-300 active:scale-93",
            ].join(" ")}
            style={{
              overflow: "visible",
              transformOrigin: "center",
              transform: selected === idx ? "scale(1.05)" : "scale(1)",
              boxShadow: selected === idx
                ? "0 0 0 2px rgba(255,157,35,0.5), 0 0 32px rgba(255,157,35,0.65), 0 8px 18px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.12), inset 0 0 30px rgba(255,157,35,0.15)"
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
            <div
              className={`h-18 w-18 transition-all duration-300 ${
                selected === idx
                  ? "brightness-135 drop-shadow-[0_0_12px_rgba(255,157,35,0.8)] scale-115"
                  : "brightness-100 group-hover:brightness-120 group-hover:drop-shadow-[0_0_8px_rgba(255,157,35,0.5)] group-hover:scale-108"
              }`}
              style={{ transformOrigin: "center" }}
            >
              {app.icon}
            </div>
            <div
              className={`font-heading mt-3 text-[14px] leading-none text-center font-semibold transition-all duration-300 ${
                selected === idx ? "text-[#ff9d23] scale-105" : "text-white/90 group-hover:text-white"
              }`}
              style={{
                letterSpacing: "0.02em",
                textShadow: selected === idx
                  ? "0 0 8px rgba(255,157,35,0.6), 0 1px 2px rgba(0,0,0,0.8)"
                  : "0 1px 2px rgba(0,0,0,0.5)"
              }}
            >
              {app.name}
            </div>
            {selected === idx && (
              <div className="pointer-events-none absolute inset-0 rounded-none ring-1 ring-[#ff9d23]/60 shadow-[inset_0_0_30px_rgba(255,157,35,0.35)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

