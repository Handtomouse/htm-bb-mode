"use client";

import { useState } from "react";

interface SignatureFooterProps {
  name: string;
  location: string;
  email: string;
  phone?: string;
  className?: string;
}

export default function SignatureFooter({
  name,
  location,
  email,
  phone,
  className = "",
}: SignatureFooterProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer
      className={`border-t border-[#E0E0E0] bg-transparent px-6 py-4 ${className}`}
      style={{ fontFamily: "VT323, monospace", imageRendering: "pixelated" }}
    >
      <div className="max-w-[60ch] mx-auto">
        {/* Single Line: Location | Name | Email */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[14px] md:text-[16px] text-[#E0E0E0]">
          {/* Location */}
          <span className="text-[#E0E0E0]/70">{location}</span>

          {/* Divider */}
          <span className="text-[#E0E0E0]/40">|</span>

          {/* HTM Logo Icon (Optional) */}
          <div className="flex items-center gap-2">
            <img
              src="/logos/HTM-LOGO-ICON-01.svg"
              alt="HTM"
              className="h-5 w-5 opacity-70"
              style={{ imageRendering: "pixelated" }}
            />
            <span className="font-bold text-[#E0E0E0]">{name}</span>
          </div>

          {/* Divider */}
          <span className="text-[#E0E0E0]/40">|</span>

          {/* Email (Clickable + Copy) */}
          <button
            onClick={() => copyToClipboard(email)}
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] px-2 py-1 relative"
            aria-label="Copy email to clipboard"
          >
            {email}
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-black text-[12px] px-3 py-1 whitespace-nowrap">
                COPIED!
              </span>
            )}
          </button>

          {/* Phone (Optional) */}
          {phone && (
            <>
              <span className="text-[#E0E0E0]/40">|</span>
              <button
                onClick={() => copyToClipboard(phone)}
                className="text-[#E0E0E0] hover:text-[var(--accent)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] px-2 py-1"
                aria-label="Copy phone to clipboard"
              >
                {phone}
              </button>
            </>
          )}
        </div>

        {/* Secondary Line: Availability/Status (Optional) */}
        <div className="text-center mt-3 text-[12px] md:text-[14px] text-[#E0E0E0]/50">
          <span>Sydney • AET (GMT+11) • Reply within 24h</span>
        </div>
      </div>
    </footer>
  );
}
