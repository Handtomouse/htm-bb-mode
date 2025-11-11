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
        duration: 0.6,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => onHoverChange(true)}
      onMouseExit={() => onHoverChange(false)}
      onClick={onClick}
      className="group relative aspect-square border-r border-b border-white/10 flex items-center justify-center bg-[#0b0b0b] hover:bg-white/5 transition-all duration-500 overflow-hidden cursor-none"
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Gradient overlay (bottom fade) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

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
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${sectorColor}, transparent)`
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
          stiffness: 150,
          damping: 15,
          mass: 0.1
        }}
        className="relative text-center px-6 transition-all duration-500 group-hover:scale-105"
      >
        {client.logo ? (
          <img
            src={client.logo}
            alt={client.name}
            className="max-w-[140px] md:max-w-[180px] lg:max-w-[220px] h-auto mx-auto opacity-70 group-hover:opacity-100 transition-opacity duration-500 filter brightness-0 invert"
          />
        ) : (
          <div className="relative px-6 py-3">
            {/* Frosted backdrop */}
            <div className="absolute inset-0 backdrop-blur-[2px] bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-sm" />

            {/* Luxury text wordmark */}
            <div
              className="relative text-[13px] md:text-[15px] lg:text-[17px] font-thin transition-all duration-700 bg-gradient-to-b from-white/80 via-white/70 to-white/50 bg-clip-text text-transparent group-hover:from-white group-hover:via-white/95 group-hover:to-white/80"
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
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className={`w-2 h-2 rounded-full ${client.status === 'active' ? 'bg-[#06ffa5]' : 'bg-white/30'}`}
          style={{ boxShadow: client.status === 'active' ? '0 0 8px #06ffa5' : 'none' }}
        />
      </div>

      {/* Website link indicator */}
      {client.website && (
        <div className="absolute top-3 right-8 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
          <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}

      {/* Projects count indicator (dot notation) */}
      <div className="absolute bottom-3 left-3 flex gap-0.5 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
        {Array.from({ length: Math.min(client.projects, 5) }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/40" />
        ))}
        {client.projects > 5 && (
          <span className="text-[8px] text-white/40 ml-1">+{client.projects - 5}</span>
        )}
      </div>

      {/* Year started badge for long-term clients */}
      {isLongTerm && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
          <span className="text-[8px] text-white/40 font-light tracking-wider">EST {client.yearStarted}</span>
        </div>
      )}

      {/* Testimonial indicator */}
      {client.testimonial && (
        <div className="absolute bottom-3 left-12 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
          <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </div>
      )}

      {/* Sector badge pill */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div
          className="px-4 py-1.5 rounded-full text-[9px] font-light tracking-wider uppercase backdrop-blur-sm"
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
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: cursorPos.x - 12,
          y: cursorPos.y - 12,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 1 : 0.6
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5
        }}
      >
        <div className="w-full h-full rounded-full border border-white/60" />
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center px-8">
        <div className="max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[70px] md:text-[100px] lg:text-[130px] font-light text-[#ff9d23] mb-16 leading-[0.9]">
              Clients
            </h1>
            <p className="text-[17px] md:text-[19px] lg:text-[21px] text-white/60 leading-[2.4] font-light tracking-wide max-w-4xl mb-12">
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
        className="max-w-[1600px] mx-auto px-12 lg:px-16 mb-20"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ff9d23]/30 to-transparent" />
      </motion.div>

      {/* Logo Grid */}
      <div ref={gridRef} className="max-w-[1600px] mx-auto px-12 lg:px-16 pb-32">
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
          className="mt-24 text-center"
        >
          <div className="inline-block px-8 py-4 border border-white/5 rounded-sm backdrop-blur-sm">
            <p className="text-[11px] md:text-[12px] lg:text-[13px] text-white/30 leading-[2.5] font-extralight tracking-[0.35em] uppercase">
              + 5 additional confidential projects
            </p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="mt-32 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-[32px] md:text-[42px] lg:text-[52px] font-light text-white/90 mb-6 leading-tight">
              Ready to join them?
            </h2>
            <p className="text-[15px] md:text-[17px] text-white/50 font-light leading-relaxed mb-12 tracking-wide">
              Let's create something exceptional together. From concept to launch, we deliver digital experiences that drive results.
            </p>
            <a
              href="/contact"
              className="inline-block px-12 py-4 border border-[#ff9d23]/30 hover:border-[#ff9d23] hover:bg-[#ff9d23]/5 text-[13px] text-[#ff9d23]/80 hover:text-[#ff9d23] font-light uppercase tracking-[0.25em] transition-all duration-500"
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedClient(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-4xl w-full bg-[#0b0b0b] border border-white/10 p-12 md:p-16 lg:p-20 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="relative w-5 h-5">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 group-hover:bg-white rotate-45" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 group-hover:bg-white -rotate-45" />
              </div>
            </button>

            {/* Client Logo/Name */}
            <div className="mb-8 pb-8 border-b border-white/10">
              {selectedClient.logo ? (
                <img
                  src={selectedClient.logo}
                  alt={selectedClient.name}
                  className="max-w-[280px] h-auto mx-auto md:mx-0 opacity-90 filter brightness-0 invert"
                />
              ) : (
                <h2 className="text-[40px] md:text-[52px] font-thin text-white/90 tracking-[0.15em]">
                  {selectedClient.name}
                </h2>
              )}
            </div>

            {/* Client Details Grid */}
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              {/* Left Column */}
              <div className="space-y-8">
                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2">Sector</p>
                  <p className="text-[16px] text-white/80 font-light">{selectedClient.sector}</p>
                </div>

                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2">Projects Delivered</p>
                  <p className="text-[16px] text-white/80 font-light">{selectedClient.projects}</p>
                </div>

                <div>
                  <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedClient.status === 'active' ? 'bg-[#06ffa5]' : 'bg-white/30'}`} />
                    <p className="text-[16px] text-white/80 font-light capitalize">{selectedClient.status}</p>
                  </div>
                </div>

                {selectedClient.yearStarted && (
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2">Relationship Since</p>
                    <p className="text-[16px] text-white/80 font-light">{selectedClient.yearStarted}</p>
                  </div>
                )}

                {selectedClient.website && (
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2">Website</p>
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] text-[#ff9d23]/80 hover:text-[#ff9d23] font-light transition-colors duration-300 flex items-center gap-2"
                    >
                      Visit Site
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {selectedClient.tagline && (
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2">Tagline</p>
                    <p className="text-[16px] text-white/80 font-light italic">{selectedClient.tagline}</p>
                  </div>
                )}

                {selectedClient.results && (
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2">Results</p>
                    <p className="text-[16px] text-white/80 font-light leading-relaxed">{selectedClient.results}</p>
                  </div>
                )}

                {selectedClient.deliverables && selectedClient.deliverables.length > 0 && (
                  <div>
                    <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-3">Deliverables</p>
                    <div className="flex flex-wrap gap-3">
                      {selectedClient.deliverables.map((item, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 text-[12px] bg-white/5 border border-white/10 text-white/70 font-light rounded-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Testimonial */}
            {selectedClient.testimonial && (
              <div className="pt-12 border-t border-white/10">
                <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-4">Testimonial</p>
                <blockquote className="text-[20px] md:text-[24px] text-white/80 font-light italic leading-[1.8]">
                  "{selectedClient.testimonial}"
                </blockquote>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
