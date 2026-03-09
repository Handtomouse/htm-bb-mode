import Link from "next/link";
import { BBIcon, type IconName } from "./BBIcon";

interface TileProps {
  title: string;
  href: string;
  iconName: IconName;
  desc?: string;
}

export default function Tile({ title, href, iconName, desc }: TileProps) {
  return (
    <Link
      href={href}
      className="
        group relative flex flex-col items-center justify-center
        rounded-[var(--radius)] border border-[var(--grid)]
        p-8 aspect-square
        transition-all duration-150
        hover:border-[var(--accent)] hover:scale-[1.015] hover:shadow-[var(--shadow)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
      "
    >
      <div className="mb-4 transition-colors text-[var(--icon)] group-hover:text-[var(--accent)]">
        <BBIcon name={iconName} variant="solid" size={48} />
      </div>
      <h2 className="font-mono text-lg text-center">
        <span className="slash-accent">/</span> {title}
      </h2>
      {desc && (
        <p className="mt-2 text-center text-sm text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
          {desc}
        </p>
      )}
    </Link>
  );
}
