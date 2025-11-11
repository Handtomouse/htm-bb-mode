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

      {/* Clients Timeline */}
      <div className="max-w-6xl mx-auto px-8">
        {clients.map((client, index) => {
          const sectorColor = SECTOR_COLORS[client.sector] || "#ff9d23";
          const isFeatured = client.featured;
          const initials = client.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <motion.section
              key={client.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-[100vh] md:mb-[110vh] lg:mb-[120vh]"
            >
              {/* Number/Index */}
              <div className="text-[14px] md:text-[15px] lg:text-[16px] font-normal text-[#ff9d23] mb-8 md:mb-10 lg:mb-12 opacity-55">
                [{String(index + 1).padStart(2, "0")}]
              </div>

              {/* Sector Label */}
              <div className="flex items-center gap-3 mb-10 md:mb-12 lg:mb-16">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sectorColor }}
                />
                <h3 className="text-[12px] md:text-[13px] lg:text-[14px] font-light uppercase tracking-[0.35em]" style={{ color: `${sectorColor}80` }}>
                  {client.sector}
                </h3>
              </div>

              {/* Client Name */}
              <h2 className="text-[32px] md:text-[40px] lg:text-[48px] text-white leading-[1.1] font-light mb-8 md:mb-10 lg:mb-12 pl-8 md:pl-10 lg:pl-12">
                {client.name}
              </h2>

              {/* Project Count & Status */}
              <div className="pl-8 md:pl-10 lg:pl-12 mb-8 md:mb-10 lg:mb-12">
                <p className="text-[14px] md:text-[15px] lg:text-[16px] text-white/50 font-light tracking-wide">
                  <span className="tabular-nums">{client.projects}</span> {client.projects === 1 ? "project" : "projects"}
                  {client.yearStarted && ` • Since ${client.yearStarted}`}
                  {client.status && (
                    <span className={client.status === "active" ? "text-[#ff9d23]/80" : "text-white/40"}>
                      {" "}• {client.status}
                    </span>
                  )}
                </p>
              </div>

              {/* Featured Client Details */}
              {isFeatured && (
                <>
                  {/* Tagline */}
                  {client.tagline && (
                    <p className="text-[17px] md:text-[19px] lg:text-[21px] text-white leading-[2.0] font-light tracking-wide max-w-4xl pl-8 md:pl-10 lg:pl-12 mb-8 md:mb-10 lg:mb-12 italic">
                      "{client.tagline}"
                    </p>
                  )}

                  {/* Results */}
                  {client.results && (
                    <p className="text-[17px] md:text-[19px] lg:text-[21px] text-white/80 leading-[2.0] font-light tracking-wide max-w-4xl pl-8 md:pl-10 lg:pl-12 mb-8 md:mb-10 lg:mb-12">
                      {client.results}
                    </p>
                  )}

                  {/* Deliverables */}
                  {client.deliverables && client.deliverables.length > 0 && (
                    <div className="pl-8 md:pl-10 lg:pl-12 mb-8 md:mb-10 lg:mb-12">
                      <p className="text-[12px] md:text-[13px] lg:text-[14px] text-[#ff9d23]/50 uppercase tracking-[0.35em] mb-4">
                        Services
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {client.deliverables.map((item) => (
                          <span
                            key={item}
                            className="text-[12px] md:text-[13px] lg:text-[14px] text-white/60 font-light tracking-wide"
                          >
                            {item}
                            {client.deliverables && client.deliverables.indexOf(item) < client.deliverables.length - 1 && " • "}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testimonial */}
                  {client.testimonial && (
                    <p className="text-[15px] md:text-[16px] lg:text-[17px] text-white/70 leading-[2.1] font-light tracking-wide max-w-4xl pl-12 md:pl-16 lg:pl-20 italic">
                      "{client.testimonial}"
                    </p>
                  )}
                </>
              )}

              {/* Non-featured: just initials as visual element */}
              {!isFeatured && (
                <div className="pl-8 md:pl-10 lg:pl-12">
                  <div
                    className="text-[80px] md:text-[100px] lg:text-[120px] font-light opacity-5 leading-none"
                    style={{ color: sectorColor }}
                  >
                    {initials}
                  </div>
                </div>
              )}
            </motion.section>
          );
        })}

        {/* Final Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
          className="h-[0.5px] bg-gradient-to-r from-[#ff9d23]/20 via-[#ff9d23]/5 to-transparent mb-[100px] md:mb-[120px] lg:mb-[140px]"
        />

        {/* Confidential Note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.3 }}
          className="text-[14px] md:text-[15px] lg:text-[16px] text-white/40 leading-[2.3] font-extralight tracking-wide max-w-4xl pl-12 md:pl-16 lg:pl-20 mb-32"
        >
          + 5 additional confidential projects
        </motion.p>
      </div>
    </div>
  );
}
