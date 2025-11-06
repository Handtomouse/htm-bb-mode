# BB-OS Development Rules

## Critical Rule: Everything Lives Inside BB-OS

**NEVER** create separate page routes. **ALWAYS** work inside the BlackBerry OS interface.

## File Structure

### ✅ CORRECT: Work on these files
```
components/
├── BlackberryOS5Dashboard.tsx       # Main BB-OS container
├── BlackberryAboutContent.tsx       # "About" app content
├── BlackberryContactContent.tsx     # "Contact" app content
├── BlackberryShowreelContent.tsx    # "Showreel" app content
├── BlackberryFavouritesContent.tsx  # "Favourites" app content
├── BlackberryWormholeContent.tsx    # "Wormhole" app content
├── BlackberryGamesContent.tsx       # "Games" app content
├── BlackberryWebContent.tsx         # "Web" app content
└── BlackberrySettingsContent.tsx    # "Settings" app content

app/
└── page.tsx                         # Only loads BlackberryOS5Dashboard
```

### ❌ WRONG: Never create these
```
app/
├── about/page.tsx      # ❌ NO - creates /about route
├── contact/page.tsx    # ❌ NO - creates /contact route
└── showreel/page.tsx   # ❌ NO - creates /showreel route
```

## How It Works

1. User visits http://localhost:3000
2. Sees BlackBerry phone interface (BB-OS)
3. Clicks app icon (e.g., "About")
4. Content loads inside scrollable phone screen
5. Everything stays within BB-OS interface

## When Making Changes

- **About page improvements?** → Edit `components/BlackberryAboutContent.tsx`
- **Contact page updates?** → Edit `components/BlackberryContactContent.tsx`
- **New app feature?** → Edit `components/BlackberryOS5Dashboard.tsx`
- **Data changes?** → Edit `public/data/about.json` (or relevant data file)

## What User Sees

```
┌─────────────────┐
│   BB-OS Phone   │  ← One page (localhost:3000)
│                 │
│  [App Icons]    │  ← Click to open apps
│                 │
│  ┌───────────┐  │
│  │ About     │  ← Content component
│  │ scrolls   │
│  │ here      │
│  └───────────┘  │
│                 │
│  [Hardware]     │
└─────────────────┘
```

## Remember
- Only ONE route: `/` (homepage)
- All content: Inside BB-OS components
- Never: Separate page routes
