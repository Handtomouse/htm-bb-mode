"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Project {
  slug: string;
  title: string;
  tags: string[];
  year: number;
  client: string;
  cover?: string;
  summary?: string;
  external?: { url?: string };
}

const PROJECTS: Project[] = [
  {
    slug: "swich-summer-2025",
    title: "S'WICH — Summer Campaign",
    tags: ["Campaign", "Content", "Motion"],
    year: 2025,
    client: "S'WICH",
    cover: "/images/projects/swich/cover.jpg",
    summary: "Iconic summer homage spots across Sydney with a bag motif.",
    external: { url: "https://eatswich.com.au" },
  },
  {
    slug: "maplemoon-rebrand",
    title: "MapleMoon — Brand Identity",
    tags: ["Branding", "Identity", "Packaging"],
    year: 2024,
    client: "MapleMoon",
    cover: "/images/projects/maplemoon/cover.jpg",
    summary: "Complete rebrand for artisan confectionery with whimsical packaging system.",
  },
  {
    slug: "jac-jack-aw24",
    title: "Jac+Jack — AW24 Campaign",
    tags: ["Fashion", "Photography", "Campaign"],
    year: 2024,
    client: "Jac+Jack",
    cover: "/images/projects/jacjack/cover.jpg",
    summary: "Minimalist autumn/winter lookbook shot in raw industrial spaces.",
  },
  {
    slug: "betoota-collabs",
    title: "Betoota — Collaboration Suite",
    tags: ["Content", "Strategy", "Branded"],
    year: 2024,
    client: "Betoota Collabs",
    cover: "/images/projects/betoota/cover.jpg",
    summary: "Multi-brand content partnerships with Australia's satirical news leader.",
  },
  {
    slug: "materre-wellness",
    title: "Materre — Brand Launch",
    tags: ["Branding", "Web", "Content"],
    year: 2024,
    client: "Materre",
    cover: "/images/projects/materre/cover.jpg",
    summary: "Holistic brand and digital experience for wellness retreat.",
  },
  {
    slug: "cape-lands-ip",
    title: "Cape Lands — Print Series",
    tags: ["IP", "Art Direction", "Print"],
    year: 2023,
    client: "Cape Lands",
    cover: "/images/projects/capelands/cover.jpg",
    summary: "Limited edition print series celebrating Australian coastal landscapes.",
  },
  {
    slug: "myflowerman-refresh",
    title: "MyFlowerMan — Digital Refresh",
    tags: ["Web", "UX", "Ecommerce"],
    year: 2024,
    client: "MyFlowerMan",
    cover: "/images/projects/myflowerman/cover.jpg",
    summary: "Streamlined ecommerce experience with focus on seasonal ranges.",
  },
  {
    slug: "mix-family-venues",
    title: "Mix Family Group — Venue System",
    tags: ["Branding", "Signage", "Experience"],
    year: 2023,
    client: "Mix Family Group",
    cover: "/images/projects/mix/cover.jpg",
    summary: "Unified identity system across hospitality portfolio.",
  },
];

function getInitials(client: string): string {
  return client
    .split(/[\s''+&—-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

function ProjectCoverImage({ project }: { project: Project }) {
  const [imgError, setImgError] = useState(false);

  if (!project.cover || imgError) {
    return (
      <div
        className="w-full aspect-video flex items-center justify-center"
        style={{
          backgroundColor: "#131313",
          border: "1px solid #F7A835",
        }}
      >
        <span
          style={{
            fontFamily: "VT323, monospace",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "#F7A835",
            letterSpacing: "0.05em",
          }}
        >
          {getInitials(project.client)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video relative overflow-hidden">
      <Image
        src={project.cover}
        alt={project.title}
        fill
        className="object-cover"
        onError={() => setImgError(true)}
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    </div>
  );
}

export default function BlackberryFavouritesContent() {
  return (
    <div
      className="h-full overflow-y-auto"
      style={{ fontFamily: "Roboto Mono, monospace" }}
    >
      {/* Section Header */}
      <div className="px-4 pt-6 pb-4 md:px-6">
        <h1
          className="tracking-widest uppercase text-sm text-[var(--ink)]"
          style={{ fontFamily: "Roboto Mono, monospace" }}
        >
          SELECTED WORK
        </h1>
        <div
          className="mt-1 h-[1px]"
          style={{ background: "linear-gradient(90deg, #F7A835 0%, transparent 100%)" }}
        />
      </div>

      {/* Gallery Grid */}
      <div className="px-4 pb-8 md:px-6">
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
          {PROJECTS.map((project, index) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative flex flex-col overflow-hidden"
              style={{
                backgroundColor: "#131313",
                border: "1px solid #2A2A2A",
                transition: "box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease",
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 0 1px #F7A835, 0 4px 24px rgba(247, 168, 53,0.25)",
              }}
            >
              {/* Cover image or placeholder */}
              <ProjectCoverImage project={project} />

              {/* Card body */}
              <div className="flex flex-col gap-1.5 p-3">
                {/* Client name */}
                <div
                  className="text-sm font-semibold uppercase leading-tight"
                  style={{
                    color: "#F7A835",
                    fontFamily: "Roboto Mono, monospace",
                    letterSpacing: "0.04em",
                  }}
                >
                  {project.client}
                </div>

                {/* Project title */}
                <div
                  className="text-xs leading-snug"
                  style={{
                    color: "#EDECEC",
                    fontFamily: "Roboto Mono, monospace",
                  }}
                >
                  {project.title.split("—")[1]?.trim() ?? project.title}
                </div>

                {/* Year */}
                <div
                  className="text-xs"
                  style={{ color: "#9A9A9A", fontFamily: "Roboto Mono, monospace" }}
                >
                  {project.year}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 text-[10px] uppercase"
                      style={{
                        fontFamily: "Roboto Mono, monospace",
                        color: "#9A9A9A",
                        border: "1px solid #2A2A2A",
                        borderRadius: "2px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
