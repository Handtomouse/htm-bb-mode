import Link from "next/link";
import { notFound } from "next/navigation";
import postsData from "@/public/data/posts.json";

interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  body?: string;
}

const posts: Post[] = postsData;

const BASE_URL = "https://htm-bb-mode.vercel.app";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderBody(body: string) {
  const paragraphs = body.split("\n\n");
  return paragraphs.map((para, idx) => {
    if (para.startsWith("## ")) {
      const heading = para.slice(3);
      return (
        <h2
          key={idx}
          className="mt-8 mb-3 border-l-4 border-[#F7A835] pl-4 font-mono text-sm font-medium uppercase tracking-widest text-[#EDECEC]"
        >
          {heading}
        </h2>
      );
    }
    return (
      <p
        key={idx}
        className="mb-5 font-mono text-sm leading-loose text-[#EDECEC]"
      >
        {para}
      </p>
    );
  });
}

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  const url = `${BASE_URL}/notes/${post.slug}`;
  return {
    title: `${post.title} | HandToMouse Notes`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: [`${BASE_URL}/og-image.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    keywords: post.tags.join(", "),
    url: `${BASE_URL}/notes/${post.slug}`,
    author: { "@type": "Person", name: "Nate Don" },
    publisher: { "@type": "Organization", name: "Hand To Mouse", url: BASE_URL },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Notes", item: `${BASE_URL}/notes` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE_URL}/notes/${post.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/notes"
          className="font-mono text-xs uppercase tracking-widest text-[#9A9A9A] no-underline transition-colors duration-150 hover:text-[#F7A835]"
        >
          ← NOTES
        </Link>
      </div>

      {/* Post header */}
      <header className="mb-6">
        <h1
          className="mb-3 text-3xl font-bold leading-tight text-[#EDECEC]"
          style={{ fontFamily: "argent-pixel-cf, var(--font-body)" }}
        >
          {post.title}
        </h1>

        <div
          className="mb-3 text-base tracking-wider text-[#9A9A9A]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formatDate(post.date)}
        </div>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="border border-[#2A2A2A] px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-[#9A9A9A]"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Divider */}
      <div className="mb-8 h-px w-full bg-[#F7A835]" />

      {/* Body */}
      <article className="max-w-[65ch]">
        {post.body ? (
          renderBody(post.body)
        ) : (
          <p className="font-mono text-sm text-[#9A9A9A]">{post.excerpt}</p>
        )}
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 border-b border-[#2A2A2A] pb-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-[#9A9A9A]">
            MORE NOTES
          </div>
          <div className="flex flex-col gap-6">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/notes/${related.slug}`}
                className="block border border-[#2A2A2A] p-4 no-underline transition-all duration-150 hover:border-[#F7A835]"
              >
                <div className="mb-1 font-mono text-sm font-medium uppercase tracking-wider text-[#EDECEC]">
                  {related.title}
                </div>
                <div
                  className="mb-2 text-xs text-[#9A9A9A]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatDate(related.date)}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {related.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#2A2A2A] px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-[#9A9A9A]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom back link */}
      <div className="mt-12 border-t border-[#2A2A2A] pt-6">
        <Link
          href="/notes"
          className="font-mono text-xs uppercase tracking-widest text-[#9A9A9A] no-underline transition-colors duration-150 hover:text-[#F7A835]"
        >
          ← Back to all notes
        </Link>
      </div>
    </div>
  );
}
