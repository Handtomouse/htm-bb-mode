"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Project {
  slug: string;
  title: string;
  tags: string[];
  year: number;
  client: string;
  cover: string;
  gallery: string[];
  roles: string[];
  description?: string;
  impact?: string[];
}

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch("/data/projects.json")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p: Project) => p.slug === params.slug);
        setProject(found || null);
      });
  }, [params.slug]);

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="py-12 text-center text-[var(--muted)]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Back */}
      <Link
        href="/portfolio"
        className="mb-6 inline-block font-mono text-[var(--accent)] hover:underline"
      >
        ← BACK TO PORTFOLIO
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-mono text-4xl uppercase">
          <span className="slash-accent">/</span> {project.title}
        </h1>
        <div className="mb-3 text-lg text-[var(--muted)]">
          {project.client} • {project.year}
        </div>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="border border-[var(--accent)] px-2 py-1 font-mono text-xs uppercase text-[var(--accent)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Roles */}
      {project.roles && project.roles.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-2 font-mono text-xl uppercase text-[var(--muted)]">
            Roles
          </h2>
          <ul className="list-inside list-disc space-y-1">
            {project.roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="mb-8">
          <h2 className="mb-2 font-mono text-xl uppercase text-[var(--muted)]">
            Overview
          </h2>
          <p className="leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* Impact */}
      {project.impact && project.impact.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-2 font-mono text-xl uppercase text-[var(--muted)]">
            Impact
          </h2>
          <ul className="list-inside list-disc space-y-1">
            {project.impact.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Gallery - Placeholder until images are added */}
      <div className="mb-8">
        <h2 className="mb-4 font-mono text-xl uppercase text-[var(--muted)]">
          Gallery
        </h2>
        <div className="space-y-4">
          {project.gallery.map((img, i) => (
            <div
              key={i}
              className="aspect-video bg-gradient-to-br from-[var(--accent)]/20 to-[var(--grid)] flex items-center justify-center border border-[var(--grid)]"
            >
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-50">📷</div>
                <div className="text-xs text-[var(--muted)]">Image {i + 1}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
