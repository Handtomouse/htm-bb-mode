"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProjectImagePlaceholder from "@/components/ProjectImagePlaceholder";

interface Project {
  slug: string;
  title: string;
  tags: string[];
  year: number;
  client: string;
  cover: string;
  description?: string;
}

export default function PortfolioContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data/projects.json")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);

        // Extract unique tags
        const tags = new Set<string>();
        data.forEach((p: Project) => p.tags.forEach((t: string) => tags.add(t)));
        setAllTags(["all", ...Array.from(tags).sort()]);
      });
  }, []);

  const filtered =
    filter === "all"
      ? projects
      : projects.filter((p) => p.tags.includes(filter));

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> PORTFOLIO
      </h1>

      {/* Currency signal */}
      <div
        className="mb-6"
        style={{
          fontFamily: 'Roboto Mono, monospace',
          fontSize: '11px',
          color: '#4A4A4A',
          letterSpacing: '0.08em',
          borderLeft: '2px solid #ff9d23',
          paddingLeft: '10px',
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: '#3A3A3A', textTransform: 'uppercase' }}>Currently working with:</span>{' '}
        <span style={{ color: '#6A6A6A' }}>S&apos;WICH · MapleMoon · Jac+Jack · Aura Therapeutics</span>
      </div>

      {/* Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`border-3 px-3 py-1 font-mono text-sm uppercase transition-all ${
              filter === tag
                ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                : "border-[var(--grid)] hover:border-[var(--accent)]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <Link
            key={project.slug}
            href={`/portfolio/${project.slug}`}
            className="group block border border-[var(--grid)] bg-[var(--panel)] p-4 transition-all hover:border-[var(--accent)]"
          >
            <div className="mb-3 aspect-video overflow-hidden border border-[var(--grid)]">
              {project.cover ? (
                <Image
                  src={project.cover}
                  alt={project.title}
                  width={640}
                  height={360}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <ProjectImagePlaceholder
                  client={project.client}
                  year={project.year}
                  tags={project.tags}
                  description={project.description}
                  className="aspect-video"
                />
              )}
            </div>
            <h2 className="mb-1 font-mono text-xl uppercase">{project.title}</h2>
            <div className="mb-2 text-sm text-[var(--muted)]">
              {project.client} • {project.year}
            </div>
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs uppercase text-[var(--accent)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-[var(--muted)]">
          No projects found
        </div>
      )}
    </div>
  );
}
