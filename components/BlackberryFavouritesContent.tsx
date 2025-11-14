"use client";

import { useState } from "react";
import { useHapticFeedback } from "@/lib/hooks";
import BBPageHeader from "./BBPageHeader";
import BBEmptyState from "./BBEmptyState";
import BBButton from "./BBButton";

const ACCENT = "#FF9D23";

type Favourite = {
  id: string;
  type: "project" | "link" | "note";
  title: string;
  subtitle?: string;
  url?: string;
  icon: string;
  addedDate: string;
};

const INITIAL_FAVOURITES: Favourite[] = [
  {
    id: "1",
    type: "project",
    title: "TechCo Branding",
    subtitle: "Brand Identity · 2024",
    url: "/portfolio/techco",
    icon: "⭐",
    addedDate: "2024-10-15",
  },
  {
    id: "2",
    type: "link",
    title: "Instagram",
    subtitle: "@handtomouse",
    url: "https://instagram.com/handtomouse",
    icon: "📷",
    addedDate: "2024-10-01",
  },
  {
    id: "3",
    type: "project",
    title: "RetailX Platform",
    subtitle: "Web Design · 2024",
    url: "/portfolio/retailx",
    icon: "💼",
    addedDate: "2024-09-20",
  },
  {
    id: "4",
    type: "link",
    title: "Portfolio",
    subtitle: "Full Work Archive",
    url: "/portfolio",
    icon: "🎨",
    addedDate: "2024-09-01",
  },
  {
    id: "5",
    type: "note",
    title: "Design Principles",
    subtitle: "Core values & approach",
    icon: "📝",
    addedDate: "2024-08-15",
  },
];

export default function BlackberryFavouritesContent() {
  const triggerHaptic = useHapticFeedback();
  const [favourites, setFavourites] = useState<Favourite[]>(INITIAL_FAVOURITES);
  const [filter, setFilter] = useState<"all" | "project" | "link" | "note">("all");

  const filtered = filter === "all" ? favourites : favourites.filter((f) => f.type === filter);

  const handleRemove = (id: string) => {
    setFavourites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleOpen = (fav: Favourite) => {
    if (fav.url) {
      if (fav.url.startsWith("http")) {
        window.open(fav.url, "_blank");
      } else {
        window.location.href = fav.url;
      }
    } else {
      alert(`Note: ${fav.title}\n\n${fav.subtitle || "No additional details"}`);
    }
  };

  return (
    <div>
      <BBPageHeader title="FAVOURITES" subtitle="Your bookmarked items" />

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Filter Tabs */}
      <div className="mb-3 flex gap-1 border border-white/10 bg-black/30 p-1">
        {(["all", "project", "link", "note"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              triggerHaptic(10);
              setFilter(f);
            }}
            className={`flex-1 px-2 py-1 text-xs font-semibold uppercase ${
              filter === f ? "bg-[#FF9D23] text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Count */}
      <div className="mb-3 text-xs text-white/50">
        {filtered.length} {filtered.length === 1 ? "item" : "items"}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <BBEmptyState
          icon="⭐"
          title="No favourites yet"
          description="Start adding your favourite projects and links"
        />
      ) : (
        <div className="space-y-6 md:space-y-8">
          {filtered.map((fav) => (
            <div
              key={fav.id}
              className="flex items-center gap-3 border border-white/10 bg-black/30 p-4 md:p-5 lg:p-6 hover:border-[#FF9D23]/50"
            >
              <div className="text-2xl">{fav.icon}</div>
              <div className="flex-1">
                <div className="text-base md:text-lg font-semibold text-white">{fav.title}</div>
                {fav.subtitle && <div className="text-sm text-white/50">{fav.subtitle}</div>}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    handleOpen(fav);
                  }}
                  className="px-2 py-1 text-xs font-semibold text-[#FF9D23] hover:underline"
                  aria-label="Open"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    handleRemove(fav.id);
                  }}
                  className="px-2 py-1 text-xs font-semibold text-red-400 hover:underline"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Add New (Placeholder) */}
      <div className="mt-4">
        <button
          onClick={() => {
            triggerHaptic(10);
            alert("Add new favourite feature coming soon!");
          }}
          className="w-full border-2 border-dashed border-white/20 bg-black/20 px-4 py-3 text-sm font-semibold text-white/50 hover:border-[#FF9D23]/50 hover:text-[#FF9D23]/70"
        >
          + Add Favourite
        </button>
      </div>

      <div className="mt-3 text-center text-xs text-white/40">
        Bookmark your favourite projects, links & notes
      </div>
    </div>
  );
}
