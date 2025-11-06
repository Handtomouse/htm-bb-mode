"use client";

import { useState, useEffect } from "react";

// Destination categories
const DESTINATIONS = {
  interactive: [
    "https://neal.fun/deep-sea/",
    "https://neal.fun/infinite-craft/",
    "https://www.koalastothemax.com",
    "https://weavesilk.com",
    "https://thisissand.com",
  ],
  games: [
    "https://slither.io",
    "https://agar.io",
    "https://typeracer.com",
  ],
  weirdFun: [
    "https://pointerpointer.com",
    "https://www.staggeringbeauty.com",
    "https://findtheinvisiblecow.com",
  ],
  music: [
    "https://radiooooo.com",
    "https://everynoise.com",
    "https://musicmap.info",
  ],
  educational: [
    "https://artsandculture.google.com/project/gigapixels",
    "https://experiments.withgoogle.com",
    "https://ncase.me/polygons",
  ],
  retro: [
    "https://www.spacejam.com/1996",
    "https://www.cameronsworld.net",
    "https://wiby.me/surprise",
  ],
};

const DESTINATION_HINTS: Record<string, string[]> = {
  interactive: ["Interactive", "Dynamic", "Immersive"],
  games: ["Strategic", "Competitive", "Challenge"],
  weirdFun: ["Peculiar", "Unconventional", "Strange"],
  music: ["Sonic", "Melodic", "Harmonic"],
  educational: ["Informative", "Enlightening", "Curious"],
  retro: ["Nostalgic", "Classic", "Time-Warp"],
};

interface Star {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  layer: number;
}

export default function BlackberryWormholeContent() {
  const [stars, setStars] = useState<Star[]>([]);
  const [isWarping, setIsWarping] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState<'interactive' | 'games' | 'weirdFun' | 'music' | 'educational' | 'retro' | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize stars and loading
  useEffect(() => {
    const initialStars: Star[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 2000,
      speed: 2,
      layer: Math.random() < 0.5 ? 0 : 1,
    }));
    setStars(initialStars);
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  // Animate stars
  useEffect(() => {
    const interval = setInterval(() => {
      setStars((prevStars) =>
        prevStars.map((star) => {
          const baseSpeed = isWarping ? 50 : 2;
          let newZ = star.z - baseSpeed;
          if (newZ < 1) {
            newZ = 2000;
          }
          return { ...star, z: newZ };
        })
      );
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, [isWarping]);

  // Countdown
  useEffect(() => {
    if (!isWarping) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Navigate after countdown
      const destination = getRandomDestination();
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = destination.url;
        }
      }, 500);
    }
  }, [isWarping, countdown]);

  const getRandomDestination = () => {
    const categoryKeys = selectedCategory === 'all'
      ? Object.keys(DESTINATIONS) as Array<keyof typeof DESTINATIONS>
      : [selectedCategory];

    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const urls = DESTINATIONS[randomCategory];
    const randomUrl = urls[Math.floor(Math.random() * urls.length)];
    const hints = DESTINATION_HINTS[randomCategory];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];

    return { url: randomUrl, category: randomCategory, hint: randomHint };
  };

  const handleWarpButtonClick = () => {
    setIsWarping(true);
    setCountdown(3);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isWarping) {
        e.preventDefault();
        handleWarpButtonClick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isWarping, isLoading]);

  return (
    <div className="relative h-full bg-black overflow-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-[100]">
          <div className="text-center">
            <div className="text-7xl mb-8" style={{
              color: "#D4AF37",
              textShadow: "0 0 40px rgba(212, 175, 55, 0.6)",
              animation: "pulse 2s ease-in-out infinite"
            }}>
              ✦
            </div>
            <p className="text-white/80 text-xl mb-3">Calibrating wormhole...</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Nebula background */}
      <div className="absolute inset-0 opacity-20" style={{
        background: `radial-gradient(ellipse at 50% 50%, rgba(212, 175, 55, 0.15), transparent 50%)`
      }} />

      {/* Starfield */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.map((star) => {
          const scale = 2000 / (star.z + 1);
          const x = star.x * scale + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
          const y = star.y * scale + (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);
          const size = (1 - star.z / 2000) * 3;
          const opacity = Math.max(0.1, 1 - star.z / 2000);

          return (
            <circle
              key={star.id}
              cx={x}
              cy={y}
              r={size}
              fill="#D4AF37"
              opacity={opacity}
            />
          );
        })}
      </svg>

      {/* CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
      }} />

      {/* Countdown */}
      {isWarping && countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="text-[20rem] font-bold text-[#D4AF37]" style={{
            textShadow: "0 0 60px rgba(212, 175, 55, 0.8), 0 0 120px rgba(212, 175, 55, 0.5)",
            animation: countdown === 0 ? "countdown-zero 1s ease-out" : "countdown-bounce 0.8s ease-out"
          }}>
            {countdown}
          </div>
        </div>
      )}

      {/* Controls */}
      {!isWarping && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {/* Category Selector */}
          <div className="flex flex-wrap gap-2 mb-8 max-w-2xl justify-center">
            {(['all', 'interactive', 'games', 'weirdFun', 'music', 'educational', 'retro'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded border transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : 'bg-black/50 text-white/80 border-white/30 hover:border-[#D4AF37]'
                }`}
                style={{
                  fontFamily: "var(--font-mono)",
                  textTransform: "capitalize"
                }}
              >
                {cat === 'weirdFun' ? 'Weird & Fun' : cat}
              </button>
            ))}
          </div>

          {/* Warp Button */}
          <button
            onClick={handleWarpButtonClick}
            className="px-8 py-4 text-2xl font-bold rounded-lg border-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #D4AF37 0%, #F4A259 100%)",
              color: "#000",
              borderColor: "#D4AF37",
              boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)",
              fontFamily: "var(--font-heading)"
            }}
          >
            ✦ INITIATE WARP SEQUENCE
          </button>

          <p className="mt-4 text-white/60 text-sm">Press SPACE to warp</p>
        </div>
      )}

      <style jsx>{`
        @keyframes countdown-bounce {
          0% { transform: scale(2); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes countdown-zero {
          0% { transform: scale(3); opacity: 0; }
          50% { transform: scale(1.3) rotate(5deg); }
          70% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
