export default function GamesPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> GAMES
      </h1>

      <div className="space-y-6">
        <p className="leading-relaxed">
          Interactive experiences and playful experiments.
        </p>

        <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
          <h2 className="mb-3 font-mono text-xl uppercase text-[var(--accent)]">
            Coming Soon
          </h2>
          <p className="text-[var(--muted)]">
            Games and interactive projects in development.
          </p>
        </div>
      </div>
    </div>
  );
}
