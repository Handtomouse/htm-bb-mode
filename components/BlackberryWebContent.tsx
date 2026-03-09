"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface LiveSite {
  id: string;
  client: string;
  description: string;
  tags: string[];
  url?: string;
}

const LIVE_SITES: LiveSite[] = [
  {
    id: "pureairo",
    client: "Pureairo",
    description: "Brand identity + web design for a wellness brand",
    tags: ["Web", "Branding"],
    url: "https://www.pureairo.com.au",
  },
  {
    id: "swich",
    client: "S'WICH",
    description: "Summer campaign — iconic Sydney homage spots",
    tags: ["Campaign", "Content"],
    url: "https://eatswich.com.au",
  },
  {
    id: "maplemoon",
    client: "MapleMoon",
    description: "Complete rebrand for artisan confectionery",
    tags: ["Branding", "Identity"],
  },
  {
    id: "jacjack",
    client: "Jac+Jack",
    description: "AW24 lookbook shot in raw industrial spaces",
    tags: ["Fashion", "Photography"],
  },
  {
    id: "materre",
    client: "Materre",
    description: "Holistic brand and digital experience for wellness retreat",
    tags: ["Web", "Branding"],
  },
];

function BrowserChrome({ url }: { url?: string }) {
  const displayUrl = url
    ? url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "live link coming soon";

  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{
        backgroundColor: "#0b0b0b",
        borderBottom: "1px solid #2A2A2A",
      }}
    >
      {/* Traffic light dots */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div
          className="rounded-full"
          style={{ width: 6, height: 6, backgroundColor: "#a92624" }}
        />
        <div
          className="rounded-full"
          style={{ width: 6, height: 6, backgroundColor: "#ff9d23" }}
        />
        <div
          className="rounded-full"
          style={{ width: 6, height: 6, backgroundColor: "#94b039" }}
        />
      </div>
      {/* URL bar */}
      <div
        className="flex-1 truncate text-[10px]"
        style={{
          fontFamily: "Roboto Mono, monospace",
          color: "#9A9A9A",
          letterSpacing: "0.02em",
        }}
      >
        {displayUrl}
      </div>
    </div>
  );
}

function SiteCard({ site, index }: { site: LiveSite; index: number }) {
  const handleVisit = () => {
    if (site.url) {
      window.open(site.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#131313",
        border: "1px solid #2A2A2A",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
      }}
      whileHover={{
        boxShadow: "0 0 0 1px #ff9d23, 0 4px 24px rgba(255,157,35,0.2)",
      }}
    >
      {/* Browser chrome mockup */}
      <BrowserChrome url={site.url} />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Client name */}
        <div
          className="text-base font-semibold uppercase"
          style={{
            fontFamily: "VT323, monospace",
            fontSize: "1.25rem",
            color: "#EDECEC",
            letterSpacing: "0.06em",
          }}
        >
          {site.client}
        </div>

        {/* Description */}
        <div
          className="text-xs leading-relaxed flex-1"
          style={{ fontFamily: "Roboto Mono, monospace", color: "#9A9A9A" }}
        >
          {site.description}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {site.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-[10px] uppercase"
              style={{
                fontFamily: "Roboto Mono, monospace",
                color: "#9A9A9A",
                border: "1px solid #2A2A2A",
                borderRadius: "2px",
                letterSpacing: "0.05em",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Visit button */}
        <div className="mt-2">
          {site.url ? (
            <button
              onClick={handleVisit}
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 transition-all duration-200"
              style={{
                fontFamily: "Roboto Mono, monospace",
                color: "#ff9d23",
                border: "1px solid #ff9d23",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(255,157,35,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              Visit →
            </button>
          ) : (
            <span
              className="text-xs uppercase tracking-widest px-3 py-1.5 inline-block"
              style={{
                fontFamily: "Roboto Mono, monospace",
                color: "#9A9A9A",
                border: "1px solid #2A2A2A",
                borderRadius: "2px",
              }}
            >
              Live link coming
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function BlackberryWebContent() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = LIVE_SITES.filter((site) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      site.client.toLowerCase().includes(q) ||
      site.description.toLowerCase().includes(q) ||
      site.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ fontFamily: "Roboto Mono, monospace" }}
    >
      {/* Section Header */}
      <div className="px-4 pt-6 pb-4 md:px-6">
        <h1
          className="tracking-widest uppercase text-sm text-[var(--ink)]"
          style={{ fontFamily: "Roboto Mono, monospace" }}
        >
          LIVE WORK
        </h1>
        <div
          className="mt-1 h-[1px]"
          style={{ background: "linear-gradient(90deg, #ff9d23 0%, transparent 100%)" }}
        />
      </div>

      {/* Search bar */}
      <div className="px-4 pb-4 md:px-6">
        <input
          type="text"
          placeholder="Search by client or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-xs focus:outline-none"
          style={{
            fontFamily: "Roboto Mono, monospace",
            backgroundColor: "#0b0b0b",
            border: "1px solid #2A2A2A",
            color: "#EDECEC",
            caretColor: "#ff9d23",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#ff9d23";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#2A2A2A";
          }}
        />
      </div>

      {/* Site cards grid */}
      <div className="px-4 pb-8 md:px-6">
        {filtered.length === 0 ? (
          <div
            className="py-8 text-center text-xs"
            style={{ color: "#9A9A9A", fontFamily: "Roboto Mono, monospace" }}
          >
            No sites matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((site, index) => (
              <SiteCard key={site.id} site={site} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
