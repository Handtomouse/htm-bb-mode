"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const ACCENT = "var(--accent)";

interface LuxuryServiceCardProps {
  service: {
    icon: string;
    title: string;
    line: string;
    example: string;
  };
  delay: number;
}

export default function LuxuryServiceCard({ service, delay }: LuxuryServiceCardProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const strength = 0.1;
    setOffset({ x: deltaX * strength, y: deltaY * strength });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3, margin: "-100px" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      whileHover={{ scale: 1.03, borderColor: ACCENT }}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`
      }}
      className="border-2 border-[var(--accent)]/30 bg-gradient-to-br from-black/40 to-black/20 p-8 md:p-12 space-y-6 transition-all duration-700 hover:shadow-[0_0_40px_rgba(255,157,35,0.5)] cursor-default"
    >
      <div className="flex items-center gap-4">
        <span className="text-[32px] md:text-[40px]">{service.icon}</span>
        <h3 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold text-white tracking-wide" style={{ fontFamily: '"argent-pixel-cf", sans-serif' }}>{service.title}</h3>
      </div>
      <p className="text-[18px] md:text-[22px] text-white/90 leading-relaxed">{service.line}</p>
      <p className="text-[16px] md:text-[18px] text-white/60 leading-relaxed">{service.example}</p>
    </motion.div>
  );
}
