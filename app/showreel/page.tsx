export default function ShowreelPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> SHOWREEL
      </h1>

      <div className="space-y-6">
        <p className="leading-relaxed">
          Motion, video, and animation work.
        </p>

        <div className="aspect-video border border-[var(--grid)] bg-[var(--panel)]">
          {/* Video player placeholder */}
        </div>

        <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
          <h2 className="mb-3 font-mono text-xl uppercase text-[var(--accent)]">
            Featured Work
          </h2>
          <p className="text-[var(--muted)]">
            Selected motion and video projects from recent campaigns.
          </p>
        </div>
      </div>
    </div>
  );
}
