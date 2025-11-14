"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ACCENT = "#ff9d23";

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

export default function BlackberryClientsContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({ clients: 0, projects: 0, sectors: 0 });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Load clients
  useEffect(() => {
    fetch("/data/clients.json")
      .then((res) => res.json())
      .then((data) => {
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[20px] text-white/70"
          style={{ fontFamily: "VT323, monospace" }}
        >
          LOADING CLIENTS...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden px-4 md:px-6" style={{ fontFamily: "VT323, monospace" }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-8 md:py-12"
      >
        <h1
          className="text-[48px] md:text-[64px] font-light text-[#ff9d23] mb-8 leading-[0.9] uppercase tracking-[0.15em]"
          style={{
            textShadow: '0 0 40px rgba(255, 157, 35, 0.4)',
          }}
        >
          Clients
        </h1>

        {/* Stats */}
        <p
          className="text-[14px] md:text-[16px] text-white/75 leading-[2.2] font-light tracking-wide mb-8"
        >
          <span className="tabular-nums text-[#ff9d23]">{animatedStats.clients}</span> clients across{" "}
          <span className="tabular-nums text-[#ff9d23]">{animatedStats.sectors}</span> industries.{" "}
          <span className="tabular-nums text-[#ff9d23]">{animatedStats.projects}</span> projects delivered.
        </p>

        {/* Sector Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap gap-3 text-[9px] text-white/65 font-light uppercase tracking-[0.15em]"
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
              <div
                key={sector}
                className="flex items-center gap-1.5 transition-all duration-500"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: SECTOR_COLORS[sector] || "#ff9d23",
                  }}
                />
                <span>{sector}: {count}</span>
              </div>
            ))}
        </motion.div>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
        className="h-[1px] bg-gradient-to-r from-transparent via-[#ff9d23]/40 to-transparent mb-8"
      />

      {/* Client Grid */}
      <div className="pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {clients.map((client, index) => {
            const sectorColor = SECTOR_COLORS[client.sector] || "#ff9d23";
            const isLongTerm = client.yearStarted && new Date().getFullYear() - client.yearStarted >= 3;
            const delay = index * 0.02;

            return (
              <ClientCell
                key={client.name}
                client={client}
                sectorColor={sectorColor}
                isLongTerm={isLongTerm}
                delay={delay}
                onClick={() => setSelectedClient(client)}
              />
            );
          })}
        </div>

        {/* Confidential Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-block px-6 py-4 border border-white/5">
            <p className="text-[10px] text-white/50 leading-[2.2] font-extralight tracking-[0.25em] uppercase">
              + 5 Additional Confidential Projects
            </p>
          </div>
        </motion.div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedClient(null)}
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 p-6 md:p-8 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: `0 0 20px ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}20`,
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-white/20 hover:bg-white/5 transition-all duration-300 group"
              style={{
                borderColor: SECTOR_COLORS[selectedClient.sector] || '#ff9d23',
              }}
            >
              <div className="relative w-4 h-4">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 rotate-45" />
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 -rotate-45" />
              </div>
            </button>

            {/* Badges */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
              <span
                className="inline-block px-6 py-2 text-[9px] font-light tracking-[0.15em] uppercase"
                style={{
                  backgroundColor: `${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}20`,
                  border: `1px solid ${SECTOR_COLORS[selectedClient.sector] || '#ff9d23'}40`,
                  color: SECTOR_COLORS[selectedClient.sector] || '#ff9d23'
                }}
              >
                {selectedClient.sector}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${selectedClient.status === 'active' ? 'bg-[#06ffa5]' : 'bg-white/50'}`}
                  style={{ boxShadow: selectedClient.status === 'active' ? '0 0 8px #06ffa5' : 'none' }}
                />
                <span className="text-[9px] text-white uppercase tracking-[0.15em] font-light">{selectedClient.status}</span>
              </div>
            </div>

            {/* Client Logo/Name */}
            <div className="mb-8 pb-8 border-b border-white/5 text-center">
              {selectedClient.logo ? (
                <img
                  src={selectedClient.logo}
                  alt={selectedClient.name}
                  className="max-w-[180px] h-auto mx-auto opacity-100 filter brightness-0 invert"
                />
              ) : (
                <h2 className="text-[32px] font-thin text-white tracking-[0.08em]">
                  {selectedClient.name}
                </h2>
              )}
            </div>

            {/* Client Details Grid */}
            <div className="mb-8 grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] text-white font-medium uppercase tracking-[0.15em] mb-2">
                    Projects Delivered
                  </p>
                  <p className="text-[24px] text-white font-light tabular-nums">{selectedClient.projects}</p>
                </div>

                <div>
                  <p className="text-[11px] text-white font-medium uppercase tracking-[0.15em] mb-2">
                    Timeline
                  </p>
                  {selectedClient.yearStarted ? (
                    <p className="text-[24px] text-white font-light">
                      {selectedClient.yearStarted} - {selectedClient.status === 'active' ? 'Present' : new Date().getFullYear()}
                      <span className="block text-[12px] text-white/80 mt-2">
                        {new Date().getFullYear() - selectedClient.yearStarted} {new Date().getFullYear() - selectedClient.yearStarted === 1 ? 'year' : 'years'}
                      </span>
                    </p>
                  ) : (
                    <p className="text-[14px] text-white/40 italic">Timeline not disclosed</p>
                  )}
                </div>

                {selectedClient.website && (
                  <div>
                    <p className="text-[11px] text-white font-medium uppercase tracking-[0.15em] mb-2">
                      Website
                    </p>
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-[#ff9d23]/80 hover:text-[#ff9d23] font-light transition-all duration-300"
                    >
                      Visit Site →
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] text-white font-medium uppercase tracking-[0.15em] mb-2">Tagline</p>
                  <p className="text-[14px] text-white leading-[1.6] font-light">
                    {selectedClient.tagline || <span className="italic text-white/40">Tagline forthcoming</span>}
                  </p>
                </div>

                {selectedClient.results && (
                  <div className="px-4 py-4 border border-white/8 border-l-2" style={{ borderLeftColor: SECTOR_COLORS[selectedClient.sector] || '#ff9d23' }}>
                    <p className="text-[11px] text-white font-medium uppercase tracking-[0.15em] mb-2">
                      Results
                    </p>
                    <p className="text-[13px] text-white font-light leading-[1.6]">
                      {selectedClient.results}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[11px] text-white font-medium uppercase tracking-[0.15em] mb-2">
                    Deliverables
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedClient.deliverables && selectedClient.deliverables.length > 0) ? (
                      selectedClient.deliverables.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 text-[10px] bg-white/5 border border-white/10 text-white"
                          style={{ fontFamily: 'ui-monospace, monospace' }}
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1.5 text-[10px] bg-white/5 border border-white/10 text-white/40 italic">
                        Details forthcoming
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            {selectedClient.testimonial && (
              <div className="pt-6 border-t border-white/5">
                <p className="text-[11px] text-white font-medium uppercase tracking-[0.15em] mb-4">Testimonial</p>
                <blockquote className="text-[14px] text-white font-light italic leading-[1.6] pl-4 border-l-2 border-[#ff9d23]/40">
                  {selectedClient.testimonial}
                </blockquote>
                <p className="text-right text-[11px] text-white/60 font-light tracking-[0.12em] mt-3">
                  — {selectedClient.name}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Client Cell Component with Magnetic Hover
function ClientCell({
  client,
  sectorColor,
  isLongTerm,
  delay,
  onClick,
}: {
  client: Client;
  sectorColor: string;
  isLongTerm: boolean;
  delay: number;
  onClick: () => void;
}) {
  const [localMousePos, setLocalMousePos] = useState({ x: 0, y: 0 });
  const cellRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cellRef.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.08;
    setLocalMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setLocalMousePos({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={cellRef}
      type="button"
      initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: delay + 0.1,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="group relative aspect-square border border-white/5 flex items-center justify-center bg-[#0b0b0b] hover:bg-white/5 transition-all duration-500 overflow-hidden hover:cursor-pointer"
    >
      {/* Sector color indicator */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${sectorColor} 50%, transparent 100%)`
        }}
      />

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
        className="relative text-center px-4 transition-all duration-500 group-hover:scale-105"
      >
        {client.logo ? (
          <img
            src={client.logo}
            alt={client.name}
            className="max-w-[80px] md:max-w-[100px] h-auto mx-auto opacity-70 group-hover:opacity-100 transition-all duration-500 filter brightness-0 invert"
          />
        ) : (
          <div className="relative px-4 py-2">
            <div
              className="relative text-[11px] md:text-[12px] font-thin transition-all duration-500 bg-gradient-to-b from-white/90 via-white/80 to-white/60 bg-clip-text text-transparent group-hover:from-white group-hover:via-white/95 group-hover:to-white/85"
              style={{
                letterSpacing: '0.2em',
                lineHeight: 1.4,
              }}
            >
              {client.name}
            </div>
          </div>
        )}

        {/* Tagline */}
        {client.tagline && (
          <div className="absolute top-full left-0 right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <p className="text-[8px] text-white/70 font-light tracking-wider uppercase">
              {client.tagline}
            </p>
          </div>
        )}
      </motion.div>

      {/* Status indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className={`w-1.5 h-1.5 rounded-full ${client.status === 'active' ? 'bg-[#06ffa5]' : 'bg-white/50'}`}
          style={{ boxShadow: client.status === 'active' ? '0 0 6px #06ffa5' : 'none' }}
        />
      </div>

      {/* Projects count */}
      <div className="absolute bottom-2 left-2 flex gap-0.5 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
        {Array.from({ length: Math.min(client.projects, 5) }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
        ))}
        {client.projects > 5 && (
          <span className="text-[7px] text-white/60 ml-0.5">+{client.projects - 5}</span>
        )}
      </div>

      {/* Year badge */}
      {isLongTerm && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
          <span className="text-[7px] text-white/60 font-light tracking-wider">EST {client.yearStarted}</span>
        </div>
      )}

      {/* Subtle glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: sectorColor }}
      />
    </motion.button>
  );
}
