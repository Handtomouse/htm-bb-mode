"use client";

import { useSettings } from "@/lib/hooks";

export default function SettingsPage() {
  const [settings, setSettings] = useSettings();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> SETTINGS
      </h1>

      <div className="space-y-8">
        {/* Dock Mode */}
        <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
          <h2 className="mb-4 font-mono text-xl uppercase text-[var(--accent)]">
            Dock Icons
          </h2>
          <div className="flex gap-3">
            <button
              className={`border-3 px-4 py-2 font-mono transition-all ${
                settings.dockMode === "mono"
                  ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                  : "border-[var(--grid)] hover:border-[var(--accent)]"
              }`}
              onClick={() => setSettings({ ...settings, dockMode: "mono" })}
            >
              MONO
            </button>
            <button
              className={`border-3 px-4 py-2 font-mono transition-all ${
                settings.dockMode === "bb"
                  ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                  : "border-[var(--grid)] hover:border-[var(--accent)]"
              }`}
              onClick={() => setSettings({ ...settings, dockMode: "bb" })}
            >
              BB PIXEL
            </button>
          </div>
        </div>

        {/* Sound */}
        <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
          <h2 className="mb-4 font-mono text-xl uppercase text-[var(--accent)]">
            Click Sound
          </h2>
          <div className="flex gap-3">
            <button
              className={`border-3 px-4 py-2 font-mono transition-all ${
                settings.sound
                  ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                  : "border-[var(--grid)] hover:border-[var(--accent)]"
              }`}
              onClick={() => setSettings({ ...settings, sound: true })}
            >
              ON
            </button>
            <button
              className={`border-3 px-4 py-2 font-mono transition-all ${
                !settings.sound
                  ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                  : "border-[var(--grid)] hover:border-[var(--accent)]"
              }`}
              onClick={() => setSettings({ ...settings, sound: false })}
            >
              OFF
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="border border-[var(--grid)] bg-[var(--panel)] p-6">
          <h2 className="mb-4 font-mono text-xl uppercase text-[var(--accent)]">
            Info
          </h2>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>✓ Settings persist in localStorage</li>
            <li>✓ Current mode: {settings.dockMode.toUpperCase()}</li>
            <li>✓ Click sound: {settings.sound ? "ON" : "OFF"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
