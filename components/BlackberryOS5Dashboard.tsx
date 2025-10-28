"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

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
// ResponsiveStage: scales the entire phone UI (screen + hardware) to the viewport
// =====================
function ResponsiveStage({ children, margin = 16 }: { children: React.ReactNode; margin?: number }) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const recompute = useCallback(() => {
    if (typeof window === "undefined") return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = contentRef.current?.offsetWidth || 1;
    const ch = contentRef.current?.offsetHeight || 1;
    const s = Math.min((vw - margin * 2) / cw, (vh - margin * 2) / ch);
    setScale(Number.isFinite(s) && s > 0 ? s : 1);
  }, [margin]);

  useLayoutEffect(() => {
    recompute();
    if (typeof window === "undefined") return;
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => recompute()) : null;
    if (contentRef.current && ro) ro.observe(contentRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("resize", recompute);
      ro?.disconnect();
    };
  }, [recompute]);

  return (
    <div className="w-screen h-screen bg-black grid place-items-center overflow-hidden">
      <div ref={contentRef} style={{ transform: `scale(${scale})`, transformOrigin: "center center", willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}

// =====================
// Root Component
// =====================
export default function BlackberryOS5Dashboard() {
  const router = useRouter();

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
      { name: "Wormhole", icon: <WormholeIcon />, path: "/web" },
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

  // Navigation - open apps inside BB device instead of routing
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
      "Wormhole": "web",
      "Donate": "donate"
    };

    const appId = appMap[app.name];
    if (appId) {
      setOpenApp(appId);
      setMode("home"); // Reset to home mode when opening app
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
    setMode("menu");
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

      // If an app is open, ESC/Backspace closes it
      if (openApp !== null) {
        if (["Escape", "Backspace"].includes(e.key)) {
          setOpenApp(null);
          e.preventDefault();
        }
        return;
      }
      if (openAppIndex !== null) {
        if (["Escape", "Backspace"].includes(e.key)) {
          setOpenAppIndex(null);
          e.preventDefault();
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
        setMode("home");
        e.preventDefault();
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
        className="relative w-[380px] max-w-full rounded-none shadow-2xl ring-1 ring-white/10 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(180%_120% at 50% -20%, #0a1220 10%, #000 70%), linear-gradient(180deg, rgba(255,255,255,0.06), transparent)",
        }}
      >
        {/* Top bezel */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between text-white/60 text-[11px]">
          <div className={`h-1.5 w-16 rounded-none ${poweredOn ? "bg-white/10" : "bg-transparent"}`} />
          <div
            className={`h-1.5 w-1.5 rounded-none ${poweredOn ? "bg-emerald-400/80 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]" : "bg-transparent"}`}
            title="Notification LED"
          />
        </div>

        {/* Screen */}
        <div ref={screenRef} className="mx-4 rounded-none overflow-hidden ring-1 ring-white/15 relative aspect-[3/4.6]">
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
          {/* Rotating square pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255, 157, 35, 0.15) 35px, rgba(255, 157, 35, 0.15) 37px),
                               repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(0, 140, 255, 0.1) 35px, rgba(0, 140, 255, 0.1) 37px)`,
              animation: "rotatePattern 20s linear infinite"
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
            @keyframes rotatePattern {
              0% { transform: rotate(0deg) scale(1.5); }
              100% { transform: rotate(360deg) scale(1.5); }
            }
          `}</style>

          {/* Status bar - BlackBerry OS style */}
          {poweredOn && (
            <div className="relative z-10 flex items-center justify-between text-[10px] text-white px-3 py-1.5 bg-gradient-to-b from-black/60 to-black/40">
              {/* Left: Sound + Signal */}
              <div className="flex items-center gap-1.5">
                <VolumeIcon />
                <SignalBars strength={signalStrength as 0 | 1 | 2 | 3 | 4} />
              </div>

              {/* Center: Carrier name */}
              <div className="font-normal tracking-wide">HTM</div>

              {/* Right: Network + Battery */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-normal">{networkType}</span>
                <div
                  className="relative"
                  onMouseEnter={() => setShowBatteryTooltip(true)}
                  onMouseLeave={() => setShowBatteryTooltip(false)}
                >
                  <Battery level={batteryLevel} charging={isCharging} />
                  {showBatteryTooltip && (
                    <div className="absolute -bottom-6 right-0 bg-black/90 text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap z-50">
                      {batteryLevel}% {isCharging && "⚡"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Time and date display - BlackBerry OS style */}
          {poweredOn && (
            <div className="relative z-10 px-3 pt-4 pb-4 text-white text-center">
              {/* Large centered time */}
              <div className="text-3xl font-light tabular-nums tracking-tight" style={{
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.6)"
              }}>
                {timeStr}
              </div>
              {/* Date below */}
              <div className="text-xs mt-1 opacity-90">{dateStr}</div>
            </div>
          )}

          {/* Main area */}
          {openApp !== null ? (
            // App is open - render content inside BB screen
            <AppContent appId={openApp} />
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
        <div className="h-3" />

        {/* Hardware row (Call • Menu • Trackpad(paused) • Back • Power) */}
        <div className="px-4 pt-2 pb-4">
          <div className="mx-auto flex items-center justify-stretch gap-0 text-white overflow-visible" style={{ padding: "0 2px" }}>
            <HwButton label="Call" onClick={() => navigateTo(apps.find(a => a.name === "Contact")!)} disabled={!poweredOn}>
              <PixelCallIcon />
            </HwButton>
            <HwButton label="Menu" onClick={goMenu} disabled={!poweredOn}>
              <PixelMenuIcon />
            </HwButton>
            {/* Trackpad paused */}
            <HwButton label="Trackpad" onClick={() => setToast("Trackpad paused (coming soon)")} disabled={!poweredOn}>
              <TrackpadMetal />
            </HwButton>
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
            <div className="px-3 py-2 text-[12px] font-semibold border-b border-white/10">Menu</div>
            <ul className="text-[12px] divide-y divide-white/10">
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
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 text-[12px]">
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[12px] px-3 py-1.5 rounded-none border border-white/15 shadow-lg">
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

    // Load data for portfolio, clients, services, notes
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
    } else {
      setLoading(false);
    }

    return () => clearTimeout(fadeTimer);
  }, [appId]);

  // Scrollable container that fills the BB screen (below status bar, above hints)
  return (
    <div
      className={`absolute left-0 right-0 top-[72px] bottom-[32px] overflow-y-auto bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="p-4">
        {loading ? (
          <div className="text-white/60 text-sm">Loading...</div>
        ) : appId === "portfolio" ? (
          <PortfolioContent projects={data} />
        ) : appId === "clients" ? (
          <ClientsContent clients={data} />
        ) : appId === "notes" ? (
          <NotesContent posts={data} />
        ) : appId === "about" ? (
          <PlaceholderContent title="About" />
        ) : appId === "settings" ? (
          <PlaceholderContent title="Settings" />
        ) : appId === "contact" ? (
          <PlaceholderContent title="Contact" />
        ) : appId === "showreel" ? (
          <PlaceholderContent title="Showreel" />
        ) : appId === "favourites" ? (
          <PlaceholderContent title="Favourites" />
        ) : appId === "games" ? (
          <PlaceholderContent title="Games" />
        ) : appId === "web" ? (
          <PlaceholderContent title="Wormhole" />
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
      className="absolute inset-0 flex items-end justify-center pb-5 px-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Bold-style bottom dock overlay */}
      <div className="w-full max-w-[94%] rounded-none border border-white/15 bg-black/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Hints at top of dock bar with gradient */}
        <div className="px-3 pt-2 pb-1.5 text-center text-white/70 text-[10px] border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent tracking-wider">
          <span className="opacity-80">▲ Menu</span>
          <span className="mx-3 opacity-40">•</span>
          <span className="opacity-80">◀▶ Navigate</span>
          <span className="mx-3 opacity-40">•</span>
          <span className="opacity-80">Enter/Tap=Open</span>
        </div>
        <div className="grid grid-cols-5 gap-2.5 p-3">
          {dockApps.map((app, idx) => (
            <button
              key={app.name}
              className={[
                "group relative flex flex-col items-center justify-center rounded-sm border p-2.5",
                selectedDock === idx
                  ? "ring-2 ring-[#ff9d23] border-[#ff9d23] shadow-[0_0_0_2px_rgba(255,157,35,0.35),0_0_20px_rgba(255,157,35,0.4)] bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:shadow-[0_0_16px_rgba(255,157,35,0.3)] hover:bg-white/8",
                "transition-all duration-300 active:scale-95",
              ].join(" ")}
              style={{
                transform: selectedDock === idx ? "scale(1.08) translateY(-2px)" : "scale(1)",
                boxShadow: selectedDock === idx
                  ? "0 0 0 2px rgba(255,157,35,0.35), 0 0 24px rgba(255,157,35,0.5), 0 4px 12px rgba(0,0,0,0.4)"
                  : undefined
              }}
              onMouseEnter={() => setSelectedDock(idx)}
              onFocus={() => setSelectedDock(idx)}
              onClick={() => navigateTo(app)}
              aria-label={app.name}
            >
              <div className={`h-9 w-9 transition-all duration-300 ${
                selectedDock === idx
                  ? "brightness-125 drop-shadow-[0_0_8px_rgba(255,157,35,0.6)]"
                  : "group-hover:brightness-110 group-hover:drop-shadow-[0_0_4px_rgba(255,157,35,0.3)]"
              }`}>
                {app.icon}
              </div>
              <div className={`mt-1.5 text-[10px] leading-none text-center font-medium transition-all duration-300 ${
                selectedDock === idx ? "text-[#ff9d23]" : "text-white/90 group-hover:text-white"
              }`}>
                {app.name}
              </div>
              {selectedDock === idx && (
                <div className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-[#ff9d23]/40 shadow-[inset_0_0_20px_rgba(255,157,35,0.25)]" />
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
    <div className="absolute inset-0 top-16 bottom-8 px-4 py-4 overflow-y-auto overflow-x-hidden">
      <div className="grid grid-cols-3 gap-4 select-none h-full" style={{ gridAutoRows: "1fr", padding: "4px" }}>
        {apps.map((app, idx) => (
          <button
            key={app.name}
            className={[
              "group relative flex flex-col items-center justify-center rounded-none border border-white/10 bg-white/5 backdrop-blur-sm",
              selected === idx ? "ring-2 ring-[#ff9d23] border-[#ff9d23] shadow-[0_0_0_2px_rgba(255,157,35,0.35)]" : "hover:border-white/25",
              "transition-all",
            ].join(" ")}
            style={{
              // Add overflow visible for glow effect
              overflow: "visible"
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
            <div className="h-10 w-10">{app.icon}</div>
            <div className="mt-2 text-[10px] text-white/90 leading-none text-center">{app.name}</div>
            {selected === idx && (
              <div className="pointer-events-none absolute inset-0 rounded-none ring-1 ring-[#ff9d23]/30 shadow-[inset_0_0_24px_rgba(255,157,35,0.35)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function HwButton({ children, label, onClick, disabled, className }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`group flex flex-col items-center gap-1 flex-1 ${disabled ? "opacity-40 pointer-events-none" : ""} ${className || ""}`}
      style={{
        transition: "all 0.3s ease",
        overflow: "visible"
      }}
    >
      <div
        className="grid place-items-center h-12 w-full rounded-none border border-white/20 bg-gradient-to-br from-[#1b1b1b] to-[#0e0e0e] backdrop-blur-sm"
        style={{
          boxShadow: "2px 2px 5px rgba(0,0,0,0.6), inset 0 0 4px #000",
          transition: "all 0.3s ease",
          overflow: "visible"
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.boxShadow = "0 0 16px #ff9d23, inset 0 0 6px #111";
            e.currentTarget.style.transform = "scale(1.05)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.6), inset 0 0 4px #000";
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseDown={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "scale(0.93)";
          }
        }}
        onMouseUp={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "scale(1.05)";
          }
        }}
      >
        <div className="h-8 w-8 transition-all duration-300 group-hover:[&_svg_rect]:fill-[#ff9d23] group-hover:[&_svg_rect]:stroke-[#ff9d23] group-hover:[&_svg_g]:fill-[#ff9d23] group-hover:[&_svg_g]:stroke-[#ff9d23]">
          {children}
        </div>
      </div>
      <div className="text-[9px] leading-none opacity-70 mt-0.5">{label}</div>
    </button>
  );
}

// =====================
// Icons & Glyphs
// =====================
function NotiDot({ pulse = false }: { pulse?: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 align-middle ${pulse ? "animate-pulse" : ""}`}
      style={{
        backgroundColor: ACCENT,
        boxShadow: pulse ? `0 0 8px ${ACCENT}` : "none",
        animation: pulse ? "notiPulse 2s ease-in-out infinite" : "none"
      }}
    >
      <style>{`
        @keyframes notiPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }
      `}</style>
    </span>
  );
}

function VolumeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-90">
      <path d="M8 3L5 6H2v4h3l3 3V3z" fill="currentColor" />
      <path d="M11 5c.5.5.8 1.2.8 2s-.3 1.5-.8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SignalBars({ strength = 4 }: { strength?: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-end gap-0.5" aria-label={`Signal ${strength}/4`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={["w-1 rounded-none", i <= strength - 1 ? "bg-white" : "bg-white/30"].join(" ")} style={{ height: 4 + i * 3 }} />
      ))}
    </div>
  );
}

function Battery({ level = 50, charging = false }: { level?: number; charging?: boolean }) {
  const pct = Math.max(0, Math.min(100, level));
  const color = pct < 20 ? "#ef4444" : charging ? "#fbbf24" : "#22c55e";

  return (
    <div className={`relative h-3 w-6 rounded-none border border-white/70 ${charging ? "animate-pulse" : ""}`}>
      <div className="absolute -right-1 top-0.5 h-2 w-0.5 bg-white/70" />
      <div
        className={`h-full transition-all duration-300 ${charging ? "animate-pulse" : ""}`}
        style={{
          width: `${pct}%`,
          background: charging ? `linear-gradient(90deg, ${color} 0%, #fde047 100%)` : color,
          boxShadow: charging ? `0 0 6px ${color}` : "none"
        }}
      />
      {charging && (
        <div className="absolute inset-0 grid place-items-center text-[9px] animate-pulse">
          ⚡️
        </div>
      )}
    </div>
  );
}

function AppGlyph({ name }: { name: string }) {
  return (
    <div className="h-4 w-4 mr-1.5 opacity-80">
      {(name === "About" && <AboutIcon />) ||
        (name === "Work" && <WorkIcon />) ||
        (name === "Clients" && <ClientsIcon />) ||
        (name === "Favourites" && <FavouritesIcon />) ||
        (name === "Showreel" && <ShowreelIcon />) ||
        (name === "Settings" && <SettingsIcon />) ||
        (name === "Donate" && <DonateIcon />) ||
        (name === "Wormhole" && <WormholeIcon />) ||
        (name === "Contact" && <ContactIcon />) ||
        (name === "Message" && <MessageIcon />) ||
        (name === "Games" && <GamesIcon />) ||
        (name === "Instagram" && <InstagramIcon />)}
    </div>
  );
}

function baseIcon(children: React.ReactNode) {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full fill-none">
      <rect x="2" y="2" width="20" height="20" rx="0" className="fill-white/8 stroke-white/25" />
      <g className="stroke-white/85" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

// ===== Portfolio Icons =====
function AboutIcon() { return baseIcon(<><path d="M9 9h6"/><path d="M9 12h6"/><path d="M9 15h4"/><circle cx="7" cy="10" r="1.2"/></>); }
function WorkIcon() { return baseIcon(<><rect x="6" y="8" width="12" height="8" rx="2"/><path d="M9 8V6h6v2"/></>); }
function ClientsIcon() { return baseIcon(<><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M5.5 17c1.2-2.5 3-3.5 3.5-3.5S12.5 14.5 13 17"/><path d="M12.5 17c1.2-2.5 3-3.5 3.5-3.5S19.5 14.5 20 17"/></>); }
function FavouritesIcon() { return baseIcon(<><path d="M12 18l-4.2 2.2.8-4.7L5 11.8l4.8-.7L12 6l2.2 5.1 4.8.7-3.6 3.7.8 4.7z"/></>); }
function ShowreelIcon() { return baseIcon(<><rect x="6" y="8" width="12" height="8" rx="2"/><path d="M11 10v4l3-2z"/></>); }
function SettingsIcon() { return baseIcon(<><circle cx="12" cy="12" r="3"/><path d="M12 6v2M12 16v2M6 12h2M16 12h2M7.8 7.8l1.4 1.4M14.8 14.8l1.4 1.4M7.8 16.2l1.4-1.4M14.8 9.2l1.4-1.4"/></>); }
function DonateIcon() { return baseIcon(<><path d="M8 11a4 4 0 0 1 8 0c0 3-4 5-4 5s-4-2-4-5z"/><path d="M12 7v8"/></>); }
function WormholeIcon() { return baseIcon(<><circle cx="12" cy="12" r="5"/><path d="M7 12h10M12 7v10"/></>); }
function ContactIcon() { return baseIcon(<><path d="M5 8h14v8H5z"/><path d="M5 8l7 5 7-5"/></>); }
function MessageIcon() { return baseIcon(<><rect x="5" y="7" width="14" height="10" rx="2"/><path d="M7 10h10M7 13h6"/></>); }
function GamesIcon() { return baseIcon(<><path d="M7 14h10"/><path d="M9 12v4M15 12v4"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></>); }
function InstagramIcon() { return baseIcon(<><rect x="7" y="7" width="10" height="10" rx="3"/><circle cx="12" cy="12" r="3"/><circle cx="15.5" cy="8.5" r="0.8"/></>); }

// ===== Pixel Hardware Icons (CALL, MENU, BACK, POWER) + Trackpad Metal =====
function PixelCallIcon() {
  return (
    <svg viewBox="0 0 169.35 169.35" className="h-full w-full">
      <g fill="#94b039">
        <rect x="60.68" y="120.39" width="8" height="8"/><rect x="68.68" y="128.39" width="8" height="8"/><rect x="76.68" y="128.39" width="8" height="8"/><rect x="84.68" y="128.39" width="8" height="8"/><rect x="92.68" y="128.39" width="8" height="8"/><rect x="100.68" y="120.39" width="8" height="8"/><rect x="36.68" y="112.35" width="8" height="8"/><rect x="44.68" y="112.35" width="8" height="8"/><rect x="52.68" y="120.39" width="8" height="8"/><rect x="108.68" y="120.39" width="8" height="8"/><rect x="116.68" y="112.35" width="8" height="8"/><rect x="124.68" y="112.35" width="8" height="8"/><rect x="28.68" y="104.35" width="8" height="8"/><rect x="68.68" y="104.35" width="8" height="8"/><rect x="76.68" y="104.35" width="8" height="8"/><rect x="84.68" y="104.35" width="8" height="8"/><rect x="92.68" y="104.35" width="8" height="8"/><rect x="132.68" y="104.35" width="8" height="8"/><rect x="20.68" y="96.35" width="8" height="8"/><rect x="52.68" y="96.35" width="8" height="8"/><rect x="60.68" y="96.35" width="8" height="8"/><rect x="100.68" y="96.35" width="8" height="8"/><rect x="108.68" y="96.35" width="8" height="8"/><rect x="140.68" y="96.35" width="8" height="8"/><rect x="20.68" y="88.35" width="8" height="8"/><rect x="52.68" y="88.35" width="8" height="8"/><rect x="108.68" y="88.35" width="8" height="8"/><rect x="140.68" y="88.35" width="8" height="8"/><rect x="20.68" y="80.35" width="8" height="8"/><rect x="60.68" y="80.35" width="8" height="8"/><rect x="100.68" y="80.35" width="8" height="8"/><rect x="140.68" y="80.35" width="8" height="8"/><rect x="28.68" y="72.35" width="8" height="8"/><rect x="52.68" y="72.35" width="8" height="8"/><rect x="108.68" y="72.35" width="8" height="8"/><rect x="132.68" y="72.35" width="8" height="8"/><rect x="36.68" y="64.35" width="8" height="8"/><rect x="44.68" y="64.35" width="8" height="8"/><rect x="116.68" y="64.35" width="8" height="8"/><rect x="124.68" y="64.35" width="8" height="8"/><rect x="68.68" y="48.96" width="8" height="8"/><rect x="76.68" y="48.96" width="8" height="8"/><rect x="84.68" y="48.96" width="8" height="8"/><rect x="92.68" y="48.96" width="8" height="8"/><rect x="60.68" y="56.96" width="8" height="8"/><rect x="100.68" y="56.96" width="8" height="8"/><rect x="48.68" y="40.96" width="8" height="8"/><rect x="40.68" y="48.96" width="8" height="8"/><rect x="112.68" y="40.96" width="8" height="8"/><rect x="120.68" y="48.96" width="8" height="8"/><rect x="56.68" y="32.96" width="8" height="8"/><rect x="64.68" y="32.96" width="8" height="8"/><rect x="72.68" y="32.96" width="8" height="8"/><rect x="80.68" y="32.96" width="8" height="8"/><rect x="88.68" y="32.96" width="8" height="8"/><rect x="96.68" y="32.96" width="8" height="8"/><rect x="104.68" y="32.96" width="8" height="8"/>
      </g>
    </svg>
  );
}
function PixelMenuIcon() {
  return (
    <svg viewBox="0 0 169.35 169.35" className="h-full w-full">
      <g fill="#6b6b6b" stroke="#6b6b6b" strokeWidth={0.27} strokeMiterlimit={10}>
        <rect x="40.68" y="88.68" width="8" height="8"/><rect x="32.68" y="96.68" width="8" height="8"/><rect x="32.68" y="104.68" width="8" height="8"/><rect x="32.68" y="112.68" width="8" height="8"/><rect x="32.68" y="120.68" width="8" height="8"/><rect x="40.68" y="128.68" width="8" height="8"/><rect x="48.68" y="88.68" width="8" height="8"/><rect x="56.68" y="88.68" width="8" height="8"/><rect x="64.68" y="88.68" width="8" height="8"/><rect x="96.68" y="88.68" width="8" height="8"/><rect x="104.68" y="88.68" width="8" height="8"/><rect x="112.68" y="88.68" width="8" height="8"/><rect x="120.68" y="88.68" width="8" height="8"/><rect x="72.68" y="96.68" width="8" height="8"/><rect x="88.68" y="96.68" width="8" height="8"/><rect x="128.68" y="96.68" width="8" height="8"/><rect x="72.68" y="104.68" width="8" height="8"/><rect x="88.68" y="104.68" width="8" height="8"/><rect x="128.68" y="104.68" width="8" height="8"/><rect x="72.68" y="112.68" width="8" height="8"/><rect x="88.68" y="112.68" width="8" height="8"/><rect x="128.68" y="112.68" width="8" height="8"/><rect x="72.68" y="120.68" width="8" height="8"/><rect x="88.68" y="120.68" width="8" height="8"/><rect x="128.68" y="120.68" width="8" height="8"/><rect x="48.68" y="128.68" width="8" height="8"/><rect x="56.68" y="128.68" width="8" height="8"/><rect x="64.68" y="128.68" width="8" height="8"/><rect x="96.68" y="128.68" width="8" height="8"/><rect x="104.68" y="128.68" width="8" height="8"/><rect x="112.68" y="128.68" width="8" height="8"/><rect x="120.68" y="128.68" width="8" height="8"/><rect x="40.68" y="32.68" width="8" height="8"/><rect x="48.68" y="32.68" width="8" height="8"/><rect x="56.68" y="32.68" width="8" height="8"/><rect x="64.68" y="32.68" width="8" height="8"/><rect x="32.68" y="40.68" width="8" height="8"/><rect x="72.68" y="40.68" width="8" height="8"/><rect x="32.68" y="48.68" width="8" height="8"/><rect x="72.68" y="48.68" width="8" height="8"/><rect x="32.68" y="56.68" width="8" height="8"/><rect x="72.68" y="56.68" width="8" height="8"/><rect x="32.68" y="64.68" width="8" height="8"/><rect x="72.68" y="64.68" width="8" height="8"/><rect x="40.68" y="72.68" width="8" height="8"/><rect x="48.68" y="72.68" width="8" height="8"/><rect x="56.68" y="72.68" width="8" height="8"/><rect x="64.68" y="72.68" width="8" height="8"/><rect x="96.68" y="32.68" width="8" height="8"/><rect x="104.68" y="32.68" width="8" height="8"/><rect x="112.68" y="32.68" width="8" height="8"/><rect x="120.68" y="32.68" width="8" height="8"/><rect x="88.68" y="40.68" width="8" height="8"/><rect x="128.68" y="40.68" width="8" height="8"/><rect x="88.68" y="48.68" width="8" height="8"/><rect x="128.68" y="48.68" width="8" height="8"/><rect x="88.68" y="56.68" width="8" height="8"/><rect x="128.68" y="56.68" width="8" height="8"/><rect x="88.68" y="64.68" width="8" height="8"/><rect x="128.68" y="64.68" width="8" height="8"/><rect x="96.68" y="72.68" width="8" height="8"/><rect x="104.68" y="72.68" width="8" height="8"/><rect x="112.68" y="72.68" width="8" height="8"/><rect x="120.68" y="72.68" width="8" height="8"/>
      </g>
    </svg>
  );
}
function PixelBackIcon() {
  return (
    <svg viewBox="0 0 169.35 169.35" className="h-full w-full">
      <g fill="#6b6b6b" stroke="#6b6b6b" strokeWidth={0.27} strokeMiterlimit={10}>
        <rect x="28.68" y="56.67" width="8" height="8"/><rect x="36.68" y="48.67" width="8" height="8"/><rect x="44.68" y="40.67" width="8" height="8"/><rect x="52.68" y="32.67" width="8" height="8"/><rect x="60.68" y="40.67" width="8" height="8"/><rect x="60.68" y="32.67" width="8" height="8"/><rect x="60.68" y="48.67" width="8" height="8"/><rect x="68.68" y="48.67" width="8" height="8"/><rect x="36.68" y="64.67" width="8" height="8"/><rect x="44.68" y="72.67" width="8" height="8"/><rect x="52.68" y="80.67" width="8" height="8"/><rect x="60.68" y="72.67" width="8" height="8"/><rect x="60.68" y="80.67" width="8" height="8"/><rect x="60.68" y="64.67" width="8" height="8"/><rect x="68.68" y="64.67" width="24" height="8"/><rect x="92.67" y="64.67" width="8" height="8"/><rect x="132.67" y="64.67" width="8" height="8"/><rect x="132.67" y="80.67" width="8" height="8"/><rect x="132.67" y="72.67" width="8" height="8"/><rect x="132.67" y="88.67" width="8" height="8"/><rect x="132.67" y="96.71" width="8" height="8"/><rect x="132.67" y="104.67" width="8" height="8"/><rect x="52.67" y="128.68" width="8" height="8"/><rect x="44.67" y="128.68" width="8" height="8"/><rect x="60.67" y="128.68" width="8" height="8"/><rect x="60.67" y="112.67" width="8" height="8"/><rect x="52.67" y="120.67" width="8" height="8"/><rect x="68.67" y="128.68" width="8" height="8"/><rect x="76.67" y="128.68" width="8" height="8"/><rect x="68.67" y="112.67" width="8" height="8"/><rect x="76.67" y="112.67" width="8" height="8"/><rect x="84.67" y="128.68" width="8" height="8"/><rect x="92.67" y="128.68" width="8" height="8"/><rect x="84.68" y="112.67" width="8" height="8"/><rect x="92.68" y="112.67" width="8" height="8"/><rect x="100.68" y="112.67" width="8" height="8"/><rect x="100.68" y="128.67" width="8" height="8"/><rect x="108.67" y="128.67" width="8" height="8"/><rect x="132.67" y="120.68" width="8" height="8"/><rect x="124.7" y="128.66" width="8" height="8"/><rect x="116.67" y="128.68" width="8" height="8"/><rect x="132.67" y="112.67" width="8" height="8"/><rect x="108.67" y="48.67" width="8" height="8"/><rect x="116.67" y="48.67" width="8" height="8"/><rect x="100.67" y="64.67" width="8" height="8"/><rect x="76.67" y="48.67" width="8" height="8"/><rect x="84.68" y="48.67" width="8" height="8"/><rect x="92.68" y="48.67" width="8" height="8"/><rect x="100.68" y="48.67" width="8" height="8"/><rect x="108.67" y="64.67" width="8" height="8"/><rect x="124.67" y="56.67" width="8" height="8"/><rect x="116.66" y="88.67" width="8" height="8"/><rect x="116.68" y="72.67" width="8" height="8"/><rect x="116.68" y="80.67" width="8" height="8"/><rect x="116.68" y="96.67" width="8" height="8"/><rect x="116.68" y="104.68" width="8" height="8"/><rect x="116.67" y="112.67" width="8" height="8"/><rect x="108.67" y="72.67" width="8" height="8"/><rect x="108.66" y="112.67" width="8" height="8"/>
      </g>
    </svg>
  );
}
function PixelPowerIcon() {
  return (
    <svg viewBox="0 0 169.35 169.35" className="h-full w-full">
      <g fill="#a92624">
        <rect x="60.68" y="40.5" width="8" height="8"/><rect x="68.68" y="32.5" width="8" height="8"/><rect x="76.68" y="32.5" width="8" height="8"/><rect x="84.68" y="32.5" width="8" height="8"/><rect x="92.68" y="32.5" width="8" height="8"/><rect x="100.68" y="40.5" width="8" height="8"/><rect x="36.68" y="48.55" width="8" height="8"/><rect x="44.68" y="48.55" width="8" height="8"/><rect x="52.68" y="40.5" width="8" height="8"/><rect x="108.68" y="40.5" width="8" height="8"/><rect x="116.68" y="48.55" width="8" height="8"/><rect x="124.68" y="48.55" width="8" height="8"/><rect x="28.68" y="56.55" width="8" height="8"/><rect x="68.68" y="56.55" width="8" height="8"/><rect x="76.68" y="56.55" width="8" height="8"/><rect x="84.68" y="56.55" width="8" height="8"/><rect x="92.68" y="56.55" width="8" height="8"/><rect x="132.68" y="56.55" width="8" height="8"/><rect x="20.68" y="64.55" width="8" height="8"/><rect x="52.68" y="64.55" width="8" height="8"/><rect x="60.68" y="64.55" width="8" height="8"/><rect x="100.68" y="64.55" width="8" height="8"/><rect x="108.68" y="64.55" width="8" height="8"/><rect x="140.68" y="64.55" width="8" height="8"/><rect x="20.68" y="72.55" width="8" height="8"/><rect x="60.68" y="72.55" width="8" height="8"/><rect x="100.68" y="72.55" width="8" height="8"/><rect x="140.68" y="72.55" width="8" height="8"/><rect x="20.68" y="80.55" width="8" height="8"/><rect x="60.68" y="80.55" width="8" height="8"/><rect x="100.68" y="80.55" width="8" height="8"/><rect x="140.68" y="80.55" width="8" height="8"/><rect x="28.68" y="88.55" width="8" height="8"/><rect x="52.68" y="88.55" width="8" height="8"/><rect x="108.68" y="88.55" width="8" height="8"/><rect x="132.68" y="88.55" width="8" height="8"/><rect x="36.68" y="96.55" width="8" height="8"/><rect x="44.68" y="96.55" width="8" height="8"/><rect x="116.68" y="96.55" width="8" height="8"/><rect x="124.68" y="96.55" width="8" height="8"/><rect x="80.68" y="96.85" width="8" height="8"/><rect x="80.68" y="88.79" width="8" height="8"/><rect x="60.68" y="104.85" width="8" height="8"/><rect x="80.68" y="104.85" width="8" height="8"/><rect x="100.68" y="104.85" width="8" height="8"/><rect x="92.68" y="96.64" width="8" height="8"/><rect x="68.68" y="96.64" width="8" height="8"/><rect x="60.68" y="112.85" width="8" height="8"/><rect x="80.68" y="112.85" width="8" height="8"/><rect x="100.68" y="112.85" width="8" height="8"/><rect x="60.68" y="120.85" width="8" height="8"/><rect x="100.68" y="120.85" width="8" height="8"/><rect x="76.68" y="128.85" width="8" height="8"/><rect x="68.68" y="128.85" width="8" height="8"/><rect x="84.68" y="128.85" width="8" height="8"/><rect x="92.68" y="128.85" width="8" height="8"/>
      </g>
    </svg>
  );
}
function TrackpadMetal() {
  // Metallic trackpad based on Enhanced_BESTSOFAR_Styled 2.html
  const container: React.CSSProperties = {
    background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)",
    borderRadius: "16px",
    padding: "4px",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    animation: "pulseGlow 4s infinite ease-in-out"
  };

  const metalButton: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    background: "radial-gradient(circle at 40% 30%, #1a1a1a 0%, #111 100%)",
    border: "4px solid #6c6c6c",
    boxShadow: "inset -4px -4px 12px rgba(255, 255, 255, 0.1), inset 4px 4px 12px rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    transition: "transform 0.2s ease"
  };

  const shine: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "12px",
    background: "radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)",
    pointerEvents: "none"
  };

  return (
    <div style={container}>
      <div style={metalButton}>
        <div style={shine} />
      </div>
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 25px rgba(255, 157, 35, 0.15); }
          50% { box-shadow: 0 0 45px rgba(255, 157, 35, 0.3); }
          100% { box-shadow: 0 0 25px rgba(255, 157, 35, 0.15); }
        }
      `}</style>
    </div>
  );
}
