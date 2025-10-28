import Tile from "./Tile";
import { getIcon } from "@/lib/icons";

export interface NavTile {
  title: string;
  href: string;
  icon?: string;
  desc?: string;
}

interface NavGridProps {
  tiles: NavTile[];
}

export default function NavGrid({ tiles }: NavGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Tile
          key={tile.href}
          title={tile.title}
          href={tile.href}
          icon={tile.icon || getIcon(tile.title.toLowerCase().replace(/\s+/g, ""))}
          desc={tile.desc}
        />
      ))}
    </div>
  );
}
