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

  // Time/UI state
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Refs
  const screenRef = useRef<HTMLDivElement | null>(null);

  // Mount and clock tick
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

  // Navigation
  const navigateTo = (app: App) => {
    if (app.path) {
      if (app.external) {
        window.open(app.path, "_blank");
      } else {
        router.push(app.path);
      }
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
    setMode("home");
  };
  const goMenu = () => {
    if (!poweredOn) return;
    setShowContext(false);
    setOpenAppIndex(null);
    setMode("menu");
  };
  const goBack = () => {
    if (!poweredOn) return;
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
    setToast(null);
  };

  // Keyboard navigation (disabled when OFF)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!poweredOn) {
        if (e.key.toLowerCase() === "p") togglePower();
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
  }, [poweredOn, openAppIndex, showContext, mode, selectedMenu, rows, COLUMNS, apps.length, dockApps.length]);

  // Time strings (only render on client to avoid hydration mismatch)
  const timeStr = mounted ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const dateStr = mounted ? now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" }) : "Loading...";

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
          <div className="h-1.5 w-16 rounded-none bg-white/10" />
          <div
            className={`h-1.5 w-1.5 rounded-none ${poweredOn ? "bg-emerald-400/80 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]" : "bg-white/10"}`}
            title="Notification LED"
          />
        </div>

        {/* Screen */}
        <div ref={screenRef} className="mx-4 rounded-none overflow-hidden ring-1 ring-white/15 relative aspect-[3/4.6]">
          {/* Wallpaper */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(150%_120% at 50% 20%, rgba(9,20,40,0.85), rgba(0,0,0,0.95)),
                               linear-gradient(135deg, rgba(0,140,255,0.18), rgba(0,0,0,0) 60%),
                               repeating-linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 8px)`,
            }}
          />

          {/* Status bar */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-white/90 px-3 py-2 bg-black/30">
            <div className="flex items-center gap-2">
              <SignalBars strength={4} />
              <span className="tracking-wide">HTM</span>
            </div>
            <div className="font-semibold tabular-nums">{timeStr}</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]">3G</span>
              <Battery level={82} charging={false} />
            </div>
          </div>

          {/* Banner */}
          <div className="relative z-10 px-3 pt-2 text-white">
            <div className="text-xs opacity-80">{dateStr}</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/80">
              <NotiDot /> <span>2 new updates</span> • <NotiDot /> <span>1 event</span>
            </div>
          </div>

          {/* Main area */}
          {mode === "home" ? (
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

          {/* Hints */}
          {poweredOn && (
            <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-[10px] text-white/60 bg-black/30 border-t border-white/10">
              {mode === "home" ? "▲ to open Menu • ◀▶ to pick • Enter=Open" : "Arrows to move • Enter=Open • Esc=Home • M=Context"}
            </div>
          )}

          {/* POWER OFF OVERLAY (full screen OFF) */}
          {!poweredOn && (
            <div className="absolute inset-0 bg-black grid place-items-center" aria-label="Device off">
              <div className="uppercase tracking-[0.2em] text-xs sm:text-sm" style={{ color: ACCENT }}>System Off</div>
            </div>
          )}
        </div>

        {/* Hardware row (Call • Menu • Trackpad(paused) • Back • Power) */}
        <div className="px-6 pt-2 pb-4">
          <div className="mx-auto mt-2 grid grid-cols-5 items-center gap-2 text-white">
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
          {/* When OFF: dim non-power controls visually */}
          {!poweredOn && <div className="absolute inset-x-0 bottom-4 px-6 pointer-events-none"><div className="grid grid-cols-5 gap-2 opacity-40" /></div>}
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
  return (
    <div className="absolute inset-0">
      {/* breathing space */}
      <div className="absolute inset-x-0 top-14 bottom-20" />

      {/* Bold-style bottom dock overlay */}
      <div className="absolute left-0 right-0 bottom-5 px-3">
        <div className="mx-auto max-w-[94%] rounded-none border border-white/15 bg-black/45 backdrop-blur-md shadow-[0_6px_28px_rgba(0,0,0,0.45)]">
          <div className="grid grid-cols-5 gap-2 p-2">
            {dockApps.map((app, idx) => (
              <button
                key={app.name}
                className={[
                  "group relative flex flex-col items-center justify-center rounded-none border border-white/10 bg-white/5 p-2",
                  selectedDock === idx
                    ? "ring-2 ring-[#ff9d23] border-[#ff9d23] shadow-[0_0_0_2px_rgba(255,157,35,0.35)]"
                    : "hover:border-white/25",
                  "transition-all",
                ].join(" ")}
                onMouseEnter={() => setSelectedDock(idx)}
                onFocus={() => setSelectedDock(idx)}
                onClick={() => navigateTo(app)}
                aria-label={app.name}
              >
                <div className="h-8 w-8">{app.icon}</div>
                <div className="mt-1 text-[10px] text-white/90 leading-none text-center">{app.name}</div>
                {selectedDock === idx && (
                  <div className="pointer-events-none absolute inset-0 rounded-none ring-1 ring-[#ff9d23]/30 shadow-[inset_0_0_18px_rgba(255,157,35,0.35)]" />
                )}
              </button>
            ))}
          </div>
          <div className="px-3 pb-1 text-center text-white/60 text-[10px]">Up/Menu = All apps</div>
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
    <div className="relative z-10 grid grid-cols-3 gap-3 px-4 pt-4 pb-10 select-none">
      {apps.map((app, idx) => (
        <button
          key={app.name}
          className={[
            "group relative flex flex-col items-center justify-center rounded-none border border-white/10 bg-white/5 p-3 backdrop-blur-sm",
            selected === idx ? "ring-2 ring-[#ff9d23] border-[#ff9d23] shadow-[0_0_0_2px_rgba(255,157,35,0.35)]" : "hover:border-white/25",
            "transition-all",
          ].join(" ")}
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
          <div className="mt-2 text-[11px] text-white/90 leading-none text-center">{app.name}</div>
          {selected === idx && (
            <div className="pointer-events-none absolute inset-0 rounded-none ring-1 ring-[#ff9d23]/30 shadow-[inset_0_0_24px_rgba(255,157,35,0.35)]" />
          )}
        </button>
      ))}
    </div>
  );
}

function HwButton({ children, label, onClick, disabled, className }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button onClick={onClick} aria-label={label} className={`group flex flex-col items-center gap-1 ${disabled ? "opacity-40 pointer-events-none" : ""} ${className || ""}`}>
      <div className="grid place-items-center h-10 w-10 rounded-none border border-white/10 bg-white/5 backdrop-blur-sm">
        {children}
      </div>
      <div className="text-[10px] leading-none opacity-70">{label}</div>
    </button>
  );
}

// =====================
// Icons & Glyphs
// =====================
function NotiDot() {
  return <span className="inline-block h-1.5 w-1.5 align-middle" style={{ backgroundColor: ACCENT }} />;
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
  return (
    <div className="relative h-3 w-6 rounded-none border border-white/70">
      <div className="absolute -right-1 top-0.5 h-2 w-0.5 bg-white/70" />
      <div className="h-full" style={{ width: `${pct}%`, background: pct < 20 ? "#ef4444" : "#22c55e" }} />
      {charging && <div className="absolute inset-0 grid place-items-center text-[9px]">⚡️</div>}
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
  const outer: React.CSSProperties = { background: "linear-gradient(145deg, #2a2a2a, #1a1a1a)", borderRadius: 0, padding: 3 };
  const inner: React.CSSProperties = {
    width: "100%", height: "100%", borderRadius: 0, border: "3px solid #6c6c6c",
    background: "radial-gradient(circle at 40% 30%, #1a1a1a 0%, #111 100%)",
    boxShadow: "inset -2px -2px 6px rgba(255,255,255,0.1), inset 2px 2px 6px rgba(0,0,0,0.6)", position: "relative"
  };
  const shine: React.CSSProperties = {
    position: "absolute", inset: 0, borderRadius: 0,
    background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)", pointerEvents: "none"
  };
  return (
    <div style={outer} className="h-full w-full">
      <div style={inner}><div style={shine} /></div>
    </div>
  );
}
