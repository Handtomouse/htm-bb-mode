# BB Mode Icon System Migration Map

**Date**: 2025-11-24
**Status**: 📋 Planning Complete → Ready for Implementation
**Goal**: Consolidate 3 fragmented icon systems into unified BBIcon component

---

## Current State Analysis

### Icon Systems (3 Different Approaches)

#### 1. **lib/icons.ts** - String-based icon storage
- `MonoIcons` - Simple white SVG strings (5 icons)
- `BBIcons` - Colored pixel art SVG strings (4 hardware icons)
- Individual exports - `Icon*` constants (12 tile icons)
- `getIcon()` utility function for dynamic lookup

#### 2. **components/BlackberryIcons.tsx** - Component-based icons
- Individual React components per icon
- `AppGlyph` wrapper component
- Portfolio-specific icons (About, Work, Clients, etc.)

#### 3. **components/InlineIcon.tsx** - SVG string renderer
- Takes HTML string and renders as component
- Used with `MonoIcons` and `BBIcons`

---

## Usage Inventory

### Files Using Current Icon Systems

| File | Usage Pattern | Icons Used | Migration Priority |
|------|---------------|------------|-------------------|
| `components/Dock.tsx` | `InlineIcon` + `MonoIcons/BBIcons` | home, services, contact, back, clients, menu, call, power | **HIGH** |
| `components/NavGrid.tsx` | `getIcon()` utility | Dynamic based on tile titles | **HIGH** |
| `components/BlackberryOS5Dashboard.tsx` | Direct component imports | AboutIcon, WorkIcon, ClientsIcon, FavouritesIcon, ShowreelIcon, SettingsIcon, DonateIcon, WormholeIcon, ContactIcon, MessageIcon, GamesIcon, InstagramIcon | **HIGH** |
| `components/Tile.tsx` | Receives icon HTML string | Various via NavGrid | **MEDIUM** |

---

## Icon Mapping (Old → New)

### MonoIcons → BBIcon Equivalents

| Old (`MonoIcons`) | New BBIcon Name | Variant | Notes |
|-------------------|-----------------|---------|-------|
| `MonoIcons.home` | `home` | pixel | ✅ Direct match |
| `MonoIcons.services` | N/A | outline | Need to create "layers" or "services" icon |
| `MonoIcons.contact` | `mail` | outline | Mail icon exists |
| `MonoIcons.back` | `back` | pixel | ✅ Direct match (from backburger.svg) |
| `MonoIcons.clients` | `users` | outline | ✅ Direct match |

### BBIcons (Hardware) → BBIcon Equivalents

| Old (`BBIcons`) | New BBIcon Name | Variant | Notes |
|-----------------|-----------------|---------|-------|
| `BBIcons.call` | `phone` | pixel | ✅ Direct match (deskphone.svg) |
| `BBIcons.menu` | `menu` | pixel | ✅ Direct match |
| `BBIcons.back` | `back` | pixel | ✅ Direct match |
| `BBIcons.power` | N/A | pixel | Custom - keep existing or create new |

### Tile Icons → BBIcon Equivalents

| Old Export | getIcon() Key | New BBIcon Name | Variant |
|-----------|---------------|-----------------|---------|
| `IconPortfolio` | portfolio | `folder` or `image` | outline |
| `IconClients` | clients | `users` | outline |
| `IconServices` | services | Need custom | outline |
| `IconWeb` | web | Need custom | outline |
| `IconShowreel` | showreel | `video` | outline |
| `IconGames` | games | Need custom | outline |
| `IconNotes` | notes | `document` | outline |
| `IconExtras` | extras | `heart` | solid |
| `IconSettings` | settings | `settings` | outline |
| `IconFavourites` | favourites | `heart` | solid |
| `IconAbout` | about | `info` | outline |
| `IconContact` | contact | `mail` | outline |

### Component Icons (BlackberryIcons.tsx) → BBIcon Equivalents

| Component | New BBIcon Name | Variant | Category |
|-----------|-----------------|---------|----------|
| `AboutIcon` | `info` | outline | navigation |
| `WorkIcon` | `folder` or `image` | outline | content |
| `ClientsIcon` | `users` | outline | communication |
| `FavouritesIcon` | `heart` | solid | actions |
| `ShowreelIcon` | `video` | outline | content |
| `SettingsIcon` | `settings` | outline | actions |
| `DonateIcon` | `heart` | solid | actions |
| `WormholeIcon` | Need custom | outline | navigation |
| `ContactIcon` | `mail` | outline | communication |
| `MessageIcon` | `message` | outline | communication |
| `GamesIcon` | Need custom | outline | content |
| `InstagramIcon` | `instagram` | outline | communication |

---

## Missing Icons (Need Creation)

Based on current usage, these icons don't have direct equivalents in our new system:

1. ✅ **Services icon** - CREATED (Stack/layers concept - 3 stacked rectangles)
2. **Web/globe icon** - Already exists in icon registry
3. ✅ **Games icon** - CREATED (Game controller with D-pad and buttons)
4. **Power icon** - Custom pixel art (keep existing BBIcons.power)
5. ✅ **Wormhole icon** - CREATED (Spiral/portal with concentric circles)

**Status**: All required custom icons created and processed into the icon system.

---

## Migration Strategy

### Phase 1: Core Component Updates (Dock.tsx)

**Before**:
```tsx
<InlineIcon svg={MonoIcons.home} className="[&>svg]:block" />
```

**After**:
```tsx
<BBIcon name="home" variant="pixel" size={28} />
```

### Phase 2: Dashboard Icon Imports

**Before**:
```tsx
import { AboutIcon, WorkIcon, ClientsIcon } from "./BlackberryIcons";
<AboutIcon />
```

**After**:
```tsx
import { BBIcon } from "./BBIcon";
<BBIcon name="info" variant="outline" size={28} />
```

### Phase 3: NavGrid/Tile System

**Before**:
```tsx
icon={tile.icon || getIcon(tile.title.toLowerCase().replace(/\s+/g, ""))}
```

**After**:
```tsx
// Update Tile.tsx to accept BBIcon name instead of HTML string
iconName={tile.iconName || mapTitleToIconName(tile.title)}

// In Tile.tsx
<BBIcon name={iconName} variant="outline" size={24} />
```

### Phase 4: AppGlyph Wrapper Update

Update `AppGlyph` component to use BBIcon internally instead of BlackberryIcons components.

**Before**:
```tsx
export function AppGlyph({ name }: { name: string }) {
  const iconMap = { about: AboutIcon, work: WorkIcon, ... };
  const Icon = iconMap[name] || AboutIcon;
  return <Icon />;
}
```

**After**:
```tsx
export function AppGlyph({ name }: { name: string }) {
  const iconNameMap = { about: 'info', work: 'folder', ... };
  return <BBIcon name={iconNameMap[name] || 'info'} variant="outline" size={28} />;
}
```

---

## Code Changes Required

### Files to Modify

1. ✅ **Create** `components/BBIcon.tsx` - DONE
2. ✅ **Create** `components/BBIcon.module.css` - DONE
3. ✅ **Create** `lib/icon-registry.ts` - DONE (221 icons: 47 core + 171 HTM + 3 custom)
4. **Modify** `components/Dock.tsx` - Replace InlineIcon usage
5. ✅ **Modify** `components/BlackberryOS5Dashboard.tsx` - DONE (All 12 app icons using BBIcon solid variant)
6. ✅ **Modify** `components/NavGrid.tsx` - DONE (Updated to use iconName prop and getTileIconName mapping)
7. ✅ **Modify** `components/Tile.tsx` - DONE (Accepts iconName prop, renders BBIcon solid variant)
8. **Update** `components/BlackberryIcons.tsx` - Add deprecation warnings
9. **Update** `lib/icons.ts` - Add deprecation comments

### Files to Deprecate (After Migration)

1. `components/BlackberryIcons.tsx` (keep temporarily with warnings)
2. `lib/icons.ts` (keep temporarily with warnings)
3. `components/InlineIcon.tsx` (might keep for edge cases)

---

## Testing Checklist

After migration, verify:

- [ ] Dock icons render correctly in both mono and bb modes
- [ ] Dashboard app grid icons match previous design
- [ ] Navigation tiles show correct icons
- [ ] All icon colors match design system (accent, white, grey, green, red)
- [ ] Hover states work correctly
- [ ] Responsive sizing maintained
- [ ] No console errors or missing icon warnings
- [ ] TypeScript autocomplete works for icon names
- [ ] Accessibility (ARIA labels) preserved

---

## Rollback Plan

If issues arise:

1. Old icon systems still present (just deprecated)
2. Can revert imports file-by-file
3. Git history available for full rollback
4. No breaking changes to public APIs (just internal refactor)

---

## Benefits After Migration

✅ **Single source of truth** - One BBIcon component
✅ **Type safety** - Autocomplete for 47 icon names
✅ **Consistent styling** - Unified luxury aesthetic
✅ **Better performance** - Optimized SVGs, tree-shaking
✅ **Easier maintenance** - Add new icons in one place
✅ **Flexible variants** - pixel/outline/solid with one prop
✅ **Theme support** - Dynamic colors via CSS variables

---

## Next Steps

1. ✅ Complete BBIcon component system - DONE
2. 🔄 Start with Dock.tsx migration (highest impact) - PENDING
3. ✅ Test on dev server - DONE (Running at http://localhost:3000)
4. ✅ Migrate Dashboard icons - DONE (All 12 app icons using solid variant)
5. ✅ Update NavGrid/Tile system - DONE (Ready for use, no pages currently use it)
6. 🔄 Add deprecation warnings - PENDING
7. 🔄 Update documentation - IN PROGRESS
8. Deploy to production - PENDING

---

**Completion Status**: Dashboard & NavGrid/Tile migrations complete. Dock.tsx and deprecation warnings remaining.
**Estimated Timeline**: 1-2 hours remaining for Dock migration + testing + deployment
