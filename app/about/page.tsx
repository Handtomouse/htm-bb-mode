export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> ABOUT
      </h1>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 font-mono text-2xl uppercase text-[var(--accent)]">
            HandToMouse
          </h2>
          <p className="leading-relaxed">
            Creative systems, content infrastructure, and brand work.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-2xl uppercase text-[var(--accent)]">
            What We Do
          </h2>
          <p className="mb-4 leading-relaxed">
            We build creative systems for brands, agencies, and platforms. Our
            work spans campaign strategy, content production, and technical
            infrastructure.
          </p>
          <ul className="list-inside list-disc space-y-2 text-[var(--muted)]">
            <li>Creative direction & campaign strategy</li>
            <li>Content systems & production pipelines</li>
            <li>Brand identity & visual systems</li>
            <li>Technical infrastructure & tooling</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-2xl uppercase text-[var(--accent)]">
            Approach
          </h2>
          <p className="leading-relaxed">
            We believe in building systems that scale. Our work focuses on
            creating repeatable frameworks, efficient workflows, and
            sustainable infrastructure that empowers teams to do their best
            work.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-2xl uppercase text-[var(--accent)]">
            Get In Touch
          </h2>
          <p className="leading-relaxed">
            Interested in working together?{" "}
            <a
              href="/contact"
              className="text-[var(--accent)] underline hover:no-underline"
            >
              Drop us a line
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
