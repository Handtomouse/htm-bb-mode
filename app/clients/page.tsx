"use client";

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
    <motion.div
      ref={cellRef}
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
      className="group relative aspect-square border-r border-b border-white/5 flex items-center justify-center bg-[#0b0b0b] hover:bg-white/5 transition-all duration-700 overflow-hidden cursor-none hover:scale-[1.02] active:scale-[0.98]"
    >
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

      {/* Sector color indicator with gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${sectorColor} 50%, transparent 100%)`
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
            alt={client.name}
            className="max-w-[140px] md:max-w-[180px] lg:max-w-[220px] h-auto mx-auto opacity-70 group-hover:opacity-100 transition-opacity duration-500 filter brightness-0 invert"
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

        {/* Tagline reveal on hover */}
        {client.tagline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500"
          >
            <p className="text-[10px] md:text-[11px] text-white/50 font-light tracking-wider uppercase">
              {client.tagline}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Status indicator (minimal dot) */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className={`w-2 h-2 rounded-full ${client.status === 'active' ? 'bg-[#06ffa5]' : 'bg-white/30'}`}
          style={{ boxShadow: client.status === 'active' ? '0 0 8px #06ffa5' : 'none' }}
        />
      </div>

      {/* Website link indicator */}
      {client.website && (
        <div className="absolute top-4 right-10 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
          <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}

      {/* Projects count indicator (dot notation) */}
      <div className="absolute bottom-4 left-4 flex gap-0.5 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
        {Array.from({ length: Math.min(client.projects, 5) }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/40" />
        ))}
        {client.projects > 5 && (
          <span className="text-[8px] text-white/40 ml-1">+{client.projects - 5}</span>
        )}
      </div>

      {/* Year started badge for long-term clients */}
      {isLongTerm && (
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
          <span className="text-[8px] text-white/40 font-light tracking-wider">EST {client.yearStarted}</span>
        </div>
      )}

      {/* Testimonial indicator */}
      {client.testimonial && (
        <div className="absolute bottom-4 left-16 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
          <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
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
    </motion.div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({ clients: 0, projects: 0, sectors: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedClient) {
        setSelectedClient(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedClient]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <p className="text-[#ff9d23] text-xl font-light">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white scroll-smooth">
      {/* Custom Cursor */}
      <motion.div
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
            <h1 className="text-[70px] md:text-[100px] lg:text-[130px] font-light text-[#ff9d23] mb-20 md:mb-24 leading-[0.9]">
              Clients
            </h1>
            <p className="text-[17px] md:text-[19px] lg:text-[21px] text-white/60 leading-[2.4] font-light tracking-wide max-w-4xl mb-16">
              <span className="tabular-nums text-[#ff9d23]/90">{animatedStats.clients}</span> clients across{" "}
              <span className="tabular-nums text-[#ff9d23]/90">{animatedStats.sectors}</span> industries.{" "}
              <span className="tabular-nums text-[#ff9d23]/90">{animatedStats.projects}</span> projects delivered.
            </p>

            {/* Sector Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 text-[11px] text-white/40 font-light uppercase tracking-[0.2em] max-w-3xl"
            >
              {Object.entries(
                clients.reduce((acc, client) => {
                  acc[client.sector] = (acc[client.sector] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([sector, count]) => (
                  <div key={sector} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SECTOR_COLORS[sector] || "#ff9d23" }}
                    />
                    <span>{sector}: {count}</span>
                  </div>
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
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ff9d23]/40 to-transparent" />
      </motion.div>

      {/* Logo Grid */}
      <div ref={gridRef} className="max-w-[1600px] mx-auto px-16 md:px-20 lg:px-24 pb-40 md:pb-48">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-l border-white/10">
          {clients.map((client, index) => {
            const sectorColor = SECTOR_COLORS[client.sector] || "#ff9d23";
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
            <p className="text-[11px] md:text-[12px] lg:text-[13px] text-white/30 leading-[2.8] font-extralight tracking-[0.35em] uppercase">
              + 5 additional confidential projects
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
            <h2 className="text-[38px] md:text-[48px] lg:text-[60px] font-light text-white/90 mb-8 leading-tight">
              Ready to join them?
            </h2>
            <p className="text-[15px] md:text-[17px] text-white/50 font-light leading-relaxed mb-14 tracking-wide">
              Let's create something exceptional together. From concept to launch, we deliver digital experiences that drive results.
            </p>
            <a
              href="/contact"
              className="inline-block px-20 py-6 border border-[#ff9d23]/30 hover:border-[#ff9d23] hover:bg-[#ff9d23]/5 text-[14px] text-[#ff9d23]/80 hover:text-[#ff9d23] font-light uppercase tracking-[0.25em] transition-all duration-700 hover:scale-105 active:scale-95"
            >
              Start Your Project
            </a>
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
        >
          {/* Backdrop with enhanced blur and noise */}
          <div className="absolute inset-0 bg-black/92 backdrop-blur-2xl">
            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px'
              }}
            />
          </div>

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.92, y: 20, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.92, y: 20, rotate: -2 }}
            transition={{ type: "spring", damping: 30, stiffness: 250, delay: 0.05 }}
            className="relative max-w-5xl w-full bg-[#0b0b0b] border-2 p-12 sm:p-16 md:p-20 lg:p-28 max-h-[90vh] overflow-y-auto scroll-smooth"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderImage: `linear-gradient(135deg, ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}40, transparent, ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}40) 1`,
              boxShadow: `0 0 80px ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}25, 0 0 120px ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}15`,
              scrollbarWidth: 'thin',
              scrollbarColor: `${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}50 transparent`,
              animation: 'modalPulse 3s ease-in-out infinite'
            }}
          >
            {/* Vignette overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(11,11,11,0.3) 100%)' }} />
            {/* Noise texture */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px'
              }}
            />

            {/* Corner accents - all 4 corners */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 opacity-50" style={{ borderColor: SECTOR_COLORS[selectedClient.sector] || '#ff9d23' }} />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 opacity-50" style={{ borderColor: SECTOR_COLORS[selectedClient.sector] || '#ff9d23' }} />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 opacity-50" style={{ borderColor: SECTOR_COLORS[selectedClient.sector] || '#ff9d23' }} />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 opacity-50" style={{ borderColor: SECTOR_COLORS[selectedClient.sector] || '#ff9d23' }} />

            {/* Scroll fade gradients - more pronounced */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b]/90 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/90 to-transparent pointer-events-none z-10" />
            {/* Close button with sector color accent */}
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white/5 transition-all duration-500 group z-20 hover:rotate-90 hover:scale-110 active:scale-95"
              style={{
                boxShadow: `0 0 0 0 ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}00`,
                transition: 'all 0.5s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = SECTOR_COLORS[selectedClient.sector] || '#ff9d23';
                e.currentTarget.style.boxShadow = `0 0 20px ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.boxShadow = '0 0 0 0 transparent';
              }}
            >
              <div className="relative w-5 h-5">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 group-hover:bg-white rotate-45 transition-all duration-500" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 group-hover:bg-white -rotate-45 transition-all duration-500" />
              </div>
            </button>

            {/* Featured Client Banner */}
            {selectedClient.featured && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="absolute top-0 left-0 px-8 py-3 bg-gradient-to-r from-transparent to-transparent"
                style={{
                  background: `linear-gradient(90deg, ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}40, transparent)`
                }}
              >
                <span className="text-[10px] font-light tracking-[0.3em] uppercase text-white/70">Featured Client</span>
              </motion.div>
            )}

            {/* Client Logo/Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-20 pb-20 relative text-center"
            >
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {selectedClient.logo ? (
                <img
                  src={selectedClient.logo}
                  alt={selectedClient.name}
                  className="max-w-[380px] h-auto mx-auto opacity-90 filter brightness-0 invert mb-8"
                  style={{ filter: 'brightness(0) invert(1) drop-shadow(0 4px 12px rgba(255,255,255,0.15))' }}
                />
              ) : (
                <h2 className="text-[40px] md:text-[52px] font-thin text-white/90 tracking-[0.15em] mb-8">
                  {selectedClient.name}
                </h2>
              )}

              {/* Sector badge inline with status */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span
                  className="inline-block px-6 py-2.5 rounded-full text-[11px] font-light tracking-[0.25em] uppercase backdrop-blur-sm transition-all duration-500 hover:scale-105"
                  style={{
                    backgroundColor: `${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}20`,
                    border: `1px solid ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}40`,
                    color: SECTOR_COLORS[selectedClient.sector] || '#ff9d23',
                    boxShadow: `0 0 20px ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}20`
                  }}
                >
                  {selectedClient.sector}
                </span>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
                  <div
                    className={`w-2 h-2 rounded-full ${selectedClient.status === 'active' ? 'bg-[#06ffa5]' : 'bg-white/30'}`}
                    style={{
                      boxShadow: selectedClient.status === 'active' ? '0 0 12px #06ffa5, 0 0 20px #06ffa540' : 'none',
                      animation: selectedClient.status === 'active' ? 'ripple 2s ease-in-out infinite' : 'none'
                    }}
                  />
                  <span className="text-[10px] text-white/60 uppercase tracking-wider font-light">{selectedClient.status}</span>
                </div>
              </div>
            </motion.div>

            {/* Client Details Grid - Asymmetric */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-[40%_60%] gap-24 mb-20"
            >
              {/* Left Column - Key Info */}
              <div className="space-y-12">
                <div>
                  <p className="text-[12px] text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Projects Delivered
                  </p>
                  <p className="text-[20px] text-white/90 font-light tabular-nums">{selectedClient.projects.toLocaleString()}</p>
                </div>

                {selectedClient.yearStarted && (
                  <div>
                    <p className="text-[12px] text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Timeline
                    </p>
                    <p className="text-[18px] text-white/80 font-light">
                      {selectedClient.yearStarted} - {selectedClient.status === 'active' ? 'Present' : new Date().getFullYear()}
                      <span className="block text-[14px] text-white/40 mt-1">
                        {new Date().getFullYear() - selectedClient.yearStarted} {new Date().getFullYear() - selectedClient.yearStarted === 1 ? 'year' : 'years'}
                      </span>
                    </p>
                  </div>
                )}

                {selectedClient.website && (
                  <div>
                    <p className="text-[12px] text-white/40 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                      Website
                    </p>
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group text-[18px] text-[#ff9d23]/80 hover:text-[#ff9d23] font-light transition-all duration-500 flex items-center gap-3 relative"
                      style={{
                        textShadow: '0 0 0 transparent',
                        transition: 'all 0.5s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textShadow = `0 0 20px ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}80`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textShadow = '0 0 0 transparent';
                      }}
                    >
                      <span className="relative">
                        Visit Site
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#ff9d23] transition-all duration-500 group-hover:w-full" />
                      </span>
                      <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column - Main Content */}
              <div className="space-y-12">
                {selectedClient.tagline && (
                  <div>
                    <p className="text-[12px] text-white/40 uppercase tracking-[0.3em] mb-4">Tagline</p>
                    <p className="text-[20px] text-white/85 font-light italic leading-relaxed bg-gradient-to-r from-white/90 to-white/60 bg-clip-text text-transparent">{selectedClient.tagline}</p>
                  </div>
                )}

                {selectedClient.results && (
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-sm">
                    <p className="text-[12px] text-white/40 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      Results
                    </p>
                    <p className="text-[18px] md:text-[20px] text-white/85 font-light leading-[1.7]">{selectedClient.results}</p>
                  </div>
                )}

                {selectedClient.deliverables && selectedClient.deliverables.length > 0 && (
                  <div>
                    <p className="text-[12px] text-white/40 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Deliverables
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {selectedClient.deliverables.map((item, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 + (i * 0.05) }}
                          className="px-6 py-3 text-[13px] bg-white/5 border border-white/10 text-white/75 font-light rounded-sm transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:scale-105"
                          style={{
                            boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
                          }}
                        >
                          {item}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Testimonial with decorative quotes */}
            {selectedClient.testimonial && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="pt-20 relative"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <p className="text-[12px] text-white/40 uppercase tracking-[0.3em] mb-8">Testimonial</p>

                {/* Large opening quote */}
                <div className="absolute left-0 top-16 text-[120px] leading-none text-white/5 font-serif select-none">"</div>

                <blockquote className="relative text-[26px] md:text-[32px] text-white/85 font-light italic leading-[1.7] pl-16">
                  {selectedClient.testimonial}
                </blockquote>

                {/* Large closing quote */}
                <div className="text-right text-[120px] leading-none text-white/5 font-serif select-none -mt-12">"</div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Add CSS keyframes for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes modalPulse {
    0%, 100% { box-shadow: 0 0 80px rgba(255, 157, 35, 0.25), 0 0 120px rgba(255, 157, 35, 0.15); }
    50% { box-shadow: 0 0 100px rgba(255, 157, 35, 0.35), 0 0 140px rgba(255, 157, 35, 0.20); }
  }
  @keyframes ripple {
    0%, 100% { box-shadow: 0 0 12px #06ffa5, 0 0 20px rgba(6, 255, 165, 0.25); }
    50% { box-shadow: 0 0 16px #06ffa5, 0 0 30px rgba(6, 255, 165, 0.40); }
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#modal-animations')) {
  style.id = 'modal-animations';
  document.head.appendChild(style);
}
