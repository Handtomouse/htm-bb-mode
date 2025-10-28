export default function WebPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> WEB
      </h1>

      <div className="space-y-6">
        <p className="leading-relaxed">
          Digital experiences, websites, and web applications.
        </p>

        <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
          <h2 className="mb-3 font-mono text-xl uppercase text-[var(--accent)]">
            Recent Web Projects
          </h2>
          <p className="text-[var(--muted)]">
            Content coming soon. Check back for updates on our latest web work.
          </p>
        </div>
      </div>
    </div>
  );
}
