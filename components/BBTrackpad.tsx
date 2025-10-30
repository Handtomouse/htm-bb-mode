"use client";

import React, { useRef, useEffect, useState } from "react";

export default function BBTrackpad({ size = 180, disabled = false }: { size?: number; disabled?: boolean }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!surfaceRef.current || !reflectionRef.current || disabled) return;
      const rect = surfaceRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;
      reflectionRef.current.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.15) 0%, transparent 70%)`;
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [disabled]);

  const radius = size * (26 / 180); // Scale radius proportionally

  return (
    <div
      className="trackpad-shell transition-all duration-300"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: disabled
          ? "linear-gradient(145deg, #1a1a1a, #0c0c0c)"
          : "linear-gradient(145deg, #2b2b2b, #0c0c0c)",
        padding: size * (8 / 180),
        display: "grid",
        placeItems: "center",
        transform: isHovered && !disabled ? "scale(1.03)" : "scale(1)",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      <div
        ref={surfaceRef}
        className="trackpad-surface transition-all duration-100"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius - 5,
          background: disabled
            ? "radial-gradient(circle at 50% 45%, #1a1a1a 0%, #0a0a0a 90%)"
            : "radial-gradient(circle at 50% 45%, #2b2b2b 0%, #0e0e0e 90%)",
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.8), inset 0 0 4px rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Static top highlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.1) 0%, transparent 60%)",
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />

        {/* Interactive reflection */}
        <div
          ref={reflectionRef}
          className="reflection transition-all duration-200"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "inherit",
            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
