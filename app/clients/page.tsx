"use client";

import { useState, useEffect } from "react";

interface Client {
  name: string;
  sector: string;
  projects: number;
  featured?: boolean;
  logo?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetch("/data/clients.json")
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);

  const featured = clients.filter((c) => c.featured);
  const others = clients.filter((c) => !c.featured);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> CLIENTS
      </h1>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-4 font-mono text-2xl uppercase text-[var(--muted)]">
            Featured
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((client) => (
              <div
                key={client.name}
                className="border border-[var(--grid)] bg-[var(--panel)] p-6 transition-all hover:border-[var(--accent)]"
              >
                <div className="mb-4 flex h-20 items-center justify-center bg-[var(--grid)]">
                  {/* Logo placeholder */}
                </div>
                <h3 className="mb-1 font-mono text-xl uppercase">
                  {client.name}
                </h3>
                <div className="mb-2 text-sm text-[var(--muted)]">
                  {client.sector}
                </div>
                <div className="font-mono text-xs text-[var(--accent)]">
                  {client.projects} PROJECT{client.projects !== 1 ? "S" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Clients */}
      <div>
        <h2 className="mb-4 font-mono text-2xl uppercase text-[var(--muted)]">
          All Clients
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((client) => (
            <div
              key={client.name}
              className="border border-[var(--grid)] bg-[var(--panel)] p-4 transition-all hover:border-[var(--accent)]"
            >
              <h3 className="mb-1 font-mono uppercase">{client.name}</h3>
              <div className="text-xs text-[var(--muted)]">{client.sector}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
