"use client";

import { useState } from "react";
import { useHapticFeedback } from "@/lib/hooks";
import BBPageHeader from "./BBPageHeader";
import BBEmptyState from "./BBEmptyState";
import BBButton from "./BBButton";

const ACCENT = "var(--accent)";

type Category = "all" | "design" | "dev" | "social" | "tools";

type Link = {
  id: string;
  title: string;
  url: string;
  category: Category;
  icon: string;
  description: string;
};

const WEB_LINKS: Link[] = [
  // Design Resources
  {
    id: "1",
    title: "Dribbble",
    url: "https://dribbble.com/handtomouse",
    category: "design",
    icon: "🏀",
    description: "Design inspiration & portfolio",
  },
  {
    id: "2",
    title: "Behance",
    url: "https://behance.net",
    category: "design",
    icon: "🎨",
    description: "Creative portfolios",
  },
  {
    id: "3",
    title: "Awwwards",
    url: "https://awwwards.com",
    category: "design",
    icon: "🏆",
    description: "Web design inspiration",
  },
  {
    id: "4",
    title: "Figma",
    url: "https://figma.com",
    category: "design",
    icon: "🎯",
    description: "Design tool",
  },

  // Dev Tools
  {
    id: "5",
    title: "GitHub",
    url: "https://github.com/handtomouse",
    category: "dev",
    icon: "💻",
    description: "Code repositories",
  },
  {
    id: "6",
    title: "Next.js Docs",
    url: "https://nextjs.org/docs",
    category: "dev",
    icon: "⚡",
    description: "React framework",
  },
  {
    id: "7",
    title: "Vercel",
    url: "https://vercel.com",
    category: "dev",
    icon: "▲",
    description: "Deployment platform",
  },
  {
    id: "8",
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    category: "dev",
    icon: "📚",
    description: "Developer Q&A",
  },

  // Social
  {
    id: "9",
    title: "Instagram",
    url: "https://instagram.com/handtomouse",
    category: "social",
    icon: "📷",
    description: "@handtomouse",
  },
  {
    id: "10",
    title: "Twitter/X",
    url: "https://twitter.com/handtomouse",
    category: "social",
    icon: "🐦",
    description: "@handtomouse",
  },
  {
    id: "11",
    title: "LinkedIn",
    url: "https://linkedin.com/in/handtomouse",
    category: "social",
    icon: "💼",
    description: "Professional network",
  },

  // Tools
  {
    id: "12",
    title: "Google Analytics",
    url: "https://analytics.google.com",
    category: "tools",
    icon: "📊",
    description: "Website analytics",
  },
  {
    id: "13",
    title: "Font Awesome",
    url: "https://fontawesome.com",
    category: "tools",
    icon: "🔤",
    description: "Icon library",
  },
  {
    id: "14",
    title: "Color Hunt",
    url: "https://colorhunt.co",
    category: "tools",
    icon: "🎨",
    description: "Color palettes",
  },
  {
    id: "15",
    title: "Unsplash",
    url: "https://unsplash.com",
    category: "tools",
    icon: "📸",
    description: "Free stock photos",
  },
];

export default function BlackberryWebContent() {
  const triggerHaptic = useHapticFeedback();
  const [category, setCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLinks = WEB_LINKS.filter((link) => {
    const matchesCategory = category === "all" || link.category === category;
    const matchesSearch =
      searchQuery === "" ||
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <BBPageHeader title="WEB" subtitle="Quick access to resources" />

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => {
            triggerHaptic(10);
            setSearchQuery(e.target.value);
          }}
          className="w-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Category Filters */}
      <div className="mb-3 flex gap-1 border border-white/10 bg-black/30 p-1">
        {(["all", "design", "dev", "social", "tools"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              triggerHaptic(10);
              setCategory(cat);
            }}
            className={`flex-1 px-2 py-1 text-xs font-semibold uppercase ${
              category === cat ? "bg-[var(--accent)] text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Count */}
      <div className="mb-3 text-xs text-white/50">
        {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <BBEmptyState
          icon="🔍"
          title="No links found"
          description={`Try adjusting your search or filters`}
          action={{ label: "Clear Filters", onClick: () => {
            triggerHaptic(10);
            setSearchQuery("");
            setCategory("all");
          } }}
        />
      ) : (
        <div className="space-y-6 md:space-y-8">
          {filteredLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                triggerHaptic(10);
                handleOpenLink(link.url);
              }}
              className="flex w-full items-center gap-3 border border-white/10 bg-black/30 p-4 md:p-5 lg:p-6 text-left hover:border-[var(--accent)]/50"
            >
              <div className="text-2xl">{link.icon}</div>
              <div className="flex-1">
                <div className="text-base md:text-lg font-semibold text-white">{link.title}</div>
                <div className="text-sm text-white/50">{link.description}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="rounded bg-[var(--accent)]/20 px-2 py-0.5 text-xs uppercase text-[var(--accent)]">
                  {link.category}
                </div>
                <div className="text-xl text-white/30">↗</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            triggerHaptic(10);
            handleOpenLink("https://handtomouse.com");
          }}
          className="border-2 border-white/20 bg-black/20 px-3 py-2 text-xs font-semibold text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          🏠 Main Site
        </button>
        <button
          onClick={() => {
            triggerHaptic(10);
            handleOpenLink("https://handtomouse.com/portfolio");
          }}
          className="border-2 border-white/20 bg-black/20 px-3 py-2 text-xs font-semibold text-white hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          💼 Portfolio
        </button>
      </div>

      <div className="mt-3 text-center text-xs text-white/40">Quick access to external resources</div>
    </div>
  );
}
