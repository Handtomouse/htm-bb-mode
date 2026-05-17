# V_0B Migration: claude.design JSX → Next.js Translation Pattern

**Status:** Phase 0 scaffolding doc. NOT executed yet. Phase 2 migration consumes this.
**Authored:** 2026-05-17 (post 7-question grill).
**Source design:** `https://claude.ai/design/p/019e30fa-a9e1-770c-bb81-475bac86bc88`
**Target codebase:** `~/Documents/GitHub/htm-bb-mode` (Next.js 15.5.12, App Router).
**Branch:** `feat/v0b-migration` (off main, all Phase 0 + 2 + 3 + 4 work lands here until 6-axis cutover gate passes).

---

## 0. Two-mode translation

The claude.design project produces **two structurally distinct chrome treatments**. The translation pattern below has different bindings for each.

| Mode | Used by | Source module(s) | Live-site target |
|---|---|---|---|
| **home-mode (wallpaper-hero)** | `/` only | `home-v2.jsx` + `home-bb-dna.jsx` (V_B variant) | `/` route via `app/page.tsx` |
| **interior-mode (chassis)** | `/services`, `/portfolio`, `/clients`, `/notes`, `/contact`, `/about` | `services-v2.jsx` + future interior modules | Per-route page.tsx, all wrap content in `BlackberryOS5Dashboard` chassis with Round-6 refreshed treatment |

**Cardinal rule:** do not assume wallpaper-hero applies to Services or any interior route. Phase 3 chrome direction is locked as "chassis for interior pages with refreshed Round-6 treatment, NOT wallpaper-hero." (STATE.md Section 11, Q3.)

---

## 1. File path conventions (where each JSX-on-canvas module maps to)

claude.design hosts modules flat (single canvas namespace, all imports via `window.*` globals). Next.js codebase is path-namespaced under `components/` and `app/`. Mapping:

| claude.design module | Next.js path | Type |
|---|---|---|
| `home-v2.jsx` (Round-6 wallpaper-hero, current canonical) | `app/page.tsx` (route) + `components/HomeWallpaperHero.tsx` (extracted body) | `'use client'` component (uses CityWidget canvas + smart-layer hooks) |
| `home-bb-dna.jsx` (V_B educational ticker variant) | `components/HomeEducationalTicker.tsx` | `'use client'` (rotating ticker + crossfade scheduled in Phase 1.5) |
| `bb-device.jsx` (DeviceFrame primitive + noChassis mode) | `components/bb/DeviceFrame.tsx` (keep `noChassis` prop) | Pure component, no client hooks needed by default. Mark `'use client'` only if a parent consumer crosses RSC boundary |
| `bb-interactivity.jsx` (Round 1-5 wiring + Round 6 transparent props) | `components/bb/useInteractivity.ts` (hook bundle) + `components/bb/InteractivityProvider.tsx` (context) | `'use client'` (uses `useState`, `useEffect`, `useRef`) |
| `bb-audio.jsx` (Round 2 Web Audio synth) | `lib/bb/audio.ts` (synth functions) + `components/bb/AudioGateProvider.tsx` (user-gesture gate) | `lib/` is plain TS, provider is `'use client'` |
| `bb-easter-eggs.jsx` (Round 3 konami + microtext + wormhole) | `components/bb/useEasterEggs.ts` | `'use client'` (window event listeners) |
| `bb-persistence.jsx` (Round 4 storage layer) | `lib/bb/persistence.ts` (localStorage wrappers) + `components/bb/usePersistedState.ts` (hook) | `lib/` plain TS, hook `'use client'` |
| `services-v2.jsx` (Iteration 3 voice-reframed Services, interior-mode chassis) | `app/services/page.tsx` (route) + `app/services/ServicesContent.tsx` (existing file, refactor to consume new chassis treatment) | `'use client'` (existing pattern in the codebase) |
| `BB-DNA Exploration.html` (3-variant explorer) | NOT migrated. Journey-record artefact on canvas only. | n/a |
| `home-chrome.jsx`, `home-variants.jsx` (exploratory) | NOT migrated. Stale on canvas. | n/a |

**Subdirectory convention:** create `components/bb/` namespace for all BB-OS primitives lifted from the canvas. This keeps the existing `components/Blackberry*.tsx` files (which are the OLD content layer) cleanly separable from the NEW design-system primitives during the migration. After all six pages are migrated, the older `Blackberry*Content.tsx` files either fold into the new structure or get retired per route as Phase 4 progresses.

---

## 2. Import rewrites (window globals → explicit imports)

claude.design exposes shared modules as `window.CityWidget`, `window.BBDevice`, `window.BBInteractivity`, etc. so JSX-on-canvas files can read across modules without ES imports. Next.js needs explicit ES module imports.

**Pattern (find/replace per module during port):**

| In source JSX | Rewrite to in .tsx |
|---|---|
| `const { CityWidget } = window;` | `import CityWidget from '@/components/bb/CityWidget';` |
| `const { DeviceFrame } = window.BBDevice;` | `import { DeviceFrame } from '@/components/bb/DeviceFrame';` |
| `const { useInteractivity } = window.BBInteractivity;` | `import { useInteractivity } from '@/components/bb/useInteractivity';` |
| `const { synth, attack, decay } = window.BBAudio;` | `import { synth, attack, decay } from '@/lib/bb/audio';` |
| `const { loadPersisted, savePersisted } = window.BBPersistence;` | `import { loadPersisted, savePersisted } from '@/lib/bb/persistence';` |
| `const { EDU_FEED } = window.HomeBBDNA;` | `import { EDU_FEED } from '@/lib/bb/eduFeed';` (extract corpus to its own file) |

**TS-isation step:** every ported module also gets explicit prop and return types. JSX-on-canvas modules are loosely typed (JSDoc at best). For Phase 2 PR review, every public surface must compile under the existing `tsconfig.json` `"strict": true`. Use `BBOS5DashboardProps`, `DeviceFrameProps`, etc. as the naming pattern.

**Path alias:** the repo already has `@/` mapped to root in `tsconfig.json`. Use that, not relative `../../components/...`.

---

## 3. Public-route binding (which translated component becomes `/`)

`app/page.tsx` is the `/` route entry. Today (main branch) it renders the old NeonCity-tunnel-plus-5-app-dock layout via `BlackberryOS5Dashboard`. After Phase 2a migration:

```tsx
// app/page.tsx (post-Phase-2a)
import HomeWallpaperHero from '@/components/HomeWallpaperHero';
import HomeEducationalTicker from '@/components/HomeEducationalTicker';

export default function HomePage() {
  return (
    <HomeWallpaperHero>
      <HomeEducationalTicker />
    </HomeWallpaperHero>
  );
}
```

`HomeWallpaperHero` provides the wallpaper-hero shell (CityWidget bright intensity 1.5, top dim 0.45/70px, bottom dim 0.6/150px, app dock + hardware row at full prominence per Round-6 numbers). `HomeEducationalTicker` is the small top-right floating note (Geist Mono 11.5px, rgba(0,0,0,0.45) + blur(6px), amber border, max-width 480px, ellipsis, current fact only). Crossfade and tap-to-reveal are Phase 1.5 polish, NOT shipped in initial Phase 2a port.

**Interior routes (Phase 3 + 4):** each interior page.tsx wraps content in an interior-mode chassis component (working name `BBChassisShell`). Pattern:

```tsx
// app/services/page.tsx (post-Phase-3)
import BBChassisShell from '@/components/bb/BBChassisShell';
import ServicesContent from './ServicesContent';

export default function ServicesPage() {
  return (
    <BBChassisShell route="/services" title="Services">
      <ServicesContent />
    </BBChassisShell>
  );
}
```

The chassis renders the BB device frame (refreshed Round-6 treatment), navigates via hardware buttons + trackpad, and slots route content into the screen area. Same shell across all interior routes for consistency.

---

## 4. Hooks vs RSC boundaries (which bits run server-side)

Next.js App Router defaults every component to a React Server Component (RSC) unless `'use client'` is the first line. The migrated tree splits roughly:

| Surface | RSC vs Client | Reason |
|---|---|---|
| `app/page.tsx`, `app/services/page.tsx`, etc. (route shells) | **RSC** (default) | They just compose props + assemble the shell. No browser APIs. |
| `HomeWallpaperHero`, `BBChassisShell` (outer shells) | **Client** | They host the CityWidget canvas, audio context, persistence hooks. All require `'use client'`. |
| `HomeEducationalTicker` (V_B ticker) | **Client** | `setInterval` rotation, `setTimeout` crossfade scheduling, `useState` for current index. |
| `components/bb/DeviceFrame.tsx` | **Client** (with caveat) | Pure render IF parents already passed it static props. But since it consumes `useInteractivity` for hardware-button glow + active state, mark `'use client'` to keep the boundary clean. |
| `lib/bb/audio.ts`, `lib/bb/persistence.ts` | **Plain TS** (no boundary) | Library code. Imported by client components only. Never imported by RSC. |
| `lib/bb/eduFeed.ts` (24-item corpus) | **Plain TS** (importable from RSC or Client) | Constant data, no side effects. Could even be moved to `public/data/eduFeed.json` for runtime-only loading if Phase 1.5 wants to gate corpus size. |
| `app/api/contact/route.ts` (existing) | **Server route handler** | Untouched by migration. |

**Data fetching:** content data (`public/data/about.json`, `public/data/clients.json`, `public/data/posts.json`) is read at build time. The migration does NOT change fetch boundaries. Keep current pattern, RSC reads JSON at build, passes serialised props to client components.

**Gotcha:** the existing `BlackberryOS5Dashboard.tsx` is the chassis-mode legacy that the migration partially replaces. It will continue to exist during Phase 2-4 because it powers the interior routes via its dashboard "open app" indirection (line 320-359). Once Phase 4 ports all 6 pages onto `BBChassisShell`, `BlackberryOS5Dashboard` can be retired or simplified.

---

## 5. Static peak-state to runtime smart layer

The claude.design mocks render ONE static frame: one EDU_FEED fact shown, one notification badge count, one CLI prompt. Production needs the runtime smart layer wired so they cycle/select/respond.

**Per variant (NB only V_B ships this round):**

### V_B (educational ticker) — THIS round
- **Static frame:** ticker shows ONE fact from EDU_FEED (the Cleopatra fact, baked into the mock for visual reference).
- **Runtime:** `setInterval(rotateNext, 8000)` cycles index 0 → 23, wraps. `useEffect` mounts on client only. `prefers-reduced-motion` disables crossfade and rotation, shows single fact. Tap on note advances index manually (Phase 1.5 polish).
- **Corpus location:** `lib/bb/eduFeed.ts`. Each entry shape: `{ id: string, body: string, source?: string }`.
- **Selection:** simple linear cycle for v1. Future hook point: replace `rotateNext` with a deterministic-by-session-seed shuffle if order-randomisation desired.

### V_A (AI-surfaced notifications) — NOT this round
- Anchor only: `BlackberryOS5Dashboard.tsx:311` hardcoded `notificationCounts = { Contact: 1, Message: 3 }`. Future SPIN replaces with `selectContent()` hook output (a function picking 2-3 surfaceable items per session from `posts.json`, `about.json.beliefs[]`, `aboutData.ts`). Noted here so Phase 2 reviewers know the V_A wiring point.

### V_C (CLI shell) — NOT this round
- Anchor only: `BBTrackpad.tsx` (defined, currently unwired in `BlackberryOS5Dashboard`). Future SPIN wires trackpad as caret-position controller, parses commands like `cat about` → render about.json, `ls portfolio` → list projects. Noted here so Phase 2 reviewers know the V_C wiring point.

**Boot/idle interval pattern:** `BBBootSequence` (lines ~280 of `BlackberryOS5Dashboard.tsx`) is the proven `setInterval` pattern for any timer-based smart layer. Reuse its cleanup-in-`useEffect`-return shape.

---

## 6. Migration checklist (Phase 2a fires against this)

When Phase 2a starts (post Wed-20 quota reset, post Phase 1 V_B lock), the executor SPIN consumes this doc and lands in this order:

1. Create `components/bb/` subdirectory.
2. Port `bb-device.jsx` → `components/bb/DeviceFrame.tsx`. Port unit-tested in isolation.
3. Port `bb-interactivity.jsx` → `components/bb/useInteractivity.ts` + `InteractivityProvider.tsx`.
4. Port `bb-audio.jsx` → `lib/bb/audio.ts` + `AudioGateProvider.tsx`.
5. Port `bb-easter-eggs.jsx` → `components/bb/useEasterEggs.ts`.
6. Port `bb-persistence.jsx` → `lib/bb/persistence.ts` + `usePersistedState.ts`.
7. Port `home-v2.jsx` body → `components/HomeWallpaperHero.tsx`.
8. Extract EDU_FEED corpus → `lib/bb/eduFeed.ts` (24 items, verify against canvas source).
9. Port V_B ticker → `components/HomeEducationalTicker.tsx`.
10. Rewrite `app/page.tsx` to compose the two new components.
11. Phase 2a also drops banned font loads from `app/layout.tsx` (font-stack collapse, see BRAND_DRIFT.md).
12. Phase 2a also restores `app/about/page.tsx` (see BRAND_DRIFT.md).
13. Phase 2a also fixes 10 occurrences of wrong-TLD email (see BRAND_DRIFT.md).
14. Phase 2b verifies on Vercel preview branch deploy.

**Out of scope for Phase 2a (deferred):**
- Phase 1.5 crossfade + tap-to-reveal polish.
- Interior-mode chassis port (Phase 3 starts after Phase 2 is green).
- V_A and V_C variants (not chosen this round).
- Retiring `BlackberryOS5Dashboard.tsx` (folded incrementally across Phase 4).

---

## 7. Bindings to follow / not to break

- **Brand tokens:** `lib/theme.ts` now declares `ACCENT = "#F7A835"` (Phase 0 fix). All ported components consume `ACCENT` from this module, never hardcode hex. Hover state should reference `ACCENT_HOVER` (`"#FFB84D"`), which still matches the brandkit's secondary `#ff9d23` family but ranges brighter for the hover delta. (Discrepancy note: brandkit secondary is `#ff9d23`, lib/theme has `#FFB84D` for hover. Out of Phase 0 scope; flag for Phase 2 brandkit alignment discussion.)
- **Geist fonts:** load Geist Sans + Geist Mono via `next/font/local` or the existing `geist` package (see `~/handtomouse_brandkit/CLAUDE.md` for the proven pattern). Phase 2a drops `next/font/google` calls for VT323/Handjet/Roboto Mono/Source Code Pro AND the typekit `swi6eoo.css` `<link>` for Argent Pixel.
- **Public data:** `about.json`, `clients.json`, `posts.json` stay in `public/data/`. Schema unchanged. Just adjust consumers to point at the new component tree.
- **htm-landing:** out of scope. Do not reference its patterns. htm-bb-mode is canonical post-cutover.

---

## End

This doc is consumed by the Phase 2a migration SPIN. If migration starts and Phase-2a deviates from a binding above, update this doc in the same commit so future phases see the new contract.
