"use client";

import React, { useState, useEffect } from "react";

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Time in HH:MM format
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);

      // Date in "Thu 30 Oct 2025" format
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dayName = dayNames[now.getDay()];
      const day = now.getDate();
      const monthName = monthNames[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDate(`${dayName} ${day} ${monthName} ${year}`);
    };

    // Update immediately
    updateDateTime();

    // Update every 30 seconds
    const interval = setInterval(updateDateTime, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-6 bg-[#0d0d0d] text-gray-400 text-xs flex justify-between items-center px-3 border-b border-[#1f1f1f] z-50 shadow-inner">
      {/* CRT shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff9d23] to-transparent opacity-30 animate-pulse"></div>

      {/* Left: Status */}
      <div className="flex items-center gap-2 font-mono">
        <span className="text-[#ff9d23] font-semibold">HTM</span>
        <span className="text-gray-600">•</span>
        <span>Wi-Fi</span>
      </div>

      {/* Center: Time */}
      <div className="font-mono text-white font-semibold tracking-wider">
        {currentTime || "00:00"}
      </div>

      {/* Right: Date & Notifications */}
      <div className="flex items-center gap-3 font-mono">
        <span>{currentDate}</span>
        <span className="text-gray-600">•</span>
        <span className="text-gray-500 italic">No notifications</span>
      </div>
    </div>
  );
}
