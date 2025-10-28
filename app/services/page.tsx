"use client";

import { useState, useEffect } from "react";

interface Service {
  title: string;
  category: string;
  description: string;
  deliverables: string[];
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/data/services.json")
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  // Group by category
  const grouped = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> SERVICES
      </h1>

      <div className="space-y-12">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="mb-4 font-mono text-2xl uppercase text-[var(--accent)]">
              {category}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((service) => (
                <div
                  key={service.title}
                  className="border border-[var(--grid)] bg-[var(--panel)] p-6 transition-all hover:border-[var(--accent)]"
                >
                  <h3 className="mb-3 font-mono text-xl uppercase">
                    {service.title}
                  </h3>
                  <p className="mb-4 leading-relaxed text-[var(--muted)]">
                    {service.description}
                  </p>
                  {service.deliverables && service.deliverables.length > 0 && (
                    <div>
                      <div className="mb-2 font-mono text-xs uppercase text-[var(--muted)]">
                        Deliverables
                      </div>
                      <ul className="list-inside list-disc space-y-1 text-sm">
                        {service.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
