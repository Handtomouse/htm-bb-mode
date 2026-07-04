import { MetadataRoute } from "next";
import postsData from "@/public/data/posts.json";
import projectsData from "@/public/data/projects.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://htm-bb-mode.vercel.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/portfolio`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/clients`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/notes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/games`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = (projectsData as { slug: string }[]).map((p) => ({
    url: `${baseUrl}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const noteRoutes: MetadataRoute.Sitemap = (postsData as { slug: string }[]).map((p) => ({
    url: `${baseUrl}/notes/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...noteRoutes];
}
