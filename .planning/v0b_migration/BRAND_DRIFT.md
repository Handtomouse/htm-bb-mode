# V_0B Migration: Brand Drift Audit + Remediation Scope

**Status:** Phase 0 scoping doc. **No fixes executed in Phase 0.** Phase 2a migration consumes this.
**Authored:** 2026-05-17, evidence gathered via fresh grep against `feat/v0b-migration@HEAD`.
**Branch:** `feat/v0b-migration`
**Canon source-of-truth:** `~/handtomouse_brandkit/brandkit.config.ts`.

Three remediation items below. Each scoped with **Severity**, **Effort**, **Dependencies**, **Acceptance**, plus a per-file inventory.

---

## ITEM 1 — Font stack collapse (6 fonts → 2 fonts)

### Current state (drift)

`app/layout.tsx` loads VT323 + Handjet + Roboto Mono + Source Code Pro via `next/font/google`, plus Argent Pixel CF via Adobe typekit `<link rel="stylesheet" href="https://use.typekit.net/swi6eoo.css" />`. Body element falls back to `var(--font-body)` which resolves to Roboto Mono. Geist Sans and Geist Mono are NOT loaded anywhere.

### Target state (canon)

Per `brandkit.config.ts:117-130`: load **Geist Sans** (primary, 4 weights: 400/500/600/700) and **Geist Mono** (mono) ONLY. No Google-font calls. No Adobe typekit `<link>`. Body defaults to Geist Sans, monospace surfaces to Geist Mono.

### File inventory (where the banned fonts appear)

**Loaders / global declarations (must be replaced):**
- `app/layout.tsx` — imports `VT323, Handjet, Roboto_Mono, Source_Code_Pro` from `next/font/google` (lines 1, 7-33), preload `<link>` for Roboto Mono + Handjet (lines 109-118), Adobe typekit `<link rel="stylesheet" href="https://use.typekit.net/swi6eoo.css" />` (line 107), body `className` (line 152) wires all four `--font-*` CSS vars, inline `style={{ fontFamily: "var(--font-body)" }}` defaults the document to Roboto Mono.
- `app/globals.css` — CSS var declarations and font-stack utilities referencing all five families (full grep required during Phase 2a, surfaced via `grep "Handjet\|Roboto.Mono\|VT323\|Source.Code.Pro\|Argent.Pixel" app/globals.css`).

**Consumer files referencing `--font-mono` / `font-mono` / VT323 (35 files):**
`app/contact/ContactContent.tsx`, `app/extras/page.tsx`, `app/icon-comparison/page.tsx`, `app/layout.tsx`, `app/not-found.tsx`, `app/notes/[slug]/page.tsx`, `app/notes/NotesContent.tsx`, `app/portfolio/[slug]/page.tsx`, `app/portfolio/PortfolioContent.tsx`, `app/services/ServicesContent.tsx`, `app/wormhole/page.tsx`, `components/BBPageHeader.tsx`, `components/BlackberryClientsContent.tsx`, `components/BlackberryContactContent.tsx`, `components/BlackberryDonateContent.tsx`, `components/BlackberryFavouritesContent.tsx`, `components/BlackberryGamesContent.tsx`, `components/BlackberryMessageContent.tsx`, `components/BlackberryOS5Dashboard.tsx`, `components/BlackberryPortfolioContent.tsx`, `components/BlackberrySettingsContent.tsx`, `components/BlackberryShowreelContent.tsx`, `components/BlackberryWebContent.tsx`, `components/BlackberryWormholeContent.tsx`, `components/CollapsibleCard.tsx`, `components/LiveSydneyTime.tsx`, `components/ProjectImagePlaceholder.tsx`, `components/ScrollDepthTracker.tsx`, `components/SettingsPanel.tsx`, `components/SignatureFooter.tsx`, `components/Tile.tsx`, `components/TopBar.tsx`, `lib/aboutData.ts`, `lib/types/style.ts`, `app/globals.css`. **157 line-occurrences across these 35 files.**

**Consumer files referencing `--font-handjet` / `font-handjet` / Handjet (5 files):**
`app/globals.css`, `app/layout.tsx`, `app/services/ServicesContent.tsx`, `components/BlackberryOS5Dashboard.tsx`, `lib/types/style.ts`. **16 line-occurrences.**

**Consumer files referencing `--font-body` / Roboto Mono (audit count: 97 line-occurrences).** Same file set as `--font-mono` minus a few additions; full re-grep during Phase 2a.

**Consumer files referencing `--font-source-code` / Source Code Pro (audit count: 26 line-occurrences).** Subset of the above file set.

**Consumer files referencing Argent Pixel / `swi6eoo` / `argent-pixel` (12 files, 42 line-occurrences):**
`app/globals.css`, `app/layout.tsx` (loader), `app/notes/[slug]/page.tsx`, `app/services/ServicesContent.tsx`, `components/BlackberryAboutContent.tsx`, `components/BlackberryDonateContent.tsx`, `components/BlackberryMessageContent.tsx`, `components/BlackberryOS5Dashboard.tsx`, `components/BlackberryShowreelContent.tsx`, `components/LuxuryServiceCard.tsx`, `components/TypewriterManifesto.tsx`, `lib/aboutData.ts`.

**Total file-unique surface area:** ~40 files. **Total line-occurrences across all banned fonts:** ~338.

### Replacement strategy (Phase 2a)

1. Replace `app/layout.tsx` font loaders with `geist/font/sans` + `geist/font/mono` (npm package `geist`, see `~/handtomouse_brandkit/CLAUDE.md` for the proven pattern). Set body className to `${GeistSans.variable} ${GeistMono.variable}` and default `font-family` to `var(--font-geist-sans)`.
2. Drop the Adobe typekit `<link>` (line 107) and the two `preload` lines for Roboto Mono + Handjet (lines 109-118).
3. Global rename in `app/globals.css`: `--font-mono` → `--font-geist-mono`, `--font-handjet` → REMOVE (folded into Geist Sans utility), `--font-body` → `--font-geist-sans`, `--font-source-code` → REMOVE (folded into Geist Mono).
4. Repo-wide find/replace per the mapping above. Verify zero residual references via the same grep used in this audit. (Be cautious: some files use `font-mono` Tailwind class which is generic; check Tailwind config to ensure `font-mono` resolves to `var(--font-geist-mono)` not VT323.)
5. Visual sweep on every route after replacement — typography hierarchy and tracking values designed for variable-width Roboto Mono / blocky VT323 will need tuning under Geist.

### Scoping

- **Severity:** P1 (brand-fatal in the literal sense: live site does not look like the brand). Listed at #2 of 6 brand-drift items in STATE.md Section 3.
- **Effort:** Medium-to-large. ~40 files, 338 line-occurrences. Bulk is mechanical find/replace, BUT visual tuning pass post-replacement is real work (line-heights, tracking, weight choices on hero text and ticker text). Estimate 4-8 hours of focused work plus per-route visual QA.
- **Dependencies:** Tailwind config (`tailwind.config.ts` may need updating so `font-mono` Tailwind utility maps to Geist Mono CSS var). `geist` npm package must already be installed (verify pre-Phase-2a).
- **Acceptance:**
  - `grep -rn "VT323\|Handjet\|Roboto_Mono\|Source_Code_Pro\|Argent.Pixel\|swi6eoo" --include="*.tsx" --include="*.ts" --include="*.css"` returns ZERO matches.
  - `app/layout.tsx` head has zero font-related `<link>` tags except possibly a `<link rel="preconnect">` for Vercel-served Geist if applicable.
  - Lighthouse 90+ on perf for `/`, `/services`, `/contact` after the swap.
  - Visual sweep on all 6 main routes signed off as on-brand.

---

## ITEM 2 — `/about` route restoration

### Current state (drift)

`/about` returns 404. Commit `e7a2349` (Mon Mar 9 12:02:44 2026, "Housekeeping: 404 page, SEO metadata, hide Extras from menu, redirect stub routes to home") removed the route page. Brand-fatal because `/about` is the most-clicked dock entry (see `components/BlackberryOS5Dashboard.tsx:287` — first item in the app dock array, points at `/about`).

### Salvageable state

- `components/BlackberryAboutContent.tsx` — content component EXISTS (not deleted by e7a2349).
- `public/data/about.json` — data file EXISTS, presumably the canonical source.
- `lib/aboutData.ts` — helper module EXISTS.
- `components/BlackberryOS5Dashboard.tsx:287` dock link → `/about` still active → currently produces the 404.
- `app/layout.tsx:120` prefetches `/data/about.json` for "instant load on About page" — vestigial hint that About used to ship.

### Restoration scope

Create `app/about/page.tsx` (route entry) using the existing content component. Minimal version:

```tsx
// app/about/page.tsx
import BlackberryAboutContent from '@/components/BlackberryAboutContent';

export default function AboutPage() {
  return <BlackberryAboutContent />;
}
```

For Phase 3+ (interior-mode chassis), wrap in `BBChassisShell` per the pattern in TRANSLATION_PATTERN.md Section 3. For Phase 2a, a bare restore is enough to clear the 404 — it can be re-skinned during Phase 4 when interior pages get the chassis pass.

**Open question for Phase 2a executor:** verify `BlackberryAboutContent.tsx` still compiles cleanly under the current Next.js + TypeScript versions. The component was untouched by `e7a2349` (which only removed the route page) but may have drifted since via the 16-file in-progress modifications visible in the dirty working tree on main.

### Scoping

- **Severity:** P0 (brand-fatal: most-clicked dock entry 404s on every visit).
- **Effort:** Small. ~20 lines of new code for the bare restore. ~1 hour including verifying the existing content component compiles + a visual smoke test.
- **Dependencies:** None for the bare restore. For a chassis-wrapped restore (Phase 3+), depends on `BBChassisShell` having shipped.
- **Acceptance:**
  - `/about` returns 200.
  - Content renders without runtime errors.
  - Dock-tile click from `/` to `/about` works.
  - "About" tile in `BlackberryOS5Dashboard.tsx` map shows expected hover + active state.

---

## ITEM 3 — Email TLD audit (`.com` → `.org`)

### Current state (drift)

Canon email is `hello@handtomouse.org`. Live site has `hello@handtomouse.com` in 10 locations across 7 files. Commit `ad4769d` partially fixed this (TDZ NeonCity bug + Instagram handle + email), but propagation is incomplete.

### File-line inventory (every occurrence)

| File | Line | Severity | Notes |
|---|---|---|---|
| `app/contact/ContactContent.tsx` | 103 | **P0 user-facing** | `navigator.clipboard?.writeText("hello@handtomouse.com")` — copies wrong email to clipboard |
| `app/contact/ContactContent.tsx` | 121 | **P0 user-facing** | rendered email string on Contact page |
| `app/contact/ContactContent.tsx` | 204 | **P0 user-facing** | `href="mailto:hello@handtomouse.com"` link |
| `components/BlackberryOS5Dashboard.tsx` | 1542 | **P0 user-facing** | clipboard copy from dashboard |
| `components/BlackberryOS5Dashboard.tsx` | 1772 | **P0 user-facing** | rendered email string |
| `app/layout.tsx` | 143 | **P1 SEO** | JSON-LD structured data `"email": "hello@handtomouse.com"` (search-engine-visible) |
| `lib/email.ts` | 177 | **P1 server fallback** | `CONTACT_EMAIL_TO || "hello@handtomouse.com"` env-var fallback for outbound mail recipient |
| `public/data/about_refactored.json` | 110 | **P2 data** | `"email": "hello@handtomouse.com"` — verify if `about_refactored.json` is actually consumed (the canonical file is `about.json`) |
| `CONTACT_IMPROVEMENTS.md` | 118 | P3 doc | `CONTACT_EMAIL_TO=hello@handtomouse.com` env-var sample |
| `README.md` | 378 | P3 doc | rendered email in readme |

**Total: 10 occurrences across 7 source files + 2 doc files + 1 data file.**

### Phase 2a strategy

- **P0 + P1 fixes (7 occurrences across 4 source files):** mechanical find-replace `hello@handtomouse.com` → `hello@handtomouse.org`. Visual sweep of `/contact` and dashboard email-copy interaction post-fix.
- **P2 data file:** verify whether `public/data/about_refactored.json` is wired up. If it's a stale artefact (canonical is `about.json`), DELETE the file rather than fix it. If it's actually consumed, fix the line.
- **P3 docs:** fix during the same commit so future README readers don't propagate the wrong address.

### Scoping

- **Severity:** P0 for the 5 user-facing occurrences (Contact page + dashboard email surface). P1 for layout.tsx JSON-LD + lib/email.ts fallback. P3 for docs.
- **Effort:** Small. ~30 minutes. Single repo-wide find-replace + verify each file, plus deciding the `about_refactored.json` question.
- **Dependencies:** Verify the `.env.local` `CONTACT_EMAIL_TO` value matches `.org` so the lib/email.ts fallback never fires anyway. Verify env-var documented in `.env.local.example` and `.env.example` is correct.
- **Acceptance:**
  - `grep -rn "hello@handtomouse\.com" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.json" --include="*.md"` returns ZERO matches in source/data files.
  - `/contact` rendered email + clipboard copy returns `hello@handtomouse.org`.
  - Dashboard email surface (line 1772 region of `BlackberryOS5Dashboard.tsx`) renders `.org`.
  - JSON-LD in HTML head contains `.org`.

---

## Phase 0 → Phase 2 handoff

When Phase 2a starts, this doc is consumed by the executor. Update each item's status as it lands:

- [ ] Item 1: Font stack collapsed to Geist Sans + Geist Mono
- [ ] Item 2: `/about` route restored
- [ ] Item 3: Email TLD audit closed (10/10 occurrences fixed or deleted)

Per Phase 2a checklist in TRANSLATION_PATTERN.md Section 6, these three items land DURING the migration commit set, not as a separate brand-fix pass — bundling reduces touch-surface contention since the font collapse and the JSX port both rewrite the same large set of consumer files.

---

## Unexpected discoveries surfaced during audit

1. **Broken git refs:** repo has `refs/heads/main 2` and `refs/remotes/origin/main 2` listed by `git branch -a` (with "bad object" warning). These are stale artefacts (likely Finder duplication of `.git/` at some point). Not blocking branch creation, but worth a `git for-each-ref` cleanup pass during Phase 2a infrastructure work.
2. **Dirty working tree:** when Phase 0 began, `main` had 16 modified files uncommitted (`app/api/contact/route.ts`, `app/games/page.tsx`, `app/layout.tsx`, `app/portfolio/PortfolioContent.tsx`, `app/portfolio/[slug]/page.tsx`, `app/services/ServicesContent.tsx`, `components/BlackberryAboutContent.tsx`, `components/BlackberryContactContent.tsx`, `components/BlackberryOS5Dashboard.tsx`, `components/BlackberryUIComponents.tsx`, `components/BlackberryWormholeContent.tsx`, `components/ProjectImagePlaceholder.tsx`, `lib/email.ts`, `public/data/about.json`, `public/data/clients.json`, `public/data/posts.json`). These came with the new branch into its working tree but were NOT committed by Phase 0. Nate should decide whether to commit them on main or fold them into the migration commits.
3. **11 commits ahead of `origin/main`:** local main has 11 commits not pushed to remote. The Phase 0 branch was created off the most recent local commit `36e1226`, so it inherits all 11. Pushing `feat/v0b-migration` to remote with `-u` will create the remote branch but does NOT push main's pending 11 commits. Decide whether to push main separately.
4. **`public/data/about_refactored.json` existence:** parallel-named-file to `about.json`. Status (canonical vs stale) unknown. Phase 2a should resolve before fixing or deleting per Item 3 P2 above.
5. **`BBTrackpad.tsx` is defined but UNWIRED in `BlackberryOS5Dashboard.tsx`** (confirmed via prior audit). Not in scope for V_B migration but documented in TRANSLATION_PATTERN.md Section 5 as the V_C anchor for future SPINs.

---

## End

This audit is evidence-based as of 2026-05-17. Re-run greps before Phase 2a executor consumes the doc; main may have shifted in the interim.
