"use client";

import { useState } from "react";
import { BBIcon } from "@/components/BBIcon";
import { PhosphorWrapper, type PhosphorWeight } from "@/components/icons/PhosphorWrapper";
import { LucideWrapper } from "@/components/icons/LucideWrapper";
import { HeroiconsWrapper } from "@/components/icons/HeroiconsWrapper";
import { DASHBOARD_ICON_MAPPINGS, type SemanticIconName } from "@/lib/icon-mappings";

type IconLibrary = "current" | "phosphor" | "lucide" | "heroicons";

const DASHBOARD_APPS: Array<{ name: string; semanticName: SemanticIconName }> = [
  { name: "About", semanticName: "about" },
  { name: "Work", semanticName: "work" },
  { name: "Clients", semanticName: "clients" },
  { name: "Favourites", semanticName: "favourites" },
  { name: "Showreel", semanticName: "showreel" },
  { name: "Settings", semanticName: "settings" },
  { name: "Donate", semanticName: "donate" },
  { name: "Wormhole", semanticName: "wormhole" },
  { name: "Contact", semanticName: "contact" },
  { name: "Message", semanticName: "message" },
  { name: "Games", semanticName: "games" },
  { name: "Instagram", semanticName: "instagram" },
];

export default function IconComparisonPage() {
  const [selectedLibrary, setSelectedLibrary] = useState<IconLibrary>("current");
  const [phosphorWeight, setPhosphorWeight] = useState<PhosphorWeight>("regular");
  const [iconSize, setIconSize] = useState(48);

  const renderIcon = (semanticName: SemanticIconName, library: IconLibrary) => {
    const mapping = DASHBOARD_ICON_MAPPINGS[semanticName];
    const color = "currentColor";

    switch (library) {
      case "current":
        return (
          <BBIcon
            name={mapping.current as any}
            variant="solid"
            size={iconSize}
          />
        );
      case "phosphor":
        return (
          <PhosphorWrapper
            name={mapping.phosphor}
            size={iconSize}
            weight={phosphorWeight}
            color={color}
          />
        );
      case "lucide":
        return (
          <LucideWrapper
            name={mapping.lucide}
            size={iconSize}
            strokeWidth={2}
            color={color}
          />
        );
      case "heroicons":
        return (
          <HeroiconsWrapper
            name={mapping.heroicons}
            variant="solid"
            size={iconSize}
          />
        );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "2rem",
        fontFamily: "var(--font-mono)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
              color: "var(--accent)",
            }}
          >
            Icon Library Comparison
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>
            Compare all icon libraries side-by-side to find the perfect fit for your BlackBerry portfolio
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: "3rem",
            padding: "1.5rem",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--grid)",
            borderRadius: "var(--radius)",
          }}
        >
          {/* Library Selector */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--accent)",
              }}
            >
              Icon Library
            </label>
            <select
              value={selectedLibrary}
              onChange={(e) => setSelectedLibrary(e.target.value as IconLibrary)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--bg)",
                border: "1px solid var(--grid)",
                borderRadius: "var(--radius)",
                color: "var(--text)",
                fontSize: "1rem",
                fontFamily: "var(--font-mono)",
              }}
            >
              <option value="current">Current (BBIcon)</option>
              <option value="phosphor">Phosphor Icons</option>
              <option value="lucide">Lucide Icons</option>
              <option value="heroicons">Heroicons</option>
            </select>
          </div>

          {/* Phosphor Weight */}
          {selectedLibrary === "phosphor" && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--accent)",
                }}
              >
                Phosphor Weight
              </label>
              <select
                value={phosphorWeight}
                onChange={(e) => setPhosphorWeight(e.target.value as PhosphorWeight)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--bg)",
                  border: "1px solid var(--grid)",
                  borderRadius: "var(--radius)",
                  color: "var(--text)",
                  fontSize: "1rem",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <option value="thin">Thin</option>
                <option value="light">Light</option>
                <option value="regular">Regular</option>
                <option value="bold">Bold</option>
                <option value="fill">Fill (Solid)</option>
                <option value="duotone">Duotone</option>
              </select>
            </div>
          )}

          {/* Size Slider */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--accent)",
              }}
            >
              Icon Size: {iconSize}px
            </label>
            <input
              type="range"
              min="24"
              max="96"
              step="8"
              value={iconSize}
              onChange={(e) => setIconSize(parseInt(e.target.value))}
              style={{
                width: "100%",
                accentColor: "var(--accent)",
              }}
            />
          </div>
        </div>

        {/* Library Info Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Current BBIcon */}
          <LibraryCard
            name="Current (BBIcon)"
            description="Your current icon system with 221 icons (47 core + 171 HTM + 3 custom)"
            count="221 icons"
            pros={["Already integrated", "3 variants (pixel/outline/solid)", "Custom styling"]}
            cons={["HTM icons don't match aesthetic", "Limited icon variety"]}
            isActive={selectedLibrary === "current"}
            onClick={() => setSelectedLibrary("current")}
          />

          {/* Phosphor */}
          <LibraryCard
            name="Phosphor Icons"
            description="Premium icon library with 6 weights. Perfect for luxury brands."
            count="9,000+ icons"
            pros={["6 weight variants", "Duotone for luxury", "MIT license", "Huge variety"]}
            cons={["Not pixel art", "Learning curve"]}
            isActive={selectedLibrary === "phosphor"}
            onClick={() => setSelectedLibrary("phosphor")}
          />

          {/* Lucide */}
          <LibraryCard
            name="Lucide Icons"
            description="Clean, minimalist icons. Fork of Feather with more variety."
            count="1,450+ icons"
            pros={["Clean minimal design", "Lightweight", "ISC license", "Active development"]}
            cons={["Single weight only", "Might be too modern"]}
            isActive={selectedLibrary === "lucide"}
            onClick={() => setSelectedLibrary("lucide")}
          />

          {/* Heroicons */}
          <LibraryCard
            name="Heroicons"
            description="Hand-crafted by Tailwind CSS creators. Optimized for Tailwind projects."
            count="452 icons"
            pros={["Perfect Tailwind integration", "Solid/Outline variants", "MIT license"]}
            cons={["Smaller library", "Less retro feel"]}
            isActive={selectedLibrary === "heroicons"}
            onClick={() => setSelectedLibrary("heroicons")}
          />
        </div>

        {/* Dashboard Preview */}
        <div style={{ marginBottom: "3rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "1rem",
              color: "var(--accent)",
            }}
          >
            Dashboard Preview ({selectedLibrary})
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            See how your 12 dashboard icons would look with this library
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "1.5rem",
              padding: "2rem",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--grid)",
              borderRadius: "var(--radius)",
            }}
          >
            {DASHBOARD_APPS.map((app) => (
              <div
                key={app.semanticName}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid transparent",
                  transition: "all 150ms",
                  cursor: "pointer",
                }}
                className="icon-card"
              >
                <div style={{ color: "var(--icon)" }}>
                  {renderIcon(app.semanticName, selectedLibrary)}
                </div>
                <span
                  style={{
                    fontSize: "0.875rem",
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {app.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Grid */}
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              marginBottom: "1rem",
              color: "var(--accent)",
            }}
          >
            Side-by-Side Comparison
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            Same icons across all libraries
          </p>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--grid)",
                borderRadius: "var(--radius)",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--grid)" }}>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Icon
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", color: "var(--accent)" }}>
                    Current
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", color: "var(--accent)" }}>
                    Phosphor
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", color: "var(--accent)" }}>
                    Lucide
                  </th>
                  <th style={{ padding: "1rem", textAlign: "center", color: "var(--accent)" }}>
                    Heroicons
                  </th>
                </tr>
              </thead>
              <tbody>
                {DASHBOARD_APPS.map((app, index) => (
                  <tr
                    key={app.semanticName}
                    style={{
                      borderBottom:
                        index < DASHBOARD_APPS.length - 1 ? "1px solid var(--grid)" : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        fontWeight: "500",
                      }}
                    >
                      {app.name}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "inline-block", color: "var(--icon)" }}>
                        {renderIcon(app.semanticName, "current")}
                      </div>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "inline-block", color: "var(--icon)" }}>
                        {renderIcon(app.semanticName, "phosphor")}
                      </div>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "inline-block", color: "var(--icon)" }}>
                        {renderIcon(app.semanticName, "lucide")}
                      </div>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "inline-block", color: "var(--icon)" }}>
                        {renderIcon(app.semanticName, "heroicons")}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
          .icon-card:hover {
            border-color: var(--accent);
            background: rgba(255, 157, 35, 0.05);
          }
        `}</style>
      </div>
    </div>
  );
}

interface LibraryCardProps {
  name: string;
  description: string;
  count: string;
  pros: string[];
  cons: string[];
  isActive: boolean;
  onClick: () => void;
}

function LibraryCard({ name, description, count, pros, cons, isActive, onClick }: LibraryCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "1.5rem",
        background: isActive ? "rgba(255, 157, 35, 0.1)" : "rgba(255, 255, 255, 0.02)",
        border: `2px solid ${isActive ? "var(--accent)" : "var(--grid)"}`,
        borderRadius: "var(--radius)",
        cursor: "pointer",
        transition: "all 150ms",
      }}
      className="library-card"
    >
      <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--accent)" }}>
        {name}
      </h3>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
        {description}
      </p>
      <div
        style={{
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--accent)",
          marginBottom: "1rem",
        }}
      >
        {count}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            marginBottom: "0.5rem",
            color: "#4ade80",
          }}
        >
          PROS
        </div>
        <ul style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--muted)" }}>
          {pros.map((pro, i) => (
            <li key={i} style={{ marginBottom: "0.25rem" }}>
              {pro}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            marginBottom: "0.5rem",
            color: "#f87171",
          }}
        >
          CONS
        </div>
        <ul style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--muted)" }}>
          {cons.map((con, i) => (
            <li key={i} style={{ marginBottom: "0.25rem" }}>
              {con}
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .library-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}
