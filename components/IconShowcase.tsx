"use client";

import React, { useState } from "react";
import { BBIcon } from "./BBIcon";
import { getAllIconNames, IconVariant } from "@/lib/icon-registry";

type IconColor = "accent" | "white" | "grey" | "green" | "red" | "inherit";

export function IconShowcase() {
  const [selectedVariant, setSelectedVariant] = useState<IconVariant>("pixel");
  const [selectedColor, setSelectedColor] = useState<IconColor>("accent");
  const [iconSize, setIconSize] = useState(48);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState<"all" | "core" | "htm">("all");

  const allIcons = getAllIconNames();

  // Separate core and HTM icons
  const coreIcons = allIcons.filter(name => !name.startsWith('htm-') && !name.includes('-1') && !name.includes('-2') && !name.includes('-3'));
  const htmIcons = allIcons.filter(name => name.startsWith('htm-') || name.includes('-1') || name.includes('-2') || name.includes('-3'));

  // Filter icons based on search
  const filteredIcons = allIcons.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCoreIcons = coreIcons.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHtmIcons = htmIcons.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colorOptions: { value: IconColor; label: string; hex: string }[] = [
    { value: "accent", label: "Accent", hex: "#ff9d23" },
    { value: "white", label: "White", hex: "#EDECEC" },
    { value: "grey", label: "Grey", hex: "#6b6b6b" },
    { value: "green", label: "Green", hex: "#94b039" },
    { value: "red", label: "Red", hex: "#a92624" },
    { value: "inherit", label: "Inherit", hex: "currentColor" },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="space-y-2">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--accent)",
            textShadow: "0 0 20px rgba(255, 157, 35, 0.4)"
          }}
        >
          ICON SYSTEM
        </h1>
        <p
          className="text-sm opacity-60"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--ink)"
          }}
        >
          {filteredIcons.length} icons × 3 variants × 6 colors = {filteredIcons.length * 3 * 6} combinations
        </p>
      </header>

      {/* Controls */}
      <div className="space-y-6 p-6 rounded-none border backdrop-blur-md"
        style={{
          borderColor: "rgba(255, 255, 255, 0.15)",
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))"
        }}
      >
        {/* Search */}
        <div>
          <label
            className="block text-xs uppercase mb-2 tracking-wide"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--muted)"
            }}
          >
            Search
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter icons..."
            className="w-full px-4 py-2 rounded-none border bg-transparent text-sm"
            style={{
              fontFamily: "var(--font-body)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "var(--ink)"
            }}
          />
        </div>

        {/* Filter Selector */}
        <div>
          <label
            className="block text-xs uppercase mb-2 tracking-wide"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--muted)"
            }}
          >
            Filter Icons
          </label>
          <div className="flex gap-3">
            {(["all", "core", "htm"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setShowFilter(filter)}
                className="px-6 py-2 rounded-none border transition-all font-bold text-sm uppercase tracking-wide"
                style={{
                  fontFamily: "var(--font-body)",
                  borderColor: showFilter === filter
                    ? "var(--accent)"
                    : "rgba(255, 255, 255, 0.2)",
                  background: showFilter === filter
                    ? "rgba(255, 157, 35, 0.1)"
                    : "transparent",
                  color: showFilter === filter
                    ? "var(--accent)"
                    : "var(--ink)",
                  boxShadow: showFilter === filter
                    ? "0 0 20px rgba(255, 157, 35, 0.3)"
                    : "none"
                }}
              >
                {filter === "all" ? `All (${filteredIcons.length})` :
                 filter === "core" ? `Core (${filteredCoreIcons.length})` :
                 `HTM (${filteredHtmIcons.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Variant Selector */}
        <div>
          <label
            className="block text-xs uppercase mb-2 tracking-wide"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--muted)"
            }}
          >
            Variant
          </label>
          <div className="flex gap-3">
            {(["pixel", "outline", "solid"] as IconVariant[]).map((variant) => (
              <button
                key={variant}
                onClick={() => setSelectedVariant(variant)}
                className="px-6 py-2 rounded-none border transition-all font-bold text-sm uppercase tracking-wide"
                style={{
                  fontFamily: "var(--font-body)",
                  borderColor: selectedVariant === variant
                    ? "var(--accent)"
                    : "rgba(255, 255, 255, 0.2)",
                  background: selectedVariant === variant
                    ? "rgba(255, 157, 35, 0.1)"
                    : "transparent",
                  color: selectedVariant === variant
                    ? "var(--accent)"
                    : "var(--ink)",
                  boxShadow: selectedVariant === variant
                    ? "0 0 20px rgba(255, 157, 35, 0.3)"
                    : "none"
                }}
              >
                {variant}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label
            className="block text-xs uppercase mb-2 tracking-wide"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--muted)"
            }}
          >
            Color
          </label>
          <div className="flex gap-3">
            {colorOptions.map(({ value, label, hex }) => (
              <button
                key={value}
                onClick={() => setSelectedColor(value)}
                className="flex items-center gap-2 px-4 py-2 rounded-none border transition-all text-xs uppercase tracking-wide font-bold"
                style={{
                  fontFamily: "var(--font-body)",
                  borderColor: selectedColor === value
                    ? "var(--accent)"
                    : "rgba(255, 255, 255, 0.2)",
                  background: selectedColor === value
                    ? "rgba(255, 157, 35, 0.1)"
                    : "transparent",
                  color: selectedColor === value
                    ? "var(--accent)"
                    : "var(--ink)",
                  boxShadow: selectedColor === value
                    ? "0 0 20px rgba(255, 157, 35, 0.3)"
                    : "none"
                }}
              >
                <span
                  className="w-4 h-4 rounded-full border"
                  style={{
                    backgroundColor: hex === "currentColor" ? "transparent" : hex,
                    borderColor: "rgba(255, 255, 255, 0.3)"
                  }}
                />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Size Slider */}
        <div>
          <label
            className="block text-xs uppercase mb-2 tracking-wide"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--muted)"
            }}
          >
            Size: {iconSize}px
          </label>
          <input
            type="range"
            min="16"
            max="96"
            step="4"
            value={iconSize}
            onChange={(e) => setIconSize(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>

        {/* Glow Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="glow-toggle"
            checked={glowEnabled}
            onChange={(e) => setGlowEnabled(e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          <label
            htmlFor="glow-toggle"
            className="text-sm uppercase tracking-wide font-bold cursor-pointer"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--ink)"
            }}
          >
            Luxury Glow Effect
          </label>
        </div>
      </div>

      {/* Icon Grid (matching menu style) */}
      <div
        className="grid grid-cols-3 gap-7 select-none"
        style={{
          gridAutoRows: "minmax(160px, 1fr)",
          padding: "20px 0"
        }}
      >
        {(showFilter === "all" ? filteredIcons :
          showFilter === "core" ? filteredCoreIcons :
          filteredHtmIcons).map((iconName) => {
          const isCore = !iconName.startsWith('htm-') && !iconName.includes('-1') && !iconName.includes('-2') && !iconName.includes('-3');
          return (
          <div
            key={iconName}
            className="group relative flex flex-col items-center justify-center rounded-none border p-6 backdrop-blur-md transition-all duration-300"
            style={{
              borderColor: "rgba(255, 255, 255, 0.15)",
              background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.06))",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 157, 35, 0.4), 0 4px 12px rgba(0, 0, 0, 0.4)";
              e.currentTarget.style.background = "linear-gradient(to bottom, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.09))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)";
              e.currentTarget.style.background = "linear-gradient(to bottom, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.06))";
            }}
          >
            {/* Icon */}
            <div
              className="transition-all duration-300 group-hover:scale-110"
              style={{
                filter: "brightness(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.2) drop-shadow(0 0 8px rgba(255, 157, 35, 0.5))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))";
              }}
            >
              <BBIcon
                name={iconName as any}
                variant={selectedVariant}
                color={selectedColor}
                size={iconSize}
                glow={glowEnabled}
              />
            </div>

            {/* Label */}
            <div className="mt-3 flex flex-col items-center gap-1">
              <span
                className="text-sm font-bold uppercase tracking-wide transition-all duration-300"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "rgba(255, 255, 255, 0.9)",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
                  lineHeight: "1"
                }}
              >
                {iconName}
              </span>
              {!isCore && (
                <span
                  className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-none border"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "rgba(255, 157, 35, 0.8)",
                    borderColor: "rgba(255, 157, 35, 0.3)",
                    background: "rgba(255, 157, 35, 0.1)",
                    fontSize: "10px"
                  }}
                >
                  HTM
                </span>
              )}
            </div>
          </div>
        )})}
      </div>

      {/* Stats Footer */}
      <footer
        className="text-center text-xs opacity-40 pt-8"
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--ink)"
        }}
      >
        BlackBerry Icon System • {filteredIcons.length} icons loaded
      </footer>
    </div>
  );
}
