import { create } from 'zustand';
import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ExpandedState,
} from '@tanstack/react-table';

interface HierarchyStore {
  // State
  grouping: string[];
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  expanded: ExpandedState;
  measureAggFns: Record<string, string>; // columnId → aggFn name

  // Grouping actions
  setGrouping: (grouping: string[]) => void;
  addGroup: (columnId: string) => void;
  removeGroup: (columnId: string) => void;
  moveGroupUp: (index: number) => void;
  moveGroupDown: (index: number) => void;

  // Table state actions
  setSorting: (sorting: SortingState) => void;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  setGlobalFilter: (filter: string) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setExpanded: (expanded: ExpandedState) => void;
  setMeasureAggFn: (columnId: string, aggFn: string) => void;

  // Utility
  expandAll: () => void;
  collapseAll: () => void;
}

export const useHierarchyStore = create<HierarchyStore>((set, get) => ({
  grouping: ['company', 'securityName'],
  sorting: [],
  columnFilters: [],
  globalFilter: '',
  columnVisibility: {},
  expanded: true, // true = all expanded
  measureAggFns: {
    tradingVolume: 'sum',
    pnl: 'sum',
    price: 'mean',
    quantity: 'sum',
  },

  setGrouping: (grouping) => set({ grouping }),

  addGroup: (columnId) => {
    const { grouping } = get();
    if (!grouping.includes(columnId)) {
      set({ grouping: [...grouping, columnId] });
    }
  },

  removeGroup: (columnId) => {
    set({ grouping: get().grouping.filter((id) => id !== columnId) });
  },

  moveGroupUp: (index) => {
    if (index === 0) return;
    const g = [...get().grouping];
    [g[index - 1], g[index]] = [g[index], g[index - 1]];
    set({ grouping: g });
  },

  moveGroupDown: (index) => {
    const g = [...get().grouping];
    if (index === g.length - 1) return;
    [g[index], g[index + 1]] = [g[index + 1], g[index]];
    set({ grouping: g });
  },

  setSorting: (sorting) => set({ sorting }),
  setColumnFilters: (columnFilters) => set({ columnFilters }),
  setGlobalFilter: (globalFilter) => set({ globalFilter }),
  setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
  setExpanded: (expanded) => set({ expanded }),
  setMeasureAggFn: (columnId, aggFn) =>
    set({ measureAggFns: { ...get().measureAggFns, [columnId]: aggFn } }),

  expandAll: () => set({ expanded: true }),
  collapseAll: () => set({ expanded: {} }),
}));
