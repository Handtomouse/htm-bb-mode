// Form utility functions for BlackBerry contact form

// Disposable email domains to warn against
export const DISPOSABLE_EMAIL_DOMAINS = [
  'temp-mail.org',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'mailinator.com',
  'maildrop.cc',
  'trashmail.com',
  'getnada.com',
  'yopmail.com',
];

// Check if email is from disposable domain
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.some(d => domain.includes(d));
}

// Message templates for Brief mode
export const MESSAGE_TEMPLATES = {
  branding: "I'm working on a branding project for [company name] and need help with [specific aspect: logo, brand strategy, visual identity]. The target audience is [describe audience]. Timeline: [your timeline].",
  packaging: "I need packaging design for [product type]. Key requirements: [list requirements]. Brand positioning: [premium/accessible/etc]. Launch date: [date].",
  web: "I'm looking for a Next.js website for [purpose]. Key features needed: [list features]. Reference sites: [examples]. Budget range: [range].",
  campaign: "Planning a campaign for [product/service]. Goal: [awareness/sales/etc]. Channels: [social/print/etc]. Duration: [timeline].",
  strategy: "Need strategic guidance on [specific challenge]. Current situation: [describe]. Desired outcome: [goal]. Timeline: [when needed].",
};

// Get template by keyword
export function getTemplateByKeyword(services: string[]): string {
  if (services.includes('Branding')) return MESSAGE_TEMPLATES.branding;
  if (services.includes('Packaging')) return MESSAGE_TEMPLATES.packaging;
  if (services.includes('Web/Next.js')) return MESSAGE_TEMPLATES.web;
  if (services.includes('Campaign')) return MESSAGE_TEMPLATES.campaign;
  if (services.includes('Strategy')) return MESSAGE_TEMPLATES.strategy;
  return "I'm interested in working together on [describe your project]. My main goals are [list goals]. Timeline: [your timeline].";
}

// Calculate character warning level
export function getCharacterWarningLevel(current: number, max: number): 'safe' | 'warning' | 'danger' {
  const percentage = (current / max) * 100;
  if (percentage >= 100) return 'danger';
  if (percentage >= 90) return 'warning';
  return 'safe';
}

// Format time ago for "Last saved" indicator
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

// Get file type icon emoji
export function getFileTypeIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '📽️';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg': return '🖼️';
    case 'zip':
    case 'rar':
    case '7z': return '📦';
    case 'ai':
    case 'psd':
    case 'xd':
    case 'figma': return '🎨';
    default: return '📎';
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Keyboard shortcuts configuration
export const KEYBOARD_SHORTCUTS = [
  { key: '⌘/Ctrl + Enter', action: 'Submit form' },
  { key: 'Alt + R', action: 'Reset form' },
  { key: 'Alt + Q', action: 'Switch to Quick mode' },
  { key: 'Alt + B', action: 'Switch to Brief mode' },
  { key: 'Esc', action: 'Dismiss notifications' },
];

// Generate field completion summary
export function getCompletionSummary(data: any, mode: 'quick' | 'brief'): { completed: number; total: number; percentage: number } {
  const requiredFields = ['name', 'email', 'message', 'consent'];
  const briefFields = mode === 'brief' ? ['company', 'budget', 'timeline', 'services'] : [];
  const allFields = [...requiredFields, ...briefFields];

  let completed = 0;
  if (data.name?.trim().length >= 2) completed++;
  if (data.email?.includes('@')) completed++;
  if (data.message?.trim().length >= 30) completed++;
  if (data.consent === true) completed++;

  if (mode === 'brief') {
    if (data.company?.trim()) completed++;
    if (data.budget) completed++;
    if (data.timeline) completed++;
    if (data.services?.length > 0) completed++;
  }

  const total = requiredFields.length + briefFields.length;
  const percentage = Math.round((completed / total) * 100);

  return { completed, total, percentage };
}
