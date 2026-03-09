// Icon name mappings across different libraries
// Maps semantic names to actual icon names in each library

export type SemanticIconName =
  | "about"
  | "work"
  | "clients"
  | "favourites"
  | "showreel"
  | "settings"
  | "donate"
  | "wormhole"
  | "contact"
  | "message"
  | "games"
  | "instagram";

export interface IconMapping {
  phosphor: string;
  lucide: string;
  heroicons: string;
  current: string; // Current BBIcon name
}

export const DASHBOARD_ICON_MAPPINGS: Record<SemanticIconName, IconMapping> = {
  about: {
    phosphor: "Info",
    lucide: "Info",
    heroicons: "InformationCircleIcon",
    current: "info",
  },
  work: {
    phosphor: "Folder",
    lucide: "Folder",
    heroicons: "FolderIcon",
    current: "folder",
  },
  clients: {
    phosphor: "Users",
    lucide: "Users",
    heroicons: "UsersIcon",
    current: "users",
  },
  favourites: {
    phosphor: "Heart",
    lucide: "Heart",
    heroicons: "HeartIcon",
    current: "heart",
  },
  showreel: {
    phosphor: "Video",
    lucide: "Video",
    heroicons: "VideoCameraIcon",
    current: "video",
  },
  settings: {
    phosphor: "Gear",
    lucide: "Settings",
    heroicons: "Cog6ToothIcon",
    current: "settings",
  },
  donate: {
    phosphor: "Heart",
    lucide: "Heart",
    heroicons: "HeartIcon",
    current: "heart",
  },
  wormhole: {
    phosphor: "Spiral",
    lucide: "CircleDot",
    heroicons: "GlobeAltIcon",
    current: "wormhole",
  },
  contact: {
    phosphor: "Envelope",
    lucide: "Mail",
    heroicons: "EnvelopeIcon",
    current: "mail",
  },
  message: {
    phosphor: "ChatCircle",
    lucide: "MessageCircle",
    heroicons: "ChatBubbleLeftIcon",
    current: "message",
  },
  games: {
    phosphor: "GameController",
    lucide: "Gamepad2",
    heroicons: "PuzzlePieceIcon",
    current: "games",
  },
  instagram: {
    phosphor: "InstagramLogo",
    lucide: "Instagram",
    heroicons: "PhotoIcon",
    current: "instagram",
  },
};
