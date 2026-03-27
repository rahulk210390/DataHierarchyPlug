# DataHierarchyPlug
Enables hierarchical grouping of data in a grid. The aim to enable drag-and-drop reordering of groupings; without compromising performance.


## Commands
```bash
npm run dev       # dev server (localhost:3000)
npm run build     # tsc + vite build
npx tsc --noEmit  # type-check only

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

### Mock data
Deterministic: `seededRandom(seed) = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)`.
50,000 rows; 10 companies, 15 securities, 12 traders.