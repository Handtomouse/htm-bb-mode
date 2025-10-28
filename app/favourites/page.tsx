export default function FavouritesPage() {
  const favourites = [
    { title: "Inspiration", items: ["Studio websites", "Design systems", "Motion work"] },
    { title: "Tools", items: ["Development", "Design", "Automation"] },
    { title: "Reading", items: ["Articles", "Books", "Newsletters"] },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> FAVOURITES
      </h1>

      <div className="space-y-6">
        <p className="leading-relaxed">
          Links, resources, and recommendations.
        </p>

        <div className="space-y-8">
          {favourites.map((section) => (
            <div
              key={section.title}
              className="border border-[var(--grid)] bg-[var(--panel)] p-6"
            >
              <h2 className="mb-4 font-mono text-xl uppercase text-[var(--accent)]">
                {section.title}
              </h2>
              <ul className="list-inside list-disc space-y-2 text-[var(--muted)]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
