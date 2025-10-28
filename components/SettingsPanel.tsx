"use client";

import { useState } from "react";
import type { Settings } from "@/lib/hooks";

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
}

export default function SettingsPanel({
  settings,
  onUpdate,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed right-3 bottom-3 z-40 w-[360px] max-w-[92vw] border border-[var(--grid)] bg-black/90 p-3 text-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="font-mono uppercase tracking-[0.05em] text-[var(--grey)]">
          /SETTINGS
        </div>
        <button
          className="border-3 border-[var(--accent)] px-2 py-1 font-mono transition-all hover:bg-[var(--accent)] hover:text-black"
          onClick={() => setOpen(!open)}
        >
          {open ? "HIDE" : "SHOW"}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Dock Mode */}
          <div>
            <div className="mb-1 font-mono text-xs uppercase">Dock Icons</div>
            <div className="flex gap-2">
              <button
                className={`border-3 border-[var(--accent)] px-2 py-1 font-mono transition-all ${
                  settings.dockMode === "mono"
                    ? "bg-[var(--accent)] text-black"
                    : "hover:bg-[var(--accent)] hover:text-black"
                }`}
                onClick={() =>
                  onUpdate({ ...settings, dockMode: "mono" })
                }
              >
                MONO
              </button>
              <button
                className={`border-3 border-[var(--accent)] px-2 py-1 font-mono transition-all ${
                  settings.dockMode === "bb"
                    ? "bg-[var(--accent)] text-black"
                    : "hover:bg-[var(--accent)] hover:text-black"
                }`}
                onClick={() => onUpdate({ ...settings, dockMode: "bb" })}
              >
                BB PIXEL
              </button>
            </div>
          </div>

          {/* Sound */}
          <div>
            <div className="mb-1 font-mono text-xs uppercase">Sound</div>
            <div className="flex gap-2">
              <button
                className={`border-3 border-[var(--accent)] px-2 py-1 font-mono transition-all ${
                  settings.sound
                    ? "bg-[var(--accent)] text-black"
                    : "hover:bg-[var(--accent)] hover:text-black"
                }`}
                onClick={() => onUpdate({ ...settings, sound: true })}
              >
                ON
              </button>
              <button
                className={`border-3 border-[var(--accent)] px-2 py-1 font-mono transition-all ${
                  !settings.sound
                    ? "bg-[var(--accent)] text-black"
                    : "hover:bg-[var(--accent)] hover:text-black"
                }`}
                onClick={() => onUpdate({ ...settings, sound: false })}
              >
                OFF
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-[var(--muted)]">
            <div className="mb-1 font-mono uppercase">Status</div>
            <ul className="space-y-1">
              <li className="flex items-start gap-2">
                <span>✔</span>
                <span>Settings persist in localStorage</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✔</span>
                <span>Dock mode: {settings.dockMode.toUpperCase()}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✔</span>
                <span>Click sound: {settings.sound ? "ON" : "OFF"}</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
