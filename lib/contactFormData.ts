// Accent color
export const ACCENT = "#FF9D23";

// Email validation
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Typo suggestions for common email domain mistakes
export const EMAIL_DOMAIN_SUGGESTIONS: Record<string, string> = {
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "hotnail.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "yahho.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "icloud.co": "icloud.com",
  "protn.me": "proton.me",
};

// Upload limits
export const MAX_FILES = 3;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

// Form options
export const BUDGETS = ["<$5k", "$5–15k", "$15–50k", "$50k+", "Not sure"] as const;
export const TIMELINES = ["ASAP (this month)", "1–3 months", "3+ months", "Exploring"] as const;
export const SERVICES = ["Branding", "Packaging", "Web/Next.js", "Campaign", "Strategy", "Other"] as const;
