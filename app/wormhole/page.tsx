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
  const [starDensity, setStarDensity] = useState(200);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);
  const [mouseTrail, setMouseTrail] = useState<{x: number, y: number, id: number, timestamp: number}[]>([]);
  const [isHyperhyperspace, setIsHyperhyperspace] = useState(false);
  const [screenShake, setScreenShake] = useState({x: 0, y: 0});
  const [selectedCategory, setSelectedCategory] = useState<'interactive' | 'games' | 'weirdFun' | 'music' | 'educational' | 'retro' | 'all'>('all');

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

    // Initialize shimmer particles
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

    // Simulate loading delay for dramatic effect
    setTimeout(() => setIsLoading(false), 1500);
  }, [starDensity]);

  // Animate stars
  useEffect(() => {
    const interval = setInterval(() => {
      setStars((prevStars) =>
        prevStars.map((star) => {
          const baseSpeed = isHyperhyperspace ? 300 : (ludicrousSpeed ? 150 : (boost ? 20 : (isWarping ? 50 : (konamiActive ? 30 : 2))));

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
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isWarping, boost, ludicrousSpeed, konamiActive, isHyperhyperspace]);

  // Animate shimmer particles
  useEffect(() => {
    const interval = setInterval(() => {
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
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, []);

  // Color shift animation
  useEffect(() => {
    const interval = setInterval(() => {
      setColorShift((prev) => (prev + 0.01) % (Math.PI * 2));
    }, 50);
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

  // Fade out old mouse trail particles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMouseTrail(prev => prev.filter(particle => now - particle.timestamp < 1000));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Variable camera shake intensity based on speed (#14)
  useEffect(() => {
    if (!isWarping && !ludicrousSpeed && !isHyperhyperspace) {
      setScreenShake({x: 0, y: 0});
      return;
    }

    // Variable intensity based on speed mode
    const intensity = isHyperhyperspace ? 12 : (ludicrousSpeed ? 6 : 3);
    const frequency = isHyperhyperspace ? 40 : (ludicrousSpeed ? 50 : 60);

    const interval = setInterval(() => {
      setScreenShake({
        x: (Math.random() - 0.5) * intensity,
        y: (Math.random() - 0.5) * intensity,
      });
    }, frequency);

    return () => {
      clearInterval(interval);
      setScreenShake({x: 0, y: 0});
    };
  }, [isWarping, ludicrousSpeed, isHyperhyperspace]);

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

  // Animate burst particles
  useEffect(() => {
    if (burstParticles.length === 0) return;

    const interval = setInterval(() => {
      setBurstParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
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

          // Enter hyperhyperspace mode
          setIsHyperhyperspace(true);

          // After 2.5s of hyperhyperspace, trigger white flash
          setTimeout(() => {
            setIsHyperhyperspace(false);
            setShowWhiteFlash(true);

            // After 1 second of white flash, navigate
            setTimeout(() => {
              const newCount = journeyCount + 1;
              setJourneyCount(newCount);
              localStorage.setItem("wormhole_journeys", newCount.toString());
              window.location.href = destination.url;
            }, 1000);
          }, 2500);

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

  // Calculate chromatic aberration intensity based on speed
  const chromaticIntensity = isHyperhyperspace ? 8 : (ludicrousSpeed ? 4 : (isWarping ? 2 : 0));

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
      className="fixed inset-0 bg-black overflow-hidden"
      style={{
        transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
        transition: isHyperhyperspace ? 'none' : 'transform 0.3s ease',
        filter: chromaticIntensity > 0 ? `drop-shadow(${chromaticIntensity}px 0 0 rgba(255,0,0,0.5)) drop-shadow(-${chromaticIntensity}px 0 0 rgba(0,255,255,0.5))` : 'none',
        boxShadow: getBorderGlow(),
        animation: (isWarping || ludicrousSpeed || isHyperhyperspace) ? 'border-pulse 0.5s ease-in-out infinite' : 'none'
      }}
    >
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-[100] animate-luxury-fade-in">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-7xl animate-luxury-pulse" style={{
                color: "#D4AF37",
                textShadow: "0 0 40px rgba(212, 175, 55, 0.6), 0 0 80px rgba(212, 175, 55, 0.4)",
                filter: "drop-shadow(0 0 40px rgba(212, 175, 55, 0.6))"
              }}>
                ✦
              </div>
            </div>
            <p className="text-white/80 text-xl mb-3" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}>
              Calibrating wormhole...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
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

      {/* Mouse Trail Particles */}
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

      {/* Shimmer Particle Layer */}
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

      {/* Starfield */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <svg width="100%" height="100%" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          {/* Constellation lines connecting nearby stars */}
          {stars.map((star, i) => {
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

          {/* Stars */}
          {stars.map((star) => {
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

      {/* Lens Flare Effect */}
      {isWarping && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative animate-lens-flare-rotate">
            {/* Center bright core */}
            <div className="absolute" style={{
              width: "120px",
              height: "120px",
              marginLeft: "-60px",
              marginTop: "-60px",
              background: "radial-gradient(circle, rgba(212, 175, 55, 0.8) 0%, rgba(244, 162, 89, 0.4) 30%, transparent 70%)",
              filter: "blur(20px)",
            }} />

            {/* Prismatic rays */}
            {[0, 45, 90, 135].map((angle) => (
              <div
                key={angle}
                className="absolute"
                style={{
                  width: "400px",
                  height: "2px",
                  marginLeft: "-200px",
                  marginTop: "-1px",
                  background: `linear-gradient(90deg, transparent, rgba(100, 149, 237, 0.6), rgba(212, 175, 55, 0.8), rgba(138, 43, 226, 0.6), transparent)`,
                  transform: `rotate(${angle}deg)`,
                  filter: "blur(2px)",
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

      {/* Radial blur during acceleration (#13) */}
      {(isWarping || ludicrousSpeed || isHyperhyperspace) && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(isHyperhyperspace ? 12 : (ludicrousSpeed ? 8 : 5))].map((_, i) => (
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
                filter: `blur(${isHyperhyperspace ? '8px' : (ludicrousSpeed ? '6px' : '4px')})`
              }}
            />
          ))}
        </div>
      )}

      {/* Luxury Warp Tunnel Rings */}
      {isWarping && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(6)].map((_, i) => (
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
              }}
            />
          ))}
        </div>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)" }} />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between border-b border-white/5 backdrop-blur-sm bg-black/20" style={{ fontFamily: "var(--font-sans)" }}>
          <div className="flex items-center gap-4">
            <span style={{ color: "#D4AF37", fontSize: "1.1rem" }}>✦</span>
            <span className="text-white/90" style={{ letterSpacing: "0.05em", fontSize: "0.9rem" }}>WORMHOLE</span>
            <span className="text-white/30">·</span>
            <span className="text-white/50" style={{ fontSize: "0.85rem", letterSpacing: "0.02em" }}>Journey #{journeyCount + 1}</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setShowCategoryFilter(!showCategoryFilter);
                playSound('beep');
              }}
              className="pointer-events-auto flex items-center gap-2 text-white/40 hover:text-[#D4AF37] transition-all px-3 py-1.5 rounded border border-white/10 hover:border-[#D4AF37]/30 backdrop-blur-sm"
              title="Category Filters"
              style={{ fontSize: "1rem" }}
            >
              ⚙️
            </button>
            <button
              onClick={toggleSound}
              className="pointer-events-auto flex items-center gap-2 text-white/40 hover:text-[#D4AF37] transition-all px-3 py-1.5 rounded border border-white/10 hover:border-[#D4AF37]/30 backdrop-blur-sm"
              title={soundEnabled ? "Sound ON" : "Sound OFF"}
              style={{ fontSize: "1.1rem" }}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
            <div className="text-white/50" style={{ fontSize: "0.85rem", letterSpacing: "0.08em" }}>
              <span className={isWarping ? "text-[#D4AF37]" : boost ? "text-[#6495ED]" : "text-white/50"}>{isWarping ? "LIGHTSPEED" : boost ? "ACCELERATED" : "SUBLIGHT"}</span>
            </div>
          </div>
        </div>

        {/* Category Filter Panel */}
        {showCategoryFilter && (
          <div className="absolute top-20 right-6 bg-black/95 backdrop-blur-xl border border-[#D4AF37]/20 rounded-lg p-6 max-w-sm pointer-events-auto animate-luxury-fade-in z-50" style={{ boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm text-[#D4AF37]" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}>Category Filters</h3>
              <button onClick={() => setShowCategoryFilter(false)} className="text-white/40 hover:text-white text-xl leading-none">×</button>
            </div>
            <div className="space-y-3 mb-6">
              {Object.entries(enabledCategories).map(([category, enabled]) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => {
                      const newCategories = { ...enabledCategories, [category]: e.target.checked };
                      setEnabledCategories(newCategories);
                      localStorage.setItem("wormhole_categories", JSON.stringify(newCategories));
                      playSound('beep');
                    }}
                    className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer"
                  />
                  <span className="text-white/70 group-hover:text-white/90 transition-colors capitalize" style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem" }}>
                    {category === 'weirdFun' ? 'Weird & Fun' : category}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const allEnabled = Object.keys(enabledCategories).reduce((acc, cat) => ({ ...acc, [cat]: true }), {});
                  setEnabledCategories(allEnabled);
                  localStorage.setItem("wormhole_categories", JSON.stringify(allEnabled));
                  playSound('beep');
                }}
                className="flex-1 px-3 py-2 border border-white/20 hover:border-[#D4AF37]/40 text-white/60 hover:text-white text-xs transition-all"
                style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em" }}
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
                className="flex-1 px-3 py-2 border border-white/20 hover:border-red-400/40 text-white/60 hover:text-red-400 text-xs transition-all"
                style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em" }}
              >
                None
              </button>
            </div>
            <p className="mt-4 text-white/40 text-xs text-center" style={{ fontFamily: "var(--font-sans)", lineHeight: "1.6" }}>
              Select categories for your journey destinations
            </p>

            {/* Star Density Slider */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="block mb-3">
                <span className="text-xs text-[#D4AF37] block mb-2" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}>
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
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider-gold"
                />
              </label>
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>Minimal</span>
                <span>Dense</span>
              </div>
            </div>
          </div>
        )}

        {/* Return to HTM Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 mt-14 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/20 hover:border-[#D4AF37]/40 text-white/60 hover:text-white transition-all pointer-events-auto hover:-translate-x-1"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            fontWeight: "500"
          }}
        >
          ← RETURN HOME
        </Link>

        {/* Center Button */}
        {!isWarping && !showExitWarning && hasSeenWarning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="text-center">
              {/* Category Selector */}
              <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
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
                      className={`px-5 py-2.5 rounded-none border-2 backdrop-blur-sm transition-all duration-300 active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-b from-white/20 to-white/15 border-[#ff9d23] text-white'
                          : 'bg-gradient-to-b from-white/8 to-white/5 border-white/20 text-white/40 hover:border-white/30 hover:from-white/10 hover:to-white/7 hover:scale-105 hover:text-white/60'
                      }`}
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "0.85rem",
                        letterSpacing: "0.02em",
                        fontWeight: isSelected ? "600" : "500",
                        boxShadow: isSelected
                          ? "0 0 0 2px rgba(255,157,35,0.3), 0 0 16px rgba(255,157,35,0.4), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                          : "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
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
                className="px-20 py-6 bg-gradient-to-r from-[#D4AF37] to-[#F4A259] text-black hover:shadow-2xl hover:scale-105 active:scale-95 transition-all rounded-xl border-2 border-[#D4AF37]/50 shadow-xl animate-button-pulse"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "1.1rem",
                  letterSpacing: "0.1em",
                  fontWeight: "600",
                  boxShadow: "0 0 50px rgba(212, 175, 55, 0.5), 0 0 100px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                }}
              >
                ✦ INITIATE WARP SEQUENCE
              </button>
              <p className="mt-10 text-white/50 text-sm" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.03em" }}>
                Click anywhere for acceleration
              </p>
              <p className="mt-2 text-white/30 text-xs font-mono" style={{ letterSpacing: "0.05em" }}>
                SPACE to jump · R to recenter
              </p>
            </div>
          </div>
        )}

        {/* Exit Warning Modal */}
        {showExitWarning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50 animate-luxury-fade-in" style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(0, 0, 0, 0.85)" }}>
            <div className="max-w-2xl w-full mx-4 bg-black/60 backdrop-blur-xl border border-[#D4AF37]/20 shadow-2xl" style={{ boxShadow: "0 0 60px rgba(212, 175, 55, 0.15), inset 0 1px 0 rgba(212, 175, 55, 0.1)" }}>
              {/* Header */}
              <div className="px-10 pt-10 pb-8 border-b border-[#D4AF37]/10">
                <div className="text-center">
                  <div className="text-5xl mb-6" style={{ color: "#D4AF37", textShadow: "0 0 20px rgba(212, 175, 55, 0.3)" }}>✦</div>
                  <h2 className="font-heading text-3xl mb-2" style={{
                    background: "linear-gradient(135deg, #D4AF37 0%, #F4A259 50%, #D4AF37 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "0.02em"
                  }}>
                    Your Journey Awaits
                  </h2>
                  <p className="text-white/50 text-sm mb-5" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.03em" }}>
                    Step into the unknown
                  </p>
                  <div className="h-px mx-auto" style={{
                    width: "120px",
                    background: "linear-gradient(90deg, transparent, #D4AF37, transparent)"
                  }}></div>
                </div>
              </div>

              {/* Body */}
              <div className="px-10 py-10">
                <p className="text-center text-white/90 text-lg mb-12" style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.01em",
                  lineHeight: "2.0"
                }}>
                  You're about to embark on a curated journey through the internet.
                </p>

                <div className="bg-gradient-to-br from-[#D4AF37]/5 to-transparent border border-[#D4AF37]/10 rounded-lg p-10 mb-12">
                  <p className="text-white/60 text-xs uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.1em" }}>
                    What to expect
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <span className="text-[#D4AF37] mt-1">→</span>
                      <p className="text-white/70 text-base" style={{ fontFamily: "var(--font-sans)", lineHeight: "2.0" }}>
                        You'll be transported to an external website beyond our control
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[#D4AF37] mt-1">→</span>
                      <p className="text-white/70 text-base" style={{ fontFamily: "var(--font-sans)", lineHeight: "2.0" }}>
                        Each destination is handpicked and unique
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[#D4AF37] mt-1">→</span>
                      <p className="text-white/70 text-base" style={{ fontFamily: "var(--font-sans)", lineHeight: "2.0" }}>
                        You may discover something extraordinary, peculiar, or wonderfully unexpected
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer justify-center py-6 group">
                  <input
                    type="checkbox"
                    checked={acceptedRisk}
                    onChange={(e) => setAcceptedRisk(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#D4AF37] cursor-pointer"
                  />
                  <span className="text-white/60 group-hover:text-white/90 transition-colors" style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    letterSpacing: "0.01em"
                  }}>
                    I'm ready to explore
                  </span>
                </label>
              </div>

              {/* Footer */}
              <div className="px-10 pb-12 flex gap-6">
                <button
                  onClick={() => {
                    setShowExitWarning(false);
                    setAcceptedRisk(false);
                  }}
                  className="flex-1 px-6 py-4 border border-white/20 text-white/60 hover:border-[#D4AF37]/40 hover:text-white transition-all backdrop-blur-sm"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    letterSpacing: "0.05em",
                    fontWeight: "500"
                  }}
                >
                  ← RETURN
                </button>
                <button
                  onClick={handleWarningAccept}
                  disabled={!acceptedRisk}
                  className={`flex-1 px-6 py-4 transition-all backdrop-blur-sm ${
                    acceptedRisk
                      ? "bg-gradient-to-r from-[#D4AF37] to-[#F4A259] text-black hover:shadow-lg hover:-translate-y-0.5"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  }`}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    letterSpacing: "0.05em",
                    fontWeight: "600",
                    boxShadow: acceptedRisk ? "0 0 30px rgba(212, 175, 55, 0.3)" : "none"
                  }}
                >
                  ENTER WORMHOLE →
                </button>
              </div>

              <p className="pb-6 text-center text-white/40 text-xs" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
                ESC to cancel
              </p>
            </div>
          </div>
        )}

        {/* Luxury Countdown */}
        {isWarping && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ backdropFilter: "blur(12px)", backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
            <div className="text-center px-8">
              {/* Destination Preview Emoji Teaser (#10) */}
              {countdown > 0 && currentDestination && (
                <div className="mb-8 text-8xl animate-flip-in" style={{
                  filter: "drop-shadow(0 0 30px rgba(212, 175, 55, 0.6))",
                  animation: "flip-reveal 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
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
                className="text-9xl mb-12"
                style={{
                  fontFamily: "var(--font-heading)",
                  background: "linear-gradient(135deg, #D4AF37 0%, #F4A259 50%, #D4AF37 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: `0 0 ${40 + (3 - countdown) * 20}px rgba(212, 175, 55, ${0.6 + (3 - countdown) * 0.1}), 0 0 ${80 + (3 - countdown) * 40}px rgba(212, 175, 55, ${0.4 + (3 - countdown) * 0.1})`,
                  filter: `drop-shadow(0 0 ${50 + (3 - countdown) * 25}px rgba(212, 175, 55, ${0.5 + (3 - countdown) * 0.15}))`,
                  animation: countdown === 0 ? 'countdown-zero 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'countdown-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                  transformOrigin: 'center'
                }}
              >
                {countdown}
              </div>
              <p
                className="text-xl mb-8"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.05em",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(212, 175, 55, 0.9) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 30px rgba(255, 255, 255, 0.3)",
                  filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.2))"
                }}
              >
                {currentMessage}
              </p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-[#D4AF37]"></div>
                <p className="text-base text-[#D4AF37]/90" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.06em", fontWeight: "500" }}>
                  {currentHint}
                </p>
                <div className="h-px w-16 bg-gradient-to-l from-transparent via-[#D4AF37]/50 to-[#D4AF37]"></div>
              </div>

              {/* Destination Preview Card */}
              {currentDestination && (
                <div className="mt-6 mx-auto max-w-md bg-black/60 backdrop-blur-md border border-[#D4AF37]/20 rounded-lg p-5 animate-luxury-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.1em" }}>
                      Destination
                    </span>
                    <span className="px-2 py-1 bg-[#D4AF37]/20 text-[#D4AF37] text-xs rounded" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em" }}>
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
              boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)"
            }}>
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-white animate-hyperspace-progress"
                style={{
                  boxShadow: "0 0 30px rgba(212, 175, 55, 0.8)"
                }}
              />
            </div>
          </div>
        )}

        {/* Ludicrous Speed Message */}
        {showLudicrousMessage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100] animate-luxury-fade-in">
            <div className="relative px-16 py-12 bg-black/80 backdrop-blur-2xl border-4 border-[#D4AF37] rounded-2xl" style={{
              boxShadow: "0 0 100px rgba(212, 175, 55, 0.8), 0 0 200px rgba(212, 175, 55, 0.6), inset 0 0 100px rgba(212, 175, 55, 0.2)"
            }}>
              <div className="text-center animate-shake">
                <p className="font-heading text-8xl mb-4" style={{
                  background: "linear-gradient(135deg, #D4AF37 0%, #F4A259 50%, #FF0080 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 0 80px rgba(255, 255, 255, 1), 0 0 120px rgba(212, 175, 55, 1)",
                  filter: "drop-shadow(0 0 80px rgba(212, 175, 55, 1)) drop-shadow(0 0 40px rgba(255, 255, 255, 1))",
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
                  color: isHyperhyperspace ? '#fff' : (ludicrousSpeed ? '#ff9d23' : '#6495ed'),
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
                        ? 'linear-gradient(90deg, #6495ed, #ff9d23, #fff)'
                        : (ludicrousSpeed
                          ? 'linear-gradient(90deg, #6495ed, #ff9d23)'
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
                background: "linear-gradient(90deg, #D4AF37, #6495ED, #BA55D3, #40E0D0, #D4AF37)",
                backgroundSize: "400% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 80px rgba(212, 175, 55, 1)",
                filter: "drop-shadow(0 0 80px rgba(212, 175, 55, 1)) drop-shadow(0 0 120px rgba(100, 149, 237, 0.8))",
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
                    className="text-[#D4AF37] font-mono text-sm px-2 py-1 border border-[#D4AF37]/40 bg-[#D4AF37]/10"
                    style={{ animation: `fade-pulse ${0.5 + i * 0.1}s ease-in-out infinite` }}
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between border-t border-white/5 backdrop-blur-sm bg-black/20" style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}>
          <div className="flex items-center gap-5">
            <span className="text-white/60" style={{ letterSpacing: "0.08em" }}>
              <span className="text-[#D4AF37]">{journeyCount}</span> {journeyCount === 1 ? "Journey" : "Journeys"}
            </span>
            {journeyHistory.length > 0 && (
              <>
                <span className="text-white/20">·</span>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="pointer-events-auto text-white/50 hover:text-[#D4AF37] transition-colors underline decoration-white/20 hover:decoration-[#D4AF37]/40"
                  style={{ letterSpacing: "0.05em" }}
                >
                  {showHistory ? "Hide" : "View"} History
                </button>
                <span className="text-white/20">·</span>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="pointer-events-auto text-white/50 hover:text-[#D4AF37] transition-colors underline decoration-white/20 hover:decoration-[#D4AF37]/40"
                  style={{ letterSpacing: "0.05em" }}
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
          <div className="absolute bottom-20 left-6 bg-black/90 backdrop-blur-xl border border-[#D4AF37]/20 p-5 max-w-md pointer-events-auto animate-luxury-fade-in" style={{ boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-[#D4AF37]" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}>Recent Journeys</h3>
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
                    className="block p-3 border border-white/10 hover:border-[#D4AF37]/50 transition-all bg-white/5 hover:bg-[#D4AF37]/10 backdrop-blur-sm group hover:scale-[1.02] hover:shadow-lg hover:shadow-[#D4AF37]/20"
                    style={{
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#D4AF37] group-hover:text-[#F4A259] transition-colors" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em" }}>{journey.hint}</span>
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
          <div className="absolute bottom-20 right-6 bg-black/90 backdrop-blur-xl border border-[#D4AF37]/20 p-5 w-80 pointer-events-auto animate-luxury-fade-in" style={{ boxShadow: "0 0 40px rgba(212, 175, 55, 0.15)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-[#D4AF37]" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.08em" }}>Journey Analytics</h3>
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
                <span className="text-2xl text-[#D4AF37] font-heading">{journeyCount}</span>
              </div>

              {/* Current Streak */}
              {streak > 0 && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20">
                  <span className="text-xs text-white/60" style={{ letterSpacing: "0.05em" }}>Current Streak</span>
                  <span className="text-2xl text-[#D4AF37] font-heading">{streak} 🔥</span>
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
                            className="h-full bg-[#D4AF37]"
                            style={{ width: `${(count / journeyHistory.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#D4AF37] font-mono w-6">{count}</span>
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
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        @keyframes fade-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes white-flash {
          0% { opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 1; }
        }
        .animate-white-flash {
          animation: white-flash 1s ease-in-out forwards;
        }

        @keyframes button-pulse {
          0%, 100% {
            box-shadow: 0 0 50px rgba(212, 175, 55, 0.5), 0 0 100px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 80px rgba(212, 175, 55, 0.8), 0 0 150px rgba(212, 175, 55, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.5);
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
        .scrollbar-luxury::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-luxury::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .scrollbar-luxury::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }
        .scrollbar-luxury::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
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
          background: #F4A259;
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
          background: #F4A259;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.8);
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
