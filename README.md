# HandToMouse — BB Mode 📱

[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-97%2F100-brightgreen)](https://htm-bb-mode.vercel.app)
[![Performance](https://img.shields.io/badge/Performance-90%2F100-green)](./LIGHTHOUSE_AUDIT_REPORT.md)
[![Accessibility](https://img.shields.io/badge/Accessibility-98%2F100-brightgreen)](./LIGHTHOUSE_AUDIT_REPORT.md)
[![Best Practices](https://img.shields.io/badge/Best_Practices-100%2F100-brightgreen)](./LIGHTHOUSE_AUDIT_REPORT.md)
[![SEO](https://img.shields.io/badge/SEO-100%2F100-brightgreen)](./LIGHTHOUSE_AUDIT_REPORT.md)

> **A fully functional BlackBerry OS5 emulator built in React** — featuring an interactive portfolio, playable games, and a complete settings system with undo/redo.

**Live Site**: [https://htm-bb-mode.vercel.app](https://htm-bb-mode.vercel.app)

---

## 🎯 What Makes This Special

This isn't just another portfolio site. It's a **pixel-perfect BlackBerry Bold emulator** that runs entirely in the browser:

- 📱 **Authentic Hardware**: Power button, lock screen, status bar, dock, menu grid
- ⌨️ **Full Keyboard Control**: Navigate with arrow keys, shortcuts (M=menu, P=power, L=lock)
- 🎮 **Playable Games**: Snake, Memory Match, Tic-Tac-Toe (fully functional!)
- ⚙️ **Advanced Settings**: Live preview, 50-state undo/redo, collapsible sections
- 🎨 **Dynamic Theming**: Time-based wallpaper colors (dawn, morning, afternoon, evening, night)
- 📧 **Working Contact Form**: Rate-limited, validated, with confetti celebration
- ♿ **98% Accessibility**: WCAG compliant, keyboard accessible, screen reader friendly

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Handtomouse/htm-bb-mode.git
cd htm-bb-mode

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your RESEND_API_KEY and CONTACT_EMAIL_TO

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file with:

```env
# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# Contact Email Configuration
CONTACT_EMAIL_TO=your-email@example.com

# Rate Limiting (UPSTASH Redis - Recommended for Production)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Rate Limit Configuration (Optional)
RATE_LIMIT_MAX_REQUESTS=5           # Max requests per window
RATE_LIMIT_WINDOW_MS=3600000        # Window in ms (default: 1 hour)
```

**Note**: Without UPSTASH keys, the contact form uses in-memory rate limiting (resets on server restart). For production, UPSTASH Redis is strongly recommended.

#### Setting Up Rate Limiting (Production)

1. **Create UPSTASH Redis account** (free tier available):
   - Go to [upstash.com](https://upstash.com)
   - Sign up and create a new Redis database
   - Choose "Regional" type (free tier)

2. **Get credentials** from your database dashboard:
   - Copy `UPSTASH_REDIS_REST_URL`
   - Copy `UPSTASH_REDIS_REST_TOKEN`

3. **Add to `.env.local`** for local development

4. **Add to Vercel** for production:
   - Go to Project Settings → Environment Variables
   - Add both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - Select "Production" environment
   - Redeploy your site

**Rate Limiting Behavior**:
- Allows 5 requests per hour per IP address
- Returns HTTP 429 with `Retry-After` header when limit exceeded
- Uses sliding window algorithm for fair rate limiting

---

## 🏗️ Architecture

### The BB-OS Single-Page Design

Unlike traditional multi-page sites, **everything lives inside the BlackBerry OS interface**:

```
app/
├── page.tsx                          # Renders BlackberryOS5Dashboard
└── layout.tsx                        # Root layout with fonts/metadata

components/
├── BlackberryOS5Dashboard.tsx        # Main OS container (1875 lines!)
├── BlackberryAboutContent.tsx        # About page content
├── BlackberryContactContent.tsx      # Contact form
├── BlackberrySettingsContentNew.tsx  # Settings with live preview
├── BlackberryClientsContent.tsx      # Client showcase
├── BlackberryGamesContent.tsx        # 3 playable games
├── BlackberryShowreelContent.tsx     # Project carousel
├── BlackberryFavouritesContent.tsx   # Bookmarking system
└── BlackberryWebContent.tsx          # External links directory
```

**Key Principle**: All "apps" are content components loaded inside `BlackberryOS5Dashboard.tsx`, not separate routes. This maintains the authentic OS experience.

See [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md) for complete architecture constraints.

---

## ✨ Features

### 📱 BlackBerry OS Emulation
- **Hardware Buttons**: Call, Menu, Back, Power (with animations)
- **Trackpad Navigation**: Arrow key support, selection highlighting
- **Status Bar**: Live time/date, signal strength, battery level, network type
- **Lock Screen**: Shift+L to lock, L to unlock
- **Power Management**: P key toggles power, grays out hardware when off
- **Responsive Scaling**: Entire device scales to fit any viewport

### 🎮 Interactive Games
Three fully playable games built from scratch:

1. **Snake** (15x15 grid)
   - Arrow button controls
   - Score tracking
   - Game over detection
   - Pause functionality

2. **Memory Match** (6 pairs)
   - Move counter
   - Match detection
   - Completion celebration
   - Reset button

3. **Tic-Tac-Toe** (vs AI)
   - Random AI opponent
   - Win detection
   - Draw handling
   - Visual winner highlight

### ⚙️ Advanced Settings System
- **Live Preview Panel**: See changes in real-time before applying
- **50-State Undo/Redo**: Full history with Cmd+Z / Cmd+Shift+Z
- **Collapsible Sections**: Organized, accessible UI
- **Haptic Feedback**: Vibration API support for mobile
- **Persistent Storage**: localStorage with validation
- **Accessibility**: Full ARIA support, keyboard navigation

### 📧 Professional Contact Form
- **20 Improvements**: Field validation, file upload, Google Drive integration
- **Rate Limiting**: UPSTASH Redis protection (5 requests/hour per IP)
- **Email Service**: Resend API integration with auto-reply
- **Security**: Honeypot, timing checks, magic byte file validation
- **Success Animation**: Canvas confetti celebration
- **Mobile UX**: Touch-optimized, responsive design

### 🎨 Design System
- **Custom Fonts**: VT323 (mono), Pixelify Sans (heading), Handjet, Roboto Mono
- **Accent Color**: `#FF9D23` (BlackBerry orange)
- **4px Spacing Scale**: Consistent 8, 12, 16, 20, 24... spacing
- **Animation System**: 120ms (instant), 300ms (fast), 600ms (normal), 1200ms (slow)
- **CSS Variables**: 50+ custom properties for theming

See [`STYLE_GUIDE.md`](./STYLE_GUIDE.md) for complete design documentation.

---

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 15.5.6 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 4

### Features
- **Animations**: Framer Motion 12.23.24
- **Email**: Resend 6.4.0
- **Rate Limiting**: Upstash Redis 1.35.6
- **Analytics**: Vercel Analytics 1.5.0
- **Effects**: canvas-confetti 1.9.4

### Deployment
- **Hosting**: Vercel
- **CI/CD**: GitHub → Vercel auto-deploy
- **Performance**: 90/100 Lighthouse score

---

## 📊 Performance

**Lighthouse Audit Results** (Nov 14, 2025):

| Metric | Score | Details |
|--------|-------|---------|
| ⚡ Performance | **90/100** | [View Report](./LIGHTHOUSE_AUDIT_REPORT.md) |
| ♿ Accessibility | **98/100** | WCAG compliant, ARIA complete |
| ✅ Best Practices | **100/100** | Perfect score! 🏆 |
| 🔍 SEO | **100/100** | Fully optimized |

**Recent Optimizations**:
- +12 points performance (78 → 90)
- +5 points accessibility (93 → 98)
- +4 points best practices (96 → 100)
- Created PWA manifest.json
- Fixed all ARIA compliance issues
- Added HTML5 semantic landmarks
- Optimized image dimensions

Full audit details: [`LIGHTHOUSE_AUDIT_REPORT.md`](./LIGHTHOUSE_AUDIT_REPORT.md)

---

## 📂 Project Structure

```
htm-bb-mode/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Main entry (renders BB-OS)
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles + CSS variables
│   └── api/contact/         # Contact form API route
├── components/              # React components
│   ├── BlackberryOS5Dashboard.tsx    # Main OS (1875 lines)
│   ├── Blackberry*Content.tsx        # 17 content components
│   ├── ui/                  # Reusable UI components
│   └── ...                  # Helper components
├── lib/                     # Utilities
│   ├── hooks.ts            # useSettings, useUndoRedo, useClickSound
│   ├── settingsValidation.ts
│   ├── formUtils.ts
│   └── rate-limit.ts
├── public/                  # Static assets
│   ├── data/               # JSON data (about, clients, projects)
│   ├── logos/              # SVG logos
│   ├── images/             # Client logos (31 files)
│   └── manifest.json       # PWA manifest
├── docs/                    # Documentation
│   ├── PROJECT_CHECKLIST.md
│   ├── DEVELOPMENT_RULES.md
│   ├── STYLE_GUIDE.md
│   └── LIGHTHOUSE_AUDIT_REPORT.md
└── README.md               # You are here!
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Arrow Keys** | Navigate apps/menu items |
| **Enter / Space** | Select app |
| **Escape / Backspace** | Go back / Close app |
| **M** | Open menu |
| **H** | Go to home screen |
| **P** | Power on/off |
| **Shift + L** | Lock screen |
| **L** | Unlock screen |
| **?** | Show keyboard help |

---

## 🎨 Customization

### Changing the Accent Color

Edit `/app/globals.css`:

```css
:root {
  --accent: #FF9D23; /* Change this */
}
```

### Adding a New "App"

1. Create `/components/BlackberryYourAppContent.tsx`
2. Add to apps array in `BlackberryOS5Dashboard.tsx`:
   ```tsx
   { name: "Your App", icon: <YourIcon />, path: "/your-app" }
   ```
3. Add case in `AppContent` component

See [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md) for detailed instructions.

---

## 📖 Documentation

- **[PROJECT_CHECKLIST.md](./PROJECT_CHECKLIST.md)** - Essential checklist (read first!)
- **[DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)** - BB-OS architecture constraints
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Complete design system (1453 lines)
- **[LIGHTHOUSE_AUDIT_REPORT.md](./LIGHTHOUSE_AUDIT_REPORT.md)** - Performance audit

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - RESEND_API_KEY
# - CONTACT_EMAIL_TO
# - UPSTASH_REDIS_REST_URL (optional)
# - UPSTASH_REDIS_REST_TOKEN (optional)
```

### Build for Production

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome! Please:

1. Read [`PROJECT_CHECKLIST.md`](./PROJECT_CHECKLIST.md) first
2. Follow the BB-OS architecture rules
3. Maintain the [`STYLE_GUIDE.md`](./STYLE_GUIDE.md)
4. Test keyboard navigation
5. Verify Lighthouse scores don't regress

---

## 📜 License

Private portfolio project © HandToMouse 2025

---

## 🙏 Acknowledgments

- **Next.js Team** - For the incredible framework
- **Vercel** - For seamless deployment
- **Framer Motion** - For smooth animations
- **BlackBerry** - For the iconic design inspiration

---

## 📞 Contact

**HandToMouse**
Portfolio: [https://htm-bb-mode.vercel.app](https://htm-bb-mode.vercel.app)
Email: hello@handtomouse.com

---

<div align="center">

**Built with ❤️ using React, Next.js, and TypeScript**

*Everyone's chasing new — we chase different.*

</div>
