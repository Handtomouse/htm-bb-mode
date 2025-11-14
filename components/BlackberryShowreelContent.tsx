"use client";

import { useState, useEffect, useRef } from "react";
import { useHapticFeedback } from "@/lib/hooks";
import BBPageHeader from "./BBPageHeader";
import BBButton from "./BBButton";

const ACCENT = "#FF9D23";

const SHOWREEL_ITEMS = [
  {
    title: "Brand Identity System",
    client: "TechCo",
    year: 2024,
    type: "Branding",
    description: "Complete brand overhaul including logo, color system, and guidelines.",
    thumbnail: "🎨",
  },
  {
    title: "E-commerce Platform",
    client: "RetailX",
    year: 2024,
    type: "Web Design",
    description: "Next.js e-commerce platform with custom checkout flow.",
    thumbnail: "🛒",
  },
  {
    title: "Packaging Design",
    client: "Artisan Co",
    year: 2023,
    type: "Packaging",
    description: "Sustainable packaging design for premium coffee brand.",
    thumbnail: "📦",
  },
  {
    title: "Campaign: Urban",
    client: "City Council",
    year: 2023,
    type: "Campaign",
    description: "Multi-channel campaign for city renewal initiative.",
    thumbnail: "📢",
  },
  {
    title: "Mobile App UI",
    client: "FinTech",
    year: 2024,
    type: "UI/UX",
    description: "Clean, accessible interface for financial planning app.",
    thumbnail: "📱",
  },
];

export default function BlackberryShowreelContent() {
  const triggerHaptic = useHapticFeedback();
  const [selected, setSelected] = useState(0);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const filteredItems = SHOWREEL_ITEMS.filter(item => {
    const matchesYear = yearFilter === "all" || item.year === yearFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesYear && matchesType;
  });

  const item = filteredItems[selected] || SHOWREEL_ITEMS[0];
  const years = Array.from(new Set(SHOWREEL_ITEMS.map(i => i.year))).sort().reverse();
  const types = Array.from(new Set(SHOWREEL_ITEMS.map(i => i.type)));

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelected(s => (s > 0 ? s - 1 : filteredItems.length - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelected(s => (s < filteredItems.length - 1 ? s + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems.length]);

  // Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left - next
      setSelected(s => (s < filteredItems.length - 1 ? s + 1 : 0));
    } else if (touchEndX.current - touchStartX.current > 50) {
      // Swipe right - previous
      setSelected(s => (s > 0 ? s - 1 : filteredItems.length - 1));
    }
  };

  const nextItem = () => setSelected(s => (s < filteredItems.length - 1 ? s + 1 : 0));
  const prevItem = () => setSelected(s => (s > 0 ? s - 1 : filteredItems.length - 1));

  return (
    <div>
      <BBPageHeader title="SHOWREEL" subtitle={`${filteredItems.length} projects`} />

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Filters */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <select
            value={yearFilter}
            onChange={(e) => {
              triggerHaptic(10);
              setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value));
              setSelected(0);
            }}
            className="flex-1 border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FF9D23] focus:outline-none"
          >
            <option value="all">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              triggerHaptic(10);
              setTypeFilter(e.target.value);
              setSelected(0);
            }}
            className="flex-1 border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-[#FF9D23] focus:outline-none"
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between border border-white/10 bg-black/30 p-2">
        <BBButton variant="ghost" size="sm" onClick={() => {
          triggerHaptic(10);
          prevItem();
        }} aria-label="Previous">
          ← Prev
        </BBButton>
        <span className="text-xs text-white/60">
          {selected + 1} / {filteredItems.length}
        </span>
        <BBButton variant="ghost" size="sm" onClick={() => {
          triggerHaptic(10);
          nextItem();
        }} aria-label="Next">
          Next →
        </BBButton>
      </div>

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Main Content */}
      <div
        className="border border-white/10 bg-black/30 p-4 md:p-6 lg:p-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Thumbnail */}
        <div className="mb-4 flex h-32 items-center justify-center border border-white/10 bg-black/50 text-6xl">
          {item.thumbnail}
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
              <span className="rounded bg-[#FF9D23]/20 px-2 py-0.5 text-[#FF9D23]">{item.type}</span>
              <span>·</span>
              <span>{item.client}</span>
              <span>·</span>
              <span>{item.year}</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-white/70">{item.description}</p>

          <div className="pt-2">
            <BBButton
              variant="secondary"
              fullWidth
              onClick={() => {
                triggerHaptic(10);
                alert("View full project details (link to /portfolio)");
              }}
            >
              View Full Project →
            </BBButton>
          </div>
        </div>
      </div>

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Thumbnail Grid */}
      <div className="mt-8">
        <h3 className="mb-2 text-xs font-semibold uppercase text-white/60">All Projects</h3>
        <div className="grid grid-cols-5 gap-2 md:gap-3 lg:gap-4">
          {SHOWREEL_ITEMS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                triggerHaptic(10);
                setSelected(idx);
              }}
              className={`flex aspect-square items-center justify-center border text-2xl ${
                idx === selected
                  ? "border-[#FF9D23] bg-[#FF9D23]/20"
                  : "border-white/10 bg-black/30 hover:border-white/30"
              }`}
              aria-label={item.title}
            >
              {item.thumbnail}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-white/40">
        ← → Arrow keys • Swipe • Click thumbnails
      </div>
    </div>
  );
}
