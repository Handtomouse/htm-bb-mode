"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// Constants
const SCROLL_THRESHOLD = 100;
const MAX_PROJECTS_FOR_SCALE = 10;
const ENTERPRISE_PROJECT_THRESHOLD = 4;
const CONFIDENTIAL_PROJECTS_COUNT = 5;
const CONTACT_EMAIL = "hello@handtomouse.org";

// Sector color mapping
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
  logo?: string;
  status?: "active" | "completed";
  tagline?: string;
  website?: string;
  deliverables?: string[];
  testimonial?: string;
  yearStarted?: number;
  results?: string;
  workSamples?: string[];
  tags?: string[];
  projectTitles?: string[];
}

export default function ClientsPage() {
  const searchParams = useSearchParams();

  // Core state
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Filter state
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [showQuickPreview, setShowQuickPreview] = useState<Client | null>(null);

  // Bookmarks
  const [bookmarkedClients, setBookmarkedClients] = useState<string[]>([]);

  // Stats counter animation
  const [animatedStats, setAnimatedStats] = useState({ clients: 0, projects: 0, sectors: 0 });

  // Load clients from JSON
  useEffect(() => {
    fetch("/data/clients.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.name.localeCompare(b.name);
        });
        setClients(sorted);
        setIsLoading(false);
      })
      .catch(() => {
        setError(true);
        setIsLoading(false);
      });
  }, []);

  // Load bookmarks from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBookmarks = localStorage.getItem("clientsBookmarks");
      if (savedBookmarks) setBookmarkedClients(JSON.parse(savedBookmarks));
    }
  }, []);

  // Sync URL params
  useEffect(() => {
    const client = searchParams.get("client");
    if (client && clients.length > 0) {
      const found = clients.find((c) => c.name === client);
      if (found) setSelectedClient(found);
    }
  }, [searchParams, clients]);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clientsBookmarks", JSON.stringify(bookmarkedClients));
    }
  }, [bookmarkedClients]);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ESC to close modal, arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedClient) return;

      if (e.key === "Escape") {
        setSelectedClient(null);
      } else if (e.key === "ArrowRight") {
        const currentIndex = clients.findIndex((c) => c.name === selectedClient.name);
        const nextIndex = (currentIndex + 1) % clients.length;
        setSelectedClient(clients[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        const currentIndex = clients.findIndex((c) => c.name === selectedClient.name);
        const prevIndex = (currentIndex - 1 + clients.length) % clients.length;
        setSelectedClient(clients[prevIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedClient, clients]);

  // Animate stats on load
  useEffect(() => {
    if (clients.length > 0) {
      const targetClients = clients.length;
      const targetProjects = totalProjects;
      const targetSectors = totalSectors;
      const duration = 1500;
      const steps = 60;
      const interval = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setAnimatedStats({
          clients: Math.round(targetClients * progress),
          projects: Math.round(targetProjects * progress),
          sectors: Math.round(targetSectors * progress),
        });
        if (step >= steps) clearInterval(timer);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [clients]);

  // Computed stats
  const totalProjects = clients.reduce((sum, c) => sum + c.projects, 0);
  const uniqueSectors = [...new Set(clients.map((c) => c.sector))];
  const totalSectors = uniqueSectors.length;

  // Filter and sort clients (memoized)
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Sector filter
    if (sectorFilter !== "all") {
      result = result.filter((c) => c.sector === sectorFilter);
    }

    // Sort alphabetically
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [clients, sectorFilter]);

  // Get related clients (same sector)
  const getRelatedClients = (client: Client) => {
    return clients
      .filter((c) => c.sector === client.sector && c.name !== client.name)
      .slice(0, 3);
  };

  // Toggle bookmark
  const toggleBookmark = (clientName: string) => {
    setBookmarkedClients((prev) =>
      prev.includes(clientName)
        ? prev.filter((n) => n !== clientName)
        : [...prev, clientName]
    );
  };

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="h-10 w-48 bg-[var(--muted)]/20 animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-[var(--muted)]/10 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border border-[var(--muted)] p-4 animate-pulse">
                <div className="aspect-[5/4] bg-[var(--muted)]/10 mb-4"></div>
                <div className="h-4 bg-[var(--muted)]/10 mb-2"></div>
                <div className="h-3 bg-[var(--muted)]/10 w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-2xl text-[var(--accent)] mb-2">⚠</p>
          <p className="font-mono text-sm text-[var(--muted)]">Failed to load clients</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (clients.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-2xl text-[var(--muted)] mb-2">○</p>
          <p className="font-mono text-sm text-[var(--muted)]">No clients found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Sticky Header */}
        <div
          className={`mb-12 transition-all duration-300 ${
            isSticky
              ? "fixed top-0 left-0 right-0 bg-[var(--bg)] border-b border-[var(--muted)] p-6 z-40"
              : ""
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="font-mono text-4xl mb-2 text-[var(--accent)]">Clients</h1>
                <p className="font-mono text-sm text-[var(--muted)]">
                  <span className="tabular-nums">{animatedStats.clients}</span> clients •{" "}
                  <span className="tabular-nums">{animatedStats.sectors}</span> industries •{" "}
                  <span className="tabular-nums">{animatedStats.projects}</span> projects
                  {bookmarkedClients.length > 0 && (
                    <> • <span className="tabular-nums">{bookmarkedClients.length}</span> bookmarked</>
                  )}
                </p>
              </div>

            </div>

            {/* Industry Filter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-mono text-sm text-[var(--fg)] uppercase tracking-wider">Filter by Industry</h2>
                <span className="font-mono text-xs text-[var(--muted)] tabular-nums">
                  {filteredClients.length} / {clients.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setSectorFilter("all")}
                  className={`group relative px-4 py-2 font-mono text-xs uppercase tracking-wide border-2 transition-all duration-300 ${
                    sectorFilter === "all"
                      ? "border-[var(--accent)] bg-[var(--accent)] text-black shadow-[0_0_20px_rgba(255,157,35,0.3)]"
                      : "border-[var(--muted)] hover:border-[var(--accent)] hover:shadow-[0_0_15px_rgba(255,157,35,0.2)]"
                  }`}
                >
                  <span className="relative z-10">All Industries</span>
                  {sectorFilter === "all" && (
                    <div className="absolute inset-0 bg-[var(--accent)] animate-pulse opacity-20"></div>
                  )}
                </button>
                {uniqueSectors.sort().map((sector) => {
                  const isActive = sectorFilter === sector;
                  const sectorColor = SECTOR_COLORS[sector] || "var(--accent)";
                  return (
                    <button
                      key={sector}
                      onClick={() => setSectorFilter(sector)}
                      className={`group relative px-4 py-2 font-mono text-xs uppercase tracking-wide border-2 transition-all duration-300 overflow-hidden ${
                        isActive
                          ? "text-black shadow-lg"
                          : "border-[var(--muted)] hover:border-[var(--accent)] hover:shadow-md"
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: sectorColor,
                              borderColor: sectorColor,
                              boxShadow: `0 0 20px ${sectorColor}40`
                            }
                          : {}
                      }
                    >
                      {/* Color indicator dot */}
                      <span
                        className={`inline-block w-2 h-2 mr-2 rounded-full border ${isActive ? 'border-black' : 'border-[var(--muted)]'}`}
                        style={{ backgroundColor: sectorColor }}
                      ></span>
                      <span className="relative z-10">{sector}</span>
                      {/* Hover effect overlay */}
                      {!isActive && (
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                          style={{ backgroundColor: sectorColor }}
                        ></div>
                      )}
                      {/* Active pulse effect */}
                      {isActive && (
                        <div
                          className="absolute inset-0 animate-pulse opacity-20"
                          style={{ backgroundColor: sectorColor }}
                        ></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Spacer when header is sticky */}
        {isSticky && <div className="h-96"></div>}

        {/* Empty State (no results) */}
        {filteredClients.length === 0 && (
          <div className="text-center py-24">
            <p className="font-mono text-6xl text-[var(--muted)] mb-4">○</p>
            <p className="font-mono text-xl text-[var(--fg)] mb-2">No clients found</p>
            <p className="font-mono text-sm text-[var(--muted)]">
              Try selecting a different industry filter
            </p>
          </div>
        )}

        {/* Client Grid */}
        {filteredClients.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredClients.map((client, index) => {
              const initials = client.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const sectorColor = SECTOR_COLORS[client.sector] || "var(--accent)";
              const isEnterprise = client.projects >= ENTERPRISE_PROJECT_THRESHOLD;
              const isBookmarked = bookmarkedClients.includes(client.name);

              return (
                <button
                  key={client.name}
                  onClick={() => setSelectedClient(client)}
                  onMouseEnter={() => setShowQuickPreview(client)}
                  onMouseLeave={() => setShowQuickPreview(null)}
                  className={`group relative border-2 transition-all duration-500 bg-gradient-to-br from-[var(--bg)] to-[var(--bg)]/95 text-left overflow-hidden ${
                    isBookmarked
                      ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
                      : ""
                  } ${
                    sectorFilter === client.sector
                      ? "border-[var(--accent)] shadow-[0_0_30px_rgba(255,157,35,0.2)]"
                      : "border-[var(--muted)] hover:border-[var(--accent)]"
                  } hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:scale-[1.02]`}
                  style={{
                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
                  }}
                >
                  {/* Pixel grid background */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, var(--muted) 0px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, var(--muted) 0px, transparent 1px, transparent 4px)",
                      backgroundSize: "4px 4px",
                    }}
                  ></div>

                  {/* Gradient overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${sectorColor}40, transparent)`
                    }}
                  ></div>

                  {/* Main content container with padding */}
                  <div className="relative p-5 pt-6">
                    {/* Bookmark Button (Hover) */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(client.name);
                        }}
                        className="px-2.5 py-1.5 bg-[var(--bg)] border-2 border-[var(--muted)] hover:border-[var(--accent)] text-sm hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
                        title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                      >
                        {isBookmarked ? "★" : "☆"}
                      </button>
                    </div>

                    {/* Logo Area */}
                    <div className="mb-4 flex items-center justify-center bg-gradient-to-br from-[var(--muted)]/10 to-[var(--muted)]/5 relative overflow-hidden aspect-[5/4] border border-[var(--muted)]/30 group-hover:border-[var(--accent)]/30 transition-colors duration-500">
                      {/* Corner decorations */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--accent)]/30 group-hover:border-[var(--accent)] transition-colors"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--accent)]/30 group-hover:border-[var(--accent)] transition-colors"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--accent)]/30 group-hover:border-[var(--accent)] transition-colors"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--accent)]/30 group-hover:border-[var(--accent)] transition-colors"></div>

                      {/* Scanline effect on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
                        }}
                      ></div>

                      {client.logo ? (
                        <Image
                          src={client.logo}
                          alt={`${client.name} logo`}
                          fill
                          className="object-contain p-6 group-hover:scale-110 group-hover:brightness-110 transition-all duration-500"
                        />
                      ) : (
                        <div className="text-7xl font-mono font-bold opacity-15 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-500" style={{ color: sectorColor }}>
                          {initials}
                        </div>
                      )}

                      {/* Status badge */}
                      {client.status && (
                        <div
                          className={`absolute bottom-2 left-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-lg border ${
                            client.status === "active"
                              ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                              : "bg-[var(--muted)] text-black border-[var(--muted)]"
                          }`}
                        >
                          {client.status === "active" && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                            </span>
                          )}
                          {client.status}
                        </div>
                      )}

                      {/* Enterprise badge */}
                      {isEnterprise && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-white text-black border border-white shadow-lg">
                          Enterprise
                        </div>
                      )}
                    </div>

                    {/* Client Name */}
                    <h3 className="font-mono text-base font-semibold mb-2 text-white group-hover:text-[var(--accent)] transition-colors duration-300 truncate">
                      {client.name}
                    </h3>

                    {/* Sector Tag with color indicator */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full border border-[var(--muted)]"
                        style={{ backgroundColor: sectorColor }}
                      ></div>
                      <p className="font-mono text-xs text-[var(--muted)] truncate uppercase tracking-wider">
                        {client.sector}
                      </p>
                    </div>

                    {/* Tags */}
                    {client.tags && client.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {client.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-[10px] font-mono bg-[var(--muted)]/30 border border-[var(--muted)]/50 hover:border-[var(--accent)]/50 transition-colors uppercase tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Project Volume Bar */}
                    <div className="w-full h-2 bg-[var(--muted)]/20 relative overflow-hidden border border-[var(--muted)]/30">
                      <div
                        className="h-full transition-all duration-500 relative group-hover:brightness-110"
                        style={{
                          width: `${Math.min((client.projects / MAX_PROJECTS_FOR_SCALE) * 100, 100)}%`,
                          backgroundColor: sectorColor,
                        }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Preview Panel */}
        {showQuickPreview && (
          <div className="fixed bottom-6 left-6 w-80 bg-[var(--bg)] border-2 border-[var(--accent)] p-4 z-30 animate-in fade-in duration-200">
            <h4 className="font-mono text-lg text-[var(--accent)] mb-2">{showQuickPreview.name}</h4>
            <div className="space-y-1 font-mono text-xs text-[var(--muted)]">
              <p>Sector: {showQuickPreview.sector}</p>
              <p>Projects: {showQuickPreview.projects}</p>
              {showQuickPreview.status && <p>Status: {showQuickPreview.status}</p>}
              {showQuickPreview.yearStarted && <p>Since: {showQuickPreview.yearStarted}</p>}
            </div>
            {showQuickPreview.tagline && (
              <p className="font-mono text-xs text-white/70 italic mt-2">"{showQuickPreview.tagline}"</p>
            )}
            <p className="font-mono text-[10px] text-[var(--muted)] mt-3">Click to view details →</p>
          </div>
        )}

        {/* Confidential Work Footer */}
        <div className="mt-16 pt-8 border-t border-[var(--muted)] text-center">
          <p className="font-mono text-xs text-[var(--muted)]">
            + {CONFIDENTIAL_PROJECTS_COUNT} additional confidential projects not shown
          </p>
        </div>

        {/* Client Detail Modal */}
        {selectedClient && (
          <div
            onClick={() => setSelectedClient(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-modal-title"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg)] border-2 border-[var(--accent)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative animate-in zoom-in-95 duration-200"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedClient(null)}
                className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--accent)] text-3xl font-mono leading-none transition-colors z-10"
                aria-label="Close client details"
              >
                ×
              </button>

              {/* Large Logo */}
              <div className="aspect-video mb-6 flex items-center justify-center bg-[var(--muted)]/5 relative">
                {selectedClient.logo ? (
                  <Image
                    src={selectedClient.logo}
                    alt={`${selectedClient.name} logo`}
                    fill
                    className="object-contain p-8"
                  />
                ) : (
                  <div className="text-9xl font-mono font-bold text-[var(--accent)] opacity-15">
                    {selectedClient.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="space-y-4">
                <div>
                  <h2 id="client-modal-title" className="font-mono text-3xl mb-2 text-[var(--accent)]">
                    {selectedClient.name}
                  </h2>
                  <p className="font-mono text-sm text-[var(--muted)]">
                    {selectedClient.sector} • {selectedClient.projects} projects
                    {selectedClient.yearStarted && ` • Since ${selectedClient.yearStarted}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedClient.status && (
                    <span
                      className={`inline-block px-3 py-1 text-xs font-mono uppercase tracking-wider ${
                        selectedClient.status === "active"
                          ? "bg-[var(--accent)] text-black"
                          : "bg-[var(--muted)] text-black"
                      }`}
                    >
                      {selectedClient.status}
                    </span>
                  )}
                  {selectedClient.projects >= ENTERPRISE_PROJECT_THRESHOLD && (
                    <span className="inline-block px-3 py-1 text-xs font-mono uppercase tracking-wider bg-white text-black">
                      Enterprise Client
                    </span>
                  )}
                  {bookmarkedClients.includes(selectedClient.name) && (
                    <span className="inline-block px-3 py-1 text-xs font-mono bg-[var(--accent)] text-black">
                      ★ Bookmarked
                    </span>
                  )}
                </div>

                {selectedClient.tagline && (
                  <p className="font-mono text-sm text-white/80 italic border-l-2 border-[var(--accent)] pl-4">
                    "{selectedClient.tagline}"
                  </p>
                )}

                {/* Results Snippet */}
                {selectedClient.results && (
                  <div className="bg-[var(--accent)]/10 border-l-2 border-[var(--accent)] p-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                      Results
                    </p>
                    <p className="font-mono text-sm text-white">{selectedClient.results}</p>
                  </div>
                )}

                {/* Deliverable Tags */}
                {selectedClient.deliverables && selectedClient.deliverables.length > 0 && (
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
                      Services Delivered
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.deliverables.map((deliverable) => (
                        <span
                          key={deliverable}
                          className="px-2 py-1 text-xs font-mono border border-[var(--muted)] text-[var(--fg)]"
                        >
                          {deliverable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Client Testimonial */}
                {selectedClient.testimonial && (
                  <div className="bg-[var(--muted)]/10 p-4">
                    <p className="font-mono text-sm text-white/90 italic mb-2">
                      "{selectedClient.testimonial}"
                    </p>
                    <p className="font-mono text-xs text-[var(--muted)]">— {selectedClient.name}</p>
                  </div>
                )}

                {/* Work Samples */}
                {selectedClient.workSamples && selectedClient.workSamples.length > 0 && (
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-[var(--muted)] mb-3">
                      Work Samples
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedClient.workSamples.slice(0, 4).map((sample, idx) => (
                        <div
                          key={idx}
                          className="aspect-video bg-[var(--muted)]/10 border border-[var(--muted)] flex items-center justify-center"
                        >
                          <span className="font-mono text-xs text-[var(--muted)]">Sample {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Website */}
                {selectedClient.website && (
                  <div className="flex items-center gap-3">
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-2 transition-all"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Visit website →
                    </a>
                  </div>
                )}

                {/* Related Work */}
                {(() => {
                  const relatedClients = getRelatedClients(selectedClient);
                  if (relatedClients.length > 0) {
                    return (
                      <div>
                        <p className="font-mono text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
                          Related Work
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {relatedClients.map((related) => (
                            <button
                              key={related.name}
                              onClick={() => setSelectedClient(related)}
                              className="px-3 py-1 text-xs font-mono border border-[var(--muted)] text-[var(--fg)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                            >
                              {related.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Sector CTA */}
                <div className="pt-4">
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=Inquiry about ${selectedClient.sector} services&body=I'm interested in discussing your work with ${selectedClient.name} and other ${selectedClient.sector} clients.`}
                    className="inline-block w-full text-center px-6 py-3 bg-[var(--accent)] text-black font-mono text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    Discuss {selectedClient.sector} Projects
                  </a>
                </div>
              </div>

              {/* Keyboard hints */}
              <div className="mt-8 pt-6 border-t border-[var(--muted)] flex items-center justify-center gap-6 font-mono text-xs text-[var(--muted)]">
                <span>← → Navigate</span>
                <span className="opacity-50">•</span>
                <span>ESC Close</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fade-in keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
