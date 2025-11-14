"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHapticFeedback } from "@/lib/hooks";

const ACCENT = "#ff9d23";

interface Project {
  slug: string;
  title: string;
  tags: string[];
  year: number;
  client: string;
  cover?: string;
  description?: string;
  deliverables?: string[];
}

export default function BlackberryPortfolioContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const triggerHaptic = useHapticFeedback();

  useEffect(() => {
    fetch("/data/projects.json")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);

        // Extract unique tags
        const tags = new Set<string>();
        data.forEach((p: Project) => p.tags.forEach((t: string) => tags.add(t)));
        setAllTags(["all", ...Array.from(tags).sort()]);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // ESC key to close modal
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedProject) {
        triggerHaptic(10);
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [selectedProject, triggerHaptic]);

  const filtered = filter === "all" ? projects : projects.filter((p) => p.tags.includes(filter));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[20px] text-white/70"
          style={{ fontFamily: "VT323, monospace" }}
        >
          LOADING PORTFOLIO...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden px-4 md:px-6" style={{ fontFamily: "VT323, monospace" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-8 md:py-12"
      >
        <h1
          className="text-[56px] md:text-[72px] font-light text-[#ff9d23] mb-8 leading-[0.9] uppercase tracking-[0.15em]"
          style={{
            textShadow: "0 0 40px rgba(255, 157, 35, 0.4)",
          }}
        >
          Portfolio
        </h1>

        <p className="text-[16px] md:text-[18px] text-white/75 leading-[2.2] font-light tracking-wide mb-8">
          <span className="tabular-nums text-[#ff9d23]">{projects.length}</span> projects across multiple
          disciplines. Filtered: <span className="tabular-nums text-[#ff9d23]">{filtered.length}</span>
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
        className="h-[1px] bg-gradient-to-r from-transparent via-[#ff9d23]/40 to-transparent mb-8"
      />

      {/* Filter Tags */}
      <div className="mb-8 flex flex-wrap gap-3">
        {allTags.map((tag) => (
          <motion.button
            key={tag}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic(10);
              setFilter(tag);
            }}
            className={`px-6 py-2.5 text-[12px] font-light tracking-[0.15em] uppercase border transition-all duration-500 ${
              filter === tag
                ? "border-[#ff9d23] bg-[#ff9d23]/20 text-[#ff9d23]"
                : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10"
            }`}
            style={
              filter === tag
                ? {
                    boxShadow: "0 0 20px rgba(255,157,35,0.3)",
                  }
                : {}
            }
          >
            {tag}
          </motion.button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="pb-12">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-white/50 text-[16px]">
            No projects found for this filter
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                delay={index * 0.05}
                onClick={() => {
                  triggerHaptic(15);
                  setSelectedProject(project);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 overflow-y-auto"
          onClick={() => {
            triggerHaptic(10);
            setSelectedProject(null);
          }}
          style={{ backgroundColor: "rgba(0,0,0,0.85)", top: 0, bottom: 0 }}
        >
          <div className="min-h-full flex items-center justify-center p-3">
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 p-4 md:p-6 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: "0 0 20px rgba(255,157,35,0.2)",
              }}
            >
              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(10);
                  setSelectedProject(null);
                }}
                className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white/5 transition-all duration-300 group"
                style={{
                  borderColor: "#ff9d23",
                }}
              >
                <div className="relative w-4 h-4">
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 rotate-45" />
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 -rotate-45" />
                </div>
              </button>

              {/* Project Title */}
              <div className="mb-8 pb-8 border-b border-white/5">
                <h2 className="text-[32px] font-thin text-white tracking-[0.08em] mb-4">
                  {selectedProject.title}
                </h2>
                <div className="flex items-center gap-4 text-[14px] text-white/70">
                  <span>{selectedProject.client}</span>
                  <span>•</span>
                  <span>{selectedProject.year}</span>
                </div>
              </div>

              {/* Project Details */}
              <div className="mb-8 space-y-6">
                {selectedProject.description && (
                  <div>
                    <p className="text-[12px] text-white font-medium uppercase tracking-[0.15em] mb-2">
                      Description
                    </p>
                    <p className="text-[16px] text-white leading-[1.6] font-light">
                      {selectedProject.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[12px] text-white font-medium uppercase tracking-[0.15em] mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-[12px] bg-white/5 border border-white/10 text-white"
                        style={{ fontFamily: "ui-monospace, monospace" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProject.deliverables && selectedProject.deliverables.length > 0 && (
                  <div>
                    <p className="text-[12px] text-white font-medium uppercase tracking-[0.15em] mb-2">
                      Deliverables
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.deliverables.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 text-[12px] bg-white/5 border border-white/10 text-white"
                          style={{ fontFamily: "ui-monospace, monospace" }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  delay,
  onClick,
}: {
  project: Project;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: delay + 0.1,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      onClick={onClick}
      className="group relative border border-white/5 bg-[#0b0b0b] p-4 md:p-6 hover:bg-white/5 transition-all duration-500 overflow-hidden hover:cursor-pointer min-h-[180px] text-left"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, #ff9d23 50%, transparent 100%)`,
        }}
      />

      {/* Project content */}
      <div className="relative">
        {/* Project cover placeholder */}
        <div className="mb-4 aspect-video bg-gradient-to-br from-[#ff9d23]/20 to-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#ff9d23]/30 transition-all duration-500">
          <div className="text-5xl opacity-50">📁</div>
        </div>

        {/* Project title */}
        <h2 className="text-[16px] md:text-[18px] font-thin text-white tracking-[0.08em] mb-2 group-hover:text-[#ff9d23] transition-colors duration-500">
          {project.title}
        </h2>

        {/* Client & Year */}
        <div className="text-[12px] text-white/60 mb-3 font-light">
          {project.client} • {project.year}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-[#ff9d23]/80 uppercase tracking-wider font-mono"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-[10px] text-white/40 font-mono">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Subtle glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: "#ff9d23" }}
      />
    </motion.button>
  );
}
