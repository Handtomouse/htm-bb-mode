import Link from "next/link";
import InlineIcon from "./InlineIcon";

interface TileProps {
  title: string;
  href: string;
  icon: string;
  desc?: string;
}

export default function Tile({ title, href, icon, desc }: TileProps) {
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
      <InlineIcon
        svg={icon}
        className="mb-4 h-12 w-12 text-[var(--icon)] transition-colors group-hover:text-[var(--accent)] [&>svg]:h-full [&>svg]:w-full"
      />
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
