"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

const clients = [
  { name: "S'WICH", year: "2022-present", tag: "Hospitality" },
  { name: "MapleMoon", year: "2022-present", tag: "Retail" },
  { name: "Jac+Jack", year: "2024", tag: "Fashion" },
  { name: "Destination NSW", year: "2023", tag: "Government" },
  { name: "Broadsheet", year: "2023", tag: "Media" },
];

export default function ClientTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className="space-y-4">
      {clients.map((client, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          whileHover={{ x: 5, backgroundColor: "rgba(255,157,35,0.05)" }}
          className="flex items-center justify-between border-l-2 border-[#FF9D23]/40 pl-4 py-3 transition-all"
        >
          <div className="flex-1">
            <div className="text-[18px] md:text-[22px] font-bold text-[#E0E0E0]">
              {client.name}
            </div>
            <div className="text-[14px] md:text-[16px] text-[#E0E0E0]/60">
              {client.year}
            </div>
          </div>
          <div className="border border-[#FF9D23]/30 bg-[#FF9D23]/10 px-3 py-1 text-[12px] md:text-[14px] text-[#FF9D23] font-medium uppercase">
            {client.tag}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
