"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
}

export default function NotesPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/data/posts.json")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> NOTES
      </h1>

      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="border-b border-[var(--grid)] pb-8 last:border-0"
          >
            <Link
              href={`/notes/${post.slug}`}
              className="group block transition-all"
            >
              <h2 className="mb-2 font-mono text-2xl uppercase group-hover:text-[var(--accent)]">
                {post.title}
              </h2>
              <div className="mb-3 font-mono text-sm text-[var(--muted)]">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <p className="mb-3 leading-relaxed text-[var(--muted)]">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs uppercase text-[var(--accent)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="py-12 text-center text-[var(--muted)]">
            No posts yet
          </div>
        )}
      </div>
    </div>
  );
}
