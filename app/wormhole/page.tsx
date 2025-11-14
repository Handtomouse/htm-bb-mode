"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Destination categories - all verified and fast-loading
const DESTINATIONS = {
  interactive: [
    "https://neal.fun/deep-sea/",
    "https://neal.fun/infinite-craft/",
    "https://www.koalastothemax.com",
    "https://weavesilk.com",
    "https://thisissand.com",
    "https://www.windows93.net",
    "https://zoomquilt.org",
    "https://lab.hakim.se",
    "https://oimo.io/works",
    "https://stars.chromeexperiments.com",
  ],
  games: [
    "https://slither.io",
    "https://agar.io",
    "https://typeracer.com",
    "https://geoguessr.com/free",
    "https://globle-game.com",
    "https://worldle.teuteuf.fr",
    "https://semantle.com",
    "https://travle.earth",
  ],
  weirdFun: [
    "https://pointerpointer.com",
    "https://www.staggeringbeauty.com",
    "https://findtheinvisiblecow.com",
    "https://heeeeeeeey.com",
    "https://cant-not-tweet-this.com",
    "https://thezen.zone",
    "https://www.omfgdogs.com",
    "https://cat-bounce.com",
    "https://corndogoncorndog.com",
    "https://ducksarethebest.com",
    "https://checkboxrace.com",
    "https://eelslap.com",
  ],
  music: [
    "https://radiooooo.com",
    "https://everynoise.com",
    "https://musicmap.info",
    "https://www.incredibox.com",
    "https://patatap.com",
    "https://typatone.com",
    "https://www.music-map.com",
    "https://pudding.cool/2018/05/similarity/",
  ],
  educational: [
    "https://artsandculture.google.com/project/gigapixels",
    "https://experiments.withgoogle.com",
    "https://www.opte.org/the-internet",
    "https://ncase.me/polygons",
    "https://ncase.me/trust",
    "https://worldometers.info",
    "https://www.ventusky.com",
    "https://earth.nullschool.net",
    "https://neal.fun/space-elevator/",
    "https://neal.fun/universe-forecast/",
  ],
  retro: [
    "https://www.spacejam.com/1996",
    "https://www.cameronsworld.net",
    "https://wiby.me/surprise",
    "https://theoldnet.com",
    "https://www.poolsuite.net",
    "https://www.donothingfor2minutes.com",
  ],
};

// Easter eggs (1% chance)
const EASTER_EGGS = [
  "https://www.zombo.com",
  "https://www.therevolvinginternet.com",
  "https://archive.org/details/msdos_Oregon_Trail_The_1990",
  "https://orteil.dashnet.org/nested",
];

// Countdown messages
const COUNTDOWN_MESSAGES = [
  "Preparing your journey",
  "Opening the gateway",
  "Bending spacetime",
  "Charting your course",
  "Gathering momentum",
  "Initiating transfer",
  "Transcending boundaries",
];

// Destination hints
const DESTINATION_HINTS: Record<string, string[]> = {
  interactive: ["Interactive", "Dynamic", "Immersive", "Whimsical", "Generative"],
  games: ["Strategic", "Competitive", "Reflex-Based", "Puzzle", "Challenge"],
  weirdFun: ["Peculiar", "Unconventional", "Chaotic", "Strange", "Wonderfully Odd"],
  music: ["Sonic", "Melodic", "Harmonic", "Rhythmic", "Auditory"],
  educational: ["Enlightening", "Infinite", "Visual", "Cosmic", "Scientific"],
  retro: ["Nostalgic", "Vintage", "Classic", "Timeless", "Heritage"],
};

interface Star {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  colorPhase: number;
  layer: number; // 0 = background (slow), 1 = mid (normal), 2 = foreground (fast)
}

interface Shimmer {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export default function WormholePage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [shimmers, setShimmers] = useState<Shimmer[]>([]);
  const [isWarping, setIsWarping] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(true);
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [hasSeenWarning, setHasSeenWarning] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [journeyCount, setJourneyCount] = useState(0);
  const [currentHint, setCurrentHint] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [canAbort, setCanAbort] = useState(false);
  const [colorShift, setColorShift] = useState(0);
  const [showAbortFeedback, setShowAbortFeedback] = useState(false);
  const [journeyHistory, setJourneyHistory] = useState<Array<{url: string, hint: string, timestamp: number}>>([]);
  const [boost, setBoost] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakBadge, setShowStreakBadge] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [ludicrousSpeed, setLudicrousSpeed] = useState(false);
  const [showLudicrousMessage, setShowLudicrousMessage] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [currentDestination, setCurrentDestination] = useState<{url: string, category: string, hint: string} | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [enabledCategories, setEnabledCategories] = useState<Record<string, boolean>>({
    interactive: true,
    games: true,
    weirdFun: true,
    music: true,
    educational: true,
    retro: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);
  const [konamiActive, setKonamiActive] = useState(false);
  const [starDensity, setStarDensity] = useState(150);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);
  const [mouseTrail, setMouseTrail] = useState<{x: number, y: number, id: number, timestamp: number}[]>([]);
  const [isHyperhyperspace, setIsHyperhyperspace] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'interactive' | 'games' | 'weirdFun' | 'music' | 'educational' | 'retro' | 'all'>('all');
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Particle burst state (#12)
  const [burstParticles, setBurstParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
  }>>([]);

  // Sound effects using Web Audio API
  const playSound = (type: 'whoosh' | 'beep' | 'warp' | 'abort') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case 'whoosh':
        // Quick whoosh for boost
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'beep':
        // UI beep for button clicks
        oscillator.type = 'square';
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;

      case 'warp':
        // Deep warp sound for hyperjump
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 1.5);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1.5);
        break;

      case 'abort':
        // Alert sound for abort
        oscillator.type = 'triangle';
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
    }
  };

  // Toggle sound and save preference
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("wormhole_sound", newValue.toString());
    if (newValue) {
      playSound('beep');
    }
  };

  // Load journey data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wormhole_journeys");
    const history = localStorage.getItem("wormhole_history");
    const savedStreak = localStorage.getItem("wormhole_streak");
    const lastJourney = localStorage.getItem("wormhole_last_journey");
    const savedSound = localStorage.getItem("wormhole_sound");
    const savedCategories = localStorage.getItem("wormhole_categories");

    setJourneyCount(saved ? parseInt(saved) : 0);
    setJourneyHistory(history ? JSON.parse(history) : []);
    setSoundEnabled(savedSound === "true");
    if (savedCategories) {
      setEnabledCategories(JSON.parse(savedCategories));
    }

    // Check if streak is still valid (within 24 hours)
    if (lastJourney) {
      const hoursSinceLastJourney = (Date.now() - parseInt(lastJourney)) / (1000 * 60 * 60);
      if (hoursSinceLastJourney < 24) {
        setStreak(savedStreak ? parseInt(savedStreak) : 0);
      } else {
        // Reset streak if more than 24 hours passed
        localStorage.removeItem("wormhole_streak");
        setStreak(0);
      }
    }
  }, []);

  // Initialize stars, shimmers, and loading
  useEffect(() => {
    const initialStars: Star[] = Array.from({ length: starDensity }, (_, i) => {
      // Distribute stars across 3 layers: 40% background, 40% mid, 20% foreground
      const rand = Math.random();
      const layer = rand < 0.4 ? 0 : (rand < 0.8 ? 1 : 2);

      return {
        id: i,
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000,
        speed: 2,
        colorPhase: Math.random() * Math.PI * 2,
        layer,
      };
    });
    setStars(initialStars);

    // Load immediately for better performance
    setIsLoading(false);

    // Lazy load shimmer particles after initial render for better performance
    setTimeout(() => {
      const initialShimmers: Shimmer[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() * 60 + 30, // Gold to orange range
      }));
      setShimmers(initialShimmers);
    }, 100);
  }, [starDensity]);

  // Animate stars using requestAnimationFrame for better performance
  useEffect(() => {
    let animationFrameId: number;

    // Calculate base speed once per frame (optimized)
    const calculateBaseSpeed = () => {
      if (isHyperhyperspace) return 300;
      if (ludicrousSpeed) return 150;
      if (isWarping) return 50;
      if (konamiActive) return 30;
      if (boost) return 20;
      return 2;
    };

    const animateStars = () => {
      const baseSpeed = calculateBaseSpeed();

      setStars((prevStars) =>
        prevStars.map((star) => {
          // Apply layer-based speed multipliers for parallax effect
          const layerMultipliers = [0.5, 1, 1.5]; // background slow, mid normal, foreground fast
          const currentSpeed = baseSpeed * layerMultipliers[star.layer] * (konamiActive ? 1.5 : 1);

          let newZ = star.z - currentSpeed;
          let newColorPhase = star.colorPhase + (isWarping ? 0.1 : 0.01);

          if (newZ <= 0) {
            return {
              ...star,
              x: (Math.random() - 0.5) * 2000,
              y: (Math.random() - 0.5) * 2000,
              z: 2000,
              speed: currentSpeed,
              colorPhase: newColorPhase,
              layer: star.layer, // Keep the same layer
            };
          }

          return { ...star, z: newZ, speed: currentSpeed, colorPhase: newColorPhase };
        })
      );

      animationFrameId = requestAnimationFrame(animateStars);
    };

    animationFrameId = requestAnimationFrame(animateStars);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isWarping, boost, ludicrousSpeed, konamiActive, isHyperhyperspace]);

  // Animate shimmer particles using requestAnimationFrame for better performance
  useEffect(() => {
    let animationFrameId: number;

    const animateShimmers = () => {
      setShimmers((prevShimmers) =>
        prevShimmers.map((shimmer) => {
          let newX = shimmer.x + shimmer.vx;
          let newY = shimmer.y + shimmer.vy;
          let newVx = shimmer.vx;
          let newVy = shimmer.vy;

          // Bounce off edges and wrap around
          const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
          const height = typeof window !== 'undefined' ? window.innerHeight : 1000;

          if (newX < 0 || newX > width) {
            newX = newX < 0 ? width : 0;
          }
          if (newY < 0 || newY > height) {
            newY = newY < 0 ? height : 0;
          }

          // Subtle random drift (Perlin-like)
          newVx += (Math.random() - 0.5) * 0.05;
          newVy += (Math.random() - 0.5) * 0.05;

          // Clamp velocity
          const maxSpeed = 0.8;
          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (speed > maxSpeed) {
            newVx = (newVx / speed) * maxSpeed;
            newVy = (newVy / speed) * maxSpeed;
          }

          return {
            ...shimmer,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            opacity: Math.sin(Date.now() * 0.001 + shimmer.id) * 0.2 + 0.3,
          };
        })
      );

      animationFrameId = requestAnimationFrame(animateShimmers);
    };

    animationFrameId = requestAnimationFrame(animateShimmers);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Color shift animation - slowed down for performance
  useEffect(() => {
    const interval = setInterval(() => {
      setColorShift((prev) => (prev + 0.01) % (Math.PI * 2));
    }, 100); // Reduced from 50ms to 100ms
    return () => clearInterval(interval);
  }, []);

  // Track mouse movement and device orientation (mobile tilt/gyro)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) * 0.05,
        y: (e.clientY - window.innerHeight / 2) * 0.05,
      });

      // Add to mouse trail if not warping
      if (!isWarping && !showExitWarning) {
        setMouseTrail(prev => {
          const now = Date.now();
          const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: now, timestamp: now }];
          return newTrail.slice(-20); // Keep last 20 particles
        });
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // beta: front-to-back tilt (-180 to 180)
      // gamma: left-to-right tilt (-90 to 90)
      const beta = e.beta || 0;
      const gamma = e.gamma || 0;

      // Map device tilt to parallax position
      setMousePos({
        x: (gamma / 90) * 30, // -30 to 30 based on tilt
        y: (beta / 180) * 30,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isWarping, showExitWarning]);

  // Fade out old mouse trail particles - disabled during countdown for performance
  useEffect(() => {
    if (isWarping) return; // Skip cleanup during countdown

    const interval = setInterval(() => {
      const now = Date.now();
      setMouseTrail(prev => prev.filter(particle => now - particle.timestamp < 1000));
    }, 50);
    return () => clearInterval(interval);
  }, [isWarping]);

  // Screen shake removed - now using pure CSS animation for better performance

  // Click to boost & double-tap for ludicrous speed
  useEffect(() => {
    const handleClick = () => {
      if (!isWarping && !showExitWarning) {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;

        // Double-tap detected (within 300ms)
        if (timeSinceLastClick < 300 && timeSinceLastClick > 0) {
          setLudicrousSpeed(true);
          setShowLudicrousMessage(true);
          playSound('warp');
          setTimeout(() => {
            setLudicrousSpeed(false);
            setShowLudicrousMessage(false);
          }, 3000);
        } else {
          // Single click boost
          setBoost(true);
          playSound('whoosh');
          setTimeout(() => setBoost(false), 2000);
        }

        setLastClickTime(now);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [isWarping, showExitWarning, soundEnabled, lastClickTime]);

  // Konami Code detection
  useEffect(() => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

    const handleKonami = (e: KeyboardEvent) => {
      const newSequence = [...konamiSequence, e.key].slice(-10);
      setKonamiSequence(newSequence);

      if (newSequence.join(',') === konamiCode.join(',')) {
        setKonamiActive(true);
        playSound('warp');
        setTimeout(() => setKonamiActive(false), 10000);
      }
    };

    window.addEventListener('keydown', handleKonami);
    return () => window.removeEventListener('keydown', handleKonami);
  }, [konamiSequence, playSound]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && !isWarping && !showExitWarning) {
        e.preventDefault();
        handleWarpButtonClick();
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (showExitWarning) {
          setShowExitWarning(false);
          setAcceptedRisk(false);
        } else if (isWarping && canAbort) {
          abortWarp();
        }
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setMousePos({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWarping, canAbort, showExitWarning]);

  // Particle burst on speed change (#12)
  useEffect(() => {
    const createBurst = () => {
      const newParticles: Array<{
        id: number;
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        color: string;
      }> = [];
      const particleCount = isHyperhyperspace ? 60 : (ludicrousSpeed ? 40 : 25);
      const baseId = Date.now();

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 3 + Math.random() * 4;
        const color = isHyperhyperspace ? 'rgba(255,255,255,0.9)' :
                      (ludicrousSpeed ? 'rgba(255,157,35,0.9)' :
                      'rgba(100,149,237,0.9)');

        newParticles.push({
          id: baseId + i,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color
        });
      }

      setBurstParticles(prev => [...prev, ...newParticles]);
    };

    if (isWarping || ludicrousSpeed || isHyperhyperspace) {
      createBurst();
    }
  }, [isWarping, ludicrousSpeed, isHyperhyperspace]);

  // Animate burst particles using requestAnimationFrame for better performance
  useEffect(() => {
    if (burstParticles.length === 0) return;

    let animationFrameId: number;

    const animateParticles = () => {
      setBurstParticles(prev => {
        const updated = prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0);

        if (updated.length > 0) {
          animationFrameId = requestAnimationFrame(animateParticles);
        }

        return updated;
      });
    };

    animationFrameId = requestAnimationFrame(animateParticles);
    return () => cancelAnimationFrame(animationFrameId);
  }, [burstParticles.length]);

  // Get random destination (respecting category filters)
  const getRandomDestination = () => {
    const hour = new Date().getHours();
    const isEasterEgg = Math.random() < 0.01;

    if (isEasterEgg) {
      return {
        url: EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)],
        category: "RARE",
        hint: "LEGENDARY",
      };
    }

    // Determine which category to use
    let chosenCategory: string;

    if (selectedCategory !== 'all') {
      // User has selected a specific category
      chosenCategory = selectedCategory;
    } else {
      // Use weighted random selection based on time of day
      // Filter categories based on user preferences
      const enabledCats = Object.keys(enabledCategories).filter(cat => enabledCategories[cat]);

      // If no categories enabled, use all
      if (enabledCats.length === 0) {
        return {
          url: DESTINATIONS.interactive[0],
          category: "interactive",
          hint: "Interactive",
        };
      }

      let categoryWeights: Record<string, number> = {};
      if (hour >= 6 && hour < 12) {
        categoryWeights = { interactive: 0.35, educational: 0.3, music: 0.2, retro: 0.15 };
      } else if (hour >= 22 || hour < 6) {
        categoryWeights = { weirdFun: 0.4, games: 0.3, interactive: 0.2, retro: 0.1 };
      } else {
        categoryWeights = { interactive: 0.3, games: 0.25, weirdFun: 0.2, music: 0.1, educational: 0.1, retro: 0.05 };
      }

      // Filter out disabled categories and normalize
      const filteredWeights: Record<string, number> = {};
      let totalWeight = 0;
      for (const cat of enabledCats) {
        const weight = categoryWeights[cat] || (1 / enabledCats.length);
        filteredWeights[cat] = weight;
        totalWeight += weight;
      }

      // Normalize weights
      for (const cat in filteredWeights) {
        filteredWeights[cat] /= totalWeight;
      }

      const rand = Math.random();
      let cumulative = 0;
      chosenCategory = enabledCats[0];

      for (const [cat, weight] of Object.entries(filteredWeights)) {
        cumulative += weight;
        if (rand <= cumulative) {
          chosenCategory = cat;
          break;
        }
      }
    }

    const recentStr = localStorage.getItem("wormhole_recent");
    const recent: string[] = recentStr ? JSON.parse(recentStr) : [];
    const category = DESTINATIONS[chosenCategory as keyof typeof DESTINATIONS];
    const available = category.filter(url => !recent.includes(url));
    const pool = available.length > 0 ? available : category;
    const url = pool[Math.floor(Math.random() * pool.length)];

    const newRecent = [url, ...recent.slice(0, 9)];
    localStorage.setItem("wormhole_recent", JSON.stringify(newRecent));

    const hints = DESTINATION_HINTS[chosenCategory as keyof typeof DESTINATION_HINTS] || ["UNKNOWN"];
    const hint = hints[Math.floor(Math.random() * hints.length)];

    return { url, category: chosenCategory, hint };
  };

  // Abort warp with feedback
  const abortWarp = () => {
    setIsWarping(false);
    setCanAbort(false);
    setCountdown(3);
    setShowAbortFeedback(true);
    playSound('abort');
    setTimeout(() => setShowAbortFeedback(false), 2000);
  };

  // Handle initial warning acceptance
  const handleWarningAccept = () => {
    if (!acceptedRisk) return;

    setShowExitWarning(false);
    setAcceptedRisk(false);
    setHasSeenWarning(true);
  };

  // Start warp sequence directly (no warning modal)
  const handleWarpButtonClick = () => {
    setIsWarping(true);
    setCountdown(3);
    setCanAbort(true);
    playSound('warp');

    const destination = getRandomDestination();
    setCurrentDestination(destination);
    setCurrentHint(destination.hint);
    setCurrentMessage(COUNTDOWN_MESSAGES[Math.floor(Math.random() * COUNTDOWN_MESSAGES.length)]);

    // Save to history
    const newHistory = [
      { url: destination.url, hint: destination.hint, timestamp: Date.now() },
      ...journeyHistory.slice(0, 9)
    ];
    setJourneyHistory(newHistory);
    localStorage.setItem("wormhole_history", JSON.stringify(newHistory));

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);

          // Smooth async animation sequence
          (async () => {
            // Enter hyperhyperspace mode
            setIsHyperhyperspace(true);

            // Wait 2s of hyperhyperspace
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Crossfade transition (300ms)
            setIsHyperhyperspace(false);
            await new Promise(resolve => setTimeout(resolve, 300));

            // White flash with fade-out
            setShowWhiteFlash(true);

            // Wait 800ms for white flash animation
            await new Promise(resolve => setTimeout(resolve, 800));

            // Final fade-out before navigation (200ms)
            setIsFadingOut(true);
            await new Promise(resolve => setTimeout(resolve, 200));

            // Update journey count and navigate
            const newCount = journeyCount + 1;
            setJourneyCount(newCount);
            localStorage.setItem("wormhole_journeys", newCount.toString());
            window.location.href = destination.url;
          })();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => setCanAbort(false), 1000);
  };

  // Get star color - animated blue/red/yellow/white cycling
  const getStarColor = (colorPhase: number) => {
    if (!isWarping) {
      // Subtle white-to-gold variation when not warping
      const goldTint = Math.sin(colorPhase) * 0.15 + 0.85;
      return `rgba(255, 255, 255, ${goldTint})`;
    }

    // Animated star colors: blue → red → yellow → white
    const colors = [
      [100, 149, 237],  // blue
      [255, 69, 58],    // red
      [255, 214, 10],   // yellow
      [255, 255, 255],  // white
    ];

    const phase = (colorPhase + colorShift) % (Math.PI * 2);
    const colorIndex = Math.floor((phase / (Math.PI * 2)) * 4);
    const [r, g, b] = colors[colorIndex];

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Calculate border glow based on speed
  const getBorderGlow = () => {
    if (isHyperhyperspace) {
      return '0 0 60px rgba(255, 255, 255, 0.8) inset, 0 0 120px rgba(255, 255, 255, 0.6) inset';
    }
    if (ludicrousSpeed) {
      return '0 0 40px rgba(255, 157, 35, 0.6) inset, 0 0 80px rgba(255, 157, 35, 0.4) inset';
    }
    if (isWarping) {
      return '0 0 20px rgba(100, 149, 237, 0.5) inset, 0 0 40px rgba(100, 149, 237, 0.3) inset';
    }
    return 'none';
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "var(--bg)",
        transition: 'opacity 0.2s ease',
        boxShadow: getBorderGlow(),
        animation: isHyperhyperspace ? 'screen-shake 0.1s infinite, border-pulse 0.5s ease-in-out infinite' : ((isWarping || ludicrousSpeed) ? 'border-pulse 0.5s ease-in-out infinite' : 'none'),
        opacity: isFadingOut ? 0 : 1
      }}
    >
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-[100] animate-luxury-fade-in" style={{ background: "var(--bg)" }}>
          <div className="text-center">
            <div className="mb-8">
              <div className="text-7xl animate-luxury-pulse" style={{
                color: "var(--accent)",
                textShadow: "0 0 40px rgba(255, 157, 35, 0.6), 0 0 80px rgba(255, 157, 35, 0.4)",
                filter: "drop-shadow(0 0 40px rgba(255, 157, 35, 0.6))"
              }}>
                ✦
              </div>
            </div>
            <p style={{
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.08em",
              color: "var(--ink)",
              opacity: 0.8,
              fontSize: "1.25rem",
              marginBottom: "0.75rem"
            }}>
              Calibrating wormhole...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "0s" }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Nebula background (#3) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Layer 1 - Slow rotation */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(ellipse at 15% 25%, rgba(212, 175, 55, 0.15), transparent 45%),
              radial-gradient(ellipse at 85% 75%, rgba(100, 149, 237, 0.18), transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(138, 43, 226, 0.12), transparent 55%)
            `,
            animation: "nebula-rotate-slow 60s linear infinite",
          }}
        />
        {/* Layer 2 - Medium rotation (opposite direction) */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: `
              radial-gradient(ellipse at 70% 30%, rgba(0, 206, 209, 0.14), transparent 48%),
              radial-gradient(ellipse at 30% 80%, rgba(255, 157, 35, 0.12), transparent 52%),
              radial-gradient(ellipse at 90% 50%, rgba(255, 105, 180, 0.1), transparent 45%)
            `,
            animation: "nebula-rotate-medium 40s linear infinite reverse",
          }}
        />
        {/* Layer 3 - Fast rotation (pulsing during warp) */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 45% 65%, rgba(255, 215, 0, 0.08), transparent 40%),
              radial-gradient(ellipse at 60% 20%, rgba(138, 43, 226, 0.1), transparent 50%)
            `,
            animation: `nebula-rotate-fast 25s linear infinite${isWarping || ludicrousSpeed || isHyperhyperspace ? ', nebula-pulse 2s ease-in-out infinite' : ''}`,
            opacity: isWarping || ludicrousSpeed || isHyperhyperspace ? 0.3 : 0.15
          }}
        />
      </div>

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Cosmic dust/debris particles (#20) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={`dust-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.3})`,
              filter: `blur(${Math.random() * 1.5}px)`,
              animation: `dust-float ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      {/* CRT Scanline Effect (#4) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 4px)',
          opacity: isWarping || ludicrousSpeed || isHyperhyperspace ? 0.6 : 0.3,
          animation: isWarping ? 'scanline 8s linear infinite' : 'none',
          mixBlendMode: 'screen'
        }}
      />

      {/* Speed lines from edges (#17) */}
      {(isWarping || ludicrousSpeed || isHyperhyperspace) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Horizontal speed lines from left */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1/3"
            style={{
              background: `repeating-linear-gradient(90deg,
                transparent 0px,
                ${isHyperhyperspace ? 'rgba(255,255,255,0.4)' : (ludicrousSpeed ? 'rgba(255,157,35,0.3)' : 'rgba(100,149,237,0.2)')} 1px,
                transparent 2px,
                transparent ${isHyperhyperspace ? '8px' : (ludicrousSpeed ? '12px' : '18px')})`,
              animation: 'speed-line-right 0.5s linear infinite',
              opacity: isHyperhyperspace ? 0.8 : (ludicrousSpeed ? 0.6 : 0.4)
            }}
          />
          {/* Horizontal speed lines from right */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3"
            style={{
              background: `repeating-linear-gradient(270deg,
                transparent 0px,
                ${isHyperhyperspace ? 'rgba(255,255,255,0.4)' : (ludicrousSpeed ? 'rgba(255,157,35,0.3)' : 'rgba(100,149,237,0.2)')} 1px,
                transparent 2px,
                transparent ${isHyperhyperspace ? '8px' : (ludicrousSpeed ? '12px' : '18px')})`,
              animation: 'speed-line-left 0.5s linear infinite',
              opacity: isHyperhyperspace ? 0.8 : (ludicrousSpeed ? 0.6 : 0.4)
            }}
          />
          {/* Vertical speed lines from top */}
          <div
            className="absolute top-0 left-0 right-0 h-1/3"
            style={{
              background: `repeating-linear-gradient(180deg,
                transparent 0px,
                ${isHyperhyperspace ? 'rgba(255,255,255,0.4)' : (ludicrousSpeed ? 'rgba(255,157,35,0.3)' : 'rgba(100,149,237,0.2)')} 1px,
                transparent 2px,
                transparent ${isHyperhyperspace ? '8px' : (ludicrousSpeed ? '12px' : '18px')})`,
              animation: 'speed-line-down 0.5s linear infinite',
              opacity: isHyperhyperspace ? 0.8 : (ludicrousSpeed ? 0.6 : 0.4)
            }}
          />
          {/* Vertical speed lines from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/3"
            style={{
              background: `repeating-linear-gradient(0deg,
                transparent 0px,
                ${isHyperhyperspace ? 'rgba(255,255,255,0.4)' : (ludicrousSpeed ? 'rgba(255,157,35,0.3)' : 'rgba(100,149,237,0.2)')} 1px,
                transparent 2px,
                transparent ${isHyperhyperspace ? '8px' : (ludicrousSpeed ? '12px' : '18px')})`,
              animation: 'speed-line-up 0.5s linear infinite',
              opacity: isHyperhyperspace ? 0.8 : (ludicrousSpeed ? 0.6 : 0.4)
            }}
          />
        </div>
      )}

      {/* Tron-style Grid Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: "500px" }}>
        <div
          className="absolute animate-tron-grid"
          style={{
            bottom: "50%",
            left: "50%",
            width: "200%",
            height: "200%",
            transform: "translateX(-50%) rotateX(60deg)",
            transformOrigin: "center bottom",
            backgroundImage: `
              linear-gradient(to right, rgba(212, 175, 55, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            opacity: isWarping ? 0.4 : 0.2,
            transition: "opacity 0.3s ease",
          }}
        />
      </div>

      {/* Enhanced Vignette Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(11, 11, 11, 0.4) 70%, rgba(11, 11, 11, 0.8) 100%)",
          mixBlendMode: "normal",
        }}
      />

      {/* Mouse Trail Particles - hidden during countdown for performance */}
      {!isWarping && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {mouseTrail.map((particle) => {
          const age = Date.now() - particle.timestamp;
          const opacity = 1 - (age / 1000);
          const size = 8 * (1 - age / 1000);

          return (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${size}px`,
                height: `${size}px`,
                background: `radial-gradient(circle, rgba(212, 175, 55, ${opacity}) 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 0 ${size * 2}px rgba(212, 175, 55, ${opacity * 0.6})`,
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>
      )}

      {/* Shimmer Particle Layer - hidden during countdown for performance */}
      {!isWarping && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {shimmers.map((shimmer) => (
          <div
            key={shimmer.id}
            className="absolute rounded-full"
            style={{
              left: `${shimmer.x}px`,
              top: `${shimmer.y}px`,
              width: `${shimmer.size}px`,
              height: `${shimmer.size}px`,
              background: `radial-gradient(circle, hsl(${shimmer.hue}, 80%, 70%) 0%, transparent 70%)`,
              opacity: shimmer.opacity,
              filter: `blur(${shimmer.size * 0.5}px)`,
              boxShadow: `0 0 ${shimmer.size * 3}px hsl(${shimmer.hue}, 80%, 60%)`,
            }}
          />
        ))}
      </div>
      )}

      {/* Starfield */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <svg width="100%" height="100%" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          {/* Constellation lines connecting nearby stars - disabled during countdown for performance */}
          {!isWarping && stars.map((star, i) => {
            const perspective = 1000;
            const scale = perspective / (perspective + star.z);
            const x = star.x * scale + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
            const y = star.y * scale + (typeof window !== 'undefined' ? window.innerHeight / 2 : 500);

            // Only render lines from background and mid layer stars (not foreground to avoid clutter)
            if (star.layer === 2) return null;

            return stars.slice(i + 1).map((otherStar, j) => {
              // Only connect stars in same layer
              if (otherStar.layer !== star.layer) return null;

              const otherScale = perspective / (perspective + otherStar.z);
              const otherX = otherStar.x * otherScale + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
              const otherY = otherStar.y * otherScale + (typeof window !== 'undefined' ? window.innerHeight / 2 : 500);

              // Calculate screen-space distance
              const dx = otherX - x;
              const dy = otherY - y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              // Only connect stars within 150px and in similar z-depth
              if (distance > 150 || Math.abs(star.z - otherStar.z) > 300) return null;

              // Fade opacity based on distance
              const opacity = (1 - distance / 150) * 0.15 * (star.layer === 0 ? 0.4 : 0.6);

              return (
                <line
                  key={`${star.id}-${otherStar.id}`}
                  x1={x}
                  y1={y}
                  x2={otherX}
                  y2={otherY}
                  stroke="rgba(212, 175, 55, 0.3)"
                  strokeWidth={0.5}
                  opacity={opacity}
                />
              );
            });
          })}

          {/* Stars - show every other star during countdown for performance */}
          {stars.filter((star, i) => !isWarping || i % 2 === 0).map((star) => {
            const perspective = 1000;
            const scale = perspective / (perspective + star.z);
            const x = star.x * scale + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
            const y = star.y * scale + (typeof window !== 'undefined' ? window.innerHeight / 2 : 500);
            const prevZ = star.z + star.speed;
            const prevScale = perspective / (perspective + prevZ);
            const prevX = star.x * prevScale + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
            const prevY = star.y * prevScale + (typeof window !== 'undefined' ? window.innerHeight / 2 : 500);

            // Layer-based adjustments for parallax depth perception
            const layerSizeMultipliers = [0.6, 1, 1.4]; // background smaller, mid normal, foreground larger
            const layerOpacityMultipliers = [0.4, 0.7, 1]; // background dimmer, mid medium, foreground bright

            const brightness = (1 - star.z / 2000) * layerOpacityMultipliers[star.layer];
            const size = Math.max(1, 3 * scale * layerSizeMultipliers[star.layer]);

            if (typeof window !== 'undefined' && (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight)) {
              return null;
            }

            const starColor = getStarColor(star.colorPhase);

            // Calculate hyperspace streak (much longer during warp)
            const streakMultiplier = isHyperhyperspace ? 15 : (isWarping ? 8 : (boost ? 3 : 1));
            const streakZ = star.z + (star.speed * streakMultiplier);
            const streakScale = perspective / (perspective + streakZ);
            const streakX = star.x * streakScale + (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
            const streakY = star.y * streakScale + (typeof window !== 'undefined' ? window.innerHeight / 2 : 500);

            return (
              <g key={star.id}>
                {(isHyperhyperspace || isWarping || boost) && (
                  <line
                    x1={streakX}
                    y1={streakY}
                    x2={x}
                    y2={y}
                    stroke={isHyperhyperspace ? "rgba(255, 255, 255, 1)" : (isWarping ? "rgba(255, 255, 255, 0.9)" : starColor)}
                    strokeWidth={isHyperhyperspace ? size * 2.5 : (isWarping ? size * 1.5 : size * 0.5)}
                    strokeLinecap="round"
                    opacity={brightness * (isHyperhyperspace || isWarping ? 1 : 0.8)}
                    style={{
                      filter: isHyperhyperspace ? "blur(2px)" : (isWarping ? "blur(1px)" : "none")
                    }}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill={isHyperhyperspace || isWarping ? "rgba(255, 255, 255, 1)" : starColor}
                  opacity={brightness}
                  style={{
                    filter: isHyperhyperspace ? `blur(${size * 0.8}px)` : (isWarping ? `blur(${size * 0.3}px)` : "none")
                  }}
                />
              </g>
            );
          })}

          {/* Particle burst on speed change (#12) */}
          {burstParticles.map(particle => (
            <circle
              key={particle.id}
              cx={particle.x}
              cy={particle.y}
              r={4 * particle.life}
              fill={particle.color}
              opacity={particle.life * 0.8}
              style={{
                filter: `blur(${2 * (1 - particle.life)}px)`
              }}
            />
          ))}
        </svg>
      </div>

      {/* Lens Flare Effect - simplified for performance */}
      {isWarping && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative animate-lens-flare-rotate" style={{ willChange: 'transform' }}>
            {/* Center bright core - blur removed for performance */}
            <div className="absolute" style={{
              width: "120px",
              height: "120px",
              marginLeft: "-60px",
              marginTop: "-60px",
              background: "radial-gradient(circle, rgba(212, 175, 55, 0.6) 0%, rgba(244, 162, 89, 0.3) 30%, transparent 70%)",
            }} />

            {/* Prismatic rays - blur removed for performance */}
            {[0, 90].map((angle) => (
              <div
                key={angle}
                className="absolute"
                style={{
                  width: "400px",
                  height: "2px",
                  marginLeft: "-200px",
                  marginTop: "-1px",
                  background: `linear-gradient(90deg, transparent, rgba(100, 149, 237, 0.4), rgba(212, 175, 55, 0.6), rgba(138, 43, 226, 0.4), transparent)`,
                  transform: `rotate(${angle}deg)`,
                }}
              />
            ))}

            {/* Outer glow rings */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${i * 80}px`,
                  height: `${i * 80}px`,
                  marginLeft: `${-i * 40}px`,
                  marginTop: `${-i * 40}px`,
                  border: `1px solid rgba(212, 175, 55, ${0.3 / i})`,
                  boxShadow: `0 0 ${i * 20}px rgba(212, 175, 55, ${0.4 / i})`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Radial blur during acceleration (#13) - reduced for performance */}
      {(isWarping || ludicrousSpeed || isHyperhyperspace) && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: `${(i + 1) * (isHyperhyperspace ? 200 : (ludicrousSpeed ? 150 : 100))}px`,
                height: `${(i + 1) * (isHyperhyperspace ? 200 : (ludicrousSpeed ? 150 : 100))}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, transparent ${60 + i * 2}%, ${
                  isHyperhyperspace ? 'rgba(255,255,255,0.15)' : (ludicrousSpeed ? 'rgba(255,157,35,0.12)' : 'rgba(100,149,237,0.1)')
                } ${62 + i * 2}%, transparent ${64 + i * 2}%)`,
                animation: 'radial-blur-pulse 2s ease-out infinite',
                animationDelay: `${i * 0.1}s`,
                opacity: isHyperhyperspace ? 0.8 : (ludicrousSpeed ? 0.6 : 0.4),
                filter: `blur(${isHyperhyperspace ? '8px' : (ludicrousSpeed ? '6px' : '4px')})`,
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>
      )}

      {/* Luxury Warp Tunnel Rings - reduced for performance */}
      {isWarping && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-luxury-warp-ring"
              style={{
                width: `${(i + 1) * 180}px`,
                height: `${(i + 1) * 180}px`,
                animationDelay: `${i * 0.15}s`,
                opacity: 0.4 - i * 0.06,
                background: `conic-gradient(from ${i * 60}deg, transparent, rgba(212, 175, 55, 0.3), transparent)`,
                border: "1px solid rgba(212, 175, 55, 0.2)",
                boxShadow: `0 0 30px rgba(212, 175, 55, 0.2), inset 0 0 30px rgba(212, 175, 55, 0.1)`,
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)" }} />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar - backdrop-blur removed for performance */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between" style={{
          fontFamily: "var(--font-sans)",
          borderBottom: "1px solid rgba(255, 157, 35, 0.1)",
          background: "rgba(11, 11, 11, 0.5)",
          padding: "var(--space-8) var(--space-10)"
        }}>
          <div className="flex items-center" style={{ gap: "var(--space-6)" }}>
            <span style={{ color: "var(--accent)", fontSize: "1.25rem" }}>✦</span>
            <span style={{ letterSpacing: "0.05em", fontSize: "1rem", color: "var(--ink)", opacity: 0.9 }}>WORMHOLE</span>
            <span style={{ color: "var(--muted)", opacity: 0.3 }}>·</span>
            <span style={{ fontSize: "0.9rem", letterSpacing: "0.02em", color: "var(--muted)" }}>Journey #{journeyCount + 1}</span>
          </div>
          <div className="flex items-center" style={{ gap: "var(--space-8)" }}>
            <button
              onClick={() => {
                setShowCategoryFilter(!showCategoryFilter);
                playSound('beep');
              }}
              className="pointer-events-auto flex items-center transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
              title="Category Filters"
              style={{
                fontSize: "1.1rem",
                color: "var(--muted)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-3) var(--space-4)",
                gap: "var(--space-2)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 157, 35, 0.4)";
                e.currentTarget.style.background = "rgba(255, 157, 35, 0.1)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              ⚙️
            </button>
            <button
              onClick={toggleSound}
              className="pointer-events-auto flex items-center transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
              title={soundEnabled ? "Sound ON" : "Sound OFF"}
              style={{
                fontSize: "1.25rem",
                color: "var(--muted)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-3) var(--space-4)",
                gap: "var(--space-2)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 157, 35, 0.4)";
                e.currentTarget.style.background = "rgba(255, 157, 35, 0.1)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
          </div>
        </div>

        {/* Category Filter Panel */}
        {showCategoryFilter && (
          <div className="absolute right-0 backdrop-blur-xl pointer-events-auto animate-luxury-fade-in z-50" style={{
            background: "rgba(11, 11, 11, 0.95)",
            border: "1px solid rgba(255, 157, 35, 0.2)",
            borderRadius: "var(--radius)",
            boxShadow: "0 0 40px rgba(255, 157, 35, 0.15)",
            top: "calc(var(--space-8) * 2 + 48px)",
            marginRight: "var(--space-10)",
            padding: "var(--space-8)",
            maxWidth: "420px",
            width: "100%"
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-6)" }}>
              <h3 style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em", fontSize: "1rem", color: "var(--accent)" }}>Category Filters</h3>
              <button onClick={() => setShowCategoryFilter(false)} style={{ color: "var(--muted)", fontSize: "2rem", lineHeight: 1, padding: "var(--space-2)" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
              {Object.entries(enabledCategories).map(([category, enabled]) => (
                <label key={category} className="flex items-center cursor-pointer group" style={{
                  gap: "var(--space-4)",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-sm)",
                  transition: "background 120ms ease"
                }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => {
                      const newCategories = { ...enabledCategories, [category]: e.target.checked };
                      setEnabledCategories(newCategories);
                      localStorage.setItem("wormhole_categories", JSON.stringify(newCategories));
                      playSound('beep');
                    }}
                    className="cursor-pointer"
                    style={{ accentColor: "var(--accent)", width: "18px", height: "18px" }}
                  />
                  <span className="transition-colors capitalize" style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--ink)", opacity: 0.7 }}>
                    {category === 'weirdFun' ? 'Weird & Fun' : category}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex" style={{ gap: "var(--space-4)" }}>
              <button
                onClick={() => {
                  const allEnabled = Object.keys(enabledCategories).reduce((acc, cat) => ({ ...acc, [cat]: true }), {});
                  setEnabledCategories(allEnabled);
                  localStorage.setItem("wormhole_categories", JSON.stringify(allEnabled));
                  playSound('beep');
                }}
                className="flex-1 transition-all hover:scale-110 active:scale-95"
                style={{
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                  fontSize: "0.75rem",
                  textTransform: "capitalize",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  boxShadow: "none",
                  filter: "none"
                }}
              >
                All
              </button>
              <button
                onClick={() => {
                  const noneEnabled = Object.keys(enabledCategories).reduce((acc, cat) => ({ ...acc, [cat]: false }), {});
                  setEnabledCategories(noneEnabled);
                  localStorage.setItem("wormhole_categories", JSON.stringify(noneEnabled));
                  playSound('beep');
                }}
                className="flex-1 transition-all hover:scale-110 active:scale-95"
                style={{
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                  fontSize: "0.75rem",
                  textTransform: "capitalize",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  boxShadow: "none",
                  filter: "none"
                }}
              >
                None
              </button>
            </div>
            <p className="text-center" style={{
              fontFamily: "var(--font-sans)",
              lineHeight: "1.6",
              marginTop: "var(--space-5)",
              color: "var(--muted)",
              opacity: 0.6,
              fontSize: "0.875rem"
            }}>
              Select categories for your journey destinations
            </p>

            {/* Star Density Slider */}
            <div style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              marginTop: "var(--space-8)",
              paddingTop: "var(--space-8)"
            }}>
              <label className="block" style={{ marginBottom: "var(--space-5)" }}>
                <span className="block" style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.08em",
                  fontSize: "0.875rem",
                  color: "var(--accent)",
                  marginBottom: "var(--space-3)"
                }}>
                  Star Density: {starDensity}
                </span>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={starDensity}
                  onChange={(e) => {
                    setStarDensity(parseInt(e.target.value));
                    playSound('beep');
                  }}
                  className="w-full appearance-none cursor-pointer slider-gold"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "var(--radius-sm)",
                    height: "6px"
                  }}
                />
              </label>
              <div className="flex justify-between" style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--muted)",
                opacity: 0.5
              }}>
                <span>Minimal</span>
                <span>Dense</span>
              </div>
            </div>
          </div>
        )}

        {/* Return to HTM Button */}
        <Link
          href="/"
          className="absolute backdrop-blur-md transition-all pointer-events-auto hover:-translate-x-1"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.875rem",
            letterSpacing: "0.08em",
            fontWeight: "500",
            background: "rgba(11, 11, 11, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "var(--muted)",
            borderRadius: "var(--radius-sm)",
            top: "calc(var(--space-8) * 2 + 48px)",
            left: "var(--space-10)",
            padding: "var(--space-4) var(--space-6)"
          }}
        >
          ← RETURN HOME
        </Link>

        {/* Center Button */}
        {!isWarping && !showExitWarning && hasSeenWarning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="text-center">
              {/* Category Selector */}
              <div className="flex flex-wrap items-center justify-center" style={{
                gap: "var(--space-4)",
                marginBottom: "var(--space-16)"
              }}>
                {[
                  { key: 'all', emoji: '🌀', label: 'All' },
                  { key: 'interactive', emoji: '🎮', label: 'Interactive' },
                  { key: 'games', emoji: '🎯', label: 'Games' },
                  { key: 'weirdFun', emoji: '🎪', label: 'Weird & Fun' },
                  { key: 'music', emoji: '🎵', label: 'Music' },
                  { key: 'educational', emoji: '📚', label: 'Educational' },
                  { key: 'retro', emoji: '👾', label: 'Retro' },
                ].map(({ key, emoji, label }) => {
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedCategory(key as typeof selectedCategory);
                        playSound('beep');
                      }}
                      className={`backdrop-blur-sm transition-all duration-300 active:scale-95 ${
                        isSelected
                          ? ''
                          : 'hover:scale-105'
                      }`}
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.95rem",
                        letterSpacing: "0.02em",
                        fontWeight: isSelected ? "600" : "500",
                        borderRadius: "0",
                        border: isSelected ? "2px solid var(--accent)" : "2px solid rgba(255, 255, 255, 0.2)",
                        background: isSelected
                          ? "linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.15))"
                          : "linear-gradient(to bottom, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.05))",
                        color: isSelected ? "var(--ink)" : "var(--muted)",
                        boxShadow: isSelected
                          ? "0 0 0 2px rgba(255,157,35,0.3), 0 0 16px rgba(255,157,35,0.4), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                          : "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                        padding: "var(--space-4) var(--space-6)"
                      }}
                    >
                      <span
                        className={`mr-2 inline-block transition-all duration-300${isSelected ? ' animate-category-icon-pulse' : ''}`}
                        style={{
                          filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,157,35,0.6))' : 'none',
                          transform: isSelected ? 'scale(1.15)' : 'scale(1)'
                        }}
                      >
                        {emoji}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleWarpButtonClick}
                className="hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-xl animate-button-pulse group"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.25rem",
                  letterSpacing: "0.1em",
                  fontWeight: "600",
                  background: "linear-gradient(to right, var(--accent), var(--accent-hover))",
                  color: "var(--bg)",
                  borderRadius: "var(--radius)",
                  border: "2px solid rgba(255, 157, 35, 0.5)",
                  boxShadow: "0 0 50px rgba(255, 157, 35, 0.5), 0 0 100px rgba(255, 157, 35, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                  padding: "var(--space-8) var(--space-24)"
                }}
              >
                <span className="inline-block group-hover:animate-[emoji-rotate_0.6s_ease-in-out]">✦</span> INITIATE WARP SEQUENCE
              </button>
              <p style={{
                fontFamily: "var(--font-sans)",
                letterSpacing: "0.03em",
                color: "var(--muted)",
                fontSize: "1rem",
                marginTop: "var(--space-12)"
              }}>
                Click anywhere for acceleration
              </p>
              <p style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.05em",
                color: "var(--muted)",
                opacity: 0.5,
                fontSize: "0.875rem",
                marginTop: "var(--space-3)"
              }}>
                SPACE to jump · R to recenter
              </p>
            </div>
          </div>
        )}

        {/* Exit Warning Modal */}
        {showExitWarning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 animate-luxury-fade-in" style={{
            backdropFilter: "blur(20px)",
            backgroundColor: "rgba(11, 11, 11, 0.85)"
          }}>
            <div className="w-full backdrop-blur-xl shadow-2xl" style={{
              background: "rgba(11, 11, 11, 0.6)",
              border: "1px solid rgba(255, 157, 35, 0.2)",
              boxShadow: "0 0 60px rgba(255, 157, 35, 0.15), inset 0 1px 0 rgba(255, 157, 35, 0.1)",
              maxWidth: "480px",
              margin: "0 var(--space-6)",
              borderRadius: "var(--radius)"
            }}>
              {/* Header */}
              <div style={{
                borderBottom: "1px solid rgba(255, 157, 35, 0.1)",
                padding: "var(--space-6) var(--space-8) var(--space-5)"
              }}>
                <div className="text-center">
                  <div style={{
                    fontSize: "2.5rem",
                    marginBottom: "var(--space-4)",
                    color: "var(--accent)",
                    textShadow: "0 0 20px rgba(255, 157, 35, 0.3)"
                  }}>✦</div>
                  <h2 style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.5rem",
                    marginBottom: "var(--space-2)",
                    background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 50%, var(--accent) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.02em"
                  }}>
                    Your Journey Awaits
                  </h2>
                  <p style={{
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.03em",
                    fontSize: "0.875rem",
                    marginBottom: "var(--space-4)",
                    color: "var(--muted)"
                  }}>
                    Step into the unknown
                  </p>
                  <div className="h-px mx-auto" style={{
                    width: "100px",
                    background: "linear-gradient(90deg, transparent, var(--accent), transparent)"
                  }}></div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "var(--space-6) var(--space-8)" }}>
                <p className="text-center" style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.01em",
                  lineHeight: "1.6",
                  color: "var(--ink)",
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  marginBottom: "var(--space-8)"
                }}>
                  You're about to embark on a curated journey through the internet.
                </p>

                <div style={{
                  background: "linear-gradient(to bottom right, rgba(255, 157, 35, 0.05), transparent)",
                  border: "1px solid rgba(255, 157, 35, 0.1)",
                  borderRadius: "var(--radius)",
                  padding: "var(--space-5)",
                  marginBottom: "var(--space-8)"
                }}>
                  <p className="uppercase" style={{
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.1em",
                    color: "var(--muted)",
                    fontSize: "0.625rem",
                    marginBottom: "var(--space-3)"
                  }}>
                    What to expect
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <div className="flex items-start" style={{ gap: "var(--space-2)" }}>
                      <span style={{ color: "var(--accent)", marginTop: "0.125rem", fontSize: "0.875rem" }}>→</span>
                      <p style={{
                        fontFamily: "var(--font-sans)",
                        lineHeight: "1.5",
                        fontSize: "0.875rem",
                        color: "var(--ink)",
                        opacity: 0.7
                      }}>
                        You'll be transported to an external website beyond our control
                      </p>
                    </div>
                    <div className="flex items-start" style={{ gap: "var(--space-2)" }}>
                      <span style={{ color: "var(--accent)", marginTop: "0.125rem", fontSize: "0.875rem" }}>→</span>
                      <p style={{
                        fontFamily: "var(--font-sans)",
                        lineHeight: "1.5",
                        fontSize: "0.875rem",
                        color: "var(--ink)",
                        opacity: 0.7
                      }}>
                        Each destination is handpicked and unique
                      </p>
                    </div>
                    <div className="flex items-start" style={{ gap: "var(--space-2)" }}>
                      <span style={{ color: "var(--accent)", marginTop: "0.125rem", fontSize: "0.875rem" }}>→</span>
                      <p style={{
                        fontFamily: "var(--font-sans)",
                        lineHeight: "1.5",
                        fontSize: "0.875rem",
                        color: "var(--ink)",
                        opacity: 0.7
                      }}>
                        You may discover something extraordinary, peculiar, or wonderfully unexpected
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex items-center cursor-pointer justify-center group" style={{
                  gap: "var(--space-2)",
                  padding: "var(--space-5) 0"
                }}>
                  <input
                    type="checkbox"
                    checked={acceptedRisk}
                    onChange={(e) => setAcceptedRisk(e.target.checked)}
                    className="rounded cursor-pointer"
                    style={{ accentColor: "var(--accent)", width: "20px", height: "20px" }}
                  />
                  <span className="transition-colors" style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.875rem",
                    letterSpacing: "0.01em",
                    color: "var(--muted)"
                  }}>
                    I'm ready to explore
                  </span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex" style={{
                padding: "0 var(--space-8) var(--space-8)",
                gap: "var(--space-3)"
              }}>
                <button
                  onClick={() => {
                    setShowExitWarning(false);
                    setAcceptedRisk(false);
                  }}
                  className="flex-1 transition-all backdrop-blur-sm"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8125rem",
                    letterSpacing: "0.05em",
                    fontWeight: "500",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "var(--muted)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-3) var(--space-5)"
                  }}
                >
                  ← RETURN
                </button>
                <button
                  onClick={handleWarningAccept}
                  disabled={!acceptedRisk}
                  className="flex-1 transition-all backdrop-blur-sm"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8125rem",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                    background: acceptedRisk
                      ? "linear-gradient(to right, var(--accent), var(--accent-hover))"
                      : "rgba(255, 255, 255, 0.1)",
                    color: acceptedRisk ? "var(--bg)" : "rgba(255, 255, 255, 0.3)",
                    cursor: acceptedRisk ? "pointer" : "not-allowed",
                    boxShadow: acceptedRisk ? "0 0 30px rgba(255, 157, 35, 0.3)" : "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-3) var(--space-5)"
                  }}
                >
                  ENTER WORMHOLE →
                </button>
              </div>

              <p className="text-center" style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.05em",
                paddingBottom: "var(--space-5)",
                color: "var(--muted)",
                opacity: 0.4,
                fontSize: "0.6875rem"
              }}>
                ESC to cancel
              </p>
            </div>
          </div>
        )}

        {/* Luxury Countdown */}
        {isWarping && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
            <div className="text-center" style={{ padding: "0 var(--space-10)" }}>
              {/* Destination Preview Emoji Teaser */}
              {countdown > 0 && currentDestination && (
                <div className="text-8xl animate-flip-in" style={{
                  filter: "drop-shadow(0 0 30px rgba(255, 157, 35, 0.6))",
                  animation: "flip-reveal 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                  marginBottom: "var(--space-10)"
                }}>
                  {currentDestination.category === 'interactive' && '🎮'}
                  {currentDestination.category === 'games' && '🎯'}
                  {currentDestination.category === 'weirdFun' && '🎪'}
                  {currentDestination.category === 'music' && '🎵'}
                  {currentDestination.category === 'educational' && '📚'}
                  {currentDestination.category === 'retro' && '👾'}
                  {!['interactive', 'games', 'weirdFun', 'music', 'educational', 'retro'].includes(currentDestination.category) && '✦'}
                </div>
              )}

              <div
                key={countdown}
                className="text-9xl"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--accent)",
                  filter: `drop-shadow(0 0 30px rgba(255, 157, 35, 0.6))`,
                  animation: countdown === 0 ? 'countdown-zero 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'countdown-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  transformOrigin: 'center',
                  marginBottom: "var(--space-16)",
                  willChange: 'transform'
                }}
              >
                {countdown}
              </div>
              <p
                className="text-xl"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.05em",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 157, 35, 0.9) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 30px rgba(255, 255, 255, 0.3)",
                  filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))",
                  marginBottom: "var(--space-10)"
                }}
              >
                {currentMessage}
              </p>
              <div className="flex items-center justify-center" style={{ gap: "var(--space-5)", marginBottom: "var(--space-10)" }}>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-[var(--accent)]"></div>
                <p className="text-base" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.06em", fontWeight: "500", color: "var(--accent)", opacity: 0.9 }}>
                  {currentHint}
                </p>
                <div className="h-px w-16 bg-gradient-to-l from-transparent via-[var(--accent)]/50 to-[var(--accent)]"></div>
              </div>

              {/* Destination Preview Card */}
              {currentDestination && (
                <div className="mt-6 mx-auto max-w-md bg-black/60 backdrop-blur-md rounded-lg p-5 animate-luxury-fade-in" style={{ border: "1px solid rgba(255, 157, 35, 0.2)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.1em" }}>
                      Destination
                    </span>
                    <span className="px-2 py-1 text-xs rounded" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em", background: "rgba(255, 157, 35, 0.2)", color: "var(--accent)" }}>
                      {currentDestination.category}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm" style={{ fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                    {new URL(currentDestination.url).hostname.replace('www.', '')}
                  </p>
                </div>
              )}

              {canAbort && (
                <p className="font-mono text-xs text-white/30 mt-8 animate-pulse" style={{ letterSpacing: "0.08em" }}>
                  ESC to abort
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hyperhyperspace Progress Indicator */}
        {isHyperhyperspace && (
          <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center pointer-events-none z-[150]">
            <p className="text-white/90 text-lg mb-4 animate-pulse" style={{
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.15em",
              textShadow: "0 0 20px rgba(255, 255, 255, 0.8)"
            }}>
              ENTERING HYPERSPACE...
            </p>
            <div className="w-96 h-2 bg-white/10 rounded-full overflow-hidden" style={{
              boxShadow: "0 0 20px rgba(255, 157, 35, 0.3)"
            }}>
              <div
                className="h-full bg-gradient-to-r to-white animate-hyperspace-progress"
                style={{
                  background: "linear-gradient(to right, var(--accent), white)",
                  boxShadow: "0 0 30px rgba(255, 157, 35, 0.8)"
                }}
              />
            </div>
          </div>
        )}

        {/* Ludicrous Speed Message */}
        {showLudicrousMessage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100] animate-luxury-fade-in">
            <div className="relative px-16 py-12 bg-black/80 backdrop-blur-2xl rounded-2xl" style={{
              border: "4px solid var(--accent)",
              boxShadow: "0 0 100px rgba(255, 157, 35, 0.8), 0 0 200px rgba(255, 157, 35, 0.6), inset 0 0 100px rgba(255, 157, 35, 0.2)"
            }}>
              <div className="text-center animate-shake">
                <p className="font-heading text-8xl mb-4" style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, var(--accent) 50%, #FF0080 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 80px rgba(255, 255, 255, 1), 0 0 120px rgba(255, 157, 35, 1)",
                  filter: "drop-shadow(0 0 80px rgba(255, 157, 35, 1)) drop-shadow(0 0 40px rgba(255, 255, 255, 1))",
                  animation: "rainbow 1s linear infinite"
                }}>
                  LUDICROUS SPEED
                </p>
                <p className="text-white text-xl font-bold" style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.1em",
                  textShadow: "0 0 20px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 1)"
                }}>
                  They've gone to plaid!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Speed Gauge/Indicator (#11) */}
        {(isWarping || ludicrousSpeed || isHyperhyperspace) && (
          <div className="fixed top-8 right-8 z-50 pointer-events-none">
            <div className="backdrop-blur-md bg-black/40 border-2 rounded-none p-4" style={{
              borderColor: isHyperhyperspace ? 'rgba(255,255,255,0.6)' : (ludicrousSpeed ? 'rgba(255,157,35,0.6)' : 'rgba(100,149,237,0.6)'),
              boxShadow: isHyperhyperspace
                ? '0 0 30px rgba(255,255,255,0.4), inset 0 0 20px rgba(255,255,255,0.1)'
                : (ludicrousSpeed
                  ? '0 0 30px rgba(255,157,35,0.4), inset 0 0 20px rgba(255,157,35,0.1)'
                  : '0 0 30px rgba(100,149,237,0.4), inset 0 0 20px rgba(100,149,237,0.1)')
            }}>
              <div className="text-center">
                <div className="text-xs uppercase tracking-wider mb-2" style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'rgba(255,255,255,0.6)'
                }}>
                  SPEED
                </div>
                <div className="text-2xl font-bold mb-3" style={{
                  fontFamily: 'var(--font-heading)',
                  color: isHyperhyperspace ? '#fff' : (ludicrousSpeed ? 'var(--accent)' : '#6495ed'),
                  textShadow: `0 0 10px ${isHyperhyperspace ? 'rgba(255,255,255,0.8)' : (ludicrousSpeed ? 'rgba(255,157,35,0.8)' : 'rgba(100,149,237,0.8)')}`
                }}>
                  {isHyperhyperspace ? 'HYPER²' : (ludicrousSpeed ? 'LUDICROUS' : 'WARP')}
                </div>
                {/* Speed bar */}
                <div className="w-32 h-2 bg-black/50 rounded-none overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: isHyperhyperspace ? '100%' : (ludicrousSpeed ? '66%' : '33%'),
                      background: isHyperhyperspace
                        ? 'linear-gradient(90deg, #6495ed, var(--accent), #fff)'
                        : (ludicrousSpeed
                          ? 'linear-gradient(90deg, #6495ed, var(--accent))'
                          : '#6495ed'),
                      boxShadow: `0 0 10px ${isHyperhyperspace ? 'rgba(255,255,255,0.6)' : (ludicrousSpeed ? 'rgba(255,157,35,0.6)' : 'rgba(100,149,237,0.6)')}`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Abort Feedback */}
        {showAbortFeedback && (
          <div className="absolute inset-0 bg-[var(--accent-2)]/30 flex items-center justify-center pointer-events-none animate-fade-in">
            <div className="text-center">
              <p className="font-mono text-6xl text-[var(--accent-2)] mb-4 font-bold">WARP ABORTED</p>
              <p className="font-mono text-xl text-white">Returning to normal space...</p>
            </div>
          </div>
        )}

        {/* White Flash Transition */}
        {showWhiteFlash && (
          <div className="absolute inset-0 bg-white z-[200] pointer-events-none animate-white-flash" />
        )}

        {/* Konami Code Activation */}
        {konamiActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-center animate-luxury-fade-in">
              <p className="font-heading text-6xl mb-4" style={{
                background: "linear-gradient(90deg, var(--accent), #6495ED, #BA55D3, #40E0D0, var(--accent))",
                backgroundSize: "400% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 80px rgba(255, 157, 35, 1)",
                filter: "drop-shadow(0 0 80px rgba(255, 157, 35, 1)) drop-shadow(0 0 120px rgba(100, 149, 237, 0.8))",
                animation: "rainbow 1.5s linear infinite"
              }}>
                ✦ COSMIC MODE ACTIVATED ✦
              </p>
              <p className="text-white/80 text-xl" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.15em" }}>
                The universe bends to your will
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'].map((key, i) => (
                  <span
                    key={i}
                    className="font-mono text-sm px-2 py-1"
                    style={{
                      color: "var(--accent)",
                      border: "1px solid rgba(255, 157, 35, 0.4)",
                      background: "rgba(255, 157, 35, 0.1)",
                      animation: `fade-pulse ${0.5 + i * 0.1}s ease-in-out infinite`
                    }}
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/5 backdrop-blur-sm bg-black/20" style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", padding: "var(--space-8) var(--space-10)" }}>
          <div className="flex items-center" style={{ gap: "var(--space-8)" }}>
            <span className="text-white/60" style={{ letterSpacing: "0.08em" }}>
              <span style={{ color: "var(--accent)" }}>{journeyCount}</span> {journeyCount === 1 ? "Journey" : "Journeys"}
            </span>
            <span className="text-white/20">·</span>
            <div className="flex items-center pointer-events-auto" style={{ gap: "var(--space-4)" }}>
              <span style={{
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                fontWeight: "600",
                color: isHyperhyperspace ? "white" : (ludicrousSpeed ? "var(--accent)" : (isWarping ? "var(--accent)" : (boost ? "#6495ED" : "var(--muted)"))),
                textShadow: (isHyperhyperspace || ludicrousSpeed || isWarping) ? "0 0 10px currentColor" : "none",
                transition: "all 0.3s ease"
              }}>
                {isHyperhyperspace ? "⚡ HYPER" : (ludicrousSpeed ? "🚀 LUDICROUS" : (isWarping ? "✦ LIGHTSPEED" : (boost ? "→ BOOST" : "⊚ SUBLIGHT")))}
              </span>
              <div style={{
                width: "120px",
                height: "6px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "3px",
                overflow: "hidden",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: isHyperhyperspace ? "100%" : (ludicrousSpeed ? "85%" : (isWarping ? "60%" : (boost ? "30%" : "5%"))),
                  background: isHyperhyperspace ? "linear-gradient(to right, white, var(--accent))" :
                             (ludicrousSpeed ? "linear-gradient(to right, var(--accent), var(--accent))" :
                             (isWarping ? "var(--accent)" :
                             (boost ? "#6495ED" : "var(--muted)"))),
                  boxShadow: (isHyperhyperspace || ludicrousSpeed || isWarping) ? "0 0 10px currentColor" : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}></div>
              </div>
            </div>
            {journeyHistory.length > 0 && (
              <>
                <span className="text-white/20">·</span>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="pointer-events-auto text-white/50 transition-colors underline decoration-white/20"
                  style={{
                    letterSpacing: "0.05em"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent)";
                    e.currentTarget.style.textDecorationColor = "rgba(255, 157, 35, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                    e.currentTarget.style.textDecorationColor = "rgba(255, 255, 255, 0.2)";
                  }}
                >
                  {showHistory ? "Hide" : "View"} History
                </button>
                <span className="text-white/20">·</span>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="pointer-events-auto text-white/50 transition-colors underline decoration-white/20"
                  style={{
                    letterSpacing: "0.05em"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent)";
                    e.currentTarget.style.textDecorationColor = "rgba(255, 157, 35, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                    e.currentTarget.style.textDecorationColor = "rgba(255, 255, 255, 0.2)";
                  }}
                >
                  {showStats ? "Hide" : "View"} Stats
                </button>
              </>
            )}
          </div>
          <div className="text-white/40 font-mono text-[10px]" style={{ letterSpacing: "0.1em" }}>
            [{Math.floor(Math.random() * 999)}.{Math.floor(Math.random() * 999)}.{Math.floor(Math.random() * 999)}]
          </div>
        </div>

        {/* Journey History Dropdown */}
        {showHistory && journeyHistory.length > 0 && (
          <div className="absolute bg-black/90 backdrop-blur-xl max-w-md pointer-events-auto animate-luxury-fade-in" style={{
            border: "1px solid rgba(255, 157, 35, 0.2)",
            boxShadow: "0 0 40px rgba(255, 157, 35, 0.15)",
            padding: "var(--space-8)",
            bottom: "calc(var(--space-8) * 2 + 48px)",
            left: "var(--space-10)",
            borderRadius: "var(--radius)"
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-6)" }}>
              <h3 className="text-sm" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em", color: "var(--accent)" }}>Recent Journeys</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-white/40 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-luxury">
              {journeyHistory.map((journey, i) => {
                const domain = new URL(journey.url).hostname.replace('www.', '');
                const timeAgo = Math.floor((Date.now() - journey.timestamp) / 60000);
                return (
                  <a
                    key={i}
                    href={journey.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 border border-white/10 transition-all bg-white/5 backdrop-blur-sm group hover:scale-[1.02]"
                    style={{
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 157, 35, 0.5)";
                      e.currentTarget.style.background = "rgba(255, 157, 35, 0.1)";
                      e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(255, 157, 35, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs transition-colors" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em", color: "var(--accent)" }}>{journey.hint}</span>
                      <span className="font-mono text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                        {timeAgo < 1 ? 'just now' : `${timeAgo}m ago`}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-white/50 group-hover:text-white/70 transition-colors truncate flex items-center gap-1">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      {domain}
                    </div>
                  </a>
                );
              })}
            </div>
            <button
              onClick={() => {
                setJourneyHistory([]);
                localStorage.removeItem('wormhole_history');
                setShowHistory(false);
              }}
              className="mt-4 w-full py-2 border border-white/20 hover:border-red-400/40 hover:text-red-400 text-white/60 text-xs transition-all backdrop-blur-sm"
              style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em" }}
            >
              Clear History
            </button>
          </div>
        )}

        {/* Journey Stats Dashboard */}
        {showStats && journeyHistory.length > 0 && (
          <div className="absolute bg-black/90 backdrop-blur-xl w-80 pointer-events-auto animate-luxury-fade-in" style={{
            border: "1px solid rgba(255, 157, 35, 0.2)",
            boxShadow: "0 0 40px rgba(255, 157, 35, 0.15)",
            padding: "var(--space-8)",
            bottom: "calc(var(--space-8) * 2 + 48px)",
            right: "var(--space-10)",
            borderRadius: "var(--radius)"
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-6)" }}>
              <h3 className="text-sm" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em", color: "var(--accent)" }}>Journey Analytics</h3>
              <button
                onClick={() => setShowStats(false)}
                className="text-white/40 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Total Journeys */}
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                <span className="text-xs text-white/60" style={{ letterSpacing: "0.05em" }}>Total Journeys</span>
                <span className="text-2xl font-heading" style={{ color: "var(--accent)" }}>{journeyCount}</span>
              </div>

              {/* Current Streak */}
              {streak > 0 && (
                <div className="flex items-center justify-between p-3" style={{ background: "linear-gradient(to right, rgba(255, 157, 35, 0.1), transparent)", border: "1px solid rgba(255, 157, 35, 0.2)" }}>
                  <span className="text-xs text-white/60" style={{ letterSpacing: "0.05em" }}>Current Streak</span>
                  <span className="text-2xl font-heading" style={{ color: "var(--accent)" }}>{streak} 🔥</span>
                </div>
              )}

              {/* Most Visited Category */}
              <div className="p-3 bg-white/5 border border-white/10">
                <span className="text-xs text-white/60 block mb-2" style={{ letterSpacing: "0.05em" }}>Category Breakdown</span>
                <div className="space-y-2">
                  {Object.entries(
                    journeyHistory.reduce((acc, journey) => {
                      const hint = journey.hint;
                      acc[hint] = (acc[hint] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-[10px] text-white/50">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1 bg-white/10 w-20 overflow-hidden">
                          <div
                            className="h-full"
                            style={{ width: `${(count / journeyHistory.length) * 100}%`, background: "var(--accent)" }}
                          />
                        </div>
                        <span className="text-[10px] font-mono w-6" style={{ color: "var(--accent)" }}>{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last Journey Time */}
              {journeyHistory.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                  <span className="text-xs text-white/60" style={{ letterSpacing: "0.05em" }}>Last Journey</span>
                  <span className="text-xs text-white/40 font-mono">
                    {Math.floor((Date.now() - journeyHistory[0].timestamp) / 60000) < 1
                      ? 'just now'
                      : `${Math.floor((Date.now() - journeyHistory[0].timestamp) / 60000)}m ago`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes luxuryNebulaDrift {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(40px, -35px) scale(1.08) rotate(2deg); }
          50% { transform: translate(-25px, 50px) scale(0.95) rotate(-1deg); }
          75% { transform: translate(30px, -20px) scale(1.05) rotate(1deg); }
        }

        @keyframes tron-grid {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
        .animate-tron-grid {
          animation: tron-grid 2s linear infinite;
        }

        @keyframes warp-ring {
          0% {
            transform: scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          100% {
            transform: scale(30);
            opacity: 0;
          }
        }
        .animate-warp-ring {
          animation: warp-ring 1.5s ease-out infinite;
        }
        @keyframes luxury-warp-ring {
          0% {
            transform: scale(0.3);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        @keyframes luxury-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.95;
          }
        }
        @keyframes luxury-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        @keyframes screen-shake {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-8px, 6px); }
          20% { transform: translate(6px, -8px); }
          30% { transform: translate(-6px, -6px); }
          40% { transform: translate(8px, 8px); }
          50% { transform: translate(-8px, -6px); }
          60% { transform: translate(6px, 8px); }
          70% { transform: translate(-6px, 6px); }
          80% { transform: translate(8px, -8px); }
          90% { transform: translate(-8px, 8px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        @keyframes fade-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes emoji-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes white-flash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          60% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-white-flash {
          animation: white-flash 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes button-pulse {
          0%, 100% {
            box-shadow: 0 0 50px rgba(255, 157, 35, 0.5), 0 0 100px rgba(255, 157, 35, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 80px rgba(255, 157, 35, 0.8), 0 0 150px rgba(255, 157, 35, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.5);
          }
        }
        .animate-button-pulse {
          animation: button-pulse 2s ease-in-out infinite;
        }

        @keyframes hyperspace-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-hyperspace-progress {
          animation: hyperspace-progress 2.5s ease-out forwards;
        }
        @keyframes lens-flare-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-luxury-warp-ring {
          animation: luxury-warp-ring 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-luxury-pulse {
          animation: luxury-pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-luxury-fade-in {
          animation: luxury-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
        .animate-lens-flare-rotate {
          animation: lens-flare-rotate 8s linear infinite;
        }

        /* Enhanced focus states for accessibility */
        button:focus-visible,
        a:focus-visible,
        input:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
          border-radius: var(--radius-sm);
        }

        .scrollbar-luxury::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-luxury::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .scrollbar-luxury::-webkit-scrollbar-thumb {
          background: rgba(255, 157, 35, 0.3);
          border-radius: 3px;
        }
        .scrollbar-luxury::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 157, 35, 0.5);
        }

        /* Slider styling */
        .slider-gold::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #D4AF37;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
          transition: all 0.2s;
        }
        .slider-gold::-webkit-slider-thumb:hover {
          background: var(--accent);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.8);
          transform: scale(1.2);
        }
        .slider-gold::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #D4AF37;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
          transition: all 0.2s;
        }
        .slider-gold::-moz-range-thumb:hover {
          background: var(--accent);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.8);
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
