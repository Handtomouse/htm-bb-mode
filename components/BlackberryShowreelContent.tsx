"use client";

// ─── SHOWREEL CONFIG ─────────────────────────────────────────────────────────
// Paste your Vimeo or YouTube URL here when the reel is ready.
// Leave empty to show the HTM branding animation placeholder.
const SHOWREEL_URL = ""
// ─────────────────────────────────────────────────────────────────────────────

import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

// ─── URL PARSING ─────────────────────────────────────────────────────────────

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Vimeo: vimeo.com/[id]
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`;
  }

  // YouTube: youtube.com/watch?v=[id] or youtu.be/[id]
  const ytWatchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatchMatch) {
    return `https://www.youtube.com/embed/${ytWatchMatch[1]}`;
  }
  const ytShortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (ytShortMatch) {
    return `https://www.youtube.com/embed/${ytShortMatch[1]}`;
  }

  return null;
}

// ─── HTM LETTER ANIMATION ────────────────────────────────────────────────────

const LETTER_DURATION = 0.45;
const LETTER_HOLD = 1.5;
const FADE_OUT = 0.4;
const GAP_PAUSE = 0.8;
const CYCLE =
  LETTER_DURATION + 0.3 /* spread */ + LETTER_HOLD + FADE_OUT + GAP_PAUSE;

const letterVariants = (delayIn: number) => ({
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: [0, 1, 1, 0, 0],
    y: [8, 0, 0, 0, 8],
    transition: {
      duration: CYCLE,
      delay: delayIn,
      times: [
        0,
        LETTER_DURATION / CYCLE,
        (LETTER_DURATION + LETTER_HOLD) / CYCLE,
        (LETTER_DURATION + LETTER_HOLD + FADE_OUT) / CYCLE,
        1,
      ],
      repeat: Infinity,
      ease: "easeOut",
    },
  },
});

const subtitleVariants = {
  hidden: { opacity: 0, letterSpacing: "0.15em" },
  visible: {
    opacity: [0, 0.7, 0.7, 0, 0],
    letterSpacing: ["0.15em", "0.4em", "0.4em", "0.15em", "0.15em"],
    transition: {
      duration: CYCLE,
      delay: 0.5,
      times: [0, 0.25, 0.7, 0.88, 1],
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const glowVariants = {
  animate: {
    scale: [0.8, 1.3, 0.8],
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

function HTMBrandingAnimation() {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#0b0b0b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow behind letters */}
      <motion.div
        variants={glowVariants}
        animate="animate"
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,157,35,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Centered content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* H T M letters */}
        <div
          style={{
            display: "flex",
            gap: "0.05em",
            alignItems: "baseline",
          }}
        >
          {(["H", "T", "M"] as const).map((letter, i) => (
            <motion.span
              key={letter}
              initial="hidden"
              animate={controls}
              variants={letterVariants(i * 0.15)}
              style={{
                fontFamily: "'argent-pixel-cf', 'VT323', monospace",
                fontSize: "clamp(60px, 12vw, 100px)",
                color: "#ff9d23",
                display: "inline-block",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* SHOWREEL subtitle */}
        <motion.span
          initial="hidden"
          animate={controls}
          variants={subtitleVariants}
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: "11px",
            color: "#9A9A9A",
            textTransform: "uppercase" as const,
            display: "block",
          }}
        >
          SHOWREEL
        </motion.span>
      </div>

      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 4px)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}

// ─── PLAYER UI CHROME ─────────────────────────────────────────────────────────

function FullscreenIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block" }}
    >
      <path
        d="M1 5V1H5M9 1H13V5M13 9V13H9M5 13H1V9"
        stroke="#9A9A9A"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayerChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #2A2A2A",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}
    >
      {/* Video / animation area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background: "#0b0b0b",
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Controls bar */}
      <div
        style={{
          background: "#0a0a0a",
          borderTop: "1px solid #2A2A2A",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Play button */}
        <span
          style={{
            color: "#ff9d23",
            fontSize: "16px",
            lineHeight: 1,
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          ▶
        </span>

        {/* Progress bar */}
        <div
          style={{
            flex: 1,
            height: "3px",
            background: "#1a1a1a",
            position: "relative",
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#ff9d23",
            }}
          />
        </div>

        {/* Time */}
        <span
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: "13px",
            color: "#9A9A9A",
            flexShrink: 0,
            letterSpacing: "0.05em",
          }}
        >
          00:00 / --:--
        </span>

        {/* Volume */}
        <span
          style={{
            color: "#9A9A9A",
            fontSize: "14px",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          🔊
        </span>

        {/* Fullscreen */}
        <span style={{ flexShrink: 0, lineHeight: 0 }}>
          <FullscreenIcon />
        </span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function BlackberryShowreelContent() {
  const embedUrl = getEmbedUrl(SHOWREEL_URL);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* Section header */}
      <div
        style={{
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            color: "#ff9d23",
            fontSize: "10px",
            lineHeight: 1,
          }}
        >
          ●
        </span>
        <span
          style={{
            fontFamily: "'argent-pixel-cf', monospace",
            fontSize: "11px",
            letterSpacing: "0.25em",
            color: "#EDECEC",
            textTransform: "uppercase" as const,
          }}
        >
          SHOWREEL
        </span>
      </div>

      {/* Player */}
      <PlayerChrome>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="HandToMouse Studio Showreel"
          />
        ) : (
          <HTMBrandingAnimation />
        )}
      </PlayerChrome>

      {/* Credits block */}
      <div style={{ marginTop: "20px" }}>
        <p
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: "10px",
            color: "#9A9A9A",
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          HANDTOMOUSE STUDIO
          <br />
          Direction · Creative · Production
          <br />© 2025
        </p>

        {/* Status note */}
        <p
          style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: "9px",
            color: "#4A4A4A",
            marginTop: "8px",
            marginBottom: 0,
          }}
        >
          Showreel in production — available 2025
        </p>
      </div>
    </motion.div>
  );
}
