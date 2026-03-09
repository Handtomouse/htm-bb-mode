import Tile from "./Tile";
import { type IconName } from "./BBIcon";

export interface NavTile {
  title: string;
  href: string;
  iconName?: IconName;
  desc?: string;
}

interface NavGridProps {
  tiles: NavTile[];
}

// Map tile titles to icon names
function getTileIconName(title: string): IconName {
  const titleKey = title.toLowerCase().replace(/\s+/g, "");
  const iconMap: Record<string, IconName> = {
    portfolio: "folder",
    work: "folder",
    clients: "users",
    services: "services",
    web: "globe",
    showreel: "video",
    games: "games",
    notes: "file-text",
    extras: "star",
    settings: "settings",
    favourites: "heart",
    favorites: "heart",
    about: "info",
    contact: "mail",
  };
  return iconMap[titleKey] || "info";
}

export default function NavGrid({ tiles }: NavGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Tile
          key={tile.href}
          title={tile.title}
          href={tile.href}
          iconName={tile.iconName || getTileIconName(tile.title)}
          desc={tile.desc}
        />
      ))}
    </div>
  );
}
