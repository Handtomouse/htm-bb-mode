"use client";

// Force cache invalidation - updated 2025-11-13
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Client {
  name: string;
  sector: string;
  projects: number;
  featured?: boolean;
  status?: "active" | "completed";
  tagline?: string;
  website?: string;
  deliverables?: string[];
  testimonial?: string;
  yearStarted?: number;
  results?: string;
  logo?: string;
}

const SECTOR_COLORS: Record<string, string> = {
  "Financial Services": "#00d4aa",
  "Banking": "#00d4aa",
  "Superannuation": "#ff6b35",
  "Creative Agency": "#9b5de5",
  "Fashion / Political": "#ff006e",
  "Fashion / Lifestyle": "#ff006e",
  "Surfing / Lifestyle": "#06ffa5",
  "Health / Wellness": "#06ffa5",
  "Marketing / Media": "#9b5de5",
  "Pet Care": "#ffbe0b",
  "Automotive / Luxury": "#fb5607",
  "Food & Beverage": "#ffbe0b",
  "Technology / CRM": "#3a86ff",
};

// Client Cell Component with Magnetic Hover
function ClientCell({
  client,
  sectorColor,
  isLongTerm,
  delay,
  onHoverChange,
  onClick,
}: {
  client: Client;
  sectorColor: string;
  isLongTerm: boolean;
  delay: number;
  onHoverChange: (hovering: boolean) => void;
  onClick: () => void;
}) {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const cellRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cellRef.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.1;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.1;
    setLocalMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setLocalMousePos({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={cellRef}
      type="button"
      aria-label={`View details for ${client.name}${client.tagline ? ` - ${client.tagline}` : ''}${client.sector ? ` (${client.sector})` : ''}`}
      initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: delay + 0.1,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => onHoverChange(true)}
      onMouseExit={() => onHoverChange(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative aspect-square border-r border-b border-white/5 flex items-center justify-center bg-[#0b0b0b] hover:bg-white/5 transition-all duration-700 overflow-hidden hover:cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[#0b0b0b] focus:z-10"
    >
      {/* Light streak reveal effect */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        whileInView={{ x: '200%', opacity: [0, 1, 1, 0] }}
        viewport={{ once: true }}
        transition={{
          duration: 1.2,
          delay: delay + 0.1,
          ease: [0.43, 0.13, 0.23, 0.96]
        }}
        className="absolute inset-y-0 w-[40%] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${sectorColor}30, transparent)`,
          filter: 'blur(20px)'
        }}
      />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Gradient overlay (bottom fade) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Featured spotlight effect */}
      {client.featured && (
        <div
          className="absolute inset-0 border-2 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
          style={{
            borderColor: sectorColor,
            boxShadow: `inset 0 0 40px ${sectorColor}40`
          }}
        />
      )}

      {/* Sector color indicator with gradient - horizontal top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${sectorColor} 50%, transparent 100%)`
        }}
      />

      {/* Sector color indicator - vertical left stripe */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[3px] opacity-0 group-hover:opacity-80 transition-all duration-700"
        style={{
          background: `linear-gradient(180deg, ${sectorColor}00 0%, ${sectorColor} 50%, ${sectorColor}00 100%)`,
          boxShadow: `0 0 12px ${sectorColor}60`
        }}
      />

      {/* Grid line glow propagation */}
      <div className="absolute -top-[1px] -right-[1px] w-[1px] h-8 opacity-0 group-hover:opacity-60 transition-opacity duration-300 bg-white/30" />
      <div className="absolute -bottom-[1px] -left-[1px] w-8 h-[1px] opacity-0 group-hover:opacity-60 transition-opacity duration-300 bg-white/30" />

      {/* Client logo or name with magnetic effect */}
      <motion.div
        animate={{
          x: localMousePos.x,
          y: localMousePos.y
        }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 18,
          mass: 0.15
        }}
        className="relative text-center px-8 transition-all duration-700 group-hover:scale-[1.08]"
      >
        {client.logo ? (
          <img
            src={client.logo}
            alt={`${client.name} logo${client.tagline ? ` - ${client.tagline}` : ''}${client.sector ? ` (${client.sector})` : ''}`}
            className="max-w-[140px] md:max-w-[180px] lg:max-w-[220px] h-auto mx-auto opacity-70 group-hover:opacity-100 transition-all duration-500 filter brightness-0 invert"
            style={{
              filter: 'brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 8px 24px rgba(0,0,0,0.2))',
              transition: 'all 0.5s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = `brightness(0) invert(1) drop-shadow(0 6px 12px rgba(255,255,255,0.4)) drop-shadow(0 12px 32px ${sectorColor}60)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(0) invert(1) drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 8px 24px rgba(0,0,0,0.2))';
            }}
          />
        ) : (
          <div className="relative px-8 py-4">
            {/* Frosted backdrop */}
            <div className="absolute inset-0 backdrop-blur-[3px] bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-sm" />

            {/* Luxury text wordmark */}
            <div
              className="relative text-[13px] md:text-[15px] lg:text-[17px] font-thin transition-all duration-700 bg-gradient-to-b from-white/90 via-white/80 to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:via-white/95 group-hover:to-white/85"
              style={{
                letterSpacing: '0.25em',
                lineHeight: 1.6,
                textShadow: '0 0 20px rgba(255,255,255,0)',
                transition: 'all 0.7s cubic-bezier(0.43, 0.13, 0.23, 0.96)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.letterSpacing = '0.35em';
                e.currentTarget.style.textShadow = '0 0 20px rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.letterSpacing = '0.25em';
                e.currentTarget.style.textShadow = '0 0 20px rgba(255,255,255,0)';
              }}
            >
              {client.name}
            </div>
          </div>
        )}

        {/* Tagline always visible */}
        {client.tagline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.3 }}
            className="absolute top-full left-0 right-0 mt-4"
          >
            <p className="text-[10px] md:text-[11px] text-white/70 font-light tracking-wider uppercase">
              {client.tagline}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Status indicator (minimal dot) */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true">
        <div
          className={`w-2 h-2 rounded-full ${client.status === 'active' ? 'bg-[#06ffa5]' : 'bg-white/50'}`}
          style={{ boxShadow: client.status === 'active' ? '0 0 8px #06ffa5' : 'none' }}
        />
      </div>

      {/* Website link indicator */}
      {client.website && (
        <div className="absolute top-4 right-10 opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true">
          <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}

      {/* Projects count indicator (dot notation) */}
      <div className="absolute bottom-4 left-4 flex gap-0.5 opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true">
        {Array.from({ length: Math.min(client.projects, 5) }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
        ))}
        {client.projects > 5 && (
          <span className="text-[8px] text-white/60 ml-1">+{client.projects - 5}</span>
        )}
      </div>

      {/* Year started badge for long-term clients */}
      {isLongTerm && (
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true">
          <span className="text-[8px] text-white/60 font-light tracking-wider">EST {client.yearStarted}</span>
        </div>
      )}

      {/* Testimonial indicator */}
      {client.testimonial && (
        <div className="absolute bottom-4 left-16 opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true">
          <svg className="w-3 h-3 text-white/60" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </div>
      )}

      {/* Sector badge pill */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div
          className="px-5 py-2 rounded-full text-[9px] font-light tracking-wider uppercase backdrop-blur-sm"
          style={{
            backgroundColor: `${sectorColor}15`,
            border: `1px solid ${sectorColor}30`,
            color: sectorColor
          }}
        >
          {client.sector}
        </div>
      </div>

      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: sectorColor }}
      />
    </motion.button>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({ clients: 0, projects: 0, sectors: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [ctaMousePos, setCtaMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // ESC key to close modal, Arrow keys to navigate
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!selectedClient) return;

      if (e.key === 'Escape') {
        setSelectedClient(null);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentIndex = clients.findIndex(c => c.name === selectedClient.name);
        if (currentIndex === -1) return;

        let nextIndex;
        if (e.key === 'ArrowLeft') {
          nextIndex = currentIndex === 0 ? clients.length - 1 : currentIndex - 1;
        } else {
          nextIndex = currentIndex === clients.length - 1 ? 0 : currentIndex + 1;
        }
        setSelectedClient(clients[nextIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [selectedClient, clients]);

  // Load clients
  useEffect(() => {
    fetch("/data/clients.json")
      .then((res) => res.json())
      .then((data) => {
        // clients.json is already alphabetically sorted
        setClients(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Animate stats
  useEffect(() => {
    if (clients.length > 0) {
      const totalProjects = clients.reduce((sum, c) => sum + c.projects, 0);
      const totalSectors = new Set(clients.map((c) => c.sector)).size;
      const duration = 1500;
      const steps = 60;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setAnimatedStats({
          clients: Math.round(clients.length * progress),
          projects: Math.round(totalProjects * progress),
          sectors: Math.round(totalSectors * progress),
        });
        if (step >= steps) clearInterval(timer);
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [clients]);

  // Custom cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll tracking for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white">
        {/* Hero Skeleton */}
        <section className="h-screen flex items-center justify-center px-12 md:px-16 lg:px-20">
          <div className="max-w-6xl w-full">
            <div className="h-32 bg-gradient-to-r from-white/5 to-white/10 rounded-sm mb-20 animate-pulse" />
            <div className="h-8 bg-gradient-to-r from-white/5 to-white/10 rounded-sm mb-6 max-w-2xl animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-white/5 to-white/10 rounded-sm mb-2 max-w-md animate-pulse" />
          </div>
        </section>

        {/* Grid Skeleton */}
        <div className="max-w-[1600px] mx-auto px-16 md:px-20 lg:px-24 pb-40">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-l border-white/10">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square border-r border-b border-white/5 flex items-center justify-center bg-[#0b0b0b]"
              >
                <div className="w-32 h-8 bg-gradient-to-r from-white/5 to-white/10 rounded-sm animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white scroll-smooth">
      {/* Skip Navigation */}
      <a
        href="#client-grid"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-white focus:text-black focus:font-medium focus:rounded-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        Skip to client grid
      </a>

      {/* Custom Cursor */}
      <motion.div
        aria-hidden="true"
        role="presentation"
        className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: cursorPos.x - 16,
          y: cursorPos.y - 16,
          scale: isHovering ? 1.8 : 1,
          opacity: isHovering ? 1 : 0.6
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.6
        }}
      >
        <div className="w-full h-full rounded-full border border-white/60" />
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center px-12 md:px-16 lg:px-20">
        <div className="max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-[70px] md:text-[100px] lg:text-[130px] font-light text-[var(--accent)] mb-20 md:mb-24 leading-[0.9]"
              style={{
                textShadow: '0 0 40px rgba(255, 157, 35, 0.4), 0 0 80px rgba(255, 157, 35, 0.2)',
                WebkitTextStroke: '0.5px rgba(255, 157, 35, 0.3)',
                transform: `translateY(${scrollY * 0.3}px)`,
                opacity: 1 - (scrollY / 800)
              }}
            >
              Clients
            </h1>
            <p
              role="status"
              aria-live="polite"
              className="text-[17px] md:text-[19px] lg:text-[21px] text-white/75 leading-[2.4] font-light tracking-wide max-w-4xl mb-16"
              style={{
                transform: `translateY(${scrollY * 0.15}px)`,
                opacity: 1 - (scrollY / 1000)
              }}
            >
              <span className="tabular-nums bg-gradient-to-r from-[var(--accent)] via-[#ffbe0b] to-[var(--accent)] bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">{animatedStats.clients}</span> clients across{" "}
              <span className="tabular-nums bg-gradient-to-r from-[var(--accent)] via-[#ffbe0b] to-[var(--accent)] bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: '0.3s' }}>{animatedStats.sectors}</span> industries.{" "}
              <span className="tabular-nums bg-gradient-to-r from-[var(--accent)] via-[#ffbe0b] to-[var(--accent)] bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: '0.6s' }}>{animatedStats.projects}</span> projects delivered.
            </p>

            {/* Sector Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 text-[11px] text-white/65 font-light uppercase tracking-[0.2em] max-w-3xl"
            >
              {Object.entries(
                clients.reduce((acc, client) => {
                  acc[client.sector] = (acc[client.sector] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([sector, count], i) => (
                  <motion.div
                    key={sector}
                    className="flex items-center gap-2 group cursor-default transition-all duration-500 hover:text-white/70"
                    animate={{
                      y: [0, -4, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-500 group-hover:scale-125"
                      style={{
                        backgroundColor: SECTOR_COLORS[sector] || "var(--accent)",
                        boxShadow: `0 0 0 ${SECTOR_COLORS[sector] || "var(--accent)"}00`,
                        transition: 'all 0.5s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 16px ${SECTOR_COLORS[sector] || "var(--accent)"}80, 0 0 28px ${SECTOR_COLORS[sector] || "var(--accent)"}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 transparent`;
                      }}
                    />
                    <span>{sector}: {count}</span>
                  </motion.div>
                ))}
            </motion.div>
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
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
      </motion.div>

      {/* Logo Grid */}
      <div id="client-grid" ref={gridRef} className="max-w-[1600px] mx-auto px-16 md:px-20 lg:px-24 pb-40 md:pb-48">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-l border-white/10">
          {clients.map((client, index) => {
            const sectorColor = SECTOR_COLORS[client.sector] || "var(--accent)";
            const isLongTerm = client.yearStarted && new Date().getFullYear() - client.yearStarted >= 3;

            // Group by sector for staggered animation
            const sectorIndex = Object.keys(SECTOR_COLORS).indexOf(client.sector);
            const delay = (sectorIndex * 0.1) + (index * 0.015);

            return (
              <ClientCell
                key={client.name}
                client={client}
                sectorColor={sectorColor}
                isLongTerm={isLongTerm}
                delay={delay}
                onHoverChange={setIsHovering}
                onClick={() => setSelectedClient(client)}
              />
            );
          })}
        </div>

        {/* Confidential Note - Luxury Editorial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="mt-36 text-center"
        >
          <div className="inline-block px-12 py-6 border border-white/5 rounded-sm backdrop-blur-sm">
            <p className="text-[11px] md:text-[12px] lg:text-[13px] text-white/50 leading-[2.8] font-extralight tracking-[0.35em] uppercase">
              + 5 Additional Confidential Projects
            </p>
            <p className="text-[9px] text-white/40 mt-2 normal-case tracking-normal">
              (Client agreements prevent public disclosure)
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 1.0, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="mt-40 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-[38px] md:text-[48px] lg:text-[60px] font-light text-white mb-8 leading-tight">
              Ready to join them?
            </h2>
            <p className="text-[15px] md:text-[17px] text-white/70 font-light leading-relaxed mb-14 tracking-wide">
              Let's create something exceptional together. From concept to launch, we deliver digital experiences that drive results.
            </p>
            <motion.a
              ref={ctaRef}
              href="/contact"
              aria-label="Start your project - Contact us to begin working together"
              className="inline-block px-20 py-6 border border-[var(--accent)]/30 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 text-[14px] text-[var(--accent)]/80 hover:text-[var(--accent)] font-light uppercase tracking-[0.25em] transition-all duration-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[#0b0b0b]"
              onMouseMove={(e) => {
                if (!ctaRef.current) return;
                const rect = ctaRef.current.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
                setCtaMousePos({ x, y });
              }}
              onMouseLeave={() => setCtaMousePos({ x: 0, y: 0 })}
              animate={{
                x: ctaMousePos.x,
                y: ctaMousePos.y,
                scale: ctaMousePos.x !== 0 || ctaMousePos.y !== 0 ? 1.05 : 1
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                mass: 0.2
              }}
            >
              Start Your Project
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedClient(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="client-modal-title"
        >
          {/* Backdrop - simplified and lighter */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[6px]" />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.92, y: 20, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.92, y: 20, rotate: -2 }}
            transition={{ type: "spring", damping: 30, stiffness: 250, delay: 0.05 }}
            className="relative max-w-6xl w-full bg-[#0a0a0a] border border-white/5 p-8 sm:p-12 md:p-16 lg:p-20 max-h-[90vh] overflow-y-auto scroll-smooth"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: `0 0 20px ${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}10, 0 0 30px ${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}05`,
              scrollbarWidth: 'thin',
              scrollbarColor: `${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}50 transparent`
            }}
          >
            <h2 id="client-modal-title" className="sr-only">
              {selectedClient.name} Details
            </h2>
            {/* Close button with sector color accent and ripple */}
            <button
              aria-label="Close client details"
              onClick={(e) => {
                // Create ripple effect
                const btn = e.currentTarget;
                const ripple = document.createElement('div');
                ripple.className = 'absolute inset-0 rounded-full animate-ripple-click';
                ripple.style.background = `radial-gradient(circle, ${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}60 0%, transparent 70%)`;
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
                setSelectedClient(null);
              }}
              className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center border border-white/20 hover:bg-white/5 transition-all duration-500 group z-20 hover:rotate-90 hover:scale-115 active:scale-95 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
              style={{
                boxShadow: `0 0 0 0 ${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}00`,
                transition: 'all 0.5s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = SECTOR_COLORS[selectedClient.sector] || 'var(--accent)';
                e.currentTarget.style.boxShadow = `0 0 20px ${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.boxShadow = '0 0 0 0 transparent';
              }}
            >
              <div className="relative w-5 h-5 z-10">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 group-hover:bg-white rotate-45 transition-all duration-500" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 group-hover:bg-white -rotate-45 transition-all duration-500" />
              </div>
            </button>


            {/* Badges - moved above logo */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="flex items-center justify-center gap-8 flex-wrap mb-12"
            >
              <span
                className="inline-block px-12 py-5 rounded-full text-[11px] font-light tracking-[0.2em] uppercase transition-all duration-500 hover:scale-105"
                style={{
                  backgroundColor: `${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}20`,
                  border: `1px solid ${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}40`,
                  color: SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'
                }}
              >
                {selectedClient.sector}
              </span>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/8 rounded-full">
                  <div
                    className={`w-2 h-2 rounded-full ${selectedClient.status === 'active' ? 'bg-[#06ffa5]' : 'bg-[#ffd700]'}`}
                    style={{
                      boxShadow: selectedClient.status === 'active' ? '0 0 12px #06ffa5, 0 0 20px #06ffa540' : '0 0 8px rgba(255, 215, 0, 0.4)',
                      animation: selectedClient.status === 'active' ? 'ripple 2s ease-in-out infinite' : 'none'
                    }}
                  />
                  <span className="text-[11px] text-white uppercase tracking-[0.2em] font-light">{selectedClient.status}</span>
                </div>
            </motion.div>

            {/* Client Logo/Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-16 pb-16 relative text-center"
            >
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              {selectedClient.logo ? (
                <img
                  src={selectedClient.logo}
                  alt={selectedClient.name}
                  className="max-w-[280px] h-auto mx-auto opacity-100 filter brightness-0 invert"
                  style={{ filter: 'brightness(0) invert(1) drop-shadow(0 4px 12px rgba(255,255,255,0.15))' }}
                />
              ) : (
                <h2 className="text-[48px] font-thin text-white tracking-[0.08em]">
                  {selectedClient.name}
                </h2>
              )}
            </motion.div>

            {/* Client Details Grid - Always 2-Column */}
            <div className="mb-24 grid md:grid-cols-2 gap-16">
              {/* Left Column - Key Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-12"
              >
                <div className="relative pb-6">
                  <p className="text-[14px] text-white font-medium uppercase tracking-[0.2em] mb-6">
                    Projects Delivered
                  </p>
                  <p className="text-[32px] text-white font-light tabular-nums leading-[1.1]">{selectedClient.projects.toLocaleString()}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-[0.03]" style={{ backgroundColor: SECTOR_COLORS[selectedClient.sector] || 'var(--accent)' }} />
                </div>

                <div className="relative pb-6">
                  <p className="text-[14px] text-white font-medium uppercase tracking-[0.2em] mb-6">
                    Timeline
                  </p>
                  {selectedClient.yearStarted ? (
                    <p className="text-[32px] text-white font-light leading-[1.1]">
                      {selectedClient.yearStarted} - {selectedClient.status === 'active' ? 'Present' : new Date().getFullYear()}
                      <span className="block text-[15px] text-white/80 mt-5">
                        {new Date().getFullYear() - selectedClient.yearStarted} {new Date().getFullYear() - selectedClient.yearStarted === 1 ? 'year' : 'years'}
                      </span>
                    </p>
                  ) : (
                    <p className="text-[18px] text-white/40 italic">
                      Timeline not disclosed
                    </p>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-[0.03]" style={{ backgroundColor: SECTOR_COLORS[selectedClient.sector] || 'var(--accent)' }} />
                </div>

                {selectedClient.website && (
                  <div className="relative">
                    <p className="text-[14px] text-white font-medium uppercase tracking-[0.2em] mb-6">
                      Website
                    </p>
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group text-[16px] text-[var(--accent)]/80 hover:text-[var(--accent)] font-light transition-all duration-500 flex items-center gap-3 relative px-6 py-2 -mx-6 -my-2 rounded-sm"
                      style={{
                        textShadow: '0 0 0 transparent',
                        backgroundColor: 'transparent',
                        transition: 'all 0.5s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textShadow = `0 0 20px ${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}80`;
                        e.currentTarget.style.backgroundColor = `${SECTOR_COLORS[selectedClient.sector] || 'var(--accent)'}08`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textShadow = '0 0 0 transparent';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span className="relative">
                        Visit Site
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--accent)] transition-all duration-500 group-hover:w-full" />
                      </span>
                      <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </motion.div>

              {/* Right Column - Main Content - Always render */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-12"
              >
                  <div>
                    <p className="text-[14px] text-white font-medium uppercase tracking-[0.2em] mb-6">Tagline</p>
                    <p className="text-[18px] text-white leading-[1.8] font-light">
                      {selectedClient.tagline || (
                        <span className="italic text-white/40">Tagline forthcoming</span>
                      )}
                    </p>
                  </div>

                  <div className="px-12 py-12 border border-white/8 rounded-sm border-l-2" style={{ borderLeftColor: SECTOR_COLORS[selectedClient.sector] || 'var(--accent)' }}>
                    <p className="text-[14px] text-white font-medium uppercase tracking-[0.2em] mb-6">
                      Results
                    </p>
                    <p className="text-[18px] text-white font-light leading-[1.8]">
                      {selectedClient.results || (
                        <span className="italic text-white/40">Results confidential or forthcoming</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[14px] text-white font-medium uppercase tracking-[0.2em] mb-6">
                      Deliverables
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {(selectedClient.deliverables && selectedClient.deliverables.length > 0) ? (
                        selectedClient.deliverables.map((item, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 + (i * 0.05) }}
                            className="px-8 py-4 text-[12px] bg-white/5 border border-white/10 text-white rounded-sm transition-all duration-500 hover:bg-white/10 hover:scale-105"
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                            letterSpacing: '0.04em',
                            fontWeight: 400
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = SECTOR_COLORS[selectedClient.sector] || 'var(--accent)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                        >
                          {item}
                          </motion.span>
                        ))
                      ) : (
                        <span className="px-8 py-4 text-[12px] bg-white/5 border border-white/10 text-white/40 italic rounded-sm">
                          Details forthcoming
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
            </div>

            {/* Testimonial with decorative quotes - Always render */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="pt-16 relative max-w-[700px] mx-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <p className="text-[14px] text-white font-medium uppercase tracking-[0.2em] mb-6">Testimonial</p>

              {selectedClient.testimonial ? (
                <>
                  {/* Large opening quote */}
                  <div className="absolute left-0 top-16 text-[120px] leading-none text-white/5 font-serif select-none">"</div>

                  <blockquote className="relative text-[20px] text-white font-light italic leading-[1.8] pl-16 mb-4">
                    {selectedClient.testimonial}
                  </blockquote>

                  {/* Large closing quote */}
                  <div className="text-right text-[120px] leading-none text-white/5 font-serif select-none -mt-12">"</div>

                  {/* Client attribution */}
                  <p className="text-right text-[14px] text-white/60 font-light tracking-[0.15em] mt-6">
                    — {selectedClient.name}
                  </p>
                </>
              ) : (
                <p className="text-[16px] text-white/40 italic text-center py-8">
                  Client testimonial forthcoming
                </p>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Add CSS keyframes for animations
if (typeof document !== 'undefined' && !document.querySelector('#modal-animations')) {
  const style = document.createElement('style');
  style.id = 'modal-animations';
  style.textContent = `
    @keyframes modalPulse {
      0%, 100% { box-shadow: 0 0 40px rgba(255, 157, 35, 0.15), 0 0 60px rgba(255, 157, 35, 0.08); }
      50% { box-shadow: 0 0 50px rgba(255, 157, 35, 0.20), 0 0 70px rgba(255, 157, 35, 0.12); }
    }
    @keyframes ripple {
      0%, 100% { box-shadow: 0 0 12px #06ffa5, 0 0 20px rgba(6, 255, 165, 0.25); }
      50% { box-shadow: 0 0 16px #06ffa5, 0 0 30px rgba(6, 255, 165, 0.40); }
    }
    @keyframes shimmer {
      0% { background-position: 200% center; }
      100% { background-position: 0% center; }
    }
    @keyframes ripple-click {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(3); opacity: 0; }
    }
    .animate-shimmer {
      animation: shimmer 4s linear infinite;
    }
    .animate-ripple-click {
      animation: ripple-click 0.6s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}
