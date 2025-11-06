"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
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

  // Animation completion tracking
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [headlineComplete, setHeadlineComplete] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  const lastScrollTop = useRef(0);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const typewriterRef = useRef<HTMLDivElement>(null);
  const lockedScrollPosition = useRef<number | null>(null);

  useEffect(() => {
    fetch("/data/about.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  // Enforce scroll boundary - prevent scrolling past typewriter until animations complete
  useEffect(() => {
    const scrollableElement = document.querySelector('.scrollable-content') as HTMLElement;
    if (!scrollableElement || !typewriterRef.current) return;

    const handleScrollBoundary = () => {
      // If animations complete, allow all scrolling
      if (typewriterComplete && headlineComplete) {
        scrollableElement.style.overflowY = 'auto';
        lockedScrollPosition.current = null;
        return;
      }

      const typewriterRect = typewriterRef.current?.getBoundingClientRect();
      const scrollableRect = scrollableElement.getBoundingClientRect();

      if (!typewriterRect) return;

      // Calculate if typewriter is approaching or in the viewport
      const viewportCenter = scrollableRect.top + (scrollableRect.height / 2);
      const typewriterTop = typewriterRect.top;
      const typewriterBottom = typewriterRect.bottom;

      // Lock scroll when typewriter top reaches 60% of viewport (before center)
      // This prevents fast scrolling from bypassing the lock
      const lockThreshold = scrollableRect.top + (scrollableRect.height * 0.6);

      if (typewriterTop <= lockThreshold && !scrollLocked) {
        console.log('LOCKING SCROLL at position:', scrollableElement.scrollTop);
        setScrollLocked(true);
        lockedScrollPosition.current = scrollableElement.scrollTop;
        scrollableElement.style.overflowY = 'hidden';
      }

      // FORCE scroll position back if user somehow scrolls past while locked
      if (scrollLocked && lockedScrollPosition.current !== null) {
        const currentScroll = scrollableElement.scrollTop;
        if (currentScroll !== lockedScrollPosition.current) {
          console.log('FORCING SCROLL BACK from', currentScroll, 'to', lockedScrollPosition.current);
          scrollableElement.scrollTop = lockedScrollPosition.current;
        }
      }
    };

    scrollableElement.addEventListener('scroll', handleScrollBoundary, { passive: false });
    handleScrollBoundary(); // Check immediately

    return () => {
      scrollableElement.removeEventListener('scroll', handleScrollBoundary);
    };
  }, [typewriterComplete, headlineComplete, scrollLocked]);

  // Unlock scroll when both animations complete
  useEffect(() => {
    if (typewriterComplete && headlineComplete) {
      const scrollableElement = document.querySelector('.scrollable-content') as HTMLElement;
      if (scrollableElement) {
        console.log('UNLOCKING SCROLL - animations complete');
        scrollableElement.style.overflowY = 'auto';
        setScrollLocked(false);
        lockedScrollPosition.current = null;
      }
    }
  }, [typewriterComplete, headlineComplete]);

  // Enable scroll snap for smooth section transitions
  useEffect(() => {
    const scrollableElement = document.querySelector('.scrollable-content') as HTMLElement;
    if (!scrollableElement) return;

    scrollableElement.style.scrollSnapType = 'y mandatory';

    return () => {
      scrollableElement.style.scrollSnapType = '';
    };
  }, []);

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
      <div className="w-full px-6 md:px-12 lg:px-20 py-8">
        {/* Hero Section with Sticky Title & Floating Icon */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div
            className="sticky top-0 h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center gap-12"
            style={{
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

        {/* Scroll spacer - creates distance between About and Typewriter */}
        <div className="h-[50vh]" aria-hidden="true" />

        {/* Hero Text Content - Full Height - Luxury Edition */}
        <section
          ref={typewriterRef}
          className="relative min-h-screen flex flex-col items-center justify-center space-y-16 md:space-y-20 text-center px-8 md:px-16 lg:px-32"
          style={{ scrollSnapAlign: 'start' }}
        >
          {/* Manifesto with typewriter effect */}
          <TypewriterManifesto onComplete={handleTypewriterComplete} />

          {/* Headline - more subtle, loads after typewriter */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 3.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            onAnimationComplete={handleHeadlineComplete}
            className="text-[16px] md:text-[20px] lg:text-[24px] text-white/50 leading-[1.8] tracking-wide font-light"
          >
            {data.hero.headline}
          </motion.p>

          {/* Elegant thin divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-48 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,157,35,0.6) 50%, transparent 100%)',
              boxShadow: '0 0 8px rgba(255,157,35,0.3)'
            }}
          />

          {/* Massive blank dead space */}
          <div className="h-[50vh] md:h-[70vh] lg:h-[100vh]" aria-hidden="true" />

          {/* Philosophy heading with subtle gradient backdrop - increased gap above */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative"
          >
            {/* Subtle radial gradient behind */}
            <div className="absolute inset-0 -m-12 opacity-30 blur-3xl bg-gradient-radial from-[#ff9d23]/20 via-transparent to-transparent" />

            <motion.h3
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative text-[26px] md:text-[36px] lg:text-[44px] font-semibold text-[#ff9d23]/80 uppercase tracking-[0.12em] leading-tight"
              style={{
                textShadow: '0 2px 8px rgba(255,157,35,0.25), 0 4px 16px rgba(255,157,35,0.15)'
              }}
            >
              Philosophy
            </motion.h3>
          </motion.div>

          {/* Frosted glass philosophy container with hover lift */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -8, boxShadow: '0 24px 48px rgba(255,157,35,0.15), 0 8px 16px rgba(0,0,0,0.3)' }}
            className="border border-[#ff9d23]/20 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl p-12 md:p-16 lg:p-20 max-w-[65ch] transition-all duration-700"
            style={{
              borderTop: '1px solid rgba(255,157,35,0.3)',
              boxShadow: '0 16px 32px rgba(255,157,35,0.08), 0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
          >
            <div className="space-y-8 text-[18px] md:text-[22px] lg:text-[26px] text-white/85 leading-[1.8] tracking-wide">
              <p className="border-l-2 border-[#ff9d23]/30 pl-6 transition-colors hover:border-[#ff9d23]/60">
                I work where ideas meet culture — finding the <em className="text-[#ff9d23]/90 not-italic font-medium">small, precise angle</em> no one else has noticed yet.
              </p>
              <p className="border-l-2 border-[#ff9d23]/30 pl-6 transition-colors hover:border-[#ff9d23]/60">
                Anyone can make something that looks current; the work is making something that still feels right in <em className="text-[#ff9d23]/90 not-italic font-medium">five years</em>.
              </p>
              <p className="border-l-2 border-[#ff9d23]/30 pl-6 transition-colors hover:border-[#ff9d23]/60">
                That comes from <em className="text-white/95 italic">research, reference, and restraint</em> — knowing what to leave out, not just what to put in.
              </p>
            </div>
          </motion.div>

          {/* Pull-quote for "ideas with backbone" */}
          <motion.blockquote
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative max-w-[50ch] text-[24px] md:text-[32px] lg:text-[40px] text-white/95 leading-[1.6] font-light tracking-wide"
          >
            <span className="absolute -left-6 md:-left-12 top-0 text-[80px] md:text-[120px] text-[#ff9d23]/20 leading-none">"</span>
            I'm not interested in trends or templates. I'm interested in <span className="text-[#ff9d23]/90 font-medium">ideas with backbone</span> — things that stick because they mean something.
            <span className="absolute -right-6 md:-right-12 bottom-0 text-[80px] md:text-[120px] text-[#ff9d23]/20 leading-none">"</span>
          </motion.blockquote>
        </section>

        {/* Empty Space Reveal Window 1 */}
        <section className="min-h-screen flex items-center justify-center">
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

        {/* Gradient Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ scaleX: 1, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-[#ff9d23]/60 to-transparent my-32 max-w-md mx-auto shadow-[0_0_20px_rgba(255,157,35,0.3)]"
        />

        {/* Stats Grid - Full Width */}
        <section className="space-y-12 md:space-y-20 py-20 md:py-32">
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

        {/* Gradient Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ scaleX: 1, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-[#ff9d23]/60 to-transparent my-32 max-w-md mx-auto shadow-[0_0_20px_rgba(255,157,35,0.3)]"
        />

        {/* Beliefs - Full Width Background */}
        <section className="py-20 md:py-32 -mx-6 md:-mx-12 lg:-mx-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-black/[0.01] via-black/[0.02] to-transparent">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
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
        <section className="space-y-12 md:space-y-20 py-20 md:py-32">
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

        {/* Gradient Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0, filter: 'blur(10px)' }}
          whileInView={{ scaleX: 1, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-[#ff9d23]/60 to-transparent my-32 max-w-md mx-auto shadow-[0_0_20px_rgba(255,157,35,0.3)]"
        />

        {/* Collapsible Sections */}
        <section className="space-y-8 md:space-y-12 py-20 md:py-32 max-w-6xl mx-auto">
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
        <section className="py-20 md:py-32 -mx-6 md:-mx-12 lg:-mx-20 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-[#ff9d23]/5 to-transparent">
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
        <section className="min-h-screen flex items-center justify-center">
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
        <section className="min-h-screen flex items-center justify-center py-32">
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

        {/* Spacer for scroll */}
        <div className="h-32" />
      </div>
    </div>
  );
}

// Typewriter Manifesto Component
function TypewriterManifesto({ onComplete }: { onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Everyone's chasing new — we chase different.";

  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = 60; // milliseconds per character

    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setShowCursor(false);
        // Notify parent that typing animation is complete
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [onComplete]);

  // Cursor blink effect
  useEffect(() => {
    if (!showCursor) return;
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, [showCursor]);

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
        minHeight: '1.4em' // Prevent layout shift
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
