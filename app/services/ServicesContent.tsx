"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Service {
  title: string;
  category: string;
  description: string;
  deliverables: string[];
}

const SERVICE_ICONS: Record<string, string> = {
  "Brand Strategy": "◈",
  "Visual Identity": "◉",
  "Campaign Creative": "◆",
  "Content Production": "▣",
  "Web & Digital": "⬡",
  "Packaging Design": "◧",
  "Art Direction": "◐",
  "Branded Content": "◑",
};

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [hovered, setHovered] = useState(false);
  const icon = SERVICE_ICONS[service.title] ?? "◈";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "var(--panel)",
        border: "1px solid var(--grid)",
        position: "relative",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 8px 32px rgba(255,157,35,0.15), 0 0 0 1px #ff9d23"
          : "none",
        borderColor: hovered ? "#ff9d23" : "var(--grid)",
        overflow: "hidden",
      }}
    >
      {/* Left accent border — slides in on hover */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 2,
          backgroundColor: "#ff9d23",
          transform: hovered ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: "top",
          transition: "transform 0.3s ease",
        }}
      />

      <div className="p-5 md:p-6">
        {/* Icon + Title row */}
        <div className="flex items-start gap-3 mb-3">
          <span
            style={{
              fontSize: "1.5rem",
              color: "#ff9d23",
              lineHeight: 1,
              flexShrink: 0,
              marginTop: 2,
              fontFamily: "monospace",
            }}
          >
            {icon}
          </span>
          <h3
            className="uppercase leading-tight"
            style={{
              fontFamily: "'Handjet', 'argent-pixel-cf', monospace",
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              color: "var(--ink)",
              letterSpacing: "0.08em",
            }}
          >
            {service.title}
          </h3>
        </div>

        {/* Category badge */}
        <div className="mb-3">
          <span
            className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest"
            style={{
              fontFamily: "Roboto Mono, monospace",
              color: "#9A9A9A",
              border: "1px solid #2A2A2A",
              borderRadius: 2,
            }}
          >
            {service.category}
          </span>
        </div>

        {/* Description */}
        <p
          className="mb-4 leading-relaxed text-sm"
          style={{
            fontFamily: "Roboto Mono, monospace",
            color: "var(--muted)",
            lineHeight: 1.75,
          }}
        >
          {service.description}
        </p>

        {/* Deliverables */}
        {service.deliverables && service.deliverables.length > 0 && (
          <div>
            <div
              className="mb-2 text-[10px] uppercase tracking-widest"
              style={{ fontFamily: "Roboto Mono, monospace", color: "#9A9A9A" }}
            >
              Deliverables
            </div>
            <ul className="space-y-1">
              {service.deliverables.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs"
                  style={{
                    fontFamily: "Roboto Mono, monospace",
                    color: "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {/* #ff9d23 square bullet */}
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      backgroundColor: "#ff9d23",
                      flexShrink: 0,
                      marginTop: 5,
                    }}
                  />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ServicesContent() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/data/services.json")
      .then((res) => res.json())
      .then((data: Service[]) => {
        setServices(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Group by category
  const grouped = services.reduce(
    (acc, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
    },
    {} as Record<string, Service[]>
  );

  // Flat index for stagger delay across all cards
  let globalIndex = 0;

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            fontFamily: "VT323, monospace",
            fontSize: "1.25rem",
            color: "#9A9A9A",
            letterSpacing: "0.15em",
          }}
        >
          LOADING SERVICES...
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16"
      style={{ backgroundColor: "var(--bg)", fontFamily: "Roboto Mono, monospace" }}
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 md:mb-14"
      >
        <h1
          className="mb-3 uppercase"
          style={{
            fontFamily: "Roboto Mono, monospace",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            color: "var(--ink)",
            letterSpacing: "0.12em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#ff9d23" }}>/</span> SERVICES
        </h1>
        <p
          className="max-w-lg text-sm leading-relaxed"
          style={{ color: "var(--muted)", lineHeight: 1.8 }}
        >
          Full-service creative studio. Strategy through execution.
        </p>
        <div
          className="mt-4 h-[1px]"
          style={{
            background: "linear-gradient(90deg, #ff9d23 0%, transparent 60%)",
          }}
        />
      </motion.div>

      {/* Grouped service sections */}
      <div className="space-y-12">
        {Object.entries(grouped).map(([category, items]) => {
          const startIndex = globalIndex;
          globalIndex += items.length;

          return (
            <div key={category}>
              <motion.h2
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: startIndex * 0.05 }}
                className="mb-5 uppercase"
                style={{
                  fontFamily: "Roboto Mono, monospace",
                  fontSize: "0.75rem",
                  color: "#ff9d23",
                  letterSpacing: "0.25em",
                  borderLeft: "2px solid #ff9d23",
                  paddingLeft: "0.75rem",
                }}
              >
                {category}
              </motion.h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((service, i) => (
                  <ServiceCard
                    key={service.title}
                    service={service}
                    index={startIndex + i}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing signal block */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: services.length * 0.05 + 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mt-20"
      >
        {/* Section rule */}
        <div
          className="mb-8 h-[1px]"
          style={{
            background: "linear-gradient(90deg, #ff9d23 0%, transparent 60%)",
          }}
        />

        {/* Pricing rows */}
        <div
          className="mb-1 text-[10px] uppercase tracking-widest"
          style={{ fontFamily: "Roboto Mono, monospace", color: "#9A9A9A" }}
        >
          Pricing
        </div>
        <div
          className="mb-6 space-y-3"
          style={{
            fontFamily: "Roboto Mono, monospace",
            borderLeft: "2px solid #2A2A2A",
            paddingLeft: "1rem",
          }}
        >
          {/* Projects row */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span
              style={{ fontSize: "0.7rem", color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.15em" }}
            >
              Projects
            </span>
            <span
              style={{ fontSize: "1rem", color: "var(--ink)", letterSpacing: "0.04em" }}
            >
              $10k–$25k
            </span>
            <span style={{ fontSize: "0.7rem", color: "#9A9A9A" }}>·</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              Most: 4–8 weeks
            </span>
          </div>
          {/* Retainers row */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span
              style={{ fontSize: "0.7rem", color: "#9A9A9A", textTransform: "uppercase", letterSpacing: "0.15em" }}
            >
              Retainers
            </span>
            <span
              style={{ fontSize: "1rem", color: "var(--ink)", letterSpacing: "0.04em" }}
            >
              $5k–$8k/m
            </span>
            <span style={{ fontSize: "0.7rem", color: "#9A9A9A" }}>·</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              20–30hrs, 4-week sprints
            </span>
          </div>
        </div>

        {/* Payment terms */}
        <div
          className="mb-1 text-[10px] uppercase tracking-widest"
          style={{ fontFamily: "Roboto Mono, monospace", color: "#9A9A9A" }}
        >
          Payment terms
        </div>
        <div
          className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
          style={{
            fontFamily: "Roboto Mono, monospace",
            borderLeft: "2px solid #2A2A2A",
            paddingLeft: "1rem",
          }}
        >
          {[
            { pct: "50%", label: "start" },
            { pct: "20%", label: "mid" },
            { pct: "15%", label: "pre-launch" },
            { pct: "15%", label: "handoff" },
          ].map((t, i, arr) => (
            <span key={t.label} className="flex items-baseline gap-1.5">
              <span style={{ color: "#ff9d23" }}>{t.pct}</span>
              <span style={{ color: "var(--muted)" }}>{t.label}</span>
              {i < arr.length - 1 && (
                <span style={{ color: "#2A2A2A", marginLeft: "0.25rem" }}>·</span>
              )}
            </span>
          ))}
        </div>

        {/* Guarantee */}
        <p
          className="mb-12 text-xs"
          style={{
            fontFamily: "Roboto Mono, monospace",
            color: "#9A9A9A",
            fontStyle: "italic",
          }}
        >
          Unhappy after Week 1? Full refund.
        </p>
      </motion.div>

      {/* CTA section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: services.length * 0.05 + 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="flex flex-col items-center text-center px-4 pb-10"
      >
        <div
          className="mb-6 h-[1px] w-24"
          style={{ backgroundColor: "#2A2A2A" }}
        />
        <h2
          className="mb-8 uppercase"
          style={{
            fontFamily: "'argent-pixel-cf', 'Handjet', monospace",
            fontSize: "clamp(1rem, 3vw, 1.5rem)",
            color: "var(--ink)",
            letterSpacing: "0.12em",
            fontVariant: "small-caps",
            maxWidth: "36ch",
            lineHeight: 1.3,
          }}
        >
          The right brief always gets a yes.
        </h2>
        <Link href="/contact">
          <motion.button
            whileHover={{ backgroundColor: "#ff9d23", color: "#000000" }}
            whileTap={{ scale: 0.96, y: 1 }}
            className="px-8 py-3 text-sm uppercase tracking-widest"
            style={{
              fontFamily: "Roboto Mono, monospace",
              backgroundColor: "transparent",
              color: "#ff9d23",
              border: "1px solid #ff9d23",
              cursor: "pointer",
              letterSpacing: "0.15em",
              transition: "background-color 0.2s ease, color 0.2s ease",
            }}
          >
            START A CONVERSATION →
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
