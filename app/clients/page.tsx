"use client";

import { useState, useEffect } from "react";
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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({ clients: 0, projects: 0, sectors: 0 });

  // Load clients
  useEffect(() => {
    fetch("/data/clients.json")
      .then((res) => res.json())
      .then((data) => {
        // Sort: featured first, then by sector, then alphabetically
        const sorted = [...data].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          if (a.sector !== b.sector) return a.sector.localeCompare(b.sector);
          return a.name.localeCompare(b.name);
        });
        setClients(sorted);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
        <p className="text-[#ff9d23] text-xl font-light">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center px-8">
        <div className="max-w-6xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[60px] md:text-[80px] lg:text-[100px] font-light text-[#ff9d23] mb-8 leading-[0.9]">
              Clients
            </h1>
            <p className="text-[17px] md:text-[19px] lg:text-[21px] text-white/60 leading-[2.1] font-light tracking-wide max-w-4xl">
              <span className="tabular-nums text-[#ff9d23]/90">{animatedStats.clients}</span> clients across{" "}
              <span className="tabular-nums text-[#ff9d23]/90">{animatedStats.sectors}</span> industries.{" "}
              <span className="tabular-nums text-[#ff9d23]/90">{animatedStats.projects}</span> projects delivered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Logo Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 border-t border-l border-white/10">
          {clients.map((client, index) => {
            const sectorColor = SECTOR_COLORS[client.sector] || "#ff9d23";
            const initials = client.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <motion.div
                key={client.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.02 }}
                className="group relative aspect-square border-r border-b border-white/10 flex items-center justify-center bg-[#0b0b0b] hover:bg-white/5 transition-all duration-300 overflow-hidden"
              >
                {/* Sector color indicator (subtle top border) */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: sectorColor }}
                />

                {/* Logo or Initials */}
                <div className="text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300 text-center px-4">
                  {client.logo ? (
                    <div className="text-2xl md:text-3xl lg:text-4xl font-light">{client.name}</div>
                  ) : (
                    <div className="text-3xl md:text-4xl lg:text-5xl font-light opacity-40 group-hover:opacity-60">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Client name on hover */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-[10px] md:text-[11px] font-light text-white/90 uppercase tracking-wider text-center">
                    {client.name}
                  </p>
                </div>

                {/* Subtle glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                  style={{ backgroundColor: sectorColor }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Confidential Note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.5 }}
          className="text-[14px] md:text-[15px] lg:text-[16px] text-white/40 leading-[2.3] font-extralight tracking-wide text-center mt-16"
        >
          + 5 additional confidential projects
        </motion.p>
      </div>
    </div>
  );
}
