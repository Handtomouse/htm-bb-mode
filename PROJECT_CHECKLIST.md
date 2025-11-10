# BB-Mode Project Checklist

**⚠️ READ THIS FIRST** - Review this file at the start of every session and before making major changes.

**Last Updated**: 2025-11-10

---

## 🔴 Critical Architecture Rules

### BB-OS Single-Page Architecture

**NEVER create separate page routes** — Everything lives inside the BlackBerry OS interface.

```
✅ CORRECT:
- Edit: components/BlackberryAboutContent.tsx
- Edit: components/BlackberryContactContent.tsx
- Edit: components/BlackberryOS5Dashboard.tsx

❌ WRONG:
- Create: app/about/page.tsx
- Create: app/contact/page.tsx
- Create: app/showreel/page.tsx
```

**Why**: The entire site is a BlackBerry phone simulator. All "apps" are content components loaded inside `BlackberryOS5Dashboard.tsx`, not separate routes.

**See**: `DEVELOPMENT_RULES.md` for complete details.

---

## 📋 Before Starting Work

**Read these files first:**

- [ ] `DEVELOPMENT_RULES.md` - Architecture constraints
- [ ] `STYLE_GUIDE.md` (Section 0: Getting Started)
- [ ] Recent changes in `components/BlackberryAboutContent.tsx`
- [ ] Check `git status` for uncommitted changes

**Understand current implementations:**

1. **FadeSection** (BlackberryAboutContent.tsx:11-35)
   - Scroll-driven fade in/out
   - Fade zones: 0-0.2 (fade in), 0.85-0.95 (fade out late)
   - Holds opacity longer through viewport center

2. **Typewriter Animation** (BlackberryAboutContent.tsx:209-231)
   - Responsive scroll ranges per breakpoint
   - Mobile: 32vh→75vh (43vh range)
   - Tablet: 30vh→77vh (47vh range)
   - Desktop: 28vh→78vh (50vh range)

3. **Style Guide v2.0.0**
   - 20 improvements completed (2025-11-10)
   - Reusable components in `components/ui/`
   - TypeScript types in `lib/types/style.ts`
   - Animation utilities in `lib/utils/animations.ts`

---

## 🎨 Style Guide Quick Reference

**Always use these values:**

| Element | Value | Notes |
|---------|-------|-------|
| Accent color | `#ff9d23` | NOT #F4A259 |
| Accent hover | `#FFB84D` | |
| Background | `#0b0b0b` (--bg) | |
| Text primary | `#EDECEC` (--ink) | |
| Text secondary | `#9A9A9A` (--muted) | |
| Body font | `var(--font-mono)` | VT323 |
| Heading font | `var(--font-heading)` | Pixelify Sans |

**Spacing scale (4px increments):**
- 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128

**Animation durations:**
- 120ms (instant), 300ms (fast), 600ms (normal), 1200ms (slow), 1800ms (dramatic)

**Easing:**
- `ease-out` (default) or `[0.16, 1, 0.3, 1]` (luxury feel)

**See**: `STYLE_GUIDE.md` for complete system.

---

## ✅ Before Committing - Code Quality Checklist

### Architecture
- [ ] Follows BB-OS single-page architecture (no separate routes)
- [ ] Content components are `Blackberry*.tsx` files
- [ ] Changes confined to `components/`, `lib/`, or `public/data/`

### Style Guide Compliance
- [ ] Uses `#ff9d23` for accent color (not #F4A259)
- [ ] Uses CSS custom properties from `globals.css`
- [ ] Spacing uses 4px scale (8, 12, 16, 20, 24...)
- [ ] Animations use standard durations (120ms, 300ms, 600ms, 1200ms)
- [ ] Easing uses `ease-out` or `[0.16, 1, 0.3, 1]`

### Responsive Design
- [ ] Mobile-first approach (`text-[16px] md:text-[20px] lg:text-[24px]`)
- [ ] Touch targets ≥ 44x44px
- [ ] Tested on mobile (375px), tablet (768px), desktop (1920px)
- [ ] No horizontal scroll

### Animations
- [ ] Uses Framer Motion for animations
- [ ] Scroll animations include `viewport={{ once: true }}`
- [ ] Respects `prefers-reduced-motion` (automatic in globals.css)
- [ ] Durations appropriate for effect (fast: 300ms, reveal: 600-1200ms)

### Accessibility
- [ ] Color contrast ≥ 4.5:1 (text), 3:1 (large text)
- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] ARIA labels for icon buttons
- [ ] Alt text for images (descriptive, not "logo")
- [ ] Semantic HTML (h1-h6, nav, main, article)

### Performance
- [ ] Images use Next.js `<Image>` component
- [ ] Heavy components lazy loaded with Suspense
- [ ] Animations use GPU-accelerated properties (transform, opacity)
- [ ] No unnecessary re-renders (React.memo if needed)

### Code Quality
- [ ] TypeScript types added/updated if applicable
- [ ] No ESLint violations
- [ ] Follows existing component patterns
- [ ] Comments explain "why", not "what"

---

## 🧩 Reusable Components Available

**Don't reinvent the wheel** - Use these from `components/ui/`:

```tsx
import { AccentButton, GlowCard, FadeSection } from "@/components/ui";

// Accent button with automatic hover glow
<AccentButton variant="primary">Get Started</AccentButton>

// Card with accent glow (About page style)
<GlowCard variant="accent">Content</GlowCard>

// Scroll-driven fade wrapper
<FadeSection>
  <section className="min-h-screen py-[10vh]">Content</section>
</FadeSection>
```

**Animation utilities** from `lib/utils/animations.ts`:

```tsx
import { fadeInUp, scrollFade, accentButtonHover, accentGlow } from "@/lib/utils/animations";

<motion.div {...fadeInUp}>Fade in content</motion.div>
```

---

## 🚨 Common Pitfalls to Avoid

1. **❌ Using #F4A259** → ✅ Use #ff9d23
2. **❌ Forgetting `viewport={{ once: true }}`** → Animations retrigger on every scroll
3. **❌ Desktop-first responsive design** → ✅ Mobile-first (base → md → lg)
4. **❌ Hardcoded colors** → ✅ Use CSS variables (`bg-bg`, `text-ink`)
5. **❌ Random spacing values** → ✅ Use 4px scale (8, 12, 16, 20, 24)
6. **❌ Creating separate routes** → ✅ Edit Blackberry content components
7. **❌ Overly complex components** → ✅ Break into smaller pieces (<1000 lines)
8. **❌ Ignoring the style guide** → ✅ Reference STYLE_GUIDE.md

---

## 📁 Current Project State

### Recent Changes (2025-11-10)
- ✅ STYLE_GUIDE.md v2.0.0 (1453 lines, 20 improvements)
- ✅ Updated globals.css (50+ CSS custom properties)
- ✅ Created reusable component library (`components/ui/`)
- ✅ Added TypeScript types (`lib/types/style.ts`)
- ✅ Added animation utilities (`lib/utils/animations.ts`)
- ✅ Updated FadeSection fade zones (0.85-0.95 for late fadeout)
- ✅ Updated Typewriter responsive scroll ranges

### Active Branch
- `main` - Production-ready code
- Deploy target: http://localhost:3000 (dev), Vercel (production)

### Key Files to Know
- `components/BlackberryOS5Dashboard.tsx` (1875 lines) - Main BB-OS container
- `components/BlackberryAboutContent.tsx` (1145 lines) - About page with custom animations
- `app/globals.css` - CSS custom properties
- `STYLE_GUIDE.md` - Complete design system
- `DEVELOPMENT_RULES.md` - Architecture constraints

---

## 🔄 Session Workflow

**Every session, follow this pattern:**

1. **Start**
   - [ ] Read this file (PROJECT_CHECKLIST.md)
   - [ ] Check `git status` for uncommitted changes
   - [ ] Review recent commits (`git log --oneline -5`)

2. **During Work**
   - [ ] Reference STYLE_GUIDE.md for patterns
   - [ ] Use reusable components from `components/ui/`
   - [ ] Follow BB-OS architecture (no separate routes)
   - [ ] Test responsive behavior (mobile, tablet, desktop)

3. **Before Committing**
   - [ ] Run through "Before Committing" checklist above
   - [ ] Test animations (smooth, no jank)
   - [ ] Check accessibility (keyboard nav, contrast)
   - [ ] Review git diff to ensure no unintended changes

4. **Commit Message Format**
   ```
   Add/Update/Fix: [Brief description]

   - Detail 1
   - Detail 2

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

---

## 📚 Essential Documentation

| File | Purpose | When to Read |
|------|---------|--------------|
| `PROJECT_CHECKLIST.md` | **This file** - Always read first | Every session start |
| `DEVELOPMENT_RULES.md` | BB-OS architecture constraints | Before any structural changes |
| `STYLE_GUIDE.md` | Complete design system | Before creating components |
| `README.md` | Project overview | First time setup |

---

## 🎯 Quick Commands

```bash
# Start dev server
npm run dev

# Check for style violations
npm run lint

# Build for production
npm run build

# View git status
git status

# View recent commits
git log --oneline -10

# View uncommitted changes
git diff
```

---

**Remember**: When in doubt, consult STYLE_GUIDE.md. When making structural changes, check DEVELOPMENT_RULES.md.

**Last Updated**: 2025-11-10 (v1.0.0)
