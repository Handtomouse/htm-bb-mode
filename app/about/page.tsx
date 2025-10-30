"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AboutData {
  studio: {
    name: string;
    tagline: string;
    established: string;
    location: string;
    timezone: string;
    teamSize: string;
  };
  philosophy: Array<{
    title: string;
    description: string;
  }>;
  process: Array<{
    phase: string;
    description: string;
    duration: string;
    icon: string;
  }>;
  capabilities: {
    strategy: number;
    creative: number;
    technical: number;
    production: number;
  };
  values: Array<{
    title: string;
    icon: string;
    description: string;
  }>;
  metrics: {
    projectsCompleted: number;
    clientRetention: number;
    averageEngagement: string;
    satisfaction: number;
  };
  tools: {
    design: string[];
    development: string[];
    production: string[];
  };
  availability: {
    status: string;
    nextSlot: string;
    capacity: number;
  };
  industries: Array<{
    name: string;
    projects: number;
  }>;
  approach: {
    title: string;
    principles: string[];
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/data/about.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[16px] text-white/70 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-24">
      {/* Hero Section */}
      <section className="border-b border-white/20 pb-20">
        <div className="space-y-8">
          <h1 className="font-heading text-7xl font-bold text-white">
            {data.studio.name}
          </h1>
          <p className="text-3xl text-white/90 max-w-3xl leading-relaxed" style={{ lineHeight: "1.6" }}>
            {data.studio.tagline}
          </p>

          {/* Studio Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
            <div className="border border-white/20 bg-gradient-to-b from-white/12 to-white/6 p-6 rounded-none">
              <div className="text-[13px] text-white/60 mb-2 font-bold uppercase tracking-wider">Est.</div>
              <div className="font-heading text-[24px] text-[#ff9d23]">{data.studio.established}</div>
            </div>
            <div className="border border-white/20 bg-gradient-to-b from-white/12 to-white/6 p-6 rounded-none">
              <div className="text-[13px] text-white/60 mb-2 font-bold uppercase tracking-wider">Location</div>
              <div className="font-heading text-[24px] text-[#ff9d23]">{data.studio.location}</div>
            </div>
            <div className="border border-white/20 bg-gradient-to-b from-white/12 to-white/6 p-6 rounded-none">
              <div className="text-[13px] text-white/60 mb-2 font-bold uppercase tracking-wider">Time Zone</div>
              <div className="font-heading text-[24px] text-[#ff9d23]">{data.studio.timezone}</div>
            </div>
            <div className="border border-white/20 bg-gradient-to-b from-white/12 to-white/6 p-6 rounded-none">
              <div className="text-[13px] text-white/60 mb-2 font-bold uppercase tracking-wider">Team</div>
              <div className="font-heading text-[24px] text-[#ff9d23]">{data.studio.teamSize}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> Philosophy
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.philosophy.map((item, idx) => (
            <div
              key={idx}
              className="border border-white/20 bg-gradient-to-b from-white/12 to-white/7 p-8 rounded-none hover:border-[#ff9d23]/50 hover:shadow-[0_0_24px_rgba(255,157,35,0.25)] transition-all duration-300"
            >
              <h3 className="font-heading text-[18px] font-bold mb-4 text-white">
                {item.title}
              </h3>
              <p className="text-[16px] text-white/85 leading-relaxed" style={{ lineHeight: "1.8" }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Timeline */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> Process
        </h2>
        <div className="space-y-6">
          {data.process.map((phase, idx) => (
            <div
              key={idx}
              className="border border-white/20 bg-gradient-to-b from-white/10 to-white/6 p-8 rounded-none hover:border-[#ff9d23]/50 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="text-5xl">{phase.icon}</div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="font-heading text-[22px] font-bold text-white">
                      {idx + 1}. {phase.phase}
                    </h3>
                    <span className="text-[14px] text-[#ff9d23] font-bold">{phase.duration}</span>
                  </div>
                  <p className="text-[16px] text-white/85 leading-relaxed" style={{ lineHeight: "1.8" }}>{phase.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities Matrix */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> Capabilities
        </h2>
        <div className="space-y-8">
          {Object.entries(data.capabilities).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-heading text-[20px] font-bold text-white capitalize">
                  {key}
                </span>
                <span className="text-[18px] text-[#ff9d23] font-bold">{value}%</span>
              </div>
              <div className="h-4 border border-white/30 bg-black rounded-none overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff9d23] to-[#ffb84d] transition-all duration-1000 ease-out"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> By The Numbers
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border-2 border-[#ff9d23]/40 bg-gradient-to-b from-white/12 to-white/6 p-8 rounded-none text-center">
            <div className="font-heading text-5xl font-bold text-[#ff9d23] mb-3">
              {data.metrics.projectsCompleted}+
            </div>
            <div className="text-[15px] text-white/80 font-bold uppercase tracking-wider">
              Projects
            </div>
          </div>
          <div className="border-2 border-[#ff9d23]/40 bg-gradient-to-b from-white/12 to-white/6 p-8 rounded-none text-center">
            <div className="font-heading text-5xl font-bold text-[#ff9d23] mb-3">
              {data.metrics.clientRetention}%
            </div>
            <div className="text-[15px] text-white/80 font-bold uppercase tracking-wider">
              Retention
            </div>
          </div>
          <div className="border-2 border-[#ff9d23]/40 bg-gradient-to-b from-white/12 to-white/6 p-8 rounded-none text-center">
            <div className="font-heading text-5xl font-bold text-[#ff9d23] mb-3">
              {data.metrics.averageEngagement}
            </div>
            <div className="text-[15px] text-white/80 font-bold uppercase tracking-wider">
              Avg Engagement
            </div>
          </div>
          <div className="border-2 border-[#ff9d23]/40 bg-gradient-to-b from-white/12 to-white/6 p-8 rounded-none text-center">
            <div className="font-heading text-5xl font-bold text-[#ff9d23] mb-3">
              {data.metrics.satisfaction}/5
            </div>
            <div className="text-[15px] text-white/80 font-bold uppercase tracking-wider">
              Satisfaction
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> Values
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.values.map((value, idx) => (
            <div
              key={idx}
              className="border border-white/20 bg-gradient-to-b from-white/12 to-white/7 p-8 rounded-none hover:border-[#ff9d23]/50 hover:shadow-[0_0_24px_rgba(255,157,35,0.25)] transition-all duration-300"
            >
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="font-heading text-[19px] font-bold mb-3 text-white">
                {value.title}
              </h3>
              <p className="text-[16px] text-white/85 leading-relaxed" style={{ lineHeight: "1.8" }}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Approach */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> {data.approach.title}
        </h2>
        <div className="border border-white/20 bg-gradient-to-b from-white/10 to-white/6 p-10 rounded-none">
          <ul className="space-y-6">
            {data.approach.principles.map((principle, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span className="text-[#ff9d23] font-bold mt-1 text-xl">→</span>
                <span className="text-[17px] text-white/85 leading-relaxed" style={{ lineHeight: "1.8" }}>{principle}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Industries */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> Industries
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.industries.map((industry, idx) => (
            <div
              key={idx}
              className="border border-white/20 bg-gradient-to-b from-white/10 to-white/6 p-7 rounded-none hover:border-[#ff9d23]/50 transition-all duration-300"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-heading text-[18px] font-bold text-white">
                  {industry.name}
                </span>
                <span className="text-[15px] text-[#ff9d23] font-bold">
                  {industry.projects}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools & Stack */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> Tools & Stack
        </h2>
        <div className="space-y-8">
          {Object.entries(data.tools).map(([category, tools]) => (
            <div key={category}>
              <h3 className="font-heading text-[20px] font-bold text-white mb-4 capitalize">
                {category}
              </h3>
              <div className="flex flex-wrap gap-3">
                {tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="border border-white/25 bg-gradient-to-b from-white/12 to-white/6 px-5 py-3 text-[15px] text-white font-bold rounded-none hover:border-[#ff9d23]/50 hover:text-[#ff9d23] transition-all duration-300"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Availability */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> Availability
        </h2>
        <div className="border-2 border-[#ff9d23]/50 bg-gradient-to-b from-white/12 to-white/6 p-10 rounded-none">
          <div className="grid sm:grid-cols-3 gap-8 items-center">
            <div>
              <div className="text-[14px] text-white/60 mb-3 font-bold uppercase tracking-wider">
                Status
              </div>
              <div className="font-heading text-[24px] font-bold text-[#ff9d23] flex items-center gap-3">
                <span className="inline-block w-4 h-4 bg-[#ff9d23] rounded-full animate-pulse" />
                {data.availability.status}
              </div>
            </div>
            <div>
              <div className="text-[14px] text-white/60 mb-3 font-bold uppercase tracking-wider">
                Next Available
              </div>
              <div className="font-heading text-[24px] font-bold text-white">
                {data.availability.nextSlot}
              </div>
            </div>
            <div>
              <div className="text-[14px] text-white/60 mb-3 font-bold uppercase tracking-wider">
                Capacity
              </div>
              <div className="font-heading text-[24px] font-bold text-white">
                {data.availability.capacity}%
              </div>
              <div className="mt-3 h-3 border border-white/30 bg-black rounded-none overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff9d23] to-[#ffb84d]"
                  style={{ width: `${data.availability.capacity}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-heading text-4xl font-bold mb-10 text-white">
          <span className="text-[#ff9d23]">/</span> FAQ
        </h2>
        <div className="space-y-4">
          {data.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-white/20 bg-gradient-to-b from-white/10 to-white/6 rounded-none overflow-hidden hover:border-[#ff9d23]/40 transition-all duration-300"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left p-7 flex items-center justify-between gap-6 group"
              >
                <span className="font-heading text-[17px] font-bold text-white group-hover:text-[#ff9d23] transition-colors">
                  {faq.question}
                </span>
                <span className="text-[#ff9d23] text-2xl font-bold flex-shrink-0 transition-transform duration-300" style={{
                  transform: expandedFaq === idx ? "rotate(180deg)" : "rotate(0deg)"
                }}>
                  ▼
                </span>
              </button>
              {expandedFaq === idx && (
                <div className="px-7 pb-7 border-t border-white/15">
                  <p className="text-[16px] text-white/85 leading-relaxed pt-5" style={{ lineHeight: "1.8" }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/20 pt-20">
        <div className="text-center space-y-8">
          <h2 className="font-heading text-5xl font-bold text-white">
            Let's Work Together
          </h2>
          <p className="text-[18px] text-white/85 max-w-2xl mx-auto leading-relaxed" style={{ lineHeight: "1.8" }}>
            Interested in collaborating? Get in touch to discuss your project.
          </p>
          <div className="flex flex-wrap gap-5 justify-center pt-6">
            <Link
              href="/contact"
              className="border-2 border-[#ff9d23] bg-[#ff9d23] hover:bg-[#ff9d23]/90 px-10 py-5 font-heading text-[17px] font-bold text-black rounded-none transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Get In Touch →
            </Link>
            <Link
              href="/portfolio"
              className="border-2 border-white/40 hover:border-[#ff9d23]/70 px-10 py-5 font-heading text-[17px] font-bold text-white rounded-none transition-all duration-300 hover:scale-105 active:scale-95"
            >
              View Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
