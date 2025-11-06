# Test Plan: About+Icon Scroll Fade Fix

## Root Cause Identified
The scroll container in `BlackberryOS5Dashboard.tsx` was missing the `scrollable-content` class, causing `BlackberryAboutContent.tsx`'s scroll handler to never attach or fire.

## Changes Made

### 1. BlackberryOS5Dashboard.tsx (Line 931)
**BEFORE:**
```tsx
className={`absolute left-0 right-0 top-[72px] bottom-[32px] overflow-y-auto bg-black/40...`
```

**AFTER:**
```tsx
className={`scrollable-content absolute left-0 right-0 top-[72px] bottom-[32px] overflow-y-auto bg-black/40...`
```

### 2. BlackberryAboutContent.tsx (Lines 308-312)
**BEFORE:**
```tsx
// Hero fade: fade out About+Icon before reaching ECN section (60vh-100vh)
const viewportHeight = window.innerHeight;
const heroFadeStart = viewportHeight * 0.6;
const heroFadeEnd = viewportHeight * 1.0;
```

**AFTER:**
```tsx
// Hero fade: fade out About+Icon as user scrolls down
// Start fading at 400px scroll, fully gone by 800px
const heroFadeStart = 400;
const heroFadeEnd = 800;
```

## Why This Fixes The Issue

1. **Scroll Event Now Fires**: The selector `.scrollable-content` now matches the actual scroll container
2. **Correct Fade Calculation**: Changed from viewport-based (60vh-100vh) to scroll-based (400px-800px)
   - This works because the scroll is happening in the BB screen container, not the viewport
3. **Proper Timing**: Starts fading at 400px (after hero section), fully gone by 800px (well before ECN section)

## Testing Steps

1. Open http://localhost:3001
2. Navigate to About section
3. Scroll down slowly
4. **Expected Behavior:**
   - At 0px scroll: About+Icon fully visible (opacity: 1)
   - At 400px scroll: About+Icon starts fading
   - At 600px scroll: About+Icon at 50% opacity
   - At 800px scroll: About+Icon completely gone (opacity: 0, visibility: hidden)
   - ECN section should NOT have any overlap with About+Icon

5. **Console Test** (optional):
   ```javascript
   // Check if scroll handler is attached
   const el = document.querySelector('.scrollable-content');
   console.log('Scroll container found:', !!el);

   // Monitor opacity changes
   const about = document.querySelector('[style*="opacity"]');
   el.addEventListener('scroll', () => {
     console.log('Scroll:', el.scrollTop, 'Opacity:', about?.style.opacity);
   });
   ```

## Visual Verification Points

- [ ] About title and icon are visible on page load
- [ ] Scrolling down starts fading both elements smoothly
- [ ] By the time Philosophy section is fully visible, About+Icon should be gone
- [ ] No overlap or blocking of content below
- [ ] Parallax effect (upward movement) is working
- [ ] Back-to-top button appears after 300px scroll
