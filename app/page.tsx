import NavGrid from "@/components/NavGrid";
import { getIcon } from "@/lib/icons";

export default function Home() {
  const tiles = [
    {
      title: "PORTFOLIO",
      href: "/portfolio",
      icon: getIcon("portfolio"),
      desc: "Selected work & case studies",
    },
    {
      title: "CLIENTS",
      href: "/clients",
      icon: getIcon("clients"),
      desc: "Partners across sectors",
    },
    {
      title: "SERVICES",
      href: "/services",
      icon: getIcon("services"),
      desc: "What we build",
    },
    {
      title: "GAMES",
      href: "/games",
      icon: getIcon("games"),
      desc: "Interactive experiments",
    },
    {
      title: "ABOUT",
      href: "/about",
      icon: getIcon("about"),
      desc: "Approach & values",
    },
    {
      title: "CONTACT",
      href: "/contact",
      icon: getIcon("contact"),
      desc: "Get in touch",
    },
    {
      title: "EXTRAS",
      href: "/extras",
      icon: getIcon("extras"),
      desc: "IP & experiments",
    },
    {
      title: "NOTES",
      href: "/notes",
      icon: getIcon("notes"),
      desc: "Thoughts & logs",
    },
    {
      title: "SETTINGS",
      href: "/settings",
      icon: getIcon("settings"),
      desc: "Preferences",
    },
    {
      title: "FAVOURITES",
      href: "/favourites",
      icon: getIcon("favourites"),
      desc: "Curated picks",
    },
    {
      title: "SHOWREEL",
      href: "/showreel",
      icon: getIcon("showreel"),
      desc: "Motion & edits",
    },
    {
      title: "WEB",
      href: "/web",
      icon: getIcon("web"),
      desc: "Digital projects",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-8">
        <h1 className="font-mono text-2xl sm:text-3xl">
          <span className="slash-accent">/</span> MENU
        </h1>
        <div className="mt-2 font-mono text-sm text-[var(--muted)]">
          01001100 10011010 01101001 10010100 11 01001100 10011010…
        </div>
      </header>
      <NavGrid tiles={tiles} />
    </div>
  );
}
