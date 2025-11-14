"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useHapticFeedback } from "@/lib/hooks";

const ACCENT = "#ff9d23";
const ACCENT_HOVER = "#FFB84D";

const FONTS = {
  mono: 'var(--font-mono)',
  body: 'var(--font-body)',
  display: 'var(--font-mono)'
} as const;

const STAT_CARD_VARS = {
  '--card-padding': '32px',
  '--card-gap': '48px',
  '--card-border': '1.5px solid rgba(255, 157, 35, 0.35)',
  '--card-radius': '1px',
  '--card-shadow': '0 0 32px rgba(255, 157, 35, 0.15)',
  '--heading-mt': '0',
  '--heading-mb': '16px',
  '--body-mb': '24px',
  '--badge-height': '22px'
} as React.CSSProperties;

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

  // Haptic feedback for touch interactions
  const triggerHaptic = useHapticFeedback();
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const lastScrollTop = useRef(0);
  const rafId = useRef<number | null>(null);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const typewriterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/data/about.json?v=3")
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
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ fontFamily: "VT323, monospace" }}>
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
            <div className="relative">
              {/* Gradient backdrop */}
              <div className="absolute inset-0 -m-8 bg-gradient-radial from-[#ff9d23]/10 via-transparent to-transparent blur-2xl" />

              <motion.h1
                className="relative text-[64px] md:text-[72px] lg:text-[80px] font-black uppercase tracking-[0.3em] leading-tight text-[#ff9d23]"
                style={{
                  textShadow: '0 0 30px rgba(255,157,35,0.3), 0 0 60px rgba(255,157,35,0.1)',
                  fontFamily: 'var(--font-mono)'
                }}
                whileHover={{
                  scale: 1.05,
                  textShadow: '0 0 60px rgba(255,157,35,0.6), 0 0 100px rgba(255,157,35,0.3)'
                }}
                transition={{ duration: 0.4 }}
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

        {/* Value Proposition - Direct & Immediate */}
        <section className="min-h-[50vh] md:min-h-[60vh] flex items-center justify-center py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto text-center space-y-12 md:space-y-16 px-8 md:px-16"
          >
            {/* Primary Headline */}
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.3]"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'rgba(255,255,255,0.95)',
                letterSpacing: '0.02em'
              }}
            >
              Ideas that outlast trends. Strategy that scales. Sydney → World.
            </motion.h2>

            {/* Supporting Statement */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[20px] md:text-[26px] lg:text-[32px] font-light leading-[1.5]"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'rgba(255,157,35,0.9)'
              }}
            >
              Everyone's chasing new — we chase <em className="font-medium not-italic">different</em>.
            </motion.p>

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
            className="relative flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 py-32"
            style={{ minHeight: 'calc(var(--vh, 1vh) * 100)', scrollMarginTop: '4rem', ...STAT_CARD_VARS }}
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

          <section className="min-h-screen py-20 flex flex-col items-center justify-center space-y-12 md:space-y-16">
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
              Ready to start? →
            </motion.a>
          </motion.div>
          </section>


        {/* Process - Standalone Section */}
        <section className="py-16 md:py-20 flex flex-col items-center justify-center">
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
        <section className="py-16 md:py-20 flex flex-col items-center justify-center">
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

          <section className="min-h-screen py-20 flex flex-col items-center justify-center space-y-8 md:space-y-12">
            <LuxuryCollapsibleSection
              title="Operations & Setup"
              icon="⚙️"
              isOpen={openSection === "ops"}
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
              isOpen={openSection === "philosophy"}
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
                className="border-2 border-[#ff9d23]/50 bg-gradient-to-br from-[#ff9d23]/10 to-[#ff9d23]/5 p-8 md:p-10 hover:shadow-[0_0_40px_rgba(255,157,35,0.5)] transition-all duration-700"
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

          <section className="min-h-[50vh] flex items-center justify-center">
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
            </motion.div>
          </section>
        

        {/* Contact CTA - Full Height */}

          <section className="relative min-h-[70vh] py-20 flex items-center justify-center">
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

  // Subtle scale effect as typewriter completes (0.7 → 1.0 becomes scale 1.0 → 1.03)
  const scaleValue = scrollProgress >= 0.7 ? 1 + ((scrollProgress - 0.7) / 0.3) * 0.03 : 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        scale: scaleValue
      }}
      transition={{ duration: 0.8, scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
      className="text-[32px] md:text-[40px] lg:text-[48px] font-medium leading-[1.4]"
      style={{
        fontFamily: 'var(--font-mono)',
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: '0.08em',
        textShadow: '0 1px 2px rgba(255,157,35,0.1)',
        minHeight: '1.4em',
        transition: 'font-size 0.2s ease-out'
      }}
    >
      {beforeAccent}
      <span className="text-[#ff9d23]/90 font-semibold">
        {accentPart}
      </span>
      {showCursor && (
        <motion.span
          animate={{ opacity: [0.9, 0.3, 0.9] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#ff9d23]/90"
        >
          |
        </motion.span>
      )}
    </motion.div>
  );
}

// Interactive Flip Card - Reveals Story Behind Numbers (25 Luxury Improvements)
function LuxuryStatCard({ label, value, delay, index }: { label: string; value: string; delay: number; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasFlippedBefore, setHasFlippedBefore] = useState(false);
  const [showViewed, setShowViewed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [showTapHint, setShowTapHint] = useState(false);

  // Improvement #14: Auto-flip first card as demo
  useEffect(() => {
    if (index === 0 && typeof window !== 'undefined') {
      const timer1 = setTimeout(() => setIsFlipped(true), 2000);
      const timer2 = setTimeout(() => setIsFlipped(false), 5000);
      const timer3 = setTimeout(() => setShowTapHint(true), 500);
      const timer4 = setTimeout(() => setShowTapHint(false), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [index]);

  // Context mapping for each stat
  const contextMap: Record<string, { text: string; comparison?: string; since?: string }> = {
    "Projects": { text: "60+ brands since 2020. S'WICH, MapleMoon, Jac+Jack among them. Hospitality, fashion, tech — never the same approach twice." },
    "Retention": { text: "3 in 4 clients return. Systems that outlast the engagement." },
    "Repeat Clients": { text: "45% return within 18 months. Long-term partnerships over one-off projects." },
    "Years Active": { text: "6 years. 38+ brands. Built for the long game." },
    "Response": { text: "48hr average. Usually within 4hr. Clear communication, efficient delivery." },
    "Industries": { text: "8 sectors. Hospitality to healthcare. Diverse experience, focused execution." }
  };

  const contextData = contextMap[label] || { text: "More context coming soon" };
  const context = contextData.text;

  // Parse number and unit separately for styling
  const parseValue = (val: string) => {
    const numericMatch = val.match(/[\d.]+/);
    if (!numericMatch) return { prefix: '', number: val, suffix: '' };

    const prefix = val.substring(0, numericMatch.index);
    const suffix = val.substring(numericMatch.index! + numericMatch[0].length);
    return { prefix, number: numericMatch[0], suffix };
  };

  const { prefix, number, suffix } = parseValue(value);

  // Improvement #11: Enhanced flip feedback
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!hasFlippedBefore) {
      setHasFlippedBefore(true);
      setShowViewed(true);
      setTimeout(() => setShowViewed(false), 3000);
    }
  };

  // Improvement #22: Swipe gesture support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      handleFlip();
    }
  };

  // Improvement #23: Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parse first sentence for emphasis
  const parseFirstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/);
    if (match) {
      return {
        firstSentence: match[0],
        rest: text.substring(match[0].length).trim()
      };
    }
    return { firstSentence: text, rest: '' };
  };

  const { firstSentence, rest } = parseFirstSentence(context);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, z: 20 }}
      whileInView={{ opacity: 1, y: 0, z: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "-150px" }}
      transition={{
        delay,
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="relative w-full"
      style={{
        perspective: '1000px',
        aspectRatio: '4 / 3'
      }}
    >
      {/* Improvement #13: "Tap to explore" hint on mobile (first 3s) */}
      {showTapHint && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 md:hidden text-[11px] text-[#ff9d23] uppercase tracking-widest z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: [0.6, 1, 0.6], y: 0 }}
          transition={{ opacity: { duration: 1.5, repeat: Infinity } }}
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
        >
          Tap to explore
        </motion.div>
      )}

      {/* Flip Container */}
      <motion.div
        animate={{ rotateY: prefersReducedMotion ? 0 : (isFlipped ? 180 : 0) }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.4,
          ease: [0.16, 1, 0.3, 1],
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          transform: prefersReducedMotion && isFlipped ? 'none' : undefined
        }}
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleFlip();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${label}: ${value}. Click to reveal more information.`}
      >
        {/* Front Side */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--card-padding)',
            backfaceVisibility: 'hidden',
            border: 'var(--card-border)',
            borderRadius: 'var(--card-radius)',
            boxShadow: isHovered
              ? '0 0 14px rgba(255,157,35,0.25), var(--card-shadow)'
              : 'var(--card-shadow)',
            background: isHovered ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.75)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Improvement #12: Corner Fold Hint with fade-in */}
          {isHovered && !isFlipped && (
            <motion.div
              className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'linear-gradient(225deg, rgba(255,157,35,0.3) 0%, transparent 50%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
              }}
            />
          )}

          {/* Number Display with Improvements #1/#8: Optical kerning & Gold foil effect */}
          <div className="relative">
            <div
              className="text-[38px] md:text-[73px] lg:text-[92px] font-extrabold relative"
              style={{
                letterSpacing: '-0.04em',
                background: 'linear-gradient(160deg, #ffd700 0%, #ff9d23 30%, #ffaa35 70%, #ffd700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: isHovered
                  ? 'drop-shadow(0 0 28px rgba(255,157,35,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  : 'drop-shadow(0 0 14px rgba(255,157,35,0.2)) drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                transform: isHovered ? 'scale(1.02) translateZ(5px)' : 'scale(1)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform'
              }}
            >
              {prefix}{number}
              {suffix && (
                <span
                  className="text-[24px] md:text-[49px] lg:text-[59px]"
                  style={{
                    opacity: 0.9,
                    marginLeft: '0.1em',
                    background: 'linear-gradient(160deg, #ffd700 0%, #ff9d23 30%, #ffaa35 70%, #ffd700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {suffix}
                </span>
              )}
            </div>
          </div>

          {/* Label with Improvement #5: Refined tracking for luxury magazine feel */}
          <div
            className="text-[14px] md:text-[22px] lg:text-[26px] uppercase tracking-[0.095em] mt-3 sm:mt-6"
            style={{
              color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)',
              transition: 'color 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              fontWeight: 500
            }}
          >
            {label}
          </div>

          {/* Improvement #17: "Since 2020" time badges */}
          {contextData.since && !isFlipped && (
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                height: 'var(--badge-height)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                fontSize: '10px',
                background: 'rgba(255,157,35,0.15)',
                color: 'rgba(255,157,35,0.8)',
                border: '0.5px solid rgba(255,157,35,0.3)',
                borderRadius: '2px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {contextData.since}
            </div>
          )}

          {/* Viewed Badge */}
          {showViewed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] px-3 py-1.5 rounded uppercase tracking-wider"
              style={{
                background: 'rgba(255,157,35,0.2)',
                color: '#ff9d23',
                border: '1px solid rgba(255,157,35,0.4)',
                fontWeight: 600
              }}
            >
              VIEWED
            </motion.div>
          )}
        </div>

        {/* Back Side with Improvement #9: Subtle border radius */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--card-padding)',
            backfaceVisibility: 'hidden',
            transform: prefersReducedMotion ? 'scaleX(-1)' : 'rotateY(180deg)',
            border: 'var(--card-border)',
            borderRadius: 'var(--card-radius)',
            boxShadow: 'var(--card-shadow)',
            background: 'radial-gradient(circle at center, rgba(255,157,35,0.10) 0%, rgba(0,0,0,0.85) 100%)'
          }}
        >
          {/* Context Text with Improvements #2/#3: Better line-height & 2-layer shadows */}
          <motion.div
            className="w-full px-2 sm:px-3 md:px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: (isFlipped || (prefersReducedMotion && isFlipped)) ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-[300px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[500px] mx-auto text-center">
              {/* First Sentence - Larger, Bold, Gold Tint, Own Line */}
              <div
                className="text-[17px] sm:text-[20px] md:text-[22px]"
                style={{
                  margin: 'var(--heading-mt) 0 var(--heading-mb) 0',
                  fontWeight: 600,
                  lineHeight: 1.5,
                  letterSpacing: '-0.005em',
                  color: '#ffa940',
                  textShadow: '0 1px 2px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.8)',
                  textAlign: 'center'
                }}
              >
                {firstSentence}
              </div>

              {/* Improvement #16: Comparison badge */}
              {contextData.comparison && (
                <motion.div
                  className="inline-block mb-2 px-2 py-1 text-[11px] sm:text-[12px] rounded-sm uppercase tracking-wider"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,157,35,0.2))',
                    color: '#ffd700',
                    border: '1px solid rgba(255,215,0,0.4)',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(255,215,0,0.2)'
                  }}
                >
                  {contextData.comparison}
                </motion.div>
              )}

              {/* Rest - Smaller, Regular, White, Line Below with Improvement #2: Better line-height (1.68) */}
              {rest && (
                <div
                  className="text-[15px] sm:text-[17px] md:text-[19px]"
                  style={{
                    margin: '0 0 var(--body-mb) 0',
                    fontWeight: 400,
                    lineHeight: 1.68,
                    letterSpacing: '0',
                    color: 'rgba(255,255,255,0.9)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.8)',
                    textAlign: 'center',
                    wordBreak: 'normal'
                  }}
                >
                  {rest}
                </div>
              )}
            </div>
          </motion.div>

          {/* Flip Back Hint */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            Tap to flip back
          </motion.div>
        </div>
      </motion.div>
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
      <p
        className="text-[16px] md:text-[20px] lg:text-[24px] leading-loose"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.05em'
        }}
      >{text}</p>
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
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3, margin: "-100px" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      whileHover={{ scale: 1.03, borderColor: ACCENT }}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`
      }}
      className="border-2 border-[#ff9d23]/30 bg-gradient-to-br from-black/40 to-black/20 p-8 md:p-12 space-y-6 transition-all duration-700 hover:shadow-[0_0_40px_rgba(255,157,35,0.5)] cursor-default"
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
      className="border-2 border-[#ff9d23]/30 bg-gradient-to-br from-black/40 to-black/20 hover:border-[#ff9d23]/50 transition-all duration-700"
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
