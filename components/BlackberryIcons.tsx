import React from "react";

// ===== Base Icon Helper =====
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
export function AboutIcon() { return baseIcon(<><path d="M9 9h6"/><path d="M9 12h6"/><path d="M9 15h4"/><circle cx="7" cy="10" r="1.2"/></>); }
export function WorkIcon() { return baseIcon(<><rect x="6" y="8" width="12" height="8" rx="2"/><path d="M9 8V6h6v2"/></>); }
export function ClientsIcon() { return baseIcon(<><circle cx="9" cy="11" r="2"/><circle cx="15" cy="11" r="2"/><path d="M5.5 17c1.2-2.5 3-3.5 3.5-3.5S12.5 14.5 13 17"/><path d="M12.5 17c1.2-2.5 3-3.5 3.5-3.5S19.5 14.5 20 17"/></>); }
export function FavouritesIcon() { return baseIcon(<><path d="M12 18l-4.2 2.2.8-4.7L5 11.8l4.8-.7L12 6l2.2 5.1 4.8.7-3.6 3.7.8 4.7z"/></>); }
export function ShowreelIcon() { return baseIcon(<><rect x="6" y="8" width="12" height="8" rx="2"/><path d="M11 10v4l3-2z"/></>); }
export function SettingsIcon() { return baseIcon(<><circle cx="12" cy="12" r="3"/><path d="M12 6v2M12 16v2M6 12h2M16 12h2M7.8 7.8l1.4 1.4M14.8 14.8l1.4 1.4M7.8 16.2l1.4-1.4M14.8 9.2l1.4-1.4"/></>); }
export function DonateIcon() { return baseIcon(<><path d="M8 11a4 4 0 0 1 8 0c0 3-4 5-4 5s-4-2-4-5z"/><path d="M12 7v8"/></>); }
export function WormholeIcon() { return baseIcon(<><circle cx="12" cy="12" r="5"/><path d="M7 12h10M12 7v10"/></>); }
export function ContactIcon() { return baseIcon(<><path d="M5 8h14v8H5z"/><path d="M5 8l7 5 7-5"/></>); }
export function MessageIcon() { return baseIcon(<><rect x="5" y="7" width="14" height="10" rx="2"/><path d="M7 10h10M7 13h6"/></>); }
export function GamesIcon() { return baseIcon(<><path d="M7 14h10"/><path d="M9 12v4M15 12v4"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></>); }
export function InstagramIcon() { return baseIcon(<><rect x="7" y="7" width="10" height="10" rx="3"/><circle cx="12" cy="12" r="3"/><circle cx="15.5" cy="8.5" r="0.8"/></>); }

// ===== Status Bar Icons =====
export function VolumeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 16 16" fill="none" className="opacity-90">
      <path d="M8 3L5 6H2v4h3l3 3V3z" fill="currentColor" />
      <path d="M11 5c.5.5.8 1.2.8 2s-.3 1.5-.8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SignalBars({ strength = 4 }: { strength?: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-end gap-1" role="img" aria-label={`Signal ${strength}/4`}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={["w-2 rounded-none", i <= strength - 1 ? "bg-white" : "bg-white/30"].join(" ")} style={{ height: 8 + i * 6 }} />
      ))}
    </div>
  );
}

export function Battery({ level = 50, charging = false }: { level?: number; charging?: boolean }) {
  const pct = Math.max(0, Math.min(100, level));
  const color = pct < 20 ? "#ef4444" : charging ? "#fbbf24" : "#22c55e";

  return (
    <div className={`relative h-6 w-12 rounded-none border-2 border-white/70 ${charging ? "animate-pulse" : ""}`}>
      <div className="absolute inset-1 rounded-none" style={{ width: `${pct}%`, backgroundColor: color }} />
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-white/70" />
    </div>
  );
}

// ===== Hardware Icons (Pixel Art) =====
export function PixelCallIcon() {
  return (
    <svg viewBox="0 0 169.35 169.35" className="h-full w-full">
      <g fill="#94b039">
        <rect x="60.68" y="120.39" width="8" height="8"/><rect x="68.68" y="128.39" width="8" height="8"/><rect x="76.68" y="128.39" width="8" height="8"/><rect x="84.68" y="128.39" width="8" height="8"/><rect x="92.68" y="128.39" width="8" height="8"/><rect x="100.68" y="120.39" width="8" height="8"/><rect x="36.68" y="112.35" width="8" height="8"/><rect x="44.68" y="112.35" width="8" height="8"/><rect x="52.68" y="120.39" width="8" height="8"/><rect x="108.68" y="120.39" width="8" height="8"/><rect x="116.68" y="112.35" width="8" height="8"/><rect x="124.68" y="112.35" width="8" height="8"/><rect x="28.68" y="104.35" width="8" height="8"/><rect x="68.68" y="104.35" width="8" height="8"/><rect x="76.68" y="104.35" width="8" height="8"/><rect x="84.68" y="104.35" width="8" height="8"/><rect x="92.68" y="104.35" width="8" height="8"/><rect x="132.68" y="104.35" width="8" height="8"/><rect x="20.68" y="96.35" width="8" height="8"/><rect x="52.68" y="96.35" width="8" height="8"/><rect x="60.68" y="96.35" width="8" height="8"/><rect x="100.68" y="96.35" width="8" height="8"/><rect x="108.68" y="96.35" width="8" height="8"/><rect x="140.68" y="96.35" width="8" height="8"/><rect x="20.68" y="88.35" width="8" height="8"/><rect x="52.68" y="88.35" width="8" height="8"/><rect x="108.68" y="88.35" width="8" height="8"/><rect x="140.68" y="88.35" width="8" height="8"/><rect x="20.68" y="80.35" width="8" height="8"/><rect x="60.68" y="80.35" width="8" height="8"/><rect x="100.68" y="80.35" width="8" height="8"/><rect x="140.68" y="80.35" width="8" height="8"/><rect x="28.68" y="72.35" width="8" height="8"/><rect x="52.68" y="72.35" width="8" height="8"/><rect x="108.68" y="72.35" width="8" height="8"/><rect x="132.68" y="72.35" width="8" height="8"/><rect x="36.68" y="64.35" width="8" height="8"/><rect x="44.68" y="64.35" width="8" height="8"/><rect x="116.68" y="64.35" width="8" height="8"/><rect x="124.68" y="64.35" width="8" height="8"/><rect x="68.68" y="48.96" width="8" height="8"/><rect x="76.68" y="48.96" width="8" height="8"/><rect x="84.68" y="48.96" width="8" height="8"/><rect x="92.68" y="48.96" width="8" height="8"/><rect x="60.68" y="56.96" width="8" height="8"/><rect x="100.68" y="56.96" width="8" height="8"/><rect x="48.68" y="40.96" width="8" height="8"/><rect x="40.68" y="48.96" width="8" height="8"/><rect x="112.68" y="40.96" width="8" height="8"/><rect x="120.68" y="48.96" width="8" height="8"/><rect x="56.68" y="32.96" width="8" height="8"/><rect x="64.68" y="32.96" width="8" height="8"/><rect x="72.68" y="32.96" width="8" height="8"/><rect x="80.68" y="32.96" width="8" height="8"/><rect x="88.68" y="32.96" width="8" height="8"/><rect x="96.68" y="32.96" width="8" height="8"/><rect x="104.68" y="32.96" width="8" height="8"/>
      </g>
    </svg>
  );
}

export function PixelMenuIcon() {
  return (
    <svg viewBox="0 0 169.35 169.35" className="h-full w-full">
      <g fill="#6b6b6b" stroke="#6b6b6b" strokeWidth={0.27} strokeMiterlimit={10}>
        <rect x="40.68" y="88.68" width="8" height="8"/><rect x="32.68" y="96.68" width="8" height="8"/><rect x="32.68" y="104.68" width="8" height="8"/><rect x="32.68" y="112.68" width="8" height="8"/><rect x="32.68" y="120.68" width="8" height="8"/><rect x="40.68" y="128.68" width="8" height="8"/><rect x="48.68" y="88.68" width="8" height="8"/><rect x="56.68" y="88.68" width="8" height="8"/><rect x="64.68" y="88.68" width="8" height="8"/><rect x="96.68" y="88.68" width="8" height="8"/><rect x="104.68" y="88.68" width="8" height="8"/><rect x="112.68" y="88.68" width="8" height="8"/><rect x="120.68" y="88.68" width="8" height="8"/><rect x="72.68" y="96.68" width="8" height="8"/><rect x="88.68" y="96.68" width="8" height="8"/><rect x="128.68" y="96.68" width="8" height="8"/><rect x="72.68" y="104.68" width="8" height="8"/><rect x="88.68" y="104.68" width="8" height="8"/><rect x="128.68" y="104.68" width="8" height="8"/><rect x="72.68" y="112.68" width="8" height="8"/><rect x="88.68" y="112.68" width="8" height="8"/><rect x="128.68" y="112.68" width="8" height="8"/><rect x="72.68" y="120.68" width="8" height="8"/><rect x="88.68" y="120.68" width="8" height="8"/><rect x="128.68" y="120.68" width="8" height="8"/><rect x="48.68" y="128.68" width="8" height="8"/><rect x="56.68" y="128.68" width="8" height="8"/><rect x="64.68" y="128.68" width="8" height="8"/><rect x="96.68" y="128.68" width="8" height="8"/><rect x="104.68" y="128.68" width="8" height="8"/><rect x="112.68" y="128.68" width="8" height="8"/><rect x="120.68" y="128.68" width="8" height="8"/><rect x="40.68" y="32.68" width="8" height="8"/><rect x="48.68" y="32.68" width="8" height="8"/><rect x="56.68" y="32.68" width="8" height="8"/><rect x="64.68" y="32.68" width="8" height="8"/><rect x="32.68" y="40.68" width="8" height="8"/><rect x="72.68" y="40.68" width="8" height="8"/><rect x="32.68" y="48.68" width="8" height="8"/><rect x="72.68" y="48.68" width="8" height="8"/><rect x="32.68" y="56.68" width="8" height="8"/><rect x="72.68" y="56.68" width="8" height="8"/><rect x="32.68" y="64.68" width="8" height="8"/><rect x="72.68" y="64.68" width="8" height="8"/><rect x="40.68" y="72.68" width="8" height="8"/><rect x="48.68" y="72.68" width="8" height="8"/><rect x="56.68" y="72.68" width="8" height="8"/><rect x="64.68" y="72.68" width="8" height="8"/><rect x="96.68" y="32.68" width="8" height="8"/><rect x="104.68" y="32.68" width="8" height="8"/><rect x="112.68" y="32.68" width="8" height="8"/><rect x="120.68" y="32.68" width="8" height="8"/><rect x="88.68" y="40.68" width="8" height="8"/><rect x="128.68" y="40.68" width="8" height="8"/><rect x="88.68" y="48.68" width="8" height="8"/><rect x="128.68" y="48.68" width="8" height="8"/><rect x="88.68" y="56.68" width="8" height="8"/><rect x="128.68" y="56.68" width="8" height="8"/><rect x="88.68" y="64.68" width="8" height="8"/><rect x="128.68" y="64.68" width="8" height="8"/><rect x="96.68" y="72.68" width="8" height="8"/><rect x="104.68" y="72.68" width="8" height="8"/><rect x="112.68" y="72.68" width="8" height="8"/><rect x="120.68" y="72.68" width="8" height="8"/>
      </g>
    </svg>
  );
}

export function PixelBackIcon() {
  return (
    <svg viewBox="0 0 169.35 169.35" className="h-full w-full">
      <g fill="#6b6b6b" stroke="#6b6b6b" strokeWidth={0.27} strokeMiterlimit={10}>
        <rect x="28.68" y="56.67" width="8" height="8"/><rect x="36.68" y="48.67" width="8" height="8"/><rect x="44.68" y="40.67" width="8" height="8"/><rect x="52.68" y="32.67" width="8" height="8"/><rect x="60.68" y="40.67" width="8" height="8"/><rect x="60.68" y="32.67" width="8" height="8"/><rect x="60.68" y="48.67" width="8" height="8"/><rect x="68.68" y="48.67" width="8" height="8"/><rect x="36.68" y="64.67" width="8" height="8"/><rect x="44.68" y="72.67" width="8" height="8"/><rect x="52.68" y="80.67" width="8" height="8"/><rect x="60.68" y="72.67" width="8" height="8"/><rect x="60.68" y="80.67" width="8" height="8"/><rect x="60.68" y="64.67" width="8" height="8"/><rect x="68.68" y="64.67" width="24" height="8"/><rect x="92.67" y="64.67" width="8" height="8"/><rect x="132.67" y="64.67" width="8" height="8"/><rect x="132.67" y="80.67" width="8" height="8"/><rect x="132.67" y="72.67" width="8" height="8"/><rect x="132.67" y="88.67" width="8" height="8"/><rect x="132.67" y="96.71" width="8" height="8"/><rect x="132.67" y="104.67" width="8" height="8"/><rect x="52.67" y="128.68" width="8" height="8"/><rect x="44.67" y="128.68" width="8" height="8"/><rect x="60.67" y="128.68" width="8" height="8"/><rect x="60.67" y="112.67" width="8" height="8"/><rect x="52.67" y="120.67" width="8" height="8"/><rect x="68.67" y="128.68" width="8" height="8"/><rect x="76.67" y="128.68" width="8" height="8"/><rect x="68.67" y="112.67" width="8" height="8"/><rect x="76.67" y="112.67" width="8" height="8"/><rect x="84.67" y="128.68" width="8" height="8"/><rect x="92.67" y="128.68" width="8" height="8"/><rect x="84.68" y="112.67" width="8" height="8"/><rect x="92.68" y="112.67" width="8" height="8"/><rect x="100.68" y="112.67" width="8" height="8"/><rect x="100.68" y="128.67" width="8" height="8"/><rect x="108.67" y="128.67" width="8" height="8"/><rect x="132.67" y="120.68" width="8" height="8"/><rect x="124.7" y="128.66" width="8" height="8"/><rect x="116.67" y="128.68" width="8" height="8"/><rect x="132.67" y="112.67" width="8" height="8"/><rect x="108.67" y="48.67" width="8" height="8"/><rect x="116.67" y="48.67" width="8" height="8"/><rect x="100.67" y="64.67" width="8" height="8"/><rect x="76.67" y="48.67" width="8" height="8"/><rect x="84.68" y="48.67" width="8" height="8"/><rect x="92.68" y="48.67" width="8" height="8"/><rect x="100.68" y="48.67" width="8" height="8"/><rect x="108.67" y="64.67" width="8" height="8"/><rect x="124.67" y="56.67" width="8" height="8"/><rect x="116.66" y="88.67" width="8" height="8"/><rect x="116.68" y="72.67" width="8" height="8"/><rect x="116.68" y="80.67" width="8" height="8"/><rect x="116.68" y="96.67" width="8" height="8"/><rect x="116.68" y="104.68" width="8" height="8"/><rect x="116.67" y="112.67" width="8" height="8"/><rect x="108.67" y="72.67" width="8" height="8"/><rect x="108.66" y="112.67" width="8" height="8"/>
      </g>
    </svg>
  );
}

export function PixelPowerIcon() {
  return (
    <svg viewBox="0 0 169.35 169.35" className="h-full w-full">
      <g fill="#a92624">
        <rect x="60.68" y="40.5" width="8" height="8"/><rect x="68.68" y="32.5" width="8" height="8"/><rect x="76.68" y="32.5" width="8" height="8"/><rect x="84.68" y="32.5" width="8" height="8"/><rect x="92.68" y="32.5" width="8" height="8"/><rect x="100.68" y="40.5" width="8" height="8"/><rect x="36.68" y="48.55" width="8" height="8"/><rect x="44.68" y="48.55" width="8" height="8"/><rect x="52.68" y="40.5" width="8" height="8"/><rect x="108.68" y="40.5" width="8" height="8"/><rect x="116.68" y="48.55" width="8" height="8"/><rect x="124.68" y="48.55" width="8" height="8"/><rect x="28.68" y="56.55" width="8" height="8"/><rect x="68.68" y="56.55" width="8" height="8"/><rect x="76.68" y="56.55" width="8" height="8"/><rect x="84.68" y="56.55" width="8" height="8"/><rect x="92.68" y="56.55" width="8" height="8"/><rect x="132.68" y="56.55" width="8" height="8"/><rect x="20.68" y="64.55" width="8" height="8"/><rect x="52.68" y="64.55" width="8" height="8"/><rect x="60.68" y="64.55" width="8" height="8"/><rect x="100.68" y="64.55" width="8" height="8"/><rect x="108.68" y="64.55" width="8" height="8"/><rect x="140.68" y="64.55" width="8" height="8"/><rect x="20.68" y="72.55" width="8" height="8"/><rect x="60.68" y="72.55" width="8" height="8"/><rect x="100.68" y="72.55" width="8" height="8"/><rect x="140.68" y="72.55" width="8" height="8"/><rect x="20.68" y="80.55" width="8" height="8"/><rect x="60.68" y="80.55" width="8" height="8"/><rect x="100.68" y="80.55" width="8" height="8"/><rect x="140.68" y="80.55" width="8" height="8"/><rect x="28.68" y="88.55" width="8" height="8"/><rect x="52.68" y="88.55" width="8" height="8"/><rect x="108.68" y="88.55" width="8" height="8"/><rect x="132.68" y="88.55" width="8" height="8"/><rect x="36.68" y="96.55" width="8" height="8"/><rect x="44.68" y="96.55" width="8" height="8"/><rect x="116.68" y="96.55" width="8" height="8"/><rect x="124.68" y="96.55" width="8" height="8"/><rect x="80.68" y="96.85" width="8" height="8"/><rect x="80.68" y="88.79" width="8" height="8"/><rect x="60.68" y="104.85" width="8" height="8"/><rect x="80.68" y="104.85" width="8" height="8"/><rect x="100.68" y="104.85" width="8" height="8"/><rect x="92.68" y="96.64" width="8" height="8"/><rect x="68.68" y="96.64" width="8" height="8"/><rect x="60.68" y="112.85" width="8" height="8"/><rect x="80.68" y="112.85" width="8" height="8"/><rect x="100.68" y="112.85" width="8" height="8"/><rect x="60.68" y="120.85" width="8" height="8"/><rect x="100.68" y="120.85" width="8" height="8"/><rect x="76.68" y="128.85" width="8" height="8"/><rect x="68.68" y="128.85" width="8" height="8"/><rect x="84.68" y="128.85" width="8" height="8"/><rect x="92.68" y="128.85" width="8" height="8"/>
      </g>
    </svg>
  );
}

// ===== Utility Component =====
export function AppGlyph({ name }: { name: string }) {
  const glyphs: Record<string, React.ReactNode> = {
    about: <AboutIcon />,
    work: <WorkIcon />,
    clients: <ClientsIcon />,
    favourites: <FavouritesIcon />,
    showreel: <ShowreelIcon />,
    settings: <SettingsIcon />,
    donate: <DonateIcon />,
    wormhole: <WormholeIcon />,
    contact: <ContactIcon />,
    message: <MessageIcon />,
    games: <GamesIcon />,
    instagram: <InstagramIcon />
  };
  return <>{glyphs[name] || <AboutIcon />}</>;
}
