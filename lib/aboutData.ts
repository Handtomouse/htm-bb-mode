import React from "react";

// Accent colors
export const ACCENT = "#ff9d23";
export const ACCENT_HOVER = "#FFB84D";

// Typography
export const FONTS = {
  mono: 'var(--font-mono)',
  body: 'var(--font-body)',
  display: 'var(--font-mono)'
} as const;

// Stat card CSS variables
export const STAT_CARD_VARS = {
  '--card-padding': '32px',
  '--card-gap': '48px',
  '--card-border': '1.5px solid rgba(255, 157, 35, 0.35)',
  '--card-radius': '1px',
  '--card-shadow': '0 0 32px rgba(255, 157, 35, 0.15)',
  '--heading-mt': '0',
  '--heading-mb': '16px',
  '--body-mb': '24px',
  '--badge-height': '22px'
} as React.CSSProperties;

// TypeScript interface for About page data structure
export interface AboutData {
  hero: {
    title: string;
    headline: string;
    subline: string;
    origin: string;
    badges: string[];
    principles: Array<{ icon: string; text: string }>;
  };
  services: Array<{
    icon: string;
    title: string;
    line: string;
    example: string;
  }>;
  process: {
    steps: Array<{
      num: string;
      title: string;
      promise: string;
      duration: string;
    }>;
  };
  proof: {
    highlights: Array<{
      label: string;
      line: string;
      quote?: string;
      duration: string;
    }>;
    clients?: string[];
  };
  ops: {
    items: Array<{ icon: string; text: string }>;
  };
  setup: {
    line: string;
  };
  notRightFor: {
    items: Array<{ icon: string; text: string }>;
  };
  pricing: {
    projects: string;
    projectLength: string;
    retainers: string;
    retainerDetails: string;
    terms: string;
    termsDetail: string;
    guarantee: string;
  };
  stats: {
    projects: string;
    retention: string;
    repeatClients: string;
    avgProjectValue: string;
    avgResponse: string;
    industries: string;
  };
  contact: {
    email: string;
    status: string;
    responseTime: string;
  };
  now: {
    lastUpdated: string;
    currentFocus: string;
    status: string;
  };
}
