"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/about.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  const togglePanel = (panelName: string) => {
    setOpenPanel(openPanel === panelName ? null : panelName);
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[16px] text-[#E0E0E0]/70 animate-pulse" style={{ fontFamily: "VT323, monospace" }}>
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#E0E0E0]" style={{ fontFamily: "VT323, monospace" }}>
      {/* Main Content Container - Centered with max-width ~60ch */}
      <main className="max-w-[60ch] mx-auto px-6 py-12 md:py-16 space-y-16">

        {/* Hero Section - Introduction */}
        <section className="space-y-6 text-center">
          <h1 className="text-[32px] md:text-[40px] font-bold text-[#FF9D23] uppercase tracking-wide leading-tight">
            {data.hero.title}
          </h1>

          {/* Concise Summary Line */}
          <p className="text-[18px] md:text-[22px] text-[#E0E0E0] leading-relaxed" style={{ lineHeight: "1.6" }}>
            {data.hero.headline}
          </p>

          {/* Subline */}
          <p className="text-[16px] md:text-[18px] text-[#E0E0E0]/80 leading-relaxed" style={{ lineHeight: "1.7" }}>
            {data.hero.subline}
          </p>

          {/* Origin Story (Brief) */}
          <p className="text-[14px] md:text-[16px] text-[#E0E0E0]/70 leading-relaxed max-w-[50ch] mx-auto" style={{ lineHeight: "1.7" }}>
            {data.hero.origin}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {data.hero.badges.map((badge, idx) => (
              <span
                key={idx}
                className="border border-[#E0E0E0]/40 bg-transparent px-4 py-2 text-[14px] text-[#E0E0E0] uppercase"
              >
                {badge}
              </span>
            ))}
          </div>
        </section>

        {/* Pixel Rule Separator */}
        <div className="border-t border-[#E0E0E0]/30 border-dashed" />

        {/* Pull Quote - Key Phrase */}
        <section className="text-center py-8">
          <blockquote className="text-[24px] md:text-[30px] font-bold text-[#FF9D23] uppercase leading-tight">
            "GOOD IDEAS DON'T SHOUT—<br />THEY STICK."
          </blockquote>
        </section>

        {/* Pixel Rule Separator */}
        <div className="border-t border-[#E0E0E0]/30 border-dashed" />

        {/* Core Principles (Beliefs) */}
        <section className="space-y-4">
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#E0E0E0] uppercase flex items-center gap-2">
            <span className="text-[#FF9D23]">▶</span> BELIEFS
          </h2>
          <div className="space-y-3">
            {data.hero.principles.map((principle, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-[20px] text-[#FF9D23] flex-shrink-0">{principle.icon}</span>
                <p className="text-[16px] md:text-[18px] text-[#E0E0E0] leading-relaxed" style={{ lineHeight: "1.7" }}>
                  {principle.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pixel Rule Separator */}
        <div className="border-t border-[#E0E0E0]/30 border-dashed" />

        {/* Collapsible Panels */}
        <section className="space-y-4">
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#E0E0E0] uppercase flex items-center gap-2 mb-6">
            <span className="text-[#FF9D23]">▶</span> MORE ABOUT HTM
          </h2>

          {/* Panel 1: How I Work */}
          <CollapsibleCard
            title="HOW I WORK"
            icon="⚙️"
            isOpen={openPanel === "how-i-work"}
            onToggle={() => togglePanel("how-i-work")}
          >
            <div className="space-y-6">
              {/* Process Steps */}
              <div>
                <h4 className="text-[16px] md:text-[18px] font-bold text-[#E0E0E0] mb-4 uppercase">
                  Process
                </h4>
                <div className="space-y-3">
                  {data.process.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-l-2 border-[#FF9D23]/40 pl-4">
                      <span className="text-[20px] text-[#FF9D23] flex-shrink-0">{step.num}</span>
                      <div>
                        <div className="font-bold text-[#E0E0E0]">
                          {step.title} • <span className="text-[#FF9D23]">{step.promise}</span>
                        </div>
                        <div className="text-[14px] text-[#E0E0E0]/70">{step.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operations */}
              <div>
                <h4 className="text-[16px] md:text-[18px] font-bold text-[#E0E0E0] mb-4 uppercase">
                  Operations
                </h4>
                <div className="space-y-2">
                  {data.ops.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[16px] text-[#FF9D23] flex-shrink-0">{item.icon}</span>
                      <p className="text-[14px] md:text-[16px] text-[#E0E0E0]">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Setup */}
              <div className="border-t border-[#E0E0E0]/20 pt-4">
                <p className="text-[14px] md:text-[16px] text-[#E0E0E0]/80 leading-relaxed" style={{ lineHeight: "1.7" }}>
                  {data.setup.line}
                </p>
              </div>
            </div>
          </CollapsibleCard>

          {/* Panel 2: Who I Work With */}
          <CollapsibleCard
            title="WHO I WORK WITH"
            icon="🤝"
            isOpen={openPanel === "who-with"}
            onToggle={() => togglePanel("who-with")}
          >
            <div className="space-y-6">
              {/* Right For */}
              <div>
                <h4 className="text-[16px] md:text-[18px] font-bold text-[#E0E0E0] mb-4 uppercase">
                  Best For
                </h4>
                <div className="space-y-2">
                  {data.hero.principles.map((principle, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[16px] text-[#FF9D23] flex-shrink-0">✓</span>
                      <p className="text-[14px] md:text-[16px] text-[#E0E0E0]">{principle.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Not Right For */}
              <div>
                <h4 className="text-[16px] md:text-[18px] font-bold text-[#E0E0E0] mb-4 uppercase">
                  Not Right For
                </h4>
                <div className="space-y-2">
                  {data.notRightFor.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[16px] text-[#E0E0E0]/50 flex-shrink-0">{item.icon}</span>
                      <p className="text-[14px] md:text-[16px] text-[#E0E0E0]/70">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Past Clients/Industries */}
              <div className="border-t border-[#E0E0E0]/20 pt-4">
                <div className="flex flex-wrap gap-2">
                  {data.proof.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="border border-[#E0E0E0]/30 bg-transparent px-3 py-1 text-[12px] md:text-[14px] text-[#E0E0E0]/80"
                    >
                      {highlight.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleCard>

          {/* Panel 3: Pricing & Terms */}
          <CollapsibleCard
            title="PRICING & TERMS"
            icon="💰"
            isOpen={openPanel === "pricing"}
            onToggle={() => togglePanel("pricing")}
          >
            <div className="space-y-6">
              {/* Projects */}
              <div>
                <h4 className="text-[16px] md:text-[18px] font-bold text-[#FF9D23] mb-2">
                  Projects
                </h4>
                <p className="text-[20px] font-bold text-[#E0E0E0] mb-1">{data.pricing.projects}</p>
                <p className="text-[14px] text-[#E0E0E0]/70">{data.pricing.projectLength}</p>
              </div>

              {/* Retainers */}
              <div>
                <h4 className="text-[16px] md:text-[18px] font-bold text-[#FF9D23] mb-2">
                  Retainers
                </h4>
                <p className="text-[20px] font-bold text-[#E0E0E0] mb-1">{data.pricing.retainers}</p>
                <p className="text-[14px] text-[#E0E0E0]/70">{data.pricing.retainerDetails}</p>
              </div>

              {/* Terms */}
              <div className="border-t border-[#E0E0E0]/20 pt-4">
                <h4 className="text-[16px] font-bold text-[#E0E0E0] mb-2 uppercase">Payment Terms</h4>
                <p className="text-[14px] text-[#E0E0E0] mb-1">{data.pricing.terms}</p>
                <p className="text-[12px] text-[#E0E0E0]/70">{data.pricing.termsDetail}</p>
              </div>

              {/* Guarantee */}
              <div className="border border-[#FF9D23]/50 bg-[#FF9D23]/10 px-4 py-3">
                <p className="text-[14px] md:text-[16px] text-[#E0E0E0] font-bold">{data.pricing.guarantee}</p>
              </div>
            </div>
          </CollapsibleCard>
        </section>

        {/* Pixel Rule Separator */}
        <div className="border-t border-[#E0E0E0]/30 border-dashed" />

        {/* Stats/Metrics */}
        <section className="space-y-6">
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#E0E0E0] uppercase flex items-center gap-2">
            <span className="text-[#FF9D23]">▶</span> BY THE NUMBERS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(data.stats).map(([key, value]) => (
              <div key={key} className="border border-[#E0E0E0]/40 bg-transparent px-4 py-3 text-center">
                <div className="text-[24px] md:text-[30px] font-bold text-[#FF9D23]">{value}</div>
                <div className="text-[12px] md:text-[14px] text-[#E0E0E0]/70 uppercase mt-1">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pixel Rule Separator */}
        <div className="border-t border-[#E0E0E0]/30 border-dashed" />

        {/* CTA Section */}
        <section className="text-center space-y-6 pt-8">
          <h2 className="text-[24px] md:text-[32px] font-bold text-[#E0E0E0] uppercase">
            LET'S WORK TOGETHER
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#E0E0E0]/80 leading-relaxed max-w-[50ch] mx-auto" style={{ lineHeight: "1.7" }}>
            {data.contact.status} • {data.contact.responseTime}
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <a
              href={`mailto:${data.contact.email}`}
              className="border-2 border-[#FF9D23] bg-[#FF9D23] hover:bg-[#FFB84D] px-8 py-3 text-[16px] font-bold text-black uppercase transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FF9D23]"
            >
              GET IN TOUCH →
            </a>
            <Link
              href="/portfolio"
              className="border-2 border-[#E0E0E0] bg-transparent hover:border-[#FF9D23] hover:text-[#FF9D23] px-8 py-3 text-[16px] font-bold text-[#E0E0E0] uppercase transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#E0E0E0]"
            >
              VIEW WORK
            </Link>
          </div>
        </section>
      </main>

      {/* Signature Footer */}
      <SignatureFooter
        name="Nate Dorey"
        location="Sydney NSW"
        email={data.contact.email}
        className="mt-16"
      />
    </div>
  );
}
