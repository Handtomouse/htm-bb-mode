# Clients Page - Wave 4: Advanced Features Specification

## Overview

This document outlines 20 advanced improvements for the Clients page. Given the current file size (1,044 lines), implementing all features would result in a 2,000+ line file, which violates best practices for maintainability.

**Recommendation**: Implement incrementally or refactor into modular architecture.

---

## Implementation Priority

### 🔴 **Critical (Implement First)** - Infrastructure
- URL State Sync
- Keyboard Command Palette
- Saved Filter Presets

### 🟡 **High Value (Implement Second)** - User Features
- Multi-Select with Checkboxes
- Client Comparison Modal
- Stats Dashboard
- Sector Pie Chart

### 🟢 **Nice to Have (Implement Later)** - Advanced
- Virtual Scrolling
- PWA/Service Worker
- Onboarding Tour
- Advanced Search Builder

---

## Feature Specifications

### 1. Client Stats Dashboard 📊

**Purpose**: Provide at-a-glance analytics and insights

**Design**:
```
┌─────────────────────────────────────────┐
│ 📊 Dashboard [Collapse ▼]               │
├─────────────────────────────────────────┤
│ Active: 12  Completed: 5  Total: 17     │
│ Avg Projects/Client: 3.2                │
│ Top Sector: Financial Services (4)      │
│ Newest: Ferrari (2024)                  │
│ Most Projects: HESTA (6)                │
│                                          │
│ [Mini Bar Chart: Sectors]               │
│ [Mini Line Chart: Clients Over Time]    │
└─────────────────────────────────────────┘
```

**State Required**:
```typescript
const [showDashboard, setShowDashboard] = useState(false);
const [dashboardMetrics, setDashboardMetrics] = useState({
  avgProjects: 0,
  topSector: "",
  newestClient: "",
  mostProjects: { name: "", count: 0 }
});
```

**Implementation**:
- Collapsible panel below header
- useMemo for metric calculations
- Mini charts using CSS (not library)
- Auto-updates when clients/filters change

**Complexity**: Medium (100 lines)

---

### 2. Search Analytics 🔍

**Purpose**: Track user behavior to improve UX

**Data Tracked**:
```typescript
interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultsCount: number;
  clickedClient?: string;
}

const [searchHistory, setSearchHistory] = useState<SearchAnalytics[]>([]);
```

**Features**:
- Track every search (debounced)
- Store in localStorage (last 100)
- Show "Popular Searches" widget
- Display "No results" common searches
- Export analytics as JSON

**UI**:
```
Popular Searches:
1. "financial" (12 searches)
2. "active" (8 searches)
3. "sydney" (5 searches)
```

**Complexity**: Low (50 lines)

---

### 3. Usage Heatmap 🔥

**Purpose**: Visual representation of client engagement

**Design**:
- Track clicks per client in localStorage
- Color-code cards: cold (blue) → warm (yellow) → hot (red)
- Opacity/border intensity based on views
- "Trending" badge for 3+ views this week

**State**:
```typescript
interface ClientUsage {
  [clientName: string]: {
    views: number;
    lastViewed: number;
    clicks: number;
  };
}

const [usageData, setUsageData] = useState<ClientUsage>({});
```

**Visual**:
```css
/* 0-2 views: default */
/* 3-5 views: border-accent/30 */
/* 6-10 views: border-accent/60 */
/* 11+ views: border-accent + shadow */
```

**Complexity**: Medium (80 lines)

---

### 4. Sector Comparison View 📈

**Purpose**: Side-by-side sector statistics

**Layout**:
```
┌──────────────────────────────────────────┐
│ Financial Services (4) vs Banking (1)    │
├──────────────────────────────────────────┤
│ Total Projects:    14  │  5              │
│ Avg Projects:      3.5 │  5.0            │
│ Active Clients:    3   │  0              │
│ Featured:          2   │  0              │
│                                           │
│ [Bar Chart Comparison]                   │
└──────────────────────────────────────────┘
```

**State**:
```typescript
const [comparedSectors, setComparedSectors] = useState<string[]>([]);
const [showSectorComparison, setShowSectorComparison] = useState(false);
```

**Features**:
- Select 2-3 sectors from filter
- Click "Compare Sectors" button
- Modal overlay with side-by-side stats
- Export comparison as image/PDF

**Complexity**: High (150 lines)

---

### 5. Client Velocity / Trending 🚀

**Purpose**: Show which clients are gaining attention

**Logic**:
```typescript
const getTrendingClients = () => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return Object.entries(usageData)
    .filter(([_, data]) => data.lastViewed > weekAgo && data.views >= 3)
    .map(([name]) => name);
};
```

**Visual**:
- "🔥 Trending" badge on cards
- Sort option: "Trending First"
- Dashboard widget: "Hot This Week"

**Complexity**: Low (40 lines)

---

### 6. Drag-and-Drop Ordering 🎯

**Purpose**: Custom client arrangement

**Library**: `@dnd-kit/core` or native HTML5 drag API

**State**:
```typescript
const [customOrder, setCustomOrder] = useState<string[]>([]);
const [isDragging, setIsDragging] = useState(false);
```

**Features**:
- Drag handle icon on each card (grid mode)
- Visual feedback (opacity, scale)
- Snap to grid positions
- "Reset to Default Order" button
- Save order to localStorage

**UI**:
```
[Card Header]
  ⋮⋮  (drag handle)
  Client Name
  [Actions]
```

**Complexity**: High (200 lines including library integration)

---

### 7. Multi-Select with Checkboxes ✓

**Purpose**: Bulk actions on multiple clients

**State**:
```typescript
const [selectedClients, setSelectedClients] = useState<string[]>([]);
const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
```

**Features**:
- Toggle multi-select mode (button or Shift key)
- Checkbox top-left of each card
- Floating toolbar when selections exist:
  - Export Selected (CSV)
  - Compare Selected
  - Print Selected
  - Bookmark All
  - Clear Selection

**UI**:
```
┌────────────────────────────────────┐
│ ☑ Select All  |  3 selected        │
│ [Export] [Compare] [Print] [Clear] │
└────────────────────────────────────┘
```

**Complexity**: Medium (120 lines)

---

### 8. Client Comparison Modal 🔬

**Purpose**: Detailed side-by-side comparison

**Design**:
```
┌──────────────────────────────────────────────┐
│ Compare Clients          [×]                  │
├──────────────────────────────────────────────┤
│         HESTA      |  Bankwest  |  Ferrari   │
├──────────────────────────────────────────────┤
│ Sector  Super      |  Banking   |  Auto      │
│ Projects 6         |  5         |  3         │
│ Status  Active     |  Completed |  Active    │
│ Started 2018       |  2015      |  2024      │
│ Tags    finance    |  bank      |  luxury    │
│         pension    |  digital   |  performance│
│                                               │
│ [Export Comparison] [Print]                  │
└──────────────────────────────────────────────┘
```

**State**:
```typescript
const [comparisonClients, setComparisonClients] = useState<Client[]>([]);
const [showComparison, setShowComparison] = useState(false);
```

**Features**:
- Select 2-4 clients (multi-select or manual)
- Click "Compare" button
- Full-screen modal with table
- Export as CSV/image
- Print-friendly

**Complexity**: Medium (150 lines)

---

### 9. Infinite Scroll Option ∞

**Purpose**: Seamless browsing for large datasets

**State**:
```typescript
const [paginationMode, setPaginationMode] = useState<"paginated" | "infinite">("paginated");
const [displayedCount, setDisplayedCount] = useState(20);
```

**Implementation**:
- Intersection Observer on last card
- Load more when visible
- "Load More" button fallback
- Toggle setting in header

**UI**:
```
[⊞] [☰] [≡]  |  Pagination: [Pages ▼] [Infinite]
```

**Features**:
- Initial: Show 20 clients
- Scroll: Load +20 each time
- "Back to Top" arrow
- Preserve scroll position

**Complexity**: Medium (100 lines)

---

### 10. Advanced Search Builder 🔧

**Purpose**: Power-user search with boolean logic

**UI**:
```
┌────────────────────────────────────────┐
│ Advanced Search Builder                 │
├────────────────────────────────────────┤
│ [Field: Name ▼] [Operator: Contains ▼] │
│ [Value: _______________]                │
│                                         │
│ [AND ▼] [OR] [NOT]                     │
│                                         │
│ [Field: Sector ▼] [Operator: Is ▼]    │
│ [Value: Financial Services ▼]           │
│                                         │
│ [+ Add Rule]  [Clear]  [Search]        │
└────────────────────────────────────────┘
```

**State**:
```typescript
interface SearchRule {
  field: "name" | "sector" | "tags" | "projects";
  operator: "contains" | "is" | "isNot" | ">" | "<" | ">=";
  value: string | number;
  logic: "AND" | "OR" | "NOT";
}

const [searchRules, setSearchRules] = useState<SearchRule[]>([]);
```

**Features**:
- Drag to reorder rules
- Save as preset
- Visual query builder (no SQL)

**Complexity**: High (200 lines)

---

### 11. Saved Filter Presets 💾

**Purpose**: Quick access to common filter combinations

**State**:
```typescript
interface FilterPreset {
  id: string;
  name: string;
  filters: {
    sectors: string[];
    status: StatusFilter;
    projectRange: [number, number];
    search: string;
    sort: SortOption;
  };
  createdAt: number;
}

const [presets, setPresets] = useState<FilterPreset[]>([]);
const [activePreset, setActivePreset] = useState<string | null>(null);
```

**UI**:
```
Presets: [Active Clients ▼] [My Favorites] [High Volume]
         [+ Save Current]
```

**Features**:
- Save current filter state with name
- Quick load from dropdown
- Edit/delete presets
- Export/import presets JSON
- Max 10 presets

**Complexity**: Medium (120 lines)

---

### 12. Filter History Timeline ⏱️

**Purpose**: See filter changes over time

**UI**:
```
Filter History:
○ 2:30 PM - Cleared all filters
├ 2:28 PM - Set sector: Financial Services
├ 2:25 PM - Search: "active"
└ 2:20 PM - Status: Active only

[Undo Last] [Jump to Time]
```

**State**:
```typescript
interface FilterSnapshot {
  timestamp: number;
  filters: CurrentFilterState;
  resultsCount: number;
}

const [filterHistory, setFilterHistory] = useState<FilterSnapshot[]>([]);
const [historyIndex, setHistoryIndex] = useState(0);
```

**Features**:
- Record every filter change
- Undo/Redo buttons (⌘Z / ⌘⇧Z)
- Timeline visual
- Jump to snapshot

**Complexity**: High (150 lines)

---

### 13. Sector Pie/Donut Chart 🥧

**Purpose**: Visual sector distribution

**Design**:
```
    [Pie Chart]
  ╱────────────╲
 │  Financial  │
 │    (23%)    │
 │             │
 │  Banking    │
 │    (15%)    │
  ╲────────────╱

Click segment → Filter by sector
```

**Implementation**:
- Pure CSS conic-gradient
- SVG fallback
- Interactive (click to filter)
- Tooltip on hover showing exact count

**Code**:
```typescript
const sectorPercentages = useMemo(() => {
  const total = clients.length;
  return sectors.map(s => ({
    name: s,
    count: sectorCounts[s],
    percentage: (sectorCounts[s] / total) * 100
  }));
}, [clients, sectors, sectorCounts]);
```

**Complexity**: Medium (100 lines)

---

### 14. Project Timeline View 📅

**Purpose**: Chronological visualization of client work

**Design**:
```
2024 ████████ Ferrari (3)
2023 ─────────
2022 ████ DaFin (2)
2021 ─────────
2020 ██████████ HESTA (6)
2019 ██ Endoca (1)
2018 ████ People's Choice (4)
```

**State**:
```typescript
const [timelineView, setTimelineView] = useState(false);
const [timelineRange, setTimelineRange] = useState<[number, number]>([2015, 2024]);
```

**Features**:
- Horizontal timeline (year axis)
- Bars represent project count
- Click bar → filter by year
- Color by sector
- Zoom in/out

**Complexity**: High (180 lines)

---

### 15. Revenue Heatmap 💰

**Purpose**: Visual value representation (if revenue data available)

**Requirements**:
```typescript
interface Client {
  // ... existing fields
  revenue?: number;  // NEW
  projectValue?: number; // NEW
}
```

**Visual**:
- Card background intensity based on value
- High value: Brighter accent tint
- Low value: Darker/subtle tint
- Tooltip shows $ amount
- Sort by revenue

**Color Scale**:
```
$0-10k:    rgba(244, 162, 89, 0.05)
$10-50k:   rgba(244, 162, 89, 0.15)
$50-100k:  rgba(244, 162, 89, 0.30)
$100k+:    rgba(244, 162, 89, 0.50)
```

**Complexity**: Low (60 lines) - but requires data

---

### 16. Virtual Scrolling 🎬

**Purpose**: Render only visible cards for performance

**Library**: `react-window` or `react-virtuoso`

**Implementation**:
```typescript
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={gridDensity}
  columnWidth={280}
  height={800}
  rowCount={Math.ceil(filteredClients.length / gridDensity)}
  rowHeight={350}
  width={1200}
>
  {({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      <ClientCard client={clients[rowIndex * gridDensity + columnIndex]} />
    </div>
  )}
</FixedSizeGrid>
```

**Benefits**:
- Handles 1000+ clients smoothly
- Constant DOM nodes (not growing with data)
- Scroll performance

**Complexity**: Medium (80 lines + library)

---

### 17. Service Worker / PWA 📱

**Purpose**: Offline capability, faster loads

**Files**:
```
public/
  sw.js (service worker)
  manifest.json (PWA manifest)
```

**Features**:
- Cache clients.json
- Cache static assets
- Offline fallback page
- Install prompt
- Update notifications

**manifest.json**:
```json
{
  "name": "HTM Clients Portfolio",
  "short_name": "Clients",
  "start_url": "/clients",
  "display": "standalone",
  "background_color": "#0b0b0b",
  "theme_color": "#F4A259",
  "icons": [...]
}
```

**Complexity**: Medium (150 lines across files)

---

### 18. URL State Sync 🔗

**Purpose**: Shareable bookmarks with full state

**Implementation**:
```typescript
// Encode state to URL
useEffect(() => {
  const params = new URLSearchParams();

  if (searchQuery) params.set('q', searchQuery);
  if (!sectorFilter.includes('all')) params.set('sectors', sectorFilter.join(','));
  if (statusFilter !== 'all') params.set('status', statusFilter);
  if (sortBy !== 'name') params.set('sort', sortBy);
  if (viewMode !== 'grid') params.set('view', viewMode);
  if (projectRange[0] !== 0) params.set('minProjects', projectRange[0].toString());
  if (projectRange[1] !== 100) params.set('maxProjects', projectRange[1].toString());

  const url = params.toString() ? `?${params.toString()}` : '';
  window.history.replaceState({}, '', url || window.location.pathname);
}, [searchQuery, sectorFilter, statusFilter, sortBy, viewMode, projectRange]);

// Decode URL on load
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const q = params.get('q');
  const sectors = params.get('sectors');
  const status = params.get('status');
  const sort = params.get('sort');
  const view = params.get('view');
  const minProjects = params.get('minProjects');
  const maxProjects = params.get('maxProjects');

  if (q) setSearchQuery(q);
  if (sectors) setSectorFilter(sectors.split(','));
  if (status) setStatusFilter(status as StatusFilter);
  if (sort) setSortBy(sort as SortOption);
  if (view) setViewMode(view as ViewMode);
  if (minProjects || maxProjects) {
    setProjectRange([
      minProjects ? parseInt(minProjects) : 0,
      maxProjects ? parseInt(maxProjects) : 100
    ]);
  }
}, []);
```

**Example URL**:
```
/clients?q=financial&sectors=Financial%20Services,Banking&status=active&sort=projects&view=list
```

**Complexity**: Medium (100 lines)

---

### 19. Onboarding Tour 🎓

**Purpose**: First-time user guidance

**Library**: `react-joyride` or custom

**Steps**:
```typescript
const tourSteps = [
  {
    target: '.search-input',
    content: 'Search for clients by name, sector, or tags',
    placement: 'bottom'
  },
  {
    target: '.view-mode-toggle',
    content: 'Switch between grid, list, or compact view',
    placement: 'bottom'
  },
  {
    target: '.sector-filter',
    content: 'Filter by industry. Click multiple to combine!',
    placement: 'bottom'
  },
  {
    target: '.client-card:first-child',
    content: 'Hover to preview, click to see full details',
    placement: 'right'
  },
  {
    target: '.export-button',
    content: 'Export your filtered results as CSV',
    placement: 'left'
  }
];
```

**State**:
```typescript
const [showTour, setShowTour] = useState(false);
const [tourStep, setTourStep] = useState(0);

useEffect(() => {
  const hasSeenTour = localStorage.getItem('clientsTourCompleted');
  if (!hasSeenTour) setShowTour(true);
}, []);
```

**Features**:
- Spotlight effect on current element
- Step indicators (1/5, 2/5...)
- Skip tour button
- "Don't show again" checkbox
- Replay tour from help menu

**Complexity**: High (150 lines + library)

---

### 20. Keyboard Command Palette ⌨️

**Purpose**: Quick actions via keyboard

**Trigger**: `⌘K` or `Ctrl+K`

**UI**:
```
┌─────────────────────────────────────┐
│ ⌘ Command Palette                   │
├─────────────────────────────────────┤
│ > search clients___                 │
│                                     │
│ 🔍 Search for "financial"           │
│ 🗂️ Filter by Financial Services     │
│ ⊞ Switch to Grid View               │
│ ☰ Switch to List View               │
│ ✓ Enter Multi-Select Mode           │
│ 💾 Save Current Filters             │
│ 📊 Open Dashboard                   │
│ 📤 Export to CSV                    │
│ ⭐ Show Bookmarked Only             │
│ 🔄 Clear All Filters                │
└─────────────────────────────────────┘
```

**Commands**:
```typescript
interface Command {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  keywords: string[];
  shortcut?: string;
}

const commands: Command[] = [
  {
    id: 'search',
    label: 'Search clients',
    icon: '🔍',
    action: () => document.querySelector('.search-input')?.focus(),
    keywords: ['search', 'find', 'query'],
    shortcut: '/'
  },
  {
    id: 'grid-view',
    label: 'Switch to Grid View',
    icon: '⊞',
    action: () => setViewMode('grid'),
    keywords: ['grid', 'view', 'layout'],
    shortcut: '⌘1'
  },
  // ... 20+ commands
];
```

**Features**:
- Fuzzy search commands
- Keyboard navigation (↑↓ Enter)
- Recent commands history
- Command shortcuts shown
- ESC to close

**State**:
```typescript
const [showCommandPalette, setShowCommandPalette] = useState(false);
const [commandQuery, setCommandQuery] = useState('');
```

**Shortcuts**:
```
⌘K        - Open palette
⌘1/2/3    - View modes
⌘F        - Focus search
⌘B        - Toggle bookmarks only
⌘E        - Export CSV
⌘/        - Show shortcuts help
```

**Complexity**: High (200 lines)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- ✅ URL State Sync (#18)
- ✅ Saved Filter Presets (#11)
- ✅ Command Palette (#20)

**Estimated Lines**: +400

### Phase 2: Core Features (Week 2)
- ✅ Multi-Select (#7)
- ✅ Comparison Modal (#8)
- ✅ Stats Dashboard (#1)

**Estimated Lines**: +420

### Phase 3: Analytics (Week 3)
- ✅ Search Analytics (#2)
- ✅ Usage Heatmap (#3)
- ✅ Trending Badges (#5)

**Estimated Lines**: +170

### Phase 4: Visualization (Week 4)
- ✅ Sector Pie Chart (#13)
- ✅ Timeline View (#14)
- ✅ Sector Comparison (#4)

**Estimated Lines**: +430

### Phase 5: Advanced (Week 5)
- ✅ Filter History (#12)
- ✅ Advanced Search Builder (#10)
- ✅ Drag-and-Drop (#6)

**Estimated Lines**: +470

### Phase 6: Performance & UX (Week 6)
- ✅ Virtual Scrolling (#16)
- ✅ Infinite Scroll (#9)
- ✅ Onboarding Tour (#19)
- ✅ PWA/Service Worker (#17)
- ✅ Revenue Heatmap (#15)

**Estimated Lines**: +540

---

## Total Impact

**Current State**:
- 1,044 lines
- 18 state variables
- 3 view modes
- 57 features (across 3 waves)

**After Wave 4**:
- **~2,474 lines** (+137%)
- **~35 state variables** (+94%)
- **5 view modes** (grid, list, compact, timeline, comparison)
- **77 features total** (+20)

---

## Architecture Recommendation

Given the massive scope, **consider refactoring** to:

### Option A: Component Split
```
app/clients/
  page.tsx (200 lines - orchestration)
  components/
    ClientCard.tsx
    ClientModal.tsx
    CommandPalette.tsx
    StatsD ashboard.tsx
    ComparisonModal.tsx
    FilterPresets.tsx
    ...
  hooks/
    useClientFilters.ts
    useClientAnalytics.ts
    useURLState.ts
  utils/
    clientHelpers.ts
    analytics.ts
```

### Option B: Feature Flags
```typescript
const features = {
  commandPalette: true,
  urlSync: true,
  virtualScroll: false, // enable later
  pwa: false,
  // ...
};
```

Enable incrementally based on user feedback.

---

## Conclusion

All 20 features are **technically feasible** but implementing them in a single file would create a **maintenance nightmare** (2,400+ lines).

**Recommended Approach**:
1. Implement critical features first (#18, #11, #20, #7, #8)
2. Refactor to component architecture
3. Add remaining features incrementally
4. Use feature flags for gradual rollout

This maintains code quality while delivering advanced functionality.
