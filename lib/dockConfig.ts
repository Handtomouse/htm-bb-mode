export type DockAction =
  | "toggleTheme"
  | "back"
  | "selectOrTrackpad"
  | "noop";

export interface DockSlot {
  id: string;
  href?: string;
  action?: DockAction;
  priority?: number;
}

export const DOCK: readonly DockSlot[] = [
  { id: "power", action: "toggleTheme" },
  { id: "back", action: "back" },
  { id: "menu", href: "/" },
  { id: "center", action: "selectOrTrackpad" },
  { id: "home", href: "/" },
  { id: "contact", href: "/contact" },
  { id: "spare", action: "noop" },
] as const;
