"use client";

import { useRouter, usePathname } from "next/navigation";
import { BBIcon } from "./BBIcon";
import { BBIcons } from "@/lib/icons"; // Keep for custom power icon temporarily
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
          <BBIcon name="menu" variant="pixel" size={28} color="grey" ariaLabel="Home" />
        </a>
        <a
          href="/services"
          aria-label="Services"
          data-active={isActive("/services") ? "true" : undefined}
          className="transition-all hover:scale-110"
        >
          <BBIcon name="settings" variant="outline" size={28} color="white" ariaLabel="Services" />
        </a>
        <a
          href="/contact"
          aria-label="Contact"
          data-active={isActive("/contact") ? "true" : undefined}
          className="transition-all hover:scale-110"
        >
          <BBIcon name="phone" variant="pixel" size={28} color="green" ariaLabel="Contact" />
        </a>
        <a
          href="#"
          onClick={handleBack}
          aria-label="Back"
          className="transition-all hover:scale-110"
        >
          <BBIcon name="back" variant="pixel" size={28} color="grey" ariaLabel="Back" />
        </a>
        <a
          href="/clients"
          aria-label="Clients"
          data-active={isActive("/clients") ? "true" : undefined}
          className="transition-all hover:scale-110"
        >
          <BBIcon name="users" variant="outline" size={28} color="white" ariaLabel="Clients" />
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
        <BBIcon name="home" variant="solid" size={28} color="white" ariaLabel="Home" />
      </a>
      <a
        href="/services"
        aria-label="Services"
        data-active={isActive("/services") ? "true" : undefined}
        className="transition-all hover:scale-110"
      >
        <BBIcon name="settings" variant="solid" size={28} color="white" ariaLabel="Services" />
      </a>
      <a
        href="/contact"
        aria-label="Contact"
        data-active={isActive("/contact") ? "true" : undefined}
        className="transition-all hover:scale-110"
      >
        <BBIcon name="mail" variant="solid" size={28} color="white" ariaLabel="Contact" />
      </a>
      <a
        href="#"
        onClick={handleBack}
        aria-label="Back"
        className="transition-all hover:scale-110"
      >
        <BBIcon name="back" variant="solid" size={28} color="white" ariaLabel="Back" />
      </a>
      <a
        href="/clients"
        aria-label="Clients"
        data-active={isActive("/clients") ? "true" : undefined}
        className="transition-all hover:scale-110"
      >
        <BBIcon name="users" variant="solid" size={28} color="white" ariaLabel="Clients" />
      </a>
    </footer>
  );
}
