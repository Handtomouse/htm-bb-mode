export default function ExtrasPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> EXTRAS
      </h1>

      <div className="space-y-6">
        <p className="leading-relaxed">
          Side projects, experiments, and miscellaneous work.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
            <h2 className="mb-3 font-mono text-xl uppercase">Templates</h2>
            <p className="text-sm text-[var(--muted)]">
              Open-source templates and starter kits
            </p>
          </div>

          <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
            <h2 className="mb-3 font-mono text-xl uppercase">Tools</h2>
            <p className="text-sm text-[var(--muted)]">
              Utility scripts and workflow helpers
            </p>
          </div>

          <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
            <h2 className="mb-3 font-mono text-xl uppercase">Experiments</h2>
            <p className="text-sm text-[var(--muted)]">
              Creative coding and visual experiments
            </p>
          </div>

          <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
            <h2 className="mb-3 font-mono text-xl uppercase">Resources</h2>
            <p className="text-sm text-[var(--muted)]">
              Guides, references, and documentation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
