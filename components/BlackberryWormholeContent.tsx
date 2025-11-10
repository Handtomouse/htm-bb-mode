"use client";

import { useState, useEffect } from "react";

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

export default function BlackberryWormholeContent() {
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
  const [starDensity, setStarDensity] = useState(75);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);
  const [mouseTrail, setMouseTrail] = useState<{x: number, y: number, id: number, timestamp: number}[]>([]);
  const [isHyperhyperspace, setIsHyperhyperspace] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'interactive' | 'games' | 'weirdFun' | 'music' | 'educational' | 'retro' | 'all'>('all');
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Particle burst state
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
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;

      case 'beep':
        oscillator.type = 'square';
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;

      case 'warp':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 1.5);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1.5);
        break;

      case 'abort':
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
        localStorage.removeItem("wormhole_streak");
        setStreak(0);
      }
    }
  }, []);

  // Initialize stars, shimmers, and loading - adapted for BB screen (480x800)
  useEffect(() => {
    const initialStars: Star[] = Array.from({ length: starDensity }, (_, i) => {
      const rand = Math.random();
      const layer = rand < 0.4 ? 0 : (rand < 0.8 ? 1 : 2);

      return {
        id: i,
        x: (Math.random() - 0.5) * 1000,
        y: (Math.random() - 0.5) * 1000,
        z: Math.random() * 2000,
        speed: 2,
        colorPhase: Math.random() * Math.PI * 2,
        layer,
      };
    });
    setStars(initialStars);

    setIsLoading(false);

    // Lazy load shimmer particles
    setTimeout(() => {
      const initialShimmers: Shimmer[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 480,
        y: Math.random() * 800,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() * 60 + 30,
      }));
      setShimmers(initialShimmers);
    }, 100);
  }, [starDensity]);

  // Animate stars using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

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
          const layerMultipliers = [0.5, 1, 1.5];
          const currentSpeed = baseSpeed * layerMultipliers[star.layer] * (konamiActive ? 1.5 : 1);

          let newZ = star.z - currentSpeed;
          let newColorPhase = star.colorPhase + (isWarping ? 0.1 : 0.01);

          if (newZ <= 0) {
            return {
              ...star,
              x: (Math.random() - 0.5) * 1000,
              y: (Math.random() - 0.5) * 1000,
              z: 2000,
              speed: currentSpeed,
              colorPhase: newColorPhase,
              layer: star.layer,
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

  // Animate shimmer particles
  useEffect(() => {
    let animationFrameId: number;

    const animateShimmers = () => {
      setShimmers((prevShimmers) =>
        prevShimmers.map((shimmer) => {
          let newX = shimmer.x + shimmer.vx;
          let newY = shimmer.y + shimmer.vy;
          let newVx = shimmer.vx;
          let newVy = shimmer.vy;

          const width = 480;
          const height = 800;

          if (newX < 0 || newX > width) {
            newX = newX < 0 ? width : 0;
          }
          if (newY < 0 || newY > height) {
            newY = newY < 0 ? height : 0;
          }

          newVx += (Math.random() - 0.5) * 0.05;
          newVy += (Math.random() - 0.5) * 0.05;

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

  // Color shift animation
  useEffect(() => {
    const interval = setInterval(() => {
      setColorShift((prev) => (prev + 0.01) % (Math.PI * 2));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - 240) * 0.05,
        y: (e.clientY - 400) * 0.05,
      });

      if (!isWarping && !showExitWarning) {
        setMouseTrail(prev => {
          const now = Date.now();
          const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: now, timestamp: now }];
          return newTrail.slice(-20);
        });
      }
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta || 0;
      const gamma = e.gamma || 0;

      setMousePos({
        x: (gamma / 90) * 30,
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
    if (isWarping) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setMouseTrail(prev => prev.filter(particle => now - particle.timestamp < 1000));
    }, 50);
    return () => clearInterval(interval);
  }, [isWarping]);

  // Click to boost & double-tap for ludicrous speed
  useEffect(() => {
    const handleClick = () => {
      if (!isWarping && !showExitWarning) {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;

        if (timeSinceLastClick < 300 && timeSinceLastClick > 0) {
          setLudicrousSpeed(true);
          setShowLudicrousMessage(true);
          playSound('warp');
          setTimeout(() => {
            setLudicrousSpeed(false);
            setShowLudicrousMessage(false);
          }, 3000);
        } else {
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

  // Particle burst on speed change
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
          x: 240,
          y: 400,
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

    let chosenCategory: string;

    if (selectedCategory !== 'all') {
      chosenCategory = selectedCategory;
    } else {
      const enabledCats = Object.keys(enabledCategories).filter(cat => enabledCategories[cat]);

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

      const filteredWeights: Record<string, number> = {};
      let totalWeight = 0;
      for (const cat of enabledCats) {
        const weight = categoryWeights[cat] || (1 / enabledCats.length);
        filteredWeights[cat] = weight;
        totalWeight += weight;
      }

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

  // Start warp sequence
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
            setIsHyperhyperspace(true);
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsHyperhyperspace(false);
            await new Promise(resolve => setTimeout(resolve, 300));

            setShowWhiteFlash(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            setIsFadingOut(true);
            await new Promise(resolve => setTimeout(resolve, 200));

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
      const goldTint = Math.sin(colorPhase) * 0.15 + 0.85;
      return `rgba(255, 255, 255, ${goldTint})`;
    }

    const colors = [
      [100, 149, 237],
      [255, 69, 58],
      [255, 214, 10],
      [255, 255, 255],
    ];

    const phase = (colorPhase + colorShift) % (Math.PI * 2);
    const colorIndex = Math.floor((phase / (Math.PI * 2)) * 4);
    const [r, g, b] = colors[colorIndex];

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: "#0b0b0b",
        transition: 'opacity 0.2s ease',
        animation: isHyperhyperspace ? 'screen-shake 0.1s infinite' : 'none',
        opacity: isFadingOut ? 0 : 1
      }}
    >
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-[100]" style={{ background: "#0b0b0b" }}>
          <div className="text-center">
            <div style={{
              fontSize: "3rem",
              color: "#ff9d23",
              textShadow: "0 0 40px rgba(255, 157, 35, 0.6)",
              animation: "pulse 2s ease-in-out infinite"
            }}>
              ✦
            </div>
            <p style={{
              fontFamily: "monospace",
              letterSpacing: "0.08em",
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.8)",
              marginTop: "1.5rem"
            }}>
              Calibrating wormhole...
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ff9d23", animationDelay: "0s" }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ff9d23", animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#ff9d23", animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Nebula background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(ellipse at 15% 25%, rgba(255, 157, 35, 0.15), transparent 45%),
              radial-gradient(ellipse at 85% 75%, rgba(100, 149, 237, 0.18), transparent 50%)
            `,
            animation: "nebula-rotate-slow 60s linear infinite",
          }}
        />
      </div>

      {/* Mouse Trail Particles */}
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

      {/* Shimmer Particle Layer */}
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

      {/* Starfield - centered at (240, 400) for BB screen */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" viewBox="0 0 480 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* Stars */}
          {stars.filter((star, i) => !isWarping || i % 2 === 0).map((star) => {
            const perspective = 1000;
            const scale = perspective / (perspective + star.z);
            const x = star.x * scale + 240;
            const y = star.y * scale + 400;

            const layerSizeMultipliers = [0.6, 1, 1.4];
            const layerOpacityMultipliers = [0.4, 0.7, 1];

            const brightness = (1 - star.z / 2000) * layerOpacityMultipliers[star.layer];
            const size = Math.max(1, 3 * scale * layerSizeMultipliers[star.layer]);

            const streakMultiplier = isHyperhyperspace ? 15 : (isWarping ? 8 : (boost ? 3 : 1));
            const streakZ = star.z + (star.speed * streakMultiplier);
            const streakScale = perspective / (perspective + streakZ);
            const streakX = star.x * streakScale + 240;
            const streakY = star.y * streakScale + 400;

            const starColor = getStarColor(star.colorPhase);

            return (
              <g key={star.id}>
                {(isHyperhyperspace || isWarping || boost) && (
                  <line
                    x1={streakX}
                    y1={streakY}
                    x2={x}
                    y2={y}
                    stroke={starColor}
                    strokeWidth={size * 0.5}
                    opacity={brightness * 0.8}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill={starColor}
                  opacity={brightness}
                />
              </g>
            );
          })}

          {/* Particle burst */}
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

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)" }} />

      {/* White Flash */}
      {showWhiteFlash && (
        <div className="absolute inset-0 bg-white z-[200]" style={{ animation: "white-flash 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards" }} />
      )}

      {/* Abort Feedback */}
      {showAbortFeedback && (
        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center pointer-events-none z-50">
          <div className="text-center">
            <p className="font-mono text-4xl text-red-500 mb-2 font-bold">WARP ABORTED</p>
            <p className="font-mono text-sm text-white">Returning to normal space...</p>
          </div>
        </div>
      )}

      {/* Konami Code Activation */}
      {konamiActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-center px-4">
            <p className="text-3xl mb-2" style={{
              background: "linear-gradient(90deg, #ff9d23, #6495ED, #BA55D3, #40E0D0, #ff9d23)",
              backgroundSize: "400% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "rainbow 1.5s linear infinite",
              fontWeight: "bold"
            }}>
              ✦ COSMIC MODE ✦
            </p>
            <p className="text-white/80 text-xs" style={{ letterSpacing: "0.1em" }}>
              The universe bends to your will
            </p>
          </div>
        </div>
      )}

      {/* Ludicrous Speed Message */}
      {showLudicrousMessage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]">
          <div className="px-8 py-6 bg-black/80 rounded-xl" style={{
            border: "3px solid #ff9d23",
            boxShadow: "0 0 60px rgba(255, 157, 35, 0.8)"
          }}>
            <p className="text-4xl font-bold mb-2" style={{
              background: "linear-gradient(135deg, #ff9d23 0%, #F4A259 50%, #FF0080 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px rgba(255, 255, 255, 1)"
            }}>
              LUDICROUS SPEED
            </p>
            <p className="text-white text-sm text-center">They've gone to plaid!</p>
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {isWarping && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
          <div className="text-center px-8">
            {countdown > 0 && currentDestination && (
              <div style={{
                fontSize: "4rem",
                filter: "drop-shadow(0 0 30px rgba(255, 157, 35, 0.6))",
                animation: "flip-reveal 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                marginBottom: "2rem"
              }}>
                {currentDestination.category === 'interactive' && '🎮'}
                {currentDestination.category === 'games' && '🎯'}
                {currentDestination.category === 'weirdFun' && '🎪'}
                {currentDestination.category === 'music' && '🎵'}
                {currentDestination.category === 'educational' && '📚'}
                {currentDestination.category === 'retro' && '👾'}
                {currentDestination.category === 'RARE' && '✦'}
              </div>
            )}

            <div
              key={countdown}
              style={{
                fontFamily: "system-ui",
                fontSize: "8rem",
                color: "#ff9d23",
                filter: "drop-shadow(0 0 30px rgba(255, 157, 35, 0.6))",
                animation: countdown === 0 ? 'countdown-zero 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'countdown-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                transformOrigin: 'center',
                marginBottom: "2rem",
                willChange: 'transform'
              }}
            >
              {countdown}
            </div>
            <p style={{
              fontFamily: "monospace",
              letterSpacing: "0.05em",
              fontSize: "1.25rem",
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "2rem"
            }}>
              {currentMessage}
            </p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div style={{ height: "1px", width: "4rem", background: "linear-gradient(to right, transparent, #ff9d23)" }}></div>
              <p style={{ fontFamily: "monospace", letterSpacing: "0.06em", fontWeight: "600", color: "#ff9d23" }}>
                {currentHint}
              </p>
              <div style={{ height: "1px", width: "4rem", background: "linear-gradient(to left, transparent, #ff9d23)" }}></div>
            </div>
            {canAbort && (
              <p className="font-mono text-xs text-white/30 animate-pulse" style={{ letterSpacing: "0.08em" }}>
                ESC to abort
              </p>
            )}
          </div>
        </div>
      )}

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50" style={{
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(11, 11, 11, 0.85)"
        }}>
          <div className="w-full backdrop-blur-xl" style={{
            background: "rgba(11, 11, 11, 0.6)",
            border: "1px solid rgba(255, 157, 35, 0.2)",
            boxShadow: "0 0 60px rgba(255, 157, 35, 0.15)",
            maxWidth: "400px",
            margin: "0 1rem",
            borderRadius: "12px",
            padding: "1.5rem"
          }}>
            <div className="text-center">
              <div style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                color: "#ff9d23",
                textShadow: "0 0 20px rgba(255, 157, 35, 0.3)"
              }}>✦</div>
              <h2 style={{
                fontFamily: "system-ui",
                fontSize: "1.25rem",
                marginBottom: "0.5rem",
                color: "#ff9d23",
                letterSpacing: "0.02em",
                fontWeight: "600"
              }}>
                Your Journey Awaits
              </h2>
              <p style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                marginBottom: "1rem",
                color: "rgba(255, 255, 255, 0.6)"
              }}>
                Step into the unknown
              </p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                lineHeight: "1.6",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "1rem",
                textAlign: "center"
              }}>
                You're about to embark on a curated journey through the internet.
              </p>

              <div style={{
                background: "rgba(255, 157, 35, 0.05)",
                border: "1px solid rgba(255, 157, 35, 0.1)",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem"
              }}>
                <p style={{
                  fontFamily: "monospace",
                  fontSize: "0.625rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase"
                }}>
                  What to expect
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div className="flex items-start" style={{ gap: "0.5rem" }}>
                    <span style={{ color: "#ff9d23", fontSize: "0.75rem" }}>→</span>
                    <p style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: "rgba(255, 255, 255, 0.7)",
                      lineHeight: "1.5"
                    }}>
                      You'll be transported to an external website
                    </p>
                  </div>
                  <div className="flex items-start" style={{ gap: "0.5rem" }}>
                    <span style={{ color: "#ff9d23", fontSize: "0.75rem" }}>→</span>
                    <p style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: "rgba(255, 255, 255, 0.7)",
                      lineHeight: "1.5"
                    }}>
                      Each destination is handpicked and unique
                    </p>
                  </div>
                  <div className="flex items-start" style={{ gap: "0.5rem" }}>
                    <span style={{ color: "#ff9d23", fontSize: "0.75rem" }}>→</span>
                    <p style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: "rgba(255, 255, 255, 0.7)",
                      lineHeight: "1.5"
                    }}>
                      You may discover something extraordinary
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-center justify-center gap-2 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedRisk}
                  onChange={(e) => setAcceptedRisk(e.target.checked)}
                  className="cursor-pointer"
                  style={{ accentColor: "#ff9d23", width: "18px", height: "18px" }}
                />
                <span style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.8)"
                }}>
                  I'm ready to explore
                </span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowExitWarning(false);
                  setAcceptedRisk(false);
                }}
                className="flex-1 transition-all"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  background: "transparent"
                }}
              >
                ← RETURN
              </button>
              <button
                onClick={handleWarningAccept}
                disabled={!acceptedRisk}
                className="flex-1 transition-all"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  background: acceptedRisk
                    ? "linear-gradient(to right, #ff9d23, #FFB84D)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: acceptedRisk ? "#0b0b0b" : "rgba(255, 255, 255, 0.3)",
                  cursor: acceptedRisk ? "pointer" : "not-allowed",
                  boxShadow: acceptedRisk ? "0 0 30px rgba(255, 157, 35, 0.3)" : "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  fontWeight: "600"
                }}
              >
                ENTER →
              </button>
            </div>

            <p className="text-center" style={{
              fontFamily: "monospace",
              fontSize: "0.625rem",
              marginTop: "1rem",
              color: "rgba(255, 255, 255, 0.4)"
            }}>
              ESC to cancel
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      {!isWarping && !isLoading && !showExitWarning && hasSeenWarning && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">
          {/* Category Selector */}
          <div className="flex flex-wrap gap-2 gap-y-2 mb-12 justify-center max-w-full">
            {(['all', 'interactive', 'games', 'weirdFun', 'music', 'educational', 'retro'] as const).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    playSound('beep');
                  }}
                  className="transition-all hover:scale-105 active:scale-95"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "capitalize",
                    background: isSelected ? "#ff9d23" : "rgba(255, 255, 255, 0.1)",
                    color: isSelected ? "#0b0b0b" : "rgba(255, 255, 255, 0.8)",
                    border: `1px solid ${isSelected ? "#ff9d23" : "rgba(255, 255, 255, 0.2)"}`,
                    borderRadius: "8px",
                    padding: "0.5rem 0.75rem",
                    boxShadow: isSelected ? "0 0 20px rgba(255, 157, 35, 0.3)" : "none"
                  }}
                >
                  {cat === 'weirdFun' ? 'Weird' : cat}
                </button>
              );
            })}
          </div>

          {/* Warp Button */}
          <button
            onClick={handleWarpButtonClick}
            className="hover:scale-110 active:scale-95 transition-all group"
            style={{
              fontFamily: "monospace",
              fontSize: "1.125rem",
              letterSpacing: "0.1em",
              fontWeight: "700",
              background: "linear-gradient(135deg, #ff9d23 0%, #FFB84D 100%)",
              color: "#0b0b0b",
              boxShadow: "0 0 40px rgba(255, 157, 35, 0.5)",
              borderRadius: "12px",
              padding: "0.75rem 1.5rem",
              border: "2px solid #ff9d23",
              animation: "button-pulse 2s ease-in-out infinite"
            }}
          >
            <span className="inline-block group-hover:animate-[emoji-rotate_0.6s_ease-in-out]">✦</span> INITIATE WARP
          </button>

          <p style={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: "1rem",
            letterSpacing: "0.05em"
          }}>
            PRESS TO ENGAGE HYPERDRIVE
          </p>

          <button
            onClick={toggleSound}
            className="mt-8 transition-all"
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "6px",
              padding: "0.5rem 1rem",
              background: "rgba(255, 255, 255, 0.05)"
            }}
          >
            {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes nebula-rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
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
        @keyframes flip-reveal {
          0% { transform: rotateY(90deg); opacity: 0; }
          100% { transform: rotateY(0deg); opacity: 1; }
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
        @keyframes white-flash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          60% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes button-pulse {
          0%, 100% {
            box-shadow: 0 0 40px rgba(255, 157, 35, 0.5);
          }
          50% {
            box-shadow: 0 0 60px rgba(255, 157, 35, 0.7);
          }
        }
        @keyframes emoji-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
