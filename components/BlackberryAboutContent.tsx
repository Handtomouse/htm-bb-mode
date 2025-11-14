"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useHapticFeedback } from "@/lib/hooks";
import TypewriterManifesto from "./TypewriterManifesto";
import LuxuryStatCard from "./LuxuryStatCard";
import LuxuryServiceCard from "./LuxuryServiceCard";
import LuxuryCollapsibleSection from "./LuxuryCollapsibleSection";
import LuxuryBelief from "./LuxuryBelief";
import { ACCENT, ACCENT_HOVER, FONTS, STAT_CARD_VARS, type AboutData } from "@/lib/aboutData";

export default function BlackberryAboutContent() {
  const [data, setData] = useState<AboutData | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Scroll tracking states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [aboutParallax, setAboutParallax] = useState(0);
  const [floatingElementsOffset, setFloatingElementsOffset] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  const [typewriterOpacity, setTypewriterOpacity] = useState(1);
  const [headlineOpacity, setHeadlineOpacity] = useState(1);
  const [typewriterScrollProgress, setTypewriterScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Animation completion tracking
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [headlineComplete, setHeadlineComplete] = useState(false);

  // Haptic feedback for touch interactions
  const triggerHaptic = useHapticFeedback();
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [showExitIntent, setShowExitIntent] = useState(false);
  const exitIntentShown = useRef(false);

  const lastScrollTop = useRef(0);
  const rafId = useRef<number | null>(null);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const typewriterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/data/about.json?v=3")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  // Detect mobile/touch devices with debounced resize (Fix #1, #3)
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();

    // Debounce resize handler to 200ms
    let resizeTimer: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 200);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedResize);
    };
  }, []);

  // Show scroll indicator after typewriter completes
  useEffect(() => {
    if (typewriterComplete && headlineComplete) {
      const timeout = setTimeout(() => {
        setShowScrollIndicator(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [typewriterComplete, headlineComplete]);

  // Exit intent detection (desktop only)
  useEffect(() => {
    if (isMobile || exitIntentShown.current) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse moves to top 50px of viewport with upward velocity
      if (e.clientY <= 50 && e.movementY < 0 && !exitIntentShown.current) {
        exitIntentShown.current = true;
        setShowExitIntent(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isMobile]);

  // Enable scroll snap & smooth scroll (Fix #3, #10: desktop only)
  useEffect(() => {
    const scrollableElement = document.querySelector('.scrollable-content') as HTMLElement;
    if (!scrollableElement) return;

    if (isMobile) {
      // Mobile: Disable scroll snap (interferes with momentum), remove smooth scroll
      scrollableElement.style.scrollSnapType = 'none';
      scrollableElement.style.scrollBehavior = 'auto';
    } else {
      // Desktop: Enable proximity snap + smooth scroll for luxurious feel
      scrollableElement.style.scrollSnapType = 'y proximity';
      scrollableElement.style.scrollPaddingTop = '80px';
      scrollableElement.style.scrollBehavior = 'smooth';
    }

    return () => {
      scrollableElement.style.scrollSnapType = '';
      scrollableElement.style.scrollPaddingTop = '';
      scrollableElement.style.scrollBehavior = '';
    };
  }, [isMobile]);

  const handleTypewriterComplete = useCallback(() => {
    setTypewriterComplete(true);
  }, []);

  const handleHeadlineComplete = useCallback(() => {
    setHeadlineComplete(true);
  }, []);

  // Scroll handler with RAF optimization
  const handleScroll = useCallback(() => {
    // Cancel any pending animation frame to ensure only one runs per scroll
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    // Schedule calculations for next frame (batches multiple scroll events)
    rafId.current = requestAnimationFrame(() => {
      const scrollableElement = document.querySelector('.scrollable-content');
      if (scrollableElement) {
        const scrollTop = scrollableElement.scrollTop;
        const scrollHeight = scrollableElement.scrollHeight - scrollableElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(progress);

        // Back-to-top button after 300px
        setShowBackToTop(scrollTop > 300);

        // Floating CTA after Stats section (~2000px)
        setShowFloatingCTA(scrollTop > 2000);

        // Section detection for navigation dots
        const sections = ["value", "stats", "services", "process", "proof", "details", "now", "contact"];
        let currentSection = "";
        for (const sectionId of sections) {
          const section = document.getElementById(sectionId);
          if (section) {
            const rect = section.getBoundingClientRect();
            // Section is active if its top is above middle of viewport and bottom is below middle
            if (rect.top <= scrollableElement.clientHeight / 2 && rect.bottom >= scrollableElement.clientHeight / 2) {
              currentSection = sectionId;
              break;
            }
          }
        }
        setActiveSection(currentSection);

        // Hero fade: 300px→1000px range (gentler exit)
        const heroFadeStart = 300;
        const heroFadeEnd = 1000;
        const heroFade = Math.max(0, Math.min(1, 1 - (scrollTop - heroFadeStart) / (heroFadeEnd - heroFadeStart)));
        setHeroOpacity(heroFade);

        // Typewriter scroll progress & fade: PIXEL-BASED (predictable across all screens)
        if (typewriterRef.current) {
          const typewriterRect = typewriterRef.current.getBoundingClientRect();
          const viewportHeight = scrollableElement.clientHeight;
          const typewriterTop = typewriterRect.top;
          const typewriterBottom = typewriterRect.bottom;

          // Calculate section center distance from viewport center (pixel-based)
          const sectionCenter = typewriterTop + (typewriterRect.height / 2);
          const viewportCenter = viewportHeight / 2;
          const distanceFromCenter = sectionCenter - viewportCenter;

          // TYPING ANIMATION: Based on distance from center (not viewport %)
          // Starts when section center is 500px below viewport center
          // Completes when section center is 50px below viewport center
          // Total range: 450px of scrolling (smoother, more luxurious)
          let scrollProgress = 0;

          if (distanceFromCenter > 500) {
            // Section center more than 500px below viewport center - not started
            scrollProgress = 0;
          } else if (distanceFromCenter > 50) {
            // Section center between 500px below and 50px below center
            // Progress from 0 to 1 over 450px of scrolling
            scrollProgress = (500 - distanceFromCenter) / 450;
          } else {
            // Section center at 50px below viewport center or higher - complete
            scrollProgress = 1;
          }

          const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
          setTypewriterScrollProgress(clampedProgress);

          // FADE OPACITY: Based on absolute pixels from viewport top (not %)
          // Fades out only when section is within 40px of top edge
          let fadeOpacity = 1;

          if (typewriterTop > viewportHeight) {
            // Section completely below viewport
            fadeOpacity = 0;
          } else if (typewriterBottom < 0) {
            // Section completely above viewport
            fadeOpacity = 0;
          } else if (typewriterTop > viewportHeight - 100) {
            // Section entering from bottom - fade in over 100px
            fadeOpacity = (viewportHeight - typewriterTop) / 100;
          } else if (typewriterTop < 40 && typewriterTop > 0) {
            // Section within 40px of top - fade out
            fadeOpacity = typewriterTop / 40;
          } else {
            // Section fully visible in viewport
            fadeOpacity = 1;
          }

          setTypewriterOpacity(Math.max(0, Math.min(1, fadeOpacity)));

          // Headline opacity: Fade in when typewriter ≥ 70% complete (smoother reveal)
          const headlineFade = clampedProgress >= 0.7 ? Math.min(1, (clampedProgress - 0.7) / 0.25) : 0;
          setHeadlineOpacity(headlineFade);
        }

        // Parallax: move UP to create separation
        const parallaxOffset = Math.max(scrollTop * -0.2, -20);
        setAboutParallax(parallaxOffset);

        // Floating elements parallax
        setFloatingElementsOffset(scrollTop * 0.3);

        lastScrollTop.current = scrollTop;
      }
    });
  }, []);

  // Attach scroll listener with RAF cleanup
  useEffect(() => {
    const scrollableElement = document.querySelector('.scrollable-content');
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
      return () => {
        scrollableElement.removeEventListener('scroll', handleScroll);
        // Cancel any pending RAF on unmount
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
        }
      };
    }
  }, [handleScroll]);

  // Fix mobile viewport height (100vh issue with address bar)
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const scrollToTop = () => {
    const scrollableElement = document.querySelector('.scrollable-content');
    if (scrollableElement) {
      scrollableElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[20px] text-white/70"
          style={{ fontFamily: "VT323, monospace" }}
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative w-full h-full bg-black overflow-hidden" role="main" aria-label="About HandToMouse" style={{ fontFamily: "VT323, monospace" }}>
      {/* Scroll Progress Gradient Overlay */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,157,35,${scrollProgress * 0.0005}) 0%, transparent 70%)`,
          opacity: Math.min(scrollProgress / 100, 0.5)
        }}
      />

      {/* Optimized Parallax Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(255,157,35,0.06) 0%, transparent 60%)',
          transform: `translateY(${floatingElementsOffset * 0.3}px)`,
          willChange: 'transform'
        }}
      />

      {/* Optimized Floating geometric elements */}
      <div
        className="fixed w-32 h-32 border border-[#ff9d23]/8 pointer-events-none"
        style={{
          top: '15%',
          left: '8%',
          transform: `translateY(${floatingElementsOffset * 0.8}px) rotate(45deg)`,
          willChange: 'transform'
        }}
      />
      <div
        className="fixed w-20 h-20 border border-[#ff9d23]/6 pointer-events-none"
        style={{
          bottom: '25%',
          right: '12%',
          transform: `translateY(${floatingElementsOffset * 0.6}px) rotate(30deg)`,
          willChange: 'transform',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
        }}
      />

      {/* Skip Links for Keyboard Navigation */}
      <div className="sr-only focus-within:not-sr-only">
        <a
          href="#services"
          className="fixed top-4 left-4 z-[100] bg-[#ff9d23] text-black px-4 py-2 text-[14px] font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#ff9d23] focus:ring-offset-2 focus:ring-offset-black"
        >
          Skip to Services
        </a>
        <a
          href="#details"
          className="fixed top-4 left-[180px] z-[100] bg-[#ff9d23] text-black px-4 py-2 text-[14px] font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#ff9d23] focus:ring-offset-2 focus:ring-offset-black"
        >
          Skip to Details
        </a>
        <a
          href="#contact"
          className="fixed top-4 left-[360px] z-[100] bg-[#ff9d23] text-black px-4 py-2 text-[14px] font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-[#ff9d23] focus:ring-offset-2 focus:ring-offset-black"
        >
          Skip to Contact
        </a>
      </div>

      {/* ARIA Live Region for Screen Readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {scrollProgress > 90 && "Near end of page"}
        {scrollProgress > 50 && scrollProgress <= 90 && "Halfway through page"}
        {activeSection && `Currently viewing ${activeSection} section`}
      </div>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#ff9d23]/20 z-50"
        style={{ transformOrigin: '0%' }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[#ff9d23] via-[#FFB84D] to-[#ff9d23]"
          style={{
            width: `${scrollProgress}%`,
            boxShadow: '0 0 10px rgba(255,157,35,0.6)'
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </motion.div>

      {/* Floating CTA Button */}
      {showFloatingCTA && data && (
        <motion.a
          href={`mailto:${data.contact.email}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,157,35,0.9)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => triggerHaptic(15)}
          className="fixed bottom-8 left-8 z-50 border-2 border-[#ff9d23] bg-[#ff9d23] px-6 py-3 text-[14px] md:text-[16px] font-bold text-black uppercase tracking-wide hover:bg-[#FFB84D] transition-all duration-300 touch-manipulation shadow-lg"
          aria-label="Get in touch"
        >
          Get in Touch →
        </motion.a>
      )}

      {/* Section Navigation Dots */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3" aria-label="Section navigation">
        {[
          { id: "value", label: "Value" },
          { id: "stats", label: "Stats" },
          { id: "services", label: "Services" },
          { id: "process", label: "Process" },
          { id: "proof", label: "Proof" },
          { id: "details", label: "Details" },
          { id: "now", label: "Now" },
          { id: "contact", label: "Contact" }
        ].map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
              triggerHaptic(10);
            }}
            className="group relative flex items-center"
            aria-label={`Go to ${section.label} section`}
          >
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[11px] text-[#ff9d23] uppercase tracking-wider font-medium whitespace-nowrap bg-black/80 px-2 py-1 border border-[#ff9d23]/30">
              {section.label}
            </span>
            <div
              className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                activeSection === section.id
                  ? "bg-[#ff9d23] border-[#ff9d23] w-3 h-3 shadow-[0_0_8px_rgba(255,157,35,0.8)]"
                  : "bg-transparent border-[#ff9d23]/40 group-hover:border-[#ff9d23] group-hover:bg-[#ff9d23]/50"
              }`}
            />
          </a>
        ))}
      </nav>

      {/* Exit Intent Popup */}
      {showExitIntent && data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowExitIntent(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl mx-4 border-2 border-[#ff9d23] bg-black p-8 md:p-12 shadow-[0_0_80px_rgba(255,157,35,0.4)]"
          >
            <button
              onClick={() => setShowExitIntent(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-[#ff9d23] text-[24px] transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            <h3 className="text-[28px] md:text-[36px] font-bold text-[#ff9d23] uppercase tracking-[0.08em] mb-6">
              Wait — One Last Thing
            </h3>
            <p className="text-[18px] md:text-[22px] text-white/90 leading-relaxed mb-8">
              {data.contact.status} • {data.contact.responseTime}
            </p>
            <p className="text-[16px] md:text-[18px] text-white/70 leading-relaxed mb-8">
              Most projects start with a 30-min discovery call. No pitch, no pressure — just clarity on whether we're a fit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a
                href={`mailto:${data.contact.email}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => triggerHaptic(15)}
                className="flex-1 border-2 border-[#ff9d23] bg-[#ff9d23] px-8 py-4 text-center text-[16px] font-bold text-black uppercase tracking-wide hover:bg-[#FFB84D] transition-all duration-300"
              >
                Book a Call →
              </motion.a>
              <button
                onClick={() => setShowExitIntent(false)}
                className="flex-1 border-2 border-[#ff9d23]/40 bg-transparent px-8 py-4 text-[16px] font-bold text-[#ff9d23] uppercase tracking-wide hover:border-[#ff9d23] hover:bg-[#ff9d23]/10 transition-all duration-300"
              >
                Keep Browsing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            triggerHaptic(15);
            scrollToTop();
          }}
          className="fixed bottom-8 right-8 z-50 border-2 border-[#ff9d23] bg-[#ff9d23] p-4 hover:bg-[#FFB84D] active:bg-[#ff8800] hover:shadow-[0_0_40px_rgba(255,157,35,0.8)] transition-all duration-300 touch-manipulation"
          aria-label="Scroll to top"
        >
          <span className="text-black text-[24px]">↑</span>
        </motion.button>
      )}

      {/* Main Content */}
      <div className="w-full px-6 md:px-12 lg:px-20">
        {/* Hero Section with Sticky Title & Floating Icon */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
          style={{ scrollSnapAlign: 'center' }}
        >
          <div
            className="sticky top-0 h-[50vh] flex flex-col items-center justify-center text-center gap-12 md:gap-16"
            style={{
              marginTop: '-72px',
              opacity: heroOpacity,
              transform: `translateY(${aboutParallax}px) scale(${1 + (scrollProgress * 0.001)})`,
              transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
              pointerEvents: heroOpacity < 0.5 ? 'none' : 'auto',
              zIndex: heroOpacity < 0.5 ? -1 : 20,
              visibility: heroOpacity < 0.05 ? 'hidden' : 'visible'
            }}
          >
            <div className="relative space-y-6">
              {/* Fragmented Luxury Typography */}
              <motion.h1
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="relative text-[56px] md:text-[72px] lg:text-[88px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] leading-none select-none"
                style={{
                  fontFamily: 'var(--font-mono)',
                  textShadow: '0 0 40px rgba(255,157,35,0.2)'
                }}
              >
                {/* Outline layer behind */}
                <span className="absolute inset-0 translate-x-1 translate-y-1 opacity-20" style={{
                  WebkitTextStroke: '2px rgba(255,157,35,0.6)',
                  color: 'transparent'
                }}>
                  ABOUT
                </span>

                {/* Main letters with stagger and gradient */}
                <motion.span
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.2
                      }
                    },
                    hover: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  className="relative flex justify-center"
                >
                  {['A', 'B', 'O', 'U', 'T'].map((letter, i) => (
                    <motion.span
                      key={i}
                      variants={{
                        hidden: {
                          opacity: 0,
                          y: 60,
                          rotateX: -90
                        },
                        visible: {
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          transition: {
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1]
                          }
                        },
                        hover: {
                          y: i % 2 === 0 ? -3 : 3,
                          transition: { duration: 0.2 }
                        }
                      }}
                      className="inline-block"
                      style={{
                        background: 'linear-gradient(135deg, #ff9d23 0%, #FFB84D 50%, #ff9d23 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'brightness(1.1)'
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.span>

                {/* Breathing scale animation */}
                <motion.span
                  animate={{
                    scaleX: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 pointer-events-none"
                />
              </motion.h1>

              {/* Read Time Indicator */}
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-[14px] md:text-[16px] text-white/60 uppercase tracking-[0.15em] font-medium"
              >
                ~3 min read
              </motion.p>
            </div>

            {/* Scroll indicator - HTM icon with subtle pulse */}
            <motion.div
              className="mt-16 md:mt-20"
              animate={{
                y: [0, 12, 0],
                opacity: [0.6, 0.8, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(255,157,35,0.3))'
              }}
            >
              <Image
                src="/logos/HTM-LOGO-ICON-01.svg"
                alt="Scroll down"
                width={80}
                height={80}
                className="h-20 w-20 md:h-24 md:w-24 opacity-70 rotate-90"
                priority
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Value Proposition - Direct & Immediate */}
        <section id="value" className="min-h-[50vh] md:min-h-[60vh] flex items-center justify-center py-16 md:py-20 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto text-center space-y-12 md:space-y-16 px-8 md:px-16"
          >
            {/* Typewriter Headline */}
            <div ref={typewriterRef}>
              <TypewriterManifesto
                text="Everyone's chasing new — we chase different."
                onComplete={handleTypewriterComplete}
                scrollProgress={typewriterScrollProgress}
                opacity={typewriterOpacity}
              />
            </div>

            {/* 3-Line Approach */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-6 text-[16px] md:text-[20px] leading-[1.8] max-w-3xl mx-auto"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'rgba(255,255,255,0.8)'
              }}
            >
              <p>I work where ideas meet culture — finding the small, precise angle no one else has noticed yet.</p>
              <p>The work: making something that still feels right in <span className="text-[#ff9d23]">five years</span>, not just five minutes.</p>
              <p>The method: research, reference, and restraint — knowing what to leave out.</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Grid - Social Proof */}

          <section
            id="stats"
            aria-label="Company statistics"
            className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 py-32 scroll-mt-20"
            style={{ minHeight: 'calc(var(--vh, 1vh) * 100)', ...STAT_CARD_VARS }}
          >
          {/* Improvement #6: Subtle radial gradient backdrop */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(255,157,35,0.02) 50%, transparent 100%)', opacity: 0.4 }} />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[40px] md:text-[48px] lg:text-[64px] font-bold uppercase text-center mb-12 md:mb-16 lg:mb-20"
            style={{
              fontFamily: 'var(--font-mono)',
              color: '#ff9d23',
              letterSpacing: '0.15em',
              textShadow: '0 0 30px rgba(255,157,35,0.3), 0 0 60px rgba(255,157,35,0.1)'
            }}
          >
            By The Numbers
          </motion.h2>
          <div
            className="relative w-full max-w-6xl mx-auto"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--card-gap)',
              alignItems: 'stretch'
            }}
          >
            <LuxuryStatCard label="Projects" value={data.stats.projects} delay={0} index={0} />
            <LuxuryStatCard label="Retention" value={data.stats.retention} delay={0.1} index={1} />
            <LuxuryStatCard label="Repeat Clients" value={data.stats.repeatClients} delay={0.2} index={2} />
            <LuxuryStatCard label="Years Active" value="6" delay={0.3} index={3} />
            <LuxuryStatCard label="Response" value={data.stats.avgResponse} delay={0.4} index={4} />
            <LuxuryStatCard label="Industries" value={data.stats.industries} delay={0.5} index={5} />
          </div>
          </section>


        {/* Services Grid */}

          <section id="services" aria-label="Our services" className="min-h-screen py-20 flex flex-col items-center justify-center space-y-12 md:space-y-16 scroll-mt-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-8 z-10 text-[28px] md:text-[36px] lg:text-[48px] font-bold text-[#ff9d23] uppercase text-center tracking-[0.08em] bg-black/90 py-4"
          >
            What We Do
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {data.services.map((service, idx) => (
              <LuxuryServiceCard key={idx} service={service} delay={idx * 0.25} />
            ))}
          </div>
          {/* Mini CTA - Interim Conversion Opportunity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-12 md:mt-16"
          >
            <motion.a
              href={`mailto:${data.contact.email}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block border-2 border-[#ff9d23] bg-[#ff9d23]/10 px-8 py-4 text-[18px] md:text-[22px] font-bold text-[#ff9d23] uppercase tracking-wide hover:bg-[#ff9d23]/20 transition-all duration-300"
            >
              {scrollProgress < 40 ? "Ready to start? →" : scrollProgress < 70 ? "Still interested? →" : "Let's talk →"}
            </motion.a>
          </motion.div>
          </section>


        {/* Process - Standalone Section */}
        <section id="process" className="py-16 md:py-20 flex flex-col items-center justify-center scroll-mt-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[28px] md:text-[36px] lg:text-[48px] font-bold text-[#ff9d23] uppercase text-center tracking-[0.08em] mb-12 md:mb-16"
          >
            How I Work
          </motion.h2>

          <div className="max-w-4xl mx-auto px-8 md:px-16 space-y-6">
            {data.process.steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-6 border-l-2 border-[#ff9d23]/40 pl-6 py-3 hover:border-[#ff9d23] hover:pl-8 transition-all duration-700"
              >
                <span className="text-[28px] text-[#ff9d23]">{step.num}</span>
                <div>
                  <div className="font-bold text-[18px] md:text-[22px] text-white leading-relaxed tracking-wide">
                    {step.title} • <span className="text-[#ff9d23]">{step.promise}</span>
                  </div>
                  <div className="text-[16px] md:text-[18px] text-white/60 mt-2">{step.duration}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>


        {/* Proof - Client Highlights & Industries */}
        <section id="proof" className="py-16 md:py-20 flex flex-col items-center justify-center scroll-mt-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[28px] md:text-[36px] lg:text-[48px] font-bold text-[#ff9d23] uppercase text-center tracking-[0.08em] mb-12 md:mb-16"
          >
            Proof
          </motion.h2>

          <div className="max-w-5xl mx-auto px-8 md:px-16 space-y-10 md:space-y-12">
            {data.proof.highlights.map((highlight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="border-l-4 border-[#ff9d23]/60 pl-6 md:pl-8 py-4"
              >
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-3">
                  <h3 className="text-[24px] md:text-[28px] font-bold text-white tracking-wide">
                    {highlight.label}
                  </h3>
                  <span className="text-[14px] md:text-[16px] text-[#ff9d23] uppercase tracking-wider">
                    {highlight.duration}
                  </span>
                </div>

                <p className="text-[16px] md:text-[20px] text-white/80 leading-relaxed mb-4">
                  {highlight.line}
                </p>

                {highlight.quote && (
                  <p className="text-[16px] md:text-[18px] text-[#ff9d23]/90 italic leading-relaxed">
                    {highlight.quote}
                  </p>
                )}
              </motion.div>
            ))}

            {/* Client Logos */}
            {data.proof.clients && data.proof.clients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-center mt-12 pt-8 border-t border-white/10"
              >
                <p className="text-[13px] md:text-[15px] text-white/40 uppercase tracking-[0.15em] mb-6">
                  Trusted by
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                  {data.proof.clients.map((client, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
                      className="text-[18px] md:text-[22px] font-bold text-white/60 uppercase tracking-wide hover:text-[#ff9d23] transition-colors duration-300"
                    >
                      {client}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Industries Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-center mt-8 pt-8 border-t border-white/20"
            >
              <p className="text-[16px] md:text-[20px] text-white/70 uppercase tracking-wider">
                <span className="text-[#ff9d23] font-bold text-[24px] md:text-[28px]">{data.stats.industries}</span> Industries
                <span className="block mt-2 text-[14px] md:text-[16px] text-white/50 normal-case tracking-normal">
                  Hospitality • Fashion • E-commerce • Health • Tech • Finance • Arts • Education
                </span>
              </p>
            </motion.div>
          </div>
        </section>


        {/* Collapsible Sections */}

          <section id="details" className="min-h-screen py-20 flex flex-col items-center justify-center space-y-8 md:space-y-12 scroll-mt-20">
            {/* Expand/Collapse All Toggle */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              onClick={() => {
                const allOpen = openSection === "all";
                setOpenSection(allOpen ? null : "all");
              }}
              className="border border-[#ff9d23]/40 bg-[#ff9d23]/5 px-6 py-3 text-[14px] md:text-[16px] text-[#ff9d23] uppercase tracking-wide hover:bg-[#ff9d23]/10 hover:border-[#ff9d23] transition-all duration-300"
            >
              {openSection === "all" ? "Collapse all ▲" : "Expand all details ▼"}
            </motion.button>

            <LuxuryCollapsibleSection
              title="Operations & Setup"
              icon="⚙️"
              isOpen={openSection === "ops" || openSection === "all"}
              onToggle={() => setOpenSection(openSection === "ops" ? null : "ops")}
            >
              <div className="space-y-10">
              <div>
                <h4 className="text-[20px] md:text-[24px] font-bold text-white mb-6 uppercase tracking-[0.08em]">Operations</h4>
                <div className="space-y-4">
                  {data.ops.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.12, duration: 0.6 }}
                      className="flex items-start gap-4"
                    >
                      <span className="text-[20px] text-[#ff9d23] flex-shrink-0">{item.icon}</span>
                      <p className="text-[16px] md:text-[20px] text-white/90 leading-relaxed">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/20 pt-8">
                <p className="text-[16px] md:text-[20px] text-white/80 leading-loose">{data.setup.line}</p>
              </div>
              </div>
            </LuxuryCollapsibleSection>

            <LuxuryCollapsibleSection
              title="Philosophy"
              icon="💭"
              isOpen={openSection === "philosophy" || openSection === "all"}
              onToggle={() => setOpenSection(openSection === "philosophy" ? null : "philosophy")}
            >
              <div className="space-y-8">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="text-[18px] md:text-[24px] text-white/90 leading-[1.8]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {data.hero.subline}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="border-l-4 border-[#ff9d23]/60 pl-6 py-4"
                >
                  <p className="text-[16px] md:text-[20px] text-[#ff9d23]/90 leading-relaxed italic">
                    {data.hero.origin}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-4 pt-6 border-t border-white/20"
                >
                  <h4 className="text-[18px] md:text-[22px] font-bold text-white uppercase tracking-[0.08em]">Principles</h4>
                  {data.hero.principles.map((principle, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (idx * 0.1), duration: 0.6 }}
                      className="flex items-start gap-4"
                    >
                      <span className="text-[20px] text-[#ff9d23] flex-shrink-0">{principle.icon}</span>
                      <p className="text-[16px] md:text-[20px] text-white/90 leading-relaxed">{principle.text}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </LuxuryCollapsibleSection>

            <LuxuryCollapsibleSection
              title="Pricing & Terms"
              icon="💰"
              isOpen={openSection === "pricing" || openSection === "all"}
              onToggle={() => setOpenSection(openSection === "pricing" ? null : "pricing")}
            >
              <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <h4 className="text-[20px] md:text-[24px] font-bold text-[#ff9d23] mb-4 tracking-wide">Projects</h4>
                <p className="text-[28px] md:text-[36px] font-bold text-white mb-3">{data.pricing.projects}</p>
                <p className="text-[16px] md:text-[18px] text-white/60 leading-relaxed">{data.pricing.projectLength}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h4 className="text-[20px] md:text-[24px] font-bold text-[#ff9d23] mb-4 tracking-wide">Retainers</h4>
                <p className="text-[28px] md:text-[36px] font-bold text-white mb-3">{data.pricing.retainers}</p>
                <p className="text-[16px] md:text-[18px] text-white/60 leading-relaxed">{data.pricing.retainerDetails}</p>
              </motion.div>

              <div className="border-t border-white/20 pt-8">
                <h4 className="text-[18px] md:text-[20px] font-bold text-white mb-4 uppercase tracking-[0.08em]">Payment Terms</h4>
                <p className="text-[16px] md:text-[20px] text-white mb-3 leading-relaxed">{data.pricing.terms}</p>
                <p className="text-[14px] md:text-[16px] text-white/60 leading-relaxed">{data.pricing.termsDetail}</p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className="border-2 border-[#ff9d23]/50 bg-gradient-to-br from-[#ff9d23]/10 to-[#ff9d23]/5 p-8 md:p-10 hover:shadow-[0_0_40px_rgba(255,157,35,0.5)] transition-all duration-700"
              >
                <p className="text-[18px] md:text-[24px] text-white font-bold leading-relaxed">{data.pricing.guarantee}</p>
              </motion.div>
              </div>
            </LuxuryCollapsibleSection>

            <LuxuryCollapsibleSection
              title="Who I Work With"
              icon="🤝"
              isOpen={openSection === "who" || openSection === "all"}
              onToggle={() => setOpenSection(openSection === "who" ? null : "who")}
            >
              <div className="space-y-10">
              <div>
                <h4 className="text-[20px] md:text-[24px] font-bold text-white mb-6 uppercase tracking-[0.08em]">Best For</h4>
                <div className="space-y-4">
                  {data.hero.principles.map((principle, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.12, duration: 0.6 }}
                      className="flex items-start gap-4"
                    >
                      <span className="text-[20px] text-[#ff9d23] flex-shrink-0">✓</span>
                      <p className="text-[16px] md:text-[20px] text-white/90 leading-relaxed">{principle.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[20px] md:text-[24px] font-bold text-white mb-6 uppercase tracking-[0.08em]">Not Right For</h4>
                <div className="space-y-4">
                  {data.notRightFor.items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.12, duration: 0.6 }}
                      className="flex items-start gap-4"
                    >
                      <span className="text-[20px] text-white/50 flex-shrink-0">{item.icon}</span>
                      <p className="text-[16px] md:text-[20px] text-white/70 leading-relaxed">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/20 pt-8">
                <div className="flex flex-wrap gap-3">
                  {data.proof.highlights.map((highlight, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.08, duration: 0.4 }}
                      whileHover={{ scale: 1.05, borderColor: ACCENT }}
                      className="border border-[#ff9d23]/30 bg-[#ff9d23]/10 px-4 py-2 text-[14px] md:text-[16px] text-[#ff9d23] font-medium uppercase tracking-wide cursor-default transition-all duration-300"
                    >
                      {highlight.label}
                    </motion.span>
                  ))}
                </div>
              </div>
              </div>
            </LuxuryCollapsibleSection>
          </section>
        

        {/* Now Block - Full Width Accent */}

          <section id="now" className="min-h-[50vh] flex items-center justify-center scroll-mt-20">
            <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl mx-auto border-2 border-[#ff9d23] bg-gradient-to-br from-[#ff9d23]/10 to-transparent p-10 md:p-16 space-y-6 hover:shadow-[0_0_60px_rgba(255,157,35,0.6)] transition-shadow duration-700"
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[32px] md:text-[48px] font-bold text-[#ff9d23] uppercase tracking-[0.08em]"
            >
              Now
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[16px] md:text-[18px] text-white/60 tracking-wide"
            >
              Last updated: {data.now.lastUpdated}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[18px] md:text-[24px] text-white leading-loose"
            >
              {data.now.currentFocus}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[20px] md:text-[28px] text-[#ff9d23] font-bold tracking-wide"
            >
              {data.now.status}
            </motion.p>

            {/* Social Proof Ticker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="border-t border-[#ff9d23]/30 pt-6 mt-6 overflow-hidden"
            >
              <motion.div
                animate={{ x: [0, -1200] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="flex gap-8 whitespace-nowrap text-[14px] md:text-[16px] text-white/50 uppercase tracking-wider"
              >
                <span>✓ New client onboarded</span>
                <span>•</span>
                <span>✓ Campaign launched for Jac+Jack</span>
                <span>•</span>
                <span>✓ S'WICH expansion strategy complete</span>
                <span>•</span>
                <span>✓ 3 new projects in pipeline</span>
                <span>•</span>
                <span>✓ New client onboarded</span>
                <span>•</span>
                <span>✓ Campaign launched for Jac+Jack</span>
                <span>•</span>
                <span>✓ S'WICH expansion strategy complete</span>
                <span>•</span>
                <span>✓ 3 new projects in pipeline</span>
              </motion.div>
            </motion.div>
            </motion.div>
          </section>
        

        {/* Contact CTA - Full Height */}

          <section id="contact" aria-label="Contact information" role="region" className="relative min-h-[70vh] py-20 flex items-center justify-center scroll-mt-20">
            {/* Background gradient that builds toward CTA */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff9d23]/5 to-[#ff9d23]/10 pointer-events-none" />

            <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative border-4 border-[#ff9d23]/40 bg-gradient-to-b from-black/60 to-black/40 p-16 md:p-24 lg:p-32 text-center space-y-12 max-w-5xl hover:border-[#ff9d23] hover:shadow-[0_0_80px_rgba(255,157,35,0.7)] transition-all duration-700"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-[36px] md:text-[52px] lg:text-[68px] font-black text-white uppercase tracking-[0.08em] leading-tight"
              style={{ textShadow: '0 0 30px rgba(255,157,35,0.3)' }}
            >
              Let's Work Together
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-[20px] md:text-[28px] text-white/90 leading-loose tracking-wide"
            >
              {data.contact.status} • {data.contact.responseTime}
            </motion.p>

            <motion.a
              href={`mailto:${data.contact.email}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                scale: 1.05,
                backgroundColor: ACCENT_HOVER,
                boxShadow: '0 0 60px rgba(255,157,35,0.9)'
              }}
              whileTap={{ scale: 0.98 }}
              className="inline-block border-4 border-[#ff9d23] bg-[#ff9d23] px-12 py-6 text-[24px] md:text-[32px] font-black text-black uppercase tracking-[0.08em] transition-all duration-700"
            >
              GET IN TOUCH →
            </motion.a>
            </motion.div>
          </section>


      </div>
    </main>
  );
}

