"use client";

import React, { useState, useEffect } from "react";

// WiFi Icon Component - Doubled Size
function WiFiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="opacity-80">
      <path
        d="M1 7c4-4 10-4 14 0M3.5 9.5c3-3 6-3 9 0M6 12c1.5-1.5 3-1.5 4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function TopBar({ notificationCount = 0 }: { notificationCount?: number }) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateDateTime = () => {
      const now = new Date();

      // Time in HH:MM format
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);

      // Date in "Thu 30 Oct" format (no year)
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dayName = dayNames[now.getDay()];
      const day = now.getDate();
      const monthName = monthNames[now.getMonth()];
      setCurrentDate(`${dayName} ${day} ${monthName}`);
    };

    // Update immediately
    updateDateTime();

    // Calculate milliseconds until next minute
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Set timeout to sync with minute change
    const initialTimeout = setTimeout(() => {
      updateDateTime();
      // Then update every 60 seconds
      const interval = setInterval(updateDateTime, 60000);
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-10 bg-[#000000] text-[#E0E0E0] text-[20px] flex justify-between items-center px-8 border-b border-white/10 z-40 leading-none" style={{ fontFamily: 'VT323, monospace' }}>
      {/* CRT shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FF9D23] to-transparent opacity-20"
        style={{
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />

      {/* Left: Wordmark + WiFi */}
      <div className="flex items-center gap-3 text-[#E0E0E0]/70">
        <img
          src="/logos/HTM-LOGOS-FULLWORDMARK.svg"
          alt="HandToMouse"
          className="h-5 w-auto max-w-[120px] sm:max-w-[140px]"
          style={{
            objectFit: "contain",
            imageRendering: 'pixelated',
            opacity: 0.88,
          }}
        />
        <span className="text-[#E0E0E0]/40">•</span>
        <WiFiIcon />
      </div>

      {/* Center: Time */}
      {mounted ? (
        <div className="text-[#E0E0E0] text-[22px] font-medium tracking-wide tabular-nums transition-all duration-300 ease-in-out" style={{ fontFamily: 'VT323, monospace' }}>
          {currentTime}
        </div>
      ) : (
        <div className="text-[#E0E0E0]/40 text-[22px] font-medium tracking-wide tabular-nums" style={{ fontFamily: 'VT323, monospace' }}>
          00:00
        </div>
      )}

      {/* Right: Date + Notifications */}
      <div className="flex items-center gap-3 text-[#E0E0E0]/60">
        {mounted ? (
          <span>{currentDate}</span>
        ) : (
          <span className="text-[#E0E0E0]/40">Loading...</span>
        )}
        {notificationCount > 0 && (
          <>
            <span className="text-[#E0E0E0]/40">•</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF9D23] animate-pulse" />
              <span className="text-[#FF9D23] font-medium">{notificationCount}</span>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
