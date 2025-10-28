"use client";

import { useRouter, usePathname } from "next/navigation";
import { MonoIcons, BBIcons } from "@/lib/icons";
import InlineIcon from "./InlineIcon";

interface DockProps {
  mode: "mono" | "bb";
  onPowerClick?: () => void;
}

export default function Dock({ mode, onPowerClick }: DockProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.back();
  };

  if (mode === "bb") {
    return (
      <footer className="mt-8 flex items-center justify-center gap-6 pb-4">
        <a
          href="/"
          aria-label="Home"
          data-active={isActive("/") ? "true" : undefined}
          className="transition-all hover:scale-110"
        >
          <InlineIcon svg={BBIcons.menu} className="[&>svg]:block" />
        </a>
        <a
          href="/services"
          aria-label="Services"
          data-active={isActive("/services") ? "true" : undefined}
          className="transition-all hover:scale-110"
        >
          <InlineIcon svg={MonoIcons.services} className="[&>svg]:block" />
        </a>
        <a
          href="/contact"
          aria-label="Contact"
          data-active={isActive("/contact") ? "true" : undefined}
          className="transition-all hover:scale-110"
        >
          <InlineIcon svg={BBIcons.call} className="[&>svg]:block" />
        </a>
        <a
          href="#"
          onClick={handleBack}
          aria-label="Back"
          className="transition-all hover:scale-110"
        >
          <InlineIcon svg={BBIcons.back} className="[&>svg]:block" />
        </a>
        <a
          href="/clients"
          aria-label="Clients"
          data-active={isActive("/clients") ? "true" : undefined}
          className="transition-all hover:scale-110"
        >
          <InlineIcon svg={MonoIcons.clients} className="[&>svg]:block" />
        </a>
        <button
          onClick={onPowerClick}
          aria-label="Power"
          className="transition-all hover:scale-110"
        >
          <InlineIcon svg={BBIcons.power} className="[&>svg]:block" />
        </button>
      </footer>
    );
  }

  // MONO mode
  return (
    <footer className="mt-8 flex items-center justify-center gap-6 pb-4">
      <a
        href="/"
        aria-label="Home"
        data-active={isActive("/") ? "true" : undefined}
        className="transition-all hover:scale-110"
      >
        <InlineIcon svg={MonoIcons.home} className="[&>svg]:block" />
      </a>
      <a
        href="/services"
        aria-label="Services"
        data-active={isActive("/services") ? "true" : undefined}
        className="transition-all hover:scale-110"
      >
        <InlineIcon svg={MonoIcons.services} className="[&>svg]:block" />
      </a>
      <a
        href="/contact"
        aria-label="Contact"
        data-active={isActive("/contact") ? "true" : undefined}
        className="transition-all hover:scale-110"
      >
        <InlineIcon svg={MonoIcons.contact} className="[&>svg]:block" />
      </a>
      <a
        href="#"
        onClick={handleBack}
        aria-label="Back"
        className="transition-all hover:scale-110"
      >
        <InlineIcon svg={MonoIcons.back} className="[&>svg]:block" />
      </a>
      <a
        href="/clients"
        aria-label="Clients"
        data-active={isActive("/clients") ? "true" : undefined}
        className="transition-all hover:scale-110"
      >
        <InlineIcon svg={MonoIcons.clients} className="[&>svg]:block" />
      </a>
    </footer>
  );
}
