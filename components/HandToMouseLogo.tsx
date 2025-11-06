"use client";

import React from "react";

interface HandToMouseLogoProps {
  showIcon?: boolean;
  className?: string;
}

/**
 * HandToMouse Brand Header Component
 *
 * Responsive wordmark logo for BB-OS5 homescreen
 * - Desktop: 55-60% viewport width
 * - Mobile: 70-75% viewport width
 * - Maintains aspect ratio
 * - Optional icon above (⅓ wordmark height)
 * - 24px minimum margins
 * - #E0E0E0 fill color, 100% opacity
 */
export default function HandToMouseLogo({ showIcon = true, className = "" }: HandToMouseLogoProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 md:gap-4 ${className}`}
      style={{
        padding: "24px",
        minHeight: "120px",
      }}
    >
      {/* Optional HTM Icon - ⅓ of wordmark height */}
      {showIcon && (
        <div className="w-[25%] md:w-[20%] max-w-[80px]">
          <img
            src="/logos/HTM-LOGO-ICON-01.svg"
            alt="HTM Icon"
            className="w-full h-auto opacity-90"
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8))',
            }}
          />
        </div>
      )}

      {/* Full Wordmark - Responsive Sizing */}
      <div className="w-[75%] md:w-[58%] max-w-[480px]">
        <img
          src="/logos/HTM-LOGOS-FULLWORDMARK.svg"
          alt="HandToMouse"
          className="w-full h-auto"
          style={{
            opacity: 1,
            filter: 'brightness(0.88) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.8))',
            imageRendering: 'crisp-edges',
          }}
        />
      </div>

      {/* Responsive Sizing Guide */}
      <style jsx>{`
        /* Mobile: 70-75% viewport width */
        @media (max-width: 767px) {
          div:first-child {
            --wordmark-width: 75%;
            --icon-width: 25%;
          }
        }

        /* Tablet: 65% viewport width */
        @media (min-width: 768px) and (max-width: 1023px) {
          div:first-child {
            --wordmark-width: 65%;
            --icon-width: 22%;
          }
        }

        /* Desktop: 55-60% viewport width */
        @media (min-width: 1024px) {
          div:first-child {
            --wordmark-width: 58%;
            --icon-width: 20%;
          }
        }

        /* Large Desktop: Cap at max-width */
        @media (min-width: 1440px) {
          div:first-child {
            --wordmark-width: 55%;
            --icon-width: 18%;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Compact Logo Variant (for constrained spaces)
 * Wordmark only, smaller sizing
 */
export function HandToMouseLogoCompact({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <img
        src="/logos/HTM-LOGOS-FULLWORDMARK.svg"
        alt="HandToMouse"
        className="h-6 w-auto md:h-8"
        style={{
          opacity: 1,
          filter: 'brightness(0.88) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))',
        }}
      />
    </div>
  );
}
