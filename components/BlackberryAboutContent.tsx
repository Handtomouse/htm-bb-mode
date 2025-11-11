"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const ACCENT = "#ff9d23";
const ACCENT_HOVER = "#FFB84D";

interface AboutData {
  hero: {
    title: string;
    headline: string;
    subline: string;
    origin: string;
    badges: string[];
    principles: Array<{ icon: string; text: string }>;
  };
  services: Array<{
    icon: string;
    title: string;
    line: string;
    example: string;
  }>;
  process: {
    steps: Array<{
      num: string;
      title: string;
      promise: string;
      duration: string;
    }>;
  };
  proof: {
    highlights: Array<{
      label: string;
      line: string;
      quote?: string;
      duration: string;
    }>;
  };
  ops: {
    items: Array<{ icon: string; text: string }>;
  };
  setup: {
    line: string;
  };
  notRightFor: {
    items: Array<{ icon: string; text: string }>;
  };
  pricing: {
    projects: string;
    projectLength: string;
    retainers: string;
    retainerDetails: string;
    terms: string;
    termsDetail: string;
    guarantee: string;
  };
  stats: {
    projects: string;
    retention: string;
    repeatClients: string;
    avgProjectValue: string;
    avgResponse: string;
    industries: string;
  };
  contact: {
    email: string;
    status: string;
    responseTime: string;
  };
  now: {
    lastUpdated: string;
    currentFocus: string;
    status: string;
  };
}

export default function BlackberryAboutContent() {
  const [data, setData] = useState<AboutData | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Scroll tracking states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [aboutParallax, setAboutParallax] = useState(0);
  const [floatingElementsOffset, setFloatingElementsOffset] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [typewriterOpacity, setTypewriterOpacity] = useState(1);
  const [headlineOpacity, setHeadlineOpacity] = useState(1);
  const [typewriterScrollProgress, setTypewriterScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Animation completion tracking
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [headlineComplete, setHeadlineComplete] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const lastScrollTop = useRef(0);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const typewriterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/data/about.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  // Detect mobile/touch devices (Fix #1, #3)
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Scroll handler
  const handleScroll = useCallback(() => {
    const scrollableElement = document.querySelector('.scrollable-content');
    if (scrollableElement) {
      const scrollTop = scrollableElement.scrollTop;
      const scrollHeight = scrollableElement.scrollHeight - scrollableElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);

      // Back-to-top button after 300px
      setShowBackToTop(scrollTop > 300);

      // Hero fade: 400px→800px range
      const heroFadeStart = 400;
      const heroFadeEnd = 800;
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
        // Starts when section center is 400px below viewport center
        // Completes when section center is 72px below viewport center (accounting for status bar offset)
        // Total range: 328px of scrolling
        let scrollProgress = 0;

        if (distanceFromCenter > 400) {
          // Section center more than 400px below viewport center - not started
          scrollProgress = 0;
        } else if (distanceFromCenter > 72) {
          // Section center between 400px below and 72px below center
          // Progress from 0 to 1 over 328px of scrolling
          scrollProgress = (400 - distanceFromCenter) / 328;
        } else {
          // Section center at 72px below viewport center or higher - complete
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

        // Headline opacity: Fade in when typewriter ≥ 80% complete
        const headlineFade = clampedProgress >= 0.8 ? Math.min(1, (clampedProgress - 0.8) / 0.15) : 0;
        setHeadlineOpacity(headlineFade);
      }

      // Parallax: move UP to create separation
      const parallaxOffset = Math.max(scrollTop * -0.2, -20);
      setAboutParallax(parallaxOffset);

      // Floating elements parallax
      setFloatingElementsOffset(scrollTop * 0.3);

      lastScrollTop.current = scrollTop;
    }
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const scrollableElement = document.querySelector('.scrollable-content');
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
      return () => scrollableElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ fontFamily: "VT323, monospace" }}>
      {/* Scroll Progress Gradient Overlay */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,157,35,${scrollProgress * 0.0005}) 0%, transparent 70%)`,
          opacity: Math.min(scrollProgress / 100, 0.5)
        }}
      />

      {/* Parallax Background Gradient Layers */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(255,157,35,0.08) 0%, transparent 50%)',
          transform: `translateY(${floatingElementsOffset * 0.2}px)`,
          transition: 'transform 0.1s linear'
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 80% 60%, rgba(255,157,35,0.06) 0%, transparent 60%)',
          transform: `translateY(${floatingElementsOffset * 0.4}px)`,
          transition: 'transform 0.1s linear'
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255,157,35,0.03) 50%, transparent 100%)',
          transform: `translateY(${floatingElementsOffset * 0.6}px)`,
          transition: 'transform 0.1s linear'
        }}
      />

      {/* Floating geometric elements - BB-style */}
      <motion.div
        className="fixed w-32 h-32 border-2 border-[#ff9d23]/10 pointer-events-none"
        style={{
          top: '10%',
          left: '5%',
          transform: `translateY(${floatingElementsOffset}px) rotate(45deg)`,
          transition: 'transform 0.1s linear'
        }}
      />
      <motion.div
        className="fixed w-20 h-20 bg-[#ff9d23]/5 pointer-events-none"
        style={{
          top: '30%',
          right: '8%',
          transform: `translateY(${floatingElementsOffset * 0.7}px)`,
          transition: 'transform 0.1s linear',
          clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
        }}
      />
      <motion.div
        className="fixed w-16 h-16 rounded-full border border-[#ff9d23]/8 pointer-events-none"
        style={{
          top: '60%',
          left: '10%',
          transform: `translateY(${floatingElementsOffset * 1.2}px)`,
          transition: 'transform 0.1s linear'
        }}
      />
      <motion.div
        className="fixed w-24 h-24 border-2 border-[#ff9d23]/10 pointer-events-none"
        style={{
          bottom: '20%',
          right: '15%',
          transform: `translateY(${floatingElementsOffset * 0.5}px) rotate(30deg)`,
          transition: 'transform 0.1s linear',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
        }}
      />

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 border-2 border-[#ff9d23] bg-[#ff9d23] p-4 hover:bg-[#FFB84D] hover:shadow-[0_0_40px_rgba(255,157,35,0.8)] transition-all duration-300"
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
            className="sticky top-0 h-screen flex flex-col items-center justify-center text-center gap-20 md:gap-24 lg:gap-32"
            style={{
              marginTop: '-72px',
              opacity: heroOpacity,
              transform: `translateY(${aboutParallax}px) scale(${1 + (scrollProgress * 0.001)})`,
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              pointerEvents: heroOpacity < 0.5 ? 'none' : 'auto',
              zIndex: heroOpacity < 0.5 ? -1 : 20,
              visibility: heroOpacity < 0.05 ? 'hidden' : 'visible'
            }}
          >
            <div className="relative">
              {/* Gradient backdrop */}
              <div className="absolute inset-0 -m-8 bg-gradient-radial from-[#ff9d23]/10 via-transparent to-transparent blur-2xl" />

              <motion.h1
                className="relative text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-[0.3em] leading-tight text-[#ff9d23]"
                style={{ textShadow: '0 0 30px rgba(255,157,35,0.3), 0 0 60px rgba(255,157,35,0.1)' }}
                whileHover={{
                  scale: 1.05,
                  textShadow: '0 0 60px rgba(255,157,35,0.6), 0 0 100px rgba(255,157,35,0.3)'
                }}
                transition={{ duration: 0.3 }}
              >
                About
              </motion.h1>
            </div>

            {/* Scroll indicator - HTM icon with pulse */}
            <motion.div
              className="mt-20 md:mt-24 lg:mt-32"
              animate={{
                y: [0, 15, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255,157,35,0.6))'
              }}
            >
              <Image
                src="/logos/HTM-LOGO-ICON-01.svg"
                alt="Scroll down"
                width={56}
                height={56}
                className="h-14 w-14 md:h-16 md:w-16 rotate-90 opacity-80"
                priority
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll spacer - responsive height (Fix #4) */}
        <div className="h-[20vh] md:h-[25vh] lg:h-[30vh]" aria-hidden="true" />

        {/* Hero Text Content - Responsive height (Fix #5) */}
        <section
          ref={typewriterRef}
          className="relative min-h-[70vh] md:min-h-[85vh] lg:min-h-screen flex flex-col items-center justify-center space-y-16 md:space-y-20 text-center px-8 md:px-16 lg:px-32"
          style={{
            scrollSnapAlign: isMobile ? 'none' : 'start',
            scrollSnapStop: isMobile ? 'normal' : 'always',
            opacity: typewriterOpacity,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          {/* Manifesto with scroll-driven typewriter effect */}
          <TypewriterManifesto
            onComplete={handleTypewriterComplete}
            scrollProgress={typewriterScrollProgress}
          />

          {/* Headline - scroll-driven fade in (Fix #7) */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: headlineOpacity, y: headlineOpacity > 0 ? 0 : 20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            onAnimationComplete={() => headlineOpacity >= 0.99 && handleHeadlineComplete()}
            className="text-[16px] md:text-[20px] lg:text-[24px] text-white/50 leading-[1.8] tracking-wide font-light"
            style={{
              transition: 'font-size 0.2s ease-out' // Fix #6: Smooth font size changes
            }}
          >
            {data.hero.headline}
          </motion.p>

        </section>

        {/* Philosophy Section - Centered with Title */}

          <section className="min-h-screen flex flex-col items-center justify-center py-12 md:py-16 lg:py-20 scroll-smooth">
          <div className="max-w-3xl w-full px-12 md:px-16 lg:px-24 flex flex-col items-center">

            {/* Section Title - "Philosophy" */}
            <motion.div
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 1.6, delay: -0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-[60vh] md:mb-[70vh] lg:mb-[80vh]"
            >
              <h2 className="text-[48px] md:text-[64px] lg:text-[80px] font-light text-[#ff9d23]/70 tracking-[0.15em] uppercase mb-8 text-center">
                Philosophy
              </h2>
              <div className="h-[1px] w-24 bg-[#ff9d23]/30" />
            </motion.div>

            {/* Philosophy - Numbered Manifesto */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 1.4, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-[90vh] md:mb-[100vh] lg:mb-[110vh]"
            >
              {/* Number Label - Centered with hover glow */}
              <motion.div
                whileHover={{ textShadow: '0 0 15px rgba(255, 157, 35, 0.6)' }}
                transition={{ duration: 0.3 }}
                className="text-[14px] md:text-[15px] lg:text-[16px] font-normal text-[#ff9d23] mb-8 md:mb-10 lg:mb-12 opacity-55 text-center"
              >
                [01]
              </motion.div>
              {/* Section Title - Centered with hover tracking expansion */}
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 1.4, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ letterSpacing: '0.4em' }}
                className="text-[12px] md:text-[13px] lg:text-[14px] font-light text-[#ff9d23]/50 uppercase tracking-[0.35em] mb-10 md:mb-12 lg:mb-16 transition-all duration-300 text-center"
              >
                The Intersection
              </motion.h3>
              {/* Body Text - Left-aligned with scale entrance */}
              <motion.p
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 1.4, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-[17px] md:text-[19px] lg:text-[21px] text-white leading-[2.1] font-light tracking-wide text-left max-w-2xl"
              >
                I work where ideas meet culture — finding the <motion.span animate={{ opacity: [0.85, 0.95, 0.85] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="text-[#ff9d23]/90 font-medium">small, precise angle</motion.span> no one else has noticed yet.
              </motion.p>
            </motion.div>

            {/* Part 2 - Centered staggered entrance */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-[90vh] md:mb-[100vh] lg:mb-[110vh]"
            >
              {/* Number - Centered with hover glow */}
              <motion.div
                whileHover={{ textShadow: '0 0 15px rgba(255, 157, 35, 0.6)' }}
                transition={{ duration: 0.3 }}
                className="text-[14px] md:text-[15px] lg:text-[16px] font-normal text-[#ff9d23] mb-8 md:mb-10 lg:mb-12 opacity-55 text-center"
              >
                [02]
              </motion.div>
              {/* Section Title - Centered with hover tracking expansion */}
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 1.4, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ letterSpacing: '0.4em' }}
                className="text-[12px] md:text-[13px] lg:text-[14px] font-light text-[#ff9d23]/50 uppercase tracking-[0.35em] mb-10 md:mb-12 lg:mb-16 transition-all duration-300 text-center"
              >
                The Timeframe
              </motion.h3>
              {/* Body Text - Left-aligned with scale entrance */}
              <motion.p
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 1.4, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-[17px] md:text-[19px] lg:text-[21px] text-white leading-[2.0] font-normal tracking-wide text-left max-w-2xl"
              >
                Anyone can make something that looks current; the work is making something that still feels right in <motion.span animate={{ opacity: [0.85, 0.95, 0.85] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="text-[#ff9d23]/90 font-medium">five years</motion.span>.
              </motion.p>
            </motion.div>

            {/* Part 3 - Centered staggered entrance */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 1.4, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-[90vh] md:mb-[100vh] lg:mb-[110vh]"
            >
              {/* Number - Centered with hover glow */}
              <motion.div
                whileHover={{ textShadow: '0 0 15px rgba(255, 157, 35, 0.6)' }}
                transition={{ duration: 0.3 }}
                className="text-[14px] md:text-[15px] lg:text-[16px] font-normal text-[#ff9d23] mb-8 md:mb-10 lg:mb-12 opacity-55 text-center"
              >
                [03]
              </motion.div>
              {/* Section Title - Centered with hover tracking expansion */}
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 1.4, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ letterSpacing: '0.4em' }}
                className="text-[12px] md:text-[13px] lg:text-[14px] font-light text-[#ff9d23]/50 uppercase tracking-[0.35em] mb-10 md:mb-12 lg:mb-16 transition-all duration-300 text-center"
              >
                The Method
              </motion.h3>
              {/* Body Text - Left-aligned with scale entrance */}
              <motion.p
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 1.4, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-[17px] md:text-[19px] lg:text-[21px] text-white leading-[1.9] font-medium tracking-wide text-left max-w-2xl"
              >
                That comes from <em className="text-white italic">research, reference, and restraint</em> — knowing what to leave out, not just what to put in.
              </motion.p>
            </motion.div>

            {/* Divider - Ultra-thin hairline, centered, with top margin */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-[0.5px] bg-gradient-to-r from-transparent via-[#ff9d23]/20 to-transparent mt-[40vh] mb-[100px] md:mb-[120px] lg:mb-[140px]"
            />

            {/* Final Statement - Left-aligned ethereal entrance */}
            <motion.p
              initial={{ opacity: 0, y: 60, scale: 0.95, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-200px" }}
              transition={{ duration: 1.4, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[17px] md:text-[19px] lg:text-[21px] text-white leading-[2.3] font-extralight tracking-wide text-left max-w-2xl"
            >
              I'm not interested in trends or templates. I'm interested in <motion.span animate={{ opacity: [0.85, 0.95, 0.85] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="text-[#ff9d23]/90 font-medium">ideas with backbone</motion.span> — things that stick because they mean something.
            </motion.p>
          </div>
          </section>

        {/* Breathing Room - Reduced */}
        <div className="h-[20vh]" />
        

        {/* Empty Space Reveal Window 1 */}
        
          <section className="h-[150vh] flex items-center justify-center">
            <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="text-[24px] md:text-[32px] lg:text-[40px] text-[#ff9d23]/60 tracking-[0.2em] uppercase">
              Built to Last
            </div>
            </motion.div>
          </section>
        

        {/* Stats Grid - Full Width */}
        
          <section className="h-[150vh] flex flex-col items-center justify-center space-y-12 md:space-y-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="sticky top-8 z-10 text-[28px] md:text-[36px] lg:text-[48px] font-bold text-[#ff9d23] uppercase text-center tracking-[0.08em] bg-black/60 backdrop-blur-md py-4 transition-opacity duration-500"
          >
            By The Numbers
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 max-w-6xl mx-auto">
            <LuxuryStatCard label="Projects" value={data.stats.projects} delay={0} />
            <LuxuryStatCard label="Retention" value={data.stats.retention} delay={0.25} />
            <LuxuryStatCard label="Repeat Clients" value={data.stats.repeatClients} delay={0.5} />
            <LuxuryStatCard label="Avg Project" value={data.stats.avgProjectValue} delay={0.75} />
            <LuxuryStatCard label="Response" value={data.stats.avgResponse} delay={1.0} />
            <LuxuryStatCard label="Industries" value={data.stats.industries} delay={1.25} />
          </div>
          </section>
        

        {/* Beliefs - Full Width Background */}
        
          <section className="h-[150vh] flex flex-col items-center justify-center">
          <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="sticky top-8 z-10 text-[28px] md:text-[36px] lg:text-[48px] font-bold text-[#ff9d23] uppercase tracking-[0.08em] bg-black/60 backdrop-blur-md py-4 transition-opacity duration-500"
            >
              Beliefs
            </motion.h2>
            <div className="space-y-4 md:space-y-6">
              {data.hero.principles.map((principle, idx) => (
                <LuxuryBelief key={idx} icon={principle.icon} text={principle.text} delay={idx * 0.25} />
              ))}
            </div>
          </div>
          </section>
        

        {/* Services Grid */}
        
          <section className="h-[150vh] flex flex-col items-center justify-center space-y-12 md:space-y-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="sticky top-8 z-10 text-[28px] md:text-[36px] lg:text-[48px] font-bold text-[#ff9d23] uppercase text-center tracking-[0.08em] bg-black/60 backdrop-blur-md py-4 transition-opacity duration-500"
          >
            What We Do
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {data.services.map((service, idx) => (
              <LuxuryServiceCard key={idx} service={service} delay={idx * 0.25} />
            ))}
          </div>
          </section>
        

        {/* Collapsible Sections */}
        
          <section className="h-[150vh] flex flex-col items-center justify-center space-y-8 md:space-y-12">
            <LuxuryCollapsibleSection
              title="How I Work"
              icon="⚙️"
              isOpen={openSection === "work"}
              onToggle={() => setOpenSection(openSection === "work" ? null : "work")}
            >
              <div className="space-y-10">
              <div>
                <h4 className="text-[20px] md:text-[24px] font-bold text-white mb-6 uppercase tracking-[0.08em]">Process</h4>
                <div className="space-y-6">
                  {data.process.steps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
              </div>

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
              title="Pricing & Terms"
              icon="💰"
              isOpen={openSection === "pricing"}
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
                className="border-2 border-[#ff9d23]/50 bg-gradient-to-br from-[#ff9d23]/10 to-[#ff9d23]/5 p-8 md:p-10 backdrop-blur-sm hover:shadow-[0_0_40px_rgba(255,157,35,0.5)] transition-all duration-700"
              >
                <p className="text-[18px] md:text-[24px] text-white font-bold leading-relaxed">{data.pricing.guarantee}</p>
              </motion.div>
              </div>
            </LuxuryCollapsibleSection>

            <LuxuryCollapsibleSection
              title="Who I Work With"
              icon="🤝"
              isOpen={openSection === "who"}
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
        
          <section className="h-[150vh] flex items-center justify-center">
            <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto border-2 border-[#ff9d23] bg-gradient-to-br from-[#ff9d23]/10 to-transparent backdrop-blur-sm p-10 md:p-16 space-y-6 hover:shadow-[0_0_60px_rgba(255,157,35,0.6)] transition-all duration-700"
          >
            <h2 className="text-[32px] md:text-[48px] font-bold text-[#ff9d23] uppercase tracking-[0.08em]">
              Now
            </h2>
            <p className="text-[16px] md:text-[18px] text-white/60 tracking-wide">Last updated: {data.now.lastUpdated}</p>
            <p className="text-[18px] md:text-[24px] text-white leading-loose">{data.now.currentFocus}</p>
            <p className="text-[20px] md:text-[28px] text-[#ff9d23] font-bold tracking-wide">{data.now.status}</p>
            </motion.div>
          </section>
        

        {/* Empty Space Reveal Window 2 */}
        
          <section className="h-[150vh] flex items-center justify-center">
            <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(15px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-8"
          >
            <div className="text-[20px] md:text-[28px] lg:text-[36px] text-white/90 tracking-[0.15em] uppercase">
              Strategy First
            </div>
            <div className="text-[16px] md:text-[20px] text-[#ff9d23]/70 tracking-[0.1em]">
              Execution Second
            </div>
            </motion.div>
          </section>
        

        {/* Contact CTA - Full Height */}
        
          <section className="h-[150vh] flex items-center justify-center">
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border-4 border-[#ff9d23]/40 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-sm p-16 md:p-24 lg:p-32 text-center space-y-12 max-w-5xl hover:border-[#ff9d23] hover:shadow-[0_0_80px_rgba(255,157,35,0.7)] transition-all duration-700"
          >
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[36px] md:text-[52px] lg:text-[68px] font-black text-white uppercase tracking-[0.08em] leading-tight"
              style={{ textShadow: '0 0 30px rgba(255,157,35,0.3)' }}
            >
              Let's Work Together
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[20px] md:text-[28px] text-white/90 leading-loose tracking-wide"
            >
              {data.contact.status} • {data.contact.responseTime}
            </motion.p>

            <motion.a
              href={`mailto:${data.contact.email}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
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
    </div>
  );
}

// Typewriter Manifesto Component - Scroll-Driven
function TypewriterManifesto({
  onComplete,
  scrollProgress
}: {
  onComplete?: () => void;
  scrollProgress: number; // 0-1
}) {
  const fullText = "Everyone's chasing new — we chase different.";

  // Calculate character index from scroll progress
  const charCount = Math.floor(scrollProgress * fullText.length);
  const displayedText = fullText.slice(0, charCount);

  // Extended cursor visibility (Fix #9): Wider range, less flickering on mobile
  const showCursor = scrollProgress > 0.001 && scrollProgress < 0.999;

  // Notify completion when fully scrolled through
  useEffect(() => {
    if (scrollProgress >= 0.99 && onComplete) {
      onComplete();
    }
  }, [scrollProgress, onComplete]);

  // Split text to apply accent color to "— we chase different."
  const splitIndex = displayedText.indexOf("—");
  const beforeAccent = splitIndex >= 0 ? displayedText.slice(0, splitIndex) : displayedText;
  const accentPart = splitIndex >= 0 ? displayedText.slice(splitIndex) : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="text-[24px] md:text-[36px] lg:text-[48px] font-medium text-white leading-[1.4] tracking-[0.08em]"
      style={{
        textShadow: '0 1px 2px rgba(255,157,35,0.1)',
        minHeight: '1.4em', // Prevent layout shift
        transition: 'font-size 0.2s ease-out' // Fix #6: Smooth font size transitions
      }}
    >
      {beforeAccent}
      <span className="text-[#ff9d23]/90 font-semibold">
        {accentPart}
      </span>
      {showCursor && (
        <span className="text-[#ff9d23]/90 animate-pulse">|</span>
      )}
    </motion.div>
  );
}

// Luxury Stat Card with Magnetic Hover
function LuxuryStatCard({ label, value, delay }: { label: string; value: string; delay: number }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const strength = 0.15;
    setOffset({ x: deltaX * strength, y: deltaY * strength });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3, margin: "-100px" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      whileHover={{ borderColor: ACCENT }}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`
      }}
      className="border-2 border-[#ff9d23]/30 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm p-10 md:p-12 lg:p-16 text-center transition-all duration-700 cursor-default hover:shadow-[0_0_40px_rgba(255,157,35,0.5)]"
    >
      <div className="text-[42px] md:text-[56px] lg:text-[72px] font-black text-[#ff9d23] tabular-nums leading-none" style={{ textShadow: '0 0 20px rgba(255,157,35,0.3)' }}>
        {value}
      </div>
      <div className="text-[16px] md:text-[20px] lg:text-[24px] text-white/80 font-medium uppercase mt-6 tracking-[0.08em]">
        {label}
      </div>
    </motion.div>
  );
}

// Luxury Belief with Hover Effect
function LuxuryBelief({ icon, text, delay }: { icon: string; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 10, borderColor: ACCENT, backgroundColor: 'rgba(255,157,35,0.05)' }}
      className="flex items-start gap-6 border-l-2 border-[#ff9d23]/40 pl-6 py-4 transition-all duration-700"
    >
      <span className="text-[28px] md:text-[32px] flex-shrink-0">{icon}</span>
      <p className="text-[18px] md:text-[24px] lg:text-[28px] text-white/90 leading-loose tracking-wide">{text}</p>
    </motion.div>
  );
}

// Luxury Service Card
function LuxuryServiceCard({ service, delay }: { service: any; delay: number }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const strength = 0.1;
    setOffset({ x: deltaX * strength, y: deltaY * strength });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3, margin: "-100px" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      whileHover={{ scale: 1.03, borderColor: ACCENT }}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`
      }}
      className="border-2 border-[#ff9d23]/30 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm p-8 md:p-12 space-y-6 transition-all duration-700 hover:shadow-[0_0_40px_rgba(255,157,35,0.5)] cursor-default"
    >
      <div className="flex items-center gap-4">
        <span className="text-[32px] md:text-[40px]">{service.icon}</span>
        <h3 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold text-white tracking-wide">{service.title}</h3>
      </div>
      <p className="text-[18px] md:text-[22px] text-white/90 leading-relaxed">{service.line}</p>
      <p className="text-[16px] md:text-[18px] text-white/60 leading-relaxed">{service.example}</p>
    </motion.div>
  );
}

// Luxury Collapsible Section
function LuxuryCollapsibleSection({
  title,
  icon,
  isOpen,
  onToggle,
  children
}: {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-2 border-[#ff9d23]/30 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm hover:border-[#ff9d23]/50 transition-all duration-700"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-8 md:p-10 text-left hover:bg-[#ff9d23]/10 transition-all duration-700"
      >
        <div className="flex items-center gap-6">
          <span className="text-[28px] md:text-[32px]">{icon}</span>
          <h3 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold text-white uppercase tracking-[0.08em]">{title}</h3>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[24px] md:text-[28px] text-[#ff9d23]"
        >
          ▶
        </motion.span>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="border-t border-[#ff9d23]/30 p-8 md:p-10"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
