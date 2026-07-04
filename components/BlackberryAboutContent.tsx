"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { useHapticFeedback } from "@/lib/hooks";
import TypewriterManifesto from "./TypewriterManifesto";
import LuxuryStatCard from "./LuxuryStatCard";
import LuxuryCollapsibleSection from "./LuxuryCollapsibleSection";
import { ACCENT, ACCENT_HOVER, STAT_CARD_VARS, type AboutData } from "@/lib/aboutData";

// ─── Dot divider ─────────────────────────────────────────────────────────────
function DotDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-6">
      {[0.3, 0.5, 0.7, 0.5, 0.3].map((op, i) => (
        <div key={i} className="w-1 h-1 rounded-full bg-[var(--accent)]" style={{ opacity: op }} />
      ))}
    </div>
  );
}

// ─── Zone 1 hook strip ───────────────────────────────────────────────────────
function HookStrip({ data }: { data: AboutData }) {
  return (
    <section
      id="hook"
      aria-label="About HandToMouse"
      className="px-6 md:px-12 pt-8 pb-6 space-y-5"
    >
      {/* Headline */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-[18px] md:text-[22px] text-white/95 leading-snug"
        style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        {data.hero.headline}
      </motion.p>

      {/* POV — sharpest line from subline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="text-[14px] md:text-[16px] leading-relaxed"
        style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.55)" }}
      >
        Finding the small, precise angle no one else has noticed yet.
      </motion.p>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {data.hero.badges.map((badge, i) => (
          <span
            key={i}
            className="px-3 py-1 text-[11px] uppercase tracking-[0.12em] border"
            style={{
              fontFamily: '"argent-pixel-cf", sans-serif',
              borderColor: "rgba(255,157,35,0.4)",
              color: ACCENT,
              background: "rgba(255,157,35,0.06)",
            }}
          >
            {badge}
          </span>
        ))}
      </motion.div>

      {/* Proof strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-4 pt-2 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <span
          className="text-[12px] uppercase tracking-[0.1em]"
          style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: "rgba(255,255,255,0.45)" }}
        >
          60+ projects
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span
          className="text-[12px] uppercase tracking-[0.1em]"
          style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: "rgba(255,255,255,0.45)" }}
        >
          78% retention
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span
          className="text-[12px] uppercase tracking-[0.1em]"
          style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: "rgba(255,255,255,0.45)" }}
        >
          Est. 2020
        </span>
      </motion.div>
    </section>
  );
}

// ─── Zone 2 — What We Do ─────────────────────────────────────────────────────
function WhatWeDo({ data }: { data: AboutData }) {
  return (
    <section
      id="services"
      aria-label="Services"
      className="px-6 md:px-12 py-6 space-y-4 border-t"
      style={{ borderColor: "rgba(255,157,35,0.15)" }}
    >
      <motion.h2
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[11px] uppercase tracking-[0.18em]"
        style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
      >
        What We Do
      </motion.h2>

      <div className="space-y-3">
        {data.services.map((svc, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
            className="flex items-baseline gap-3"
          >
            <span className="text-[16px] flex-shrink-0" aria-hidden="true">
              {svc.icon}
            </span>
            <span
              className="text-[14px] md:text-[15px] text-white/90"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span className="font-medium">{svc.title}</span>
              <span className="text-white/40 mx-2">—</span>
              <span className="text-white/60">{svc.line}</span>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Pricing signal */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="pt-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p
          className="text-[12px] uppercase tracking-[0.1em]"
          style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: "rgba(255,255,255,0.35)" }}
        >
          {data.pricing.projects} projects&nbsp;&nbsp;·&nbsp;&nbsp;{data.pricing.retainers}/m retainers
        </p>
      </motion.div>
    </section>
  );
}

// ─── Zone 3 — Proof cards ────────────────────────────────────────────────────
function ProofSection({
  data,
  onOpenWork,
}: {
  data: AboutData;
  onOpenWork?: () => void;
}) {
  return (
    <section
      id="proof"
      aria-label="Client proof"
      className="px-6 md:px-12 py-6 space-y-4 border-t"
      style={{ borderColor: "rgba(255,157,35,0.15)" }}
    >
      <motion.h2
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[11px] uppercase tracking-[0.18em]"
        style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
      >
        Proof
      </motion.h2>

      <div className="space-y-3">
        {data.proof.highlights.map((h, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.55 }}
            className="border-l-2 pl-4 py-2"
            style={{ borderColor: "rgba(255,157,35,0.4)" }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span
                className="text-[14px] font-bold text-white uppercase tracking-wide"
                style={{ fontFamily: '"argent-pixel-cf", sans-serif' }}
              >
                {h.label}
              </span>
              <span
                className="text-[11px] flex-shrink-0"
                style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: "rgba(255,157,35,0.6)" }}
              >
                {h.duration}
              </span>
            </div>
            <p
              className="text-[13px] mt-1 leading-snug"
              style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.65)" }}
            >
              {h.line}
            </p>
            {h.quote && (
              <p
                className="text-[12px] mt-1 italic"
                style={{ color: "rgba(255,157,35,0.75)" }}
              >
                {h.quote}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Client strip */}
      {data.proof.clients && data.proof.clients.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap gap-x-4 gap-y-1 pt-2"
        >
          {data.proof.clients.map((c, i) => (
            <span
              key={i}
              className="text-[11px] uppercase tracking-[0.1em]"
              style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: "rgba(255,255,255,0.3)" }}
            >
              {c}
            </span>
          ))}
        </motion.div>
      )}

      {/* See work CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <button
          onClick={onOpenWork}
          className="text-[12px] uppercase tracking-[0.12em] hover:opacity-80 transition-opacity"
          style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
        >
          See work →
        </button>
      </motion.div>
    </section>
  );
}

// ─── Zone 4 — Process (collapsed by default) ─────────────────────────────────
function ProcessSection({ data }: { data: AboutData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="process"
      aria-label="Process"
      className="px-6 md:px-12 py-6 border-t"
      style={{ borderColor: "rgba(255,157,35,0.15)" }}
    >
      <button
        className="w-full flex items-center justify-between group"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span
          className="text-[11px] uppercase tracking-[0.18em]"
          style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
        >
          Process
        </span>
        {/* collapsed summary */}
        {!expanded && (
          <span
            className="text-[11px] text-white/40 tracking-wide"
            style={{ fontFamily: '"argent-pixel-cf", sans-serif' }}
          >
            ① Plan → ② Produce → ③ Train
          </span>
        )}
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-[12px] ml-2 flex-shrink-0"
          style={{ color: ACCENT }}
        >
          ▶
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={expanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ overflow: "hidden" }}
      >
        <div className="pt-4 space-y-4">
          {data.process.steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={expanded ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="flex items-start gap-4 border-l-2 pl-4 py-2"
              style={{ borderColor: "rgba(255,157,35,0.35)" }}
            >
              <span className="text-[18px] flex-shrink-0" style={{ color: ACCENT }}>
                {step.num}
              </span>
              <div>
                <div
                  className="text-[14px] font-bold text-white tracking-wide"
                  style={{ fontFamily: '"argent-pixel-cf", sans-serif' }}
                >
                  {step.title}{" "}
                  <span style={{ color: ACCENT }}>· {step.promise}</span>
                </div>
                <div
                  className="text-[12px] mt-1"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {step.duration}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ─── Beliefs compact grid ────────────────────────────────────────────────────
function BeliefsGrid({ data }: { data: AboutData }) {
  if (!data.beliefs || data.beliefs.length === 0) return null;
  return (
    <section
      id="beliefs"
      aria-label="Beliefs"
      className="px-6 md:px-12 py-6 border-t"
      style={{ borderColor: "rgba(255,157,35,0.15)" }}
    >
      <motion.h2
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[11px] uppercase tracking-[0.18em] mb-4"
        style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
      >
        What We Believe
      </motion.h2>
      <div className="space-y-2">
        {data.beliefs.map((b, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.07, duration: 0.45 }}
            className="flex items-baseline gap-3"
          >
            <span className="text-[13px] flex-shrink-0">{b.icon}</span>
            <span
              className="text-[13px] text-white/70 leading-snug"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {b.text}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Details collapsibles (ops / pricing / who) ──────────────────────────────
function DetailsSection({
  data,
  openSection,
  setOpenSection,
}: {
  data: AboutData;
  openSection: string | null;
  setOpenSection: (s: string | null) => void;
}) {
  const toggle = (id: string) =>
    setOpenSection(openSection === id ? null : id);

  return (
    <section
      id="details"
      aria-label="Details"
      className="px-6 md:px-12 py-6 space-y-4 border-t"
      style={{ borderColor: "rgba(255,157,35,0.15)" }}
    >
      <motion.h2
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-[11px] uppercase tracking-[0.18em]"
        style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
      >
        Details
      </motion.h2>

      {/* Ops — condensed to 3 bullets */}
      <LuxuryCollapsibleSection
        title="How We Work"
        icon="⚙️"
        isOpen={openSection === "ops"}
        onToggle={() => toggle("ops")}
      >
        <div className="space-y-3">
          <p
            className="text-[14px] text-white/70 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {data.setup.line}
          </p>
          <div className="space-y-2 pt-2">
            {data.ops.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-[14px] flex-shrink-0" style={{ color: ACCENT }}>
                  {item.icon}
                </span>
                <p
                  className="text-[13px] text-white/80 leading-snug"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          {/* Not right for — 2 lines max */}
          <div
            className="pt-3 border-t text-[12px] leading-snug"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              fontFamily: "var(--font-body)",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Not right for: urgent rebrands, vanity-metric briefs, or &ldquo;make us viral&rdquo; asks.
          </div>
        </div>
      </LuxuryCollapsibleSection>

      {/* Pricing */}
      <LuxuryCollapsibleSection
        title="Pricing & Terms"
        icon="💰"
        isOpen={openSection === "pricing"}
        onToggle={() => toggle("pricing")}
      >
        <div className="space-y-6">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.1em] mb-1"
              style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
            >
              Projects
            </p>
            <p className="text-[22px] font-bold text-white">{data.pricing.projects}</p>
            <p className="text-[12px] text-white/50 mt-1">{data.pricing.projectLength}</p>
          </div>
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.1em] mb-1"
              style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
            >
              Retainers
            </p>
            <p className="text-[22px] font-bold text-white">{data.pricing.retainers}</p>
            <p className="text-[12px] text-white/50 mt-1">{data.pricing.retainerDetails}</p>
          </div>
          <div
            className="border-t pt-4 space-y-1"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-[12px] text-white/60">{data.pricing.terms}</p>
            <p
              className="text-[11px]"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}
            >
              {data.pricing.termsDetail}
            </p>
          </div>
          <div
            className="border border-[var(--accent)]/30 px-4 py-3 text-[13px] text-white/80"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {data.pricing.guarantee}
          </div>
        </div>
      </LuxuryCollapsibleSection>

      {/* Who */}
      <LuxuryCollapsibleSection
        title="Who I Work With"
        icon="🤝"
        isOpen={openSection === "who"}
        onToggle={() => toggle("who")}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {data.hero.principles.map((p, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-[14px] flex-shrink-0">{p.icon}</span>
                <p
                  className="text-[13px] text-white/80 leading-snug"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {p.text}
                </p>
              </div>
            ))}
          </div>

          {/* Philosophy — one punchy line, rest hidden */}
          <div
            className="border-t pt-3 text-[13px] italic leading-snug"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              color: "rgba(255,157,35,0.75)",
              fontFamily: "var(--font-body)",
            }}
          >
            &ldquo;I&apos;m not interested in trends or templates. I&apos;m interested in ideas with backbone — things that stick because they mean something.&rdquo;
          </div>
        </div>
      </LuxuryCollapsibleSection>
    </section>
  );
}

// ─── Typewriter section ──────────────────────────────────────────────────────
function TypewriterSection({
  typewriterRef,
  typewriterScrollProgress,
  typewriterOpacity,
  onTypewriterComplete,
}: {
  typewriterRef: React.RefObject<HTMLDivElement>;
  typewriterScrollProgress: number;
  typewriterOpacity: number;
  onTypewriterComplete: () => void;
}) {
  return (
    <section
      id="typewriter"
      className="flex items-center justify-center py-12 md:py-16 scroll-mt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center px-6 md:px-12"
      >
        <div ref={typewriterRef}>
          <TypewriterManifesto
            text="Everyone's chasing new — we chase different."
            onComplete={onTypewriterComplete}
            scrollProgress={typewriterScrollProgress}
            opacity={typewriterOpacity}
          />
        </div>
      </motion.div>
    </section>
  );
}

// ─── Stats section (unchanged logic, identical markup) ────────────────────────
function StatsSection({
  data,
  mouseX,
  mouseY,
  springX,
  springY,
  statsSectionRef,
  cardRefs,
  lineCoords,
  hoveredCardIndex,
  setHoveredCardIndex,
  isAnythingHovered,
  setIsAnythingHovered,
  spotlightIndex,
}: {
  data: AboutData;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  springX: ReturnType<typeof useSpring>;
  springY: ReturnType<typeof useSpring>;
  statsSectionRef: React.MutableRefObject<HTMLElement | null>;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  lineCoords: { x1: number; y1: number; x2: number; y2: number }[];
  hoveredCardIndex: number | null;
  setHoveredCardIndex: (i: number | null) => void;
  isAnythingHovered: boolean;
  setIsAnythingHovered: (v: boolean) => void;
  spotlightIndex: number;
}) {
  return (
    <section
      id="stats"
      ref={statsSectionRef}
      aria-label="Company statistics"
      className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 py-20 scroll-mt-20"
      style={{ minHeight: "calc(var(--vh, 1vh) * 80)", ...STAT_CARD_VARS, position: "relative", overflow: "hidden" }}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
    >
      {/* Radial gradient backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(255,157,35,0.02) 50%, transparent 100%)",
          opacity: 0.4,
        }}
      />

      {/* Trailing glow cursor */}
      <motion.div
        style={{
          position: "absolute",
          pointerEvents: "none",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,157,35,0.07) 0%, transparent 70%)",
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          zIndex: 0,
        }}
      />

      {/* Connecting lines SVG overlay */}
      {lineCoords.length > 0 && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {lineCoords.map((line, li) => {
            const pairIndices = [[0, 2], [1, 4]];
            const [a, b] = pairIndices[li] ?? [0, 0];
            const isActive = hoveredCardIndex === a || hoveredCardIndex === b;
            return (
              <line
                key={li}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#ff9d23"
                strokeOpacity={isActive ? 0.35 : 0.12}
                strokeDasharray="4 4"
                strokeWidth="1"
                style={{ transition: "stroke-opacity 0.3s" }}
              />
            );
          })}
        </svg>
      )}

      {/* Scroll reveal curtain */}
      <motion.div
        initial={{ y: 0 }}
        whileInView={{ y: "100%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          background: "#0b0b0b",
          zIndex: 10,
          pointerEvents: "none",
          originY: 1,
        }}
      />

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="text-[32px] md:text-[40px] lg:text-[52px] font-bold uppercase text-center mb-10 md:mb-14"
        style={{
          fontFamily: '"argent-pixel-cf", sans-serif',
          color: "var(--accent)",
          letterSpacing: "0.15em",
          textShadow: "0 0 30px rgba(255,157,35,0.3), 0 0 60px rgba(255,157,35,0.1)",
          position: "relative",
          zIndex: 2,
        }}
      >
        By The Numbers
      </motion.h2>

      <div
        className="relative w-full max-w-6xl mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--card-gap)",
          alignItems: "stretch",
          zIndex: 2,
        }}
      >
        <div
          ref={(el) => { cardRefs.current[0] = el; }}
          className="col-span-full sm:col-auto"
          onMouseEnter={() => { setIsAnythingHovered(true); setHoveredCardIndex(0); }}
          onMouseLeave={() => { setIsAnythingHovered(false); setHoveredCardIndex(null); }}
        >
          <LuxuryStatCard
            label="Projects"
            value={data.stats.projects}
            delay={0.3}
            index={0}
            priority={true}
            benchmark="2.8× avg studio output"
            trend={[15, 25, 38, 50, 62, 75, 90, 100]}
            story="60+ brand projects delivered since 2020 — each one a different brief, a different sector, the same obsession with precision."
            shareText="60+ projects delivered since 2020 — HandToMouse Studio"
            isSpotlit={spotlightIndex === 0}
          />
        </div>

        <div
          ref={(el) => { cardRefs.current[1] = el; }}
          className="odd:aspect-[3/2] even:aspect-[4/3] sm:aspect-auto"
          onMouseEnter={() => { setIsAnythingHovered(true); setHoveredCardIndex(1); }}
          onMouseLeave={() => { setIsAnythingHovered(false); setHoveredCardIndex(null); }}
        >
          <LuxuryStatCard
            label="Retention"
            value={data.stats.retention}
            delay={0.4}
            index={1}
            benchmark="1.9× industry avg"
            trend={[40, 52, 60, 68, 72, 75]}
            story="3 in 4 clients return for the next project. Good systems create dependency — in the best possible way."
            shareText="75% client retention — HandToMouse Studio"
            isSpotlit={spotlightIndex === 1}
          />
        </div>

        <div
          ref={(el) => { cardRefs.current[2] = el; }}
          className="even:aspect-[4/3] odd:aspect-[3/2] sm:aspect-auto"
          onMouseEnter={() => { setIsAnythingHovered(true); setHoveredCardIndex(2); }}
          onMouseLeave={() => { setIsAnythingHovered(false); setHoveredCardIndex(null); }}
        >
          <LuxuryStatCard
            label="Repeat Clients"
            value={data.stats.repeatClients}
            delay={0.5}
            index={2}
            benchmark="3× typical agency rate"
            trend={[20, 28, 35, 40, 43, 45]}
            story="45% of clients return within 18 months. The brief changes — the relationship doesn't."
            shareText="45% repeat client rate — HandToMouse Studio"
            isSpotlit={spotlightIndex === 2}
          />
        </div>

        <div
          ref={(el) => { cardRefs.current[3] = el; }}
          className="odd:aspect-[3/2] even:aspect-[4/3] sm:aspect-auto"
          onMouseEnter={() => { setIsAnythingHovered(true); setHoveredCardIndex(3); }}
          onMouseLeave={() => { setIsAnythingHovered(false); setHoveredCardIndex(null); }}
        >
          <LuxuryStatCard
            label="Years Active"
            value="6"
            delay={0.6}
            index={3}
            trend={[10, 25, 40, 55, 70, 100]}
            story="6 years of focused practice. Long enough to know what works — still close enough to stay curious."
            shareText="6 years active — HandToMouse Studio"
            isSpotlit={spotlightIndex === 3}
          />
        </div>

        <div
          ref={(el) => { cardRefs.current[4] = el; }}
          className="even:aspect-[4/3] odd:aspect-[3/2] sm:aspect-auto"
          onMouseEnter={() => { setIsAnythingHovered(true); setHoveredCardIndex(4); }}
          onMouseLeave={() => { setIsAnythingHovered(false); setHoveredCardIndex(null); }}
        >
          <LuxuryStatCard
            label="Response"
            value={data.stats.avgResponse}
            delay={0.7}
            index={4}
            benchmark="5× faster than avg agency"
            trend={[100, 85, 70, 60, 52, 48]}
            story="48hr average turnaround — usually 4hr. Clarity is part of the service, not an afterthought."
            shareText="48hr average response — HandToMouse Studio"
            isSpotlit={spotlightIndex === 4}
          />
        </div>

        <div
          ref={(el) => { cardRefs.current[5] = el; }}
          className="odd:aspect-[3/2] even:aspect-[4/3] sm:aspect-auto"
          onMouseEnter={() => { setIsAnythingHovered(true); setHoveredCardIndex(5); }}
          onMouseLeave={() => { setIsAnythingHovered(false); setHoveredCardIndex(null); }}
        >
          <LuxuryStatCard
            label="Industries"
            value={data.stats.industries}
            delay={0.8}
            index={5}
            trend={[2, 4, 5, 6, 7, 8]}
            story="8 industries covered — hospitality to healthcare. Diverse context sharpens the eye."
            shareText="8 industries served — HandToMouse Studio"
            isSpotlit={spotlightIndex === 5}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Zone 5 — Contact signal ──────────────────────────────────────────────────
function ContactSignal({ data }: { data: AboutData }) {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="px-6 md:px-12 py-8 border-t"
      style={{ borderColor: "rgba(255,157,35,0.3)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-5"
      >
        <p
          className="text-[15px] md:text-[17px] text-white/85 leading-snug"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {data.contact.status}
        </p>

        <p
          className="text-[12px] uppercase tracking-[0.1em]"
          style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: "rgba(255,255,255,0.35)" }}
        >
          {data.contact.responseTime}
        </p>

        <motion.a
          href="/contact"
          whileHover={{ scale: 1.03, boxShadow: `0 0 30px rgba(255,157,35,0.6)` }}
          whileTap={{ scale: 0.97 }}
          className="inline-block border-2 border-[var(--accent)] bg-[var(--accent)] px-6 py-3 text-[13px] font-bold text-black uppercase tracking-[0.1em] transition-all duration-300"
          style={{ fontFamily: '"argent-pixel-cf", sans-serif' }}
        >
          Start a Conversation →
        </motion.a>
      </motion.div>
    </section>
  );
}

// ─── Now block ────────────────────────────────────────────────────────────────
function NowBlock({ data }: { data: AboutData }) {
  return (
    <section
      id="now"
      className="px-6 md:px-12 py-6 border-t"
      style={{ borderColor: "rgba(255,157,35,0.15)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-3"
      >
        <div className="flex items-baseline gap-3">
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ fontFamily: '"argent-pixel-cf", sans-serif', color: ACCENT }}
          >
            Now
          </span>
          <span
            className="text-[11px]"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: '"argent-pixel-cf", sans-serif' }}
          >
            {data.now.lastUpdated}
          </span>
        </div>
        <p
          className="text-[13px] leading-snug text-white/65"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {data.now.currentFocus}
        </p>

        {/* Ticker */}
        <div className="overflow-hidden border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <motion.div
            animate={{ x: [0, -900] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 whitespace-nowrap"
          >
            {[
              "✓ Jac+Jack W25/SP25 campaign delivered",
              "✓ S'WICH Bondi → Redfern → Surry Hills",
              "✓ MapleMoon 160+ retailers",
              "✓ Aura Therapeutics brand identity",
            ].concat([
              "✓ Jac+Jack W25/SP25 campaign delivered",
              "✓ S'WICH Bondi → Redfern → Surry Hills",
              "✓ MapleMoon 160+ retailers",
              "✓ Aura Therapeutics brand identity",
            ]).map((t, i) => (
              <span
                key={i}
                className="text-[11px] uppercase tracking-[0.08em]"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: '"argent-pixel-cf", sans-serif' }}
              >
                {t}
                {i < 7 && <span className="mx-4" style={{ color: "rgba(255,255,255,0.15)" }}>·</span>}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BlackberryAboutContent({
  onOpenWork,
}: {
  onOpenWork?: () => void;
}) {
  const [data, setData] = useState<AboutData | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Scroll tracking
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [typewriterOpacity, setTypewriterOpacity] = useState(1);
  const [typewriterScrollProgress, setTypewriterScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  // Animation completion
  const [typewriterComplete, setTypewriterComplete] = useState(false);

  const triggerHaptic = useHapticFeedback();
  const lastScrollTop = useRef(0);
  const rafId = useRef<number | null>(null);
  const typewriterRef = useRef<HTMLDivElement>(null);

  // Spotlight cycling
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isAnythingHovered, setIsAnythingHovered] = useState(false);

  // Trailing cursor
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // Stat card refs
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null, null]);
  const statsSectionRef = useRef<HTMLElement | null>(null);
  const [lineCoords, setLineCoords] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/data/about.json?v=3")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(isTouchDevice || window.innerWidth < 768);
    };
    checkMobile();
    let t: NodeJS.Timeout;
    const onResize = () => { clearTimeout(t); t = setTimeout(checkMobile, 200); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, []);

  // Fix mobile viewport height
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);
    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  // Scroll snap (desktop only)
  useEffect(() => {
    const el = document.querySelector(".scrollable-content") as HTMLElement | null;
    if (!el) return;
    if (isMobile) {
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
    } else {
      el.style.scrollSnapType = "y proximity";
      el.style.scrollPaddingTop = "80px";
      el.style.scrollBehavior = "smooth";
    }
    return () => {
      el.style.scrollSnapType = "";
      el.style.scrollPaddingTop = "";
      el.style.scrollBehavior = "";
    };
  }, [isMobile]);

  const handleTypewriterComplete = useCallback(() => setTypewriterComplete(true), []);

  // Scroll handler (RAF-optimised)
  const handleScroll = useCallback(() => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const el = document.querySelector(".scrollable-content");
      if (!el) return;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 300);

      const sections = ["hook", "services", "proof", "process", "stats", "beliefs", "details", "now", "contact"];
      let current = "";
      for (const id of sections) {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= el.clientHeight / 2 && rect.bottom >= el.clientHeight / 2) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);

      // Typewriter scroll progress
      if (typewriterRef.current) {
        const tr = typewriterRef.current.getBoundingClientRect();
        const vh = el.clientHeight;
        const center = tr.top + tr.height / 2;
        const dist = center - vh / 2;
        let sp = 0;
        if (dist <= 50) sp = 1;
        else if (dist <= 500) sp = (500 - dist) / 450;
        setTypewriterScrollProgress(Math.max(0, Math.min(1, sp)));

        let fade = 1;
        if (tr.top > vh) fade = 0;
        else if (tr.bottom < 0) fade = 0;
        else if (tr.top > vh - 100) fade = (vh - tr.top) / 100;
        else if (tr.top < 40 && tr.top > 0) fade = tr.top / 40;
        setTypewriterOpacity(Math.max(0, Math.min(1, fade)));
      }

      lastScrollTop.current = scrollTop;
    });
  }, []);

  useEffect(() => {
    const el = document.querySelector(".scrollable-content");
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  // Spotlight cycling
  useEffect(() => {
    if (isAnythingHovered) return;
    const interval = setInterval(() => setSpotlightIndex((i) => (i + 1) % 6), 5000);
    return () => clearInterval(interval);
  }, [isAnythingHovered]);

  // Connecting line positions
  useEffect(() => {
    if (typeof window === "undefined") return;
    const compute = () => {
      const section = statsSectionRef.current;
      if (!section) return;
      const sr = section.getBoundingClientRect();
      const pairs: [number, number][] = [[0, 2], [1, 4]];
      const lines = pairs
        .map(([a, b]) => {
          const rA = cardRefs.current[a]?.getBoundingClientRect();
          const rB = cardRefs.current[b]?.getBoundingClientRect();
          if (!rA || !rB) return null;
          return {
            x1: rA.left + rA.width / 2 - sr.left,
            y1: rA.top + rA.height / 2 - sr.top,
            x2: rB.left + rB.width / 2 - sr.left,
            y2: rB.top + rB.height / 2 - sr.top,
          };
        })
        .filter((l): l is { x1: number; y1: number; x2: number; y2: number } => l !== null);
      setLineCoords(lines);
    };
    const t = setTimeout(compute, 600);
    window.addEventListener("resize", compute);
    return () => { clearTimeout(t); window.removeEventListener("resize", compute); };
  }, []);

  const scrollToTop = () => {
    document.querySelector(".scrollable-content")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[16px] text-white/70"
          style={{ fontFamily: "var(--font-body)" }}
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  return (
    <main
      className="relative w-full h-full bg-black overflow-hidden"
      role="main"
      aria-label="About HandToMouse"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Load progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--accent)] origin-left z-[9999]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: data ? 1 : 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ boxShadow: "0 0 8px rgba(255,157,35,0.6)" }}
      />

      {/* Scroll Progress Gradient */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,157,35,${scrollProgress * 0.0005}) 0%, transparent 70%)`,
          opacity: Math.min(scrollProgress / 100, 0.5),
        }}
      />

      {/* Skip links */}
      <div className="sr-only focus-within:not-sr-only">
        <a
          href="#services"
          className="fixed top-4 left-4 z-[100] bg-[var(--accent)] text-black px-4 py-2 text-[12px] font-bold uppercase tracking-wide focus:outline-none"
        >
          Skip to Services
        </a>
        <a
          href="#contact"
          className="fixed top-4 left-[160px] z-[100] bg-[var(--accent)] text-black px-4 py-2 text-[12px] font-bold uppercase tracking-wide focus:outline-none"
        >
          Skip to Contact
        </a>
      </div>

      {/* ARIA live region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {activeSection && `Currently viewing ${activeSection} section`}
      </div>

      {/* Section nav dots */}
      <nav
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-2"
        aria-label="Section navigation"
      >
        {[
          { id: "hook", label: "Intro" },
          { id: "services", label: "Services" },
          { id: "proof", label: "Proof" },
          { id: "process", label: "Process" },
          { id: "stats", label: "Stats" },
          { id: "details", label: "Details" },
          { id: "now", label: "Now" },
          { id: "contact", label: "Contact" },
        ].map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
              triggerHaptic(10);
            }}
            className="group relative flex items-center"
            aria-label={`Go to ${s.label} section`}
          >
            <span className="absolute right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] text-[var(--accent)] uppercase tracking-wider whitespace-nowrap bg-black/80 px-2 py-0.5 border border-[var(--accent)]/30">
              {s.label}
            </span>
            <div
              className={`w-1.5 h-1.5 rounded-full border transition-all duration-300 ${
                activeSection === s.id
                  ? "bg-[var(--accent)] border-[var(--accent)] shadow-[0_0_6px_rgba(255,157,35,0.8)]"
                  : "bg-transparent border-[var(--accent)]/40 group-hover:border-[var(--accent)]"
              }`}
            />
          </a>
        ))}
      </nav>

      {/* Back to top */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => { triggerHaptic(15); scrollToTop(); }}
          className="fixed bottom-6 right-6 z-50 border border-[var(--accent)] bg-[var(--accent)] p-3 hover:bg-[var(--accent-hover)] transition-all duration-300 touch-manipulation"
          aria-label="Scroll to top"
        >
          <span className="text-black text-[16px]">↑</span>
        </motion.button>
      )}

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="w-full">

        {/* ZONE 1 — Hook (always visible, above the fold) */}
        <HookStrip data={data} />

        <DotDivider />

        {/* ZONE 2 — What We Do */}
        <WhatWeDo data={data} />

        <DotDivider />

        {/* ZONE 3 — Proof */}
        <ProofSection data={data} onOpenWork={onOpenWork} />

        <DotDivider />

        {/* ZONE 4 — Process */}
        <ProcessSection data={data} />

        {/* Typewriter interlude */}
        <TypewriterSection
          typewriterRef={typewriterRef as React.RefObject<HTMLDivElement>}
          typewriterScrollProgress={typewriterScrollProgress}
          typewriterOpacity={typewriterOpacity}
          onTypewriterComplete={handleTypewriterComplete}
        />

        {/* Stats grid — untouched logic */}
        <StatsSection
          data={data}
          mouseX={mouseX}
          mouseY={mouseY}
          springX={springX}
          springY={springY}
          statsSectionRef={statsSectionRef}
          cardRefs={cardRefs}
          lineCoords={lineCoords}
          hoveredCardIndex={hoveredCardIndex}
          setHoveredCardIndex={setHoveredCardIndex}
          isAnythingHovered={isAnythingHovered}
          setIsAnythingHovered={setIsAnythingHovered}
          spotlightIndex={spotlightIndex}
        />

        {/* Beliefs compact */}
        <BeliefsGrid data={data} />

        {/* Details (collapsibles) */}
        <DetailsSection
          data={data}
          openSection={openSection}
          setOpenSection={setOpenSection}
        />

        {/* Now block */}
        <NowBlock data={data} />

        {/* ZONE 5 — Contact signal */}
        <ContactSignal data={data} />

      </div>
    </main>
  );
}
