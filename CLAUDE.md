# HierarchyFlex — Claude Code Instructions

## Project Overview
**HierarchyFlex** — a Tableau Extension and Power BI Custom Visual for runtime row hierarchy reordering in enterprise BI dashboards. Targeting financial services.

**Legal entity:** Rahul Kunal (solo founder)
**Competitor benchmark:** Inforiver Analytics+ at $3/user/month ($300/mo for 100 users)
**Pro pricing:** $15/user/month

## Tech Stack
| Layer | Library | Notes |
|-------|---------|-------|
| Table engine | `@tanstack/react-table` v8 | Headless; grouping + aggregation + sorting + filtering |
| Virtualization | `@tanstack/react-virtual` v3 | DOM virtualization; ~20 nodes rendered regardless of row count |
| Drag-and-drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | Hierarchy reorder panel |
| State | `zustand` v5 | Grouping, sorting, filters, column visibility, expanded, measureAggFns |
| Build | Vite + React 18 + TypeScript (strict) | `npm run dev` → localhost:3000 |

**No AG Grid** — no OEM redistribution license available. Entire stack is MIT-licensed open source.

## Commands
```bash
npm run dev       # dev server (localhost:3000)
npm run build     # tsc + vite build
npx tsc --noEmit  # type-check only
```

## Source Layout
```
src/
  types/index.ts                          # FinancialRow interface
  data/mockFinancialData.ts               # 50,000 deterministic rows (seededRandom)
  store/hierarchyStore.ts                 # Zustand store
  components/DataHierarchyGrid/
    index.tsx                             # Main grid (TanStack Table + Virtual)
    GroupByPanel.tsx                      # dnd-kit drag-to-reorder panel
    Toolbar.tsx                           # Search, expand/collapse, agg selectors, col visibility
  styles/grid.css                         # Dark theme via CSS variables
  App.tsx
  main.tsx
```

## Key Patterns

### Column defs
Use `any[]` (not `ColumnDef<FinancialRow, unknown>[]`) to avoid TanStack generic variance issues with the `footer` property. TypeScript correctly infers types at the `useReactTable` call site.

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: any[] = [...];
```

### OnChangeFn handlers
TanStack Table's `on*Change` accepts `Updater<T>` (value or function). Always wrap with `functionalUpdate`:

```ts
import { functionalUpdate } from '@tanstack/react-table';

onSortingChange: (u) => setSorting(functionalUpdate(u, sorting)),
onColumnFiltersChange: (u) => setColumnFilters(functionalUpdate(u, columnFilters)),
onColumnVisibilityChange: (u) => setColumnVisibility(functionalUpdate(u, columnVisibility)),
onExpandedChange: (u) => setExpanded(functionalUpdate(u, expanded)),
```

### TanStack Table pipeline order
```
getCoreRowModel → getFilteredRowModel → getSortedRowModel → getGroupedRowModel → getExpandedRowModel
```
`getExpandedRowModel()` produces a flat array of visible rows suitable for TanStack Virtual — no custom flattener needed.

### Virtualized scroll
```ts
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 36,
  overscan: 8,
});
```

### dnd-kit GroupByPanel pattern
`DndContext` → `SortableContext` → `useSortable` per item → `DragOverlay` ghost.
`onDragEnd` calls `setGrouping(arrayMove(grouping, oldIndex, newIndex))`.

### Mock data
Deterministic: `seededRandom(seed) = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)`.
50,000 rows; 10 companies, 15 securities, 12 traders.

## Telemetry Policy (locked)
**Allowed:** event names, render counts, load times, UI interaction metadata.
**Forbidden:** row-level data, financial values, column names, API keys, any user dataset content.
Telemetry tools (Mixpanel/PostHog) must be configured metadata-only before SOC 2 audit.

## Planned Adapters (not yet built)
- `src/adapters/tableauAdapter.ts` — Tableau Extensions API v2
- `src/adapters/visual.ts` — Power BI Visuals SDK (pbiviz); uses `fetchMoreData()` loop to bypass 30K row limit

## Roadmap (post-current sprint)
- Conditional formatting (heatmaps, color bands)
- Drill-through (expandable sub-tables)
- Excel export via SheetJS with outline grouping
- Saved views (localStorage → server-side for Enterprise)
- Licensing feature gates (Free / Pro / Enterprise)
- Telemetry integration (metadata-only payload)
- Tableau Extension adapter
- Power BI Custom Visual adapter
