import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProjectImagePlaceholder from "@/components/ProjectImagePlaceholder";
import projectsData from "@/public/data/projects.json";

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
  deliverables?: string[];
  external?: { url: string };
}

const projects: Project[] = projectsData as Project[];

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} | Portfolio`,
    description: project.description ?? `${project.client} • ${project.year}`,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
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

      {/* Hero cover */}
      <div className="mb-8 aspect-video overflow-hidden border border-[var(--grid)]">
        {project.cover ? (
          <Image
            src={project.cover}
            alt={project.title}
            width={1280}
            height={720}
            className="h-full w-full object-cover"
            priority
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

      {/* Gallery */}
      <div className="mb-8">
        <h2 className="mb-4 font-mono text-xl uppercase text-[var(--muted)]">
          Gallery
        </h2>
        {project.gallery && project.gallery.length > 0 ? (
          <div className="space-y-4">
            {project.gallery.map((img, i) => (
              <div
                key={i}
                className="overflow-hidden border border-[var(--grid)]"
              >
                <Image
                  src={img}
                  alt={`${project.title} — image ${i + 1}`}
                  width={1280}
                  height={720}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-video overflow-hidden border border-[var(--grid)]">
            <ProjectImagePlaceholder
              client={project.client}
              year={project.year}
              tags={project.tags}
              description={project.description}
              className="aspect-video"
            />
          </div>
        )}
      </div>

      {/* External link */}
      {project.external?.url && (
        <div className="mt-8">
          <a
            href={project.external.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm uppercase text-[var(--accent)] hover:underline"
          >
            VIEW PROJECT ↗
          </a>
        </div>
      )}
    </div>
  );
}
