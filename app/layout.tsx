"use client";

import { VT323 } from "next/font/google";
import "./globals.css";
import Dock from "@/components/Dock";
import SettingsPanel from "@/components/SettingsPanel";
import { useSettings, useClickSound } from "@/lib/hooks";
import { useEffect, useState } from "react";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, setSettings] = useSettings();
  const beep = useClickSound(settings.sound);
  const [power, setPower] = useState(false);

  // Global click sound
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button")) {
        beep();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [beep]);

  return (
    <html lang="en">
      <head>
        <title>HandToMouse — BB Mode</title>
        <meta
          name="description"
          content="Creative systems, content infrastructure, and brand work by HandToMouse."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${vt323.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <Dock mode={settings.dockMode} onPowerClick={() => setPower(!power)} />
        </div>

        <SettingsPanel settings={settings} onUpdate={setSettings} />

        {/* Power overlay */}
        {power && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/98"
            onClick={() => setPower(false)}
          >
            <div className="text-[var(--grey)]">POWER — TAP TO RESUME</div>
          </div>
        )}
      </body>
    </html>
  );
}
