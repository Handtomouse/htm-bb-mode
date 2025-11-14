"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function StatusIndicator() {
  const [status, setStatus] = useState<"online" | "away" | "offline">("online");

  useEffect(() => {
    const checkStatus = () => {
      const sydneyHour = new Date().toLocaleTimeString("en-AU", {
        timeZone: "Australia/Sydney",
        hour: "2-digit",
        hour12: false,
      });
      const hour = parseInt(sydneyHour);

      if (hour >= 9 && hour < 18) {
        setStatus("online");
      } else if (hour >= 18 && hour < 22) {
        setStatus("away");
      } else {
        setStatus("offline");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    online: { color: "#00FF00", text: "Available now" },
    away: { color: "var(--accent)", text: "After hours" },
    offline: { color: "#FF0000", text: "Offline (9am-6pm AET)" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <span className="text-[12px] md:text-[14px] text-[#E0E0E0]/70">
        {config.text}
      </span>
    </div>
  );
}
