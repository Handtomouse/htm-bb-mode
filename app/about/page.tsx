"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import CollapsibleCard from "@/components/CollapsibleCard";
import SignatureFooter from "@/components/SignatureFooter";

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
}

// Animated Section wrapper with scroll reveal
function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Animated divider that slides in
function AnimatedDivider({ delay = 0 }: { delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scaleX: 0 }}
      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeInOut" }}
      className="border-t border-[#E0E0E0]/30 border-dashed origin-left"
    />
  );
}

// Scroll progress indicator
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed right-0 top-0 w-1 h-full bg-[#FF9D23]/20 z-50 origin-top"
      style={{ scaleY }}
    >
      <motion.div
        className="w-full bg-[#FF9D23]"
        style={{ height: "100%", transformOrigin: "top" }}
      />
    </motion.div>
  );
}

// Typewriter effect for hero
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && !started) {
      setStarted(true);
      const timeout = setTimeout(() => {
        let i = 0;
        const interval = setInterval(() => {
          if (i < text.length) {
            setDisplayedText(text.slice(0, i + 1));
            i++;
          } else {
            clearInterval(interval);
          }
        }, 30);
        return () => clearInterval(interval);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, text, delay, started]);

  return (
    <span ref={ref} className="inline-block min-h-[1.2em]">
      {displayedText}
      {started && displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-[#FF9D23] ml-1"
        />
      )}
    </span>
  );
}

// Staggered word reveal for pull quote
function StaggeredWords({ text }: { text: string }) {
  const words = text.split(" ");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <span ref={ref} className="inline-block">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = "smooth";

    fetch("/data/about.json")
      .then((res) => res.json())
      .then((json) => setData(json));

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const togglePanel = (panelName: string) => {
    setOpenPanel(openPanel === panelName ? null : panelName);
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[20px] text-[#E0E0E0]/70"
          style={{ fontFamily: "VT323, monospace" }}
        >
          LOADING...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#E0E0E0] relative" style={{ fontFamily: "VT323, monospace" }}>
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Parallax Background */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,157,35,0.03) 0%, transparent 50%)",
        }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      />

      {/* Main Content Container - Centered with max-width ~70ch */}
      <main className="max-w-[70ch] mx-auto px-6 py-16 md:py-24 space-y-24 md:space-y-32 relative z-10">

        {/* Hero Section - Introduction with Typewriter */}
        <AnimatedSection>
          <section className="space-y-8 text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-[40px] md:text-[52px] font-bold text-[#FF9D23] uppercase tracking-wide leading-tight"
            >
              {data.hero.title}
            </motion.h1>

            {/* Typewriter Headline */}
            <div className="text-[22px] md:text-[28px] text-[#E0E0E0] leading-relaxed" style={{ lineHeight: "1.6" }}>
              <TypewriterText text={data.hero.headline} delay={0.3} />
            </div>

            {/* Subline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-[18px] md:text-[24px] text-[#E0E0E0]/80 leading-relaxed"
              style={{ lineHeight: "1.8" }}
            >
              {data.hero.subline}
            </motion.p>

            {/* Origin Story */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="text-[16px] md:text-[20px] text-[#E0E0E0]/70 leading-relaxed max-w-[55ch] mx-auto"
              style={{ lineHeight: "1.8" }}
            >
              {data.hero.origin}
            </motion.p>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 pt-6"
            >
              {data.hero.badges.map((badge, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.05, borderColor: "rgba(255,157,35,0.6)" }}
                  className="border border-[#E0E0E0]/40 bg-transparent px-5 py-3 text-[16px] text-[#E0E0E0] uppercase cursor-default transition-all"
                >
                  {badge}
                </motion.span>
              ))}
            </motion.div>
          </section>
        </AnimatedSection>

        {/* Animated Divider */}
        <AnimatedDivider />

        {/* Pull Quote - Staggered Reveal */}
        <AnimatedSection delay={0.2}>
          <section className="text-center py-12">
            <blockquote className="text-[28px] md:text-[36px] font-bold text-[#FF9D23] uppercase leading-tight">
              <StaggeredWords text="GOOD IDEAS DON'T SHOUT—" />
              <br />
              <StaggeredWords text="THEY STICK." />
            </blockquote>
          </section>
        </AnimatedSection>

        {/* Animated Divider */}
        <AnimatedDivider delay={0.2} />

        {/* Core Principles (Beliefs) */}
        <AnimatedSection delay={0.3}>
          <section className="space-y-6">
            <motion.h2
              whileHover={{ x: 5 }}
              className="text-[24px] md:text-[30px] font-bold text-[#E0E0E0] uppercase flex items-center gap-3"
            >
              <span className="text-[#FF9D23]">▶</span> BELIEFS
            </motion.h2>
            <div className="space-y-5">
              {data.hero.principles.map((principle, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className="text-[24px] text-[#FF9D23] flex-shrink-0 cursor-default"
                  >
                    {principle.icon}
                  </motion.span>
                  <p className="text-[18px] md:text-[22px] text-[#E0E0E0] leading-relaxed" style={{ lineHeight: "1.8" }}>
                    {principle.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Animated Divider */}
        <AnimatedDivider delay={0.3} />

        {/* Collapsible Panels with Enhanced Animations */}
        <AnimatedSection delay={0.4}>
          <section className="space-y-6">
            <motion.h2
              whileHover={{ x: 5 }}
              className="text-[24px] md:text-[30px] font-bold text-[#E0E0E0] uppercase flex items-center gap-3 mb-8"
            >
              <span className="text-[#FF9D23]">▶</span> MORE ABOUT HTM
            </motion.h2>

            {/* Panel 1: How I Work */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <CollapsibleCard
                title="HOW I WORK"
                icon="⚙️"
                isOpen={openPanel === "how-i-work"}
                onToggle={() => togglePanel("how-i-work")}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Process Steps */}
                  <div>
                    <h4 className="text-[18px] md:text-[22px] font-bold text-[#E0E0E0] mb-5 uppercase">
                      Process
                    </h4>
                    <div className="space-y-4">
                      {data.process.steps.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.4 }}
                          className="flex items-start gap-4 border-l-2 border-[#FF9D23]/40 pl-5"
                        >
                          <span className="text-[24px] text-[#FF9D23] flex-shrink-0">{step.num}</span>
                          <div>
                            <div className="font-bold text-[18px] text-[#E0E0E0]">
                              {step.title} • <span className="text-[#FF9D23]">{step.promise}</span>
                            </div>
                            <div className="text-[16px] text-[#E0E0E0]/70">{step.duration}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Operations */}
                  <div>
                    <h4 className="text-[18px] md:text-[22px] font-bold text-[#E0E0E0] mb-5 uppercase">
                      Operations
                    </h4>
                    <div className="space-y-3">
                      {data.ops.items.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.4 }}
                          className="flex items-start gap-4"
                        >
                          <span className="text-[20px] text-[#FF9D23] flex-shrink-0">{item.icon}</span>
                          <p className="text-[16px] md:text-[20px] text-[#E0E0E0]">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Setup */}
                  <div className="border-t border-[#E0E0E0]/20 pt-5">
                    <p className="text-[16px] md:text-[20px] text-[#E0E0E0]/80 leading-relaxed" style={{ lineHeight: "1.8" }}>
                      {data.setup.line}
                    </p>
                  </div>
                </motion.div>
              </CollapsibleCard>
            </motion.div>

            {/* Panel 2: Who I Work With */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CollapsibleCard
                title="WHO I WORK WITH"
                icon="🤝"
                isOpen={openPanel === "who-with"}
                onToggle={() => togglePanel("who-with")}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Best For */}
                  <div>
                    <h4 className="text-[18px] md:text-[22px] font-bold text-[#E0E0E0] mb-5 uppercase">
                      Best For
                    </h4>
                    <div className="space-y-3">
                      {data.hero.principles.map((principle, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.4 }}
                          className="flex items-start gap-4"
                        >
                          <span className="text-[20px] text-[#FF9D23] flex-shrink-0">✓</span>
                          <p className="text-[16px] md:text-[20px] text-[#E0E0E0]">{principle.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Not Right For */}
                  <div>
                    <h4 className="text-[18px] md:text-[22px] font-bold text-[#E0E0E0] mb-5 uppercase">
                      Not Right For
                    </h4>
                    <div className="space-y-3">
                      {data.notRightFor.items.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.08, duration: 0.4 }}
                          className="flex items-start gap-4"
                        >
                          <span className="text-[20px] text-[#E0E0E0]/50 flex-shrink-0">{item.icon}</span>
                          <p className="text-[16px] md:text-[20px] text-[#E0E0E0]/70">{item.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Industries */}
                  <div className="border-t border-[#E0E0E0]/20 pt-5">
                    <div className="flex flex-wrap gap-3">
                      {data.proof.highlights.map((highlight, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          whileHover={{ scale: 1.05, borderColor: "rgba(255,157,35,0.5)" }}
                          className="border border-[#E0E0E0]/30 bg-transparent px-4 py-2 text-[14px] md:text-[16px] text-[#E0E0E0]/80 cursor-default transition-all"
                        >
                          {highlight.label}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </CollapsibleCard>
            </motion.div>

            {/* Panel 3: Pricing & Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CollapsibleCard
                title="PRICING & TERMS"
                icon="💰"
                isOpen={openPanel === "pricing"}
                onToggle={() => togglePanel("pricing")}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="space-y-8"
                >
                  {/* Projects */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <h4 className="text-[18px] md:text-[22px] font-bold text-[#FF9D23] mb-3">
                      Projects
                    </h4>
                    <p className="text-[24px] font-bold text-[#E0E0E0] mb-2">{data.pricing.projects}</p>
                    <p className="text-[16px] text-[#E0E0E0]/70">{data.pricing.projectLength}</p>
                  </motion.div>

                  {/* Retainers */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <h4 className="text-[18px] md:text-[22px] font-bold text-[#FF9D23] mb-3">
                      Retainers
                    </h4>
                    <p className="text-[24px] font-bold text-[#E0E0E0] mb-2">{data.pricing.retainers}</p>
                    <p className="text-[16px] text-[#E0E0E0]/70">{data.pricing.retainerDetails}</p>
                  </motion.div>

                  {/* Terms */}
                  <div className="border-t border-[#E0E0E0]/20 pt-5">
                    <h4 className="text-[18px] font-bold text-[#E0E0E0] mb-3 uppercase">Payment Terms</h4>
                    <p className="text-[16px] text-[#E0E0E0] mb-2">{data.pricing.terms}</p>
                    <p className="text-[14px] text-[#E0E0E0]/70">{data.pricing.termsDetail}</p>
                  </div>

                  {/* Guarantee */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-[#FF9D23]/50 bg-[#FF9D23]/10 px-5 py-4"
                  >
                    <p className="text-[16px] md:text-[20px] text-[#E0E0E0] font-bold">{data.pricing.guarantee}</p>
                  </motion.div>
                </motion.div>
              </CollapsibleCard>
            </motion.div>
          </section>
        </AnimatedSection>

        {/* Animated Divider */}
        <AnimatedDivider delay={0.4} />

        {/* Stats/Metrics */}
        <AnimatedSection delay={0.5}>
          <section className="space-y-8">
            <motion.h2
              whileHover={{ x: 5 }}
              className="text-[24px] md:text-[30px] font-bold text-[#E0E0E0] uppercase flex items-center gap-3"
            >
              <span className="text-[#FF9D23]">▶</span> BY THE NUMBERS
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Object.entries(data.stats).map(([key, value], idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  whileHover={{ scale: 1.05, borderColor: "rgba(255,157,35,0.6)" }}
                  className="border border-[#E0E0E0]/40 bg-transparent px-5 py-4 text-center cursor-default transition-all"
                >
                  <div className="text-[30px] md:text-[38px] font-bold text-[#FF9D23]">{value}</div>
                  <div className="text-[14px] md:text-[16px] text-[#E0E0E0]/70 uppercase mt-2">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* Animated Divider */}
        <AnimatedDivider delay={0.5} />

        {/* CTA Section */}
        <AnimatedSection delay={0.6}>
          <section className="text-center space-y-8 pt-12 pb-8">
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[30px] md:text-[40px] font-bold text-[#E0E0E0] uppercase"
            >
              LET'S WORK TOGETHER
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[18px] md:text-[24px] text-[#E0E0E0]/80 leading-relaxed max-w-[55ch] mx-auto"
              style={{ lineHeight: "1.8" }}
            >
              {data.contact.status} • {data.contact.responseTime}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap gap-5 justify-center pt-6"
            >
              <motion.a
                href={`mailto:${data.contact.email}`}
                whileHover={{ scale: 1.05, backgroundColor: "#FFB84D" }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-[#FF9D23] bg-[#FF9D23] px-10 py-4 text-[18px] font-bold text-black uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF9D23]"
              >
                GET IN TOUCH →
              </motion.a>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/portfolio"
                  className="block border-2 border-[#E0E0E0] bg-transparent hover:border-[#FF9D23] hover:text-[#FF9D23] px-10 py-4 text-[18px] font-bold text-[#E0E0E0] uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E0E0E0]"
                >
                  VIEW WORK
                </Link>
              </motion.div>
            </motion.div>
          </section>
        </AnimatedSection>

        {/* Fade-out before footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="h-24"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))",
          }}
        />
      </main>

      {/* Signature Footer with Slide-up Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <SignatureFooter
          name="Nate Dorey"
          location="Sydney NSW"
          email={data.contact.email}
          className="mt-0"
        />
      </motion.div>
    </div>
  );
}
