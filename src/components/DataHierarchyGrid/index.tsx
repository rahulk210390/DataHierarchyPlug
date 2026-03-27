import { useRef, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  functionalUpdate,
  type Row,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useHierarchyStore } from '../../store/hierarchyStore';
import { GroupByPanel } from './GroupByPanel';
import { Toolbar } from './Toolbar';
import type { FinancialRow, DimensionDef } from '../../types';

const fmt = {
  number: (v: number) => v.toLocaleString(),
  currency: (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v),
  pnl: (v: number) => {
    const s = fmt.currency(v);
    return v >= 0 ? `+${s}` : s;
  },
  price: (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v),
};

const DIMENSIONS: DimensionDef[] = [
  { id: 'company',      label: 'Company' },
  { id: 'assetClass',   label: 'Asset Class' },
  { id: 'region',       label: 'Region' },
  { id: 'book',         label: 'Book' },
  { id: 'securityName', label: 'Security' },
  { id: 'traderName',   label: 'Trader' },
];

const MEASURE_COLUMN_IDS = ['tradingVolume', 'pnl', 'quantity', 'price'];

const columnHelper = createColumnHelper<FinancialRow>();

interface DataHierarchyGridProps {
  data: FinancialRow[];
}

export function DataHierarchyGrid({ data }: DataHierarchyGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    grouping, sorting, columnFilters, globalFilter,
    columnVisibility, expanded,
    measureAggFns,
    setSorting, setColumnFilters, setGlobalFilter,
    setColumnVisibility, setExpanded,
  } = useHierarchyStore();

  // Build columns dynamically — aggFn per measure driven by store
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<any[]>(
    () => [
      columnHelper.accessor('company', {
        header: 'Company',
        aggregationFn: 'count',
        aggregatedCell: ({ getValue }) => `${getValue<number>()} firms`,
        enableGrouping: true,
      }),
      columnHelper.accessor('securityName', {
        header: 'Security',
        aggregationFn: 'count',
        aggregatedCell: ({ getValue }) => `${getValue<number>()} securities`,
        enableGrouping: true,
      }),
      columnHelper.accessor('traderName', {
        header: 'Trader',
        aggregationFn: 'count',
        aggregatedCell: ({ getValue }) => `${getValue<number>()} traders`,
        enableGrouping: true,
      }),
      columnHelper.accessor('cusip', {
        header: 'CUSIP',
        enableGrouping: false,
      }),
      columnHelper.accessor('isin', {
        header: 'ISIN',
        enableGrouping: false,
      }),
      columnHelper.accessor('assetClass', {
        header: 'Asset Class',
        enableGrouping: true,
      }),
      columnHelper.accessor('region', {
        header: 'Region',
        enableGrouping: true,
      }),
      columnHelper.accessor('book', {
        header: 'Book',
        enableGrouping: true,
      }),
      columnHelper.accessor('tradingVolume', {
        header: 'Trading Volume',
        aggregationFn: (measureAggFns['tradingVolume'] ?? 'sum') as 'sum',
        cell: ({ getValue }) => fmt.currency(getValue<number>()),
        aggregatedCell: ({ getValue }) => fmt.currency(getValue<number>()),
        enableGrouping: false,
        meta: { isMeasure: true, align: 'right' },
      }),
      columnHelper.accessor('pnl', {
        header: 'P&L',
        aggregationFn: (measureAggFns['pnl'] ?? 'sum') as 'sum',
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return <span className={v >= 0 ? 'cell--positive' : 'cell--negative'}>{fmt.pnl(v)}</span>;
        },
        aggregatedCell: ({ getValue }) => {
          const v = getValue<number>();
          return <span className={v >= 0 ? 'cell--positive' : 'cell--negative'}>{fmt.pnl(v)}</span>;
        },
        enableGrouping: false,
        meta: { isMeasure: true, align: 'right' },
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        aggregationFn: (measureAggFns['price'] ?? 'mean') as 'mean',
        cell: ({ getValue }) => fmt.price(getValue<number>()),
        aggregatedCell: ({ getValue }) => `avg ${fmt.price(getValue<number>())}`,
        enableGrouping: false,
        meta: { isMeasure: true, align: 'right' },
      }),
      columnHelper.accessor('quantity', {
        header: 'Quantity',
        aggregationFn: (measureAggFns['quantity'] ?? 'sum') as 'sum',
        cell: ({ getValue }) => fmt.number(getValue<number>()),
        aggregatedCell: ({ getValue }) => fmt.number(getValue<number>()),
        enableGrouping: false,
        meta: { isMeasure: true, align: 'right' },
      }),
    ],
    [measureAggFns],
  );

  const table = useReactTable({
    data,
    columns,
    state: { grouping, sorting, columnFilters, globalFilter, columnVisibility, expanded },
    onSortingChange: (u) => setSorting(functionalUpdate(u, sorting)),
    onColumnFiltersChange: (u) => setColumnFilters(functionalUpdate(u, columnFilters)),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: (u) => setColumnVisibility(functionalUpdate(u, columnVisibility)),
    onExpandedChange: (u) => setExpanded(functionalUpdate(u, expanded)),
    // Row models — order matters
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    // Don't let TanStack auto-manage grouping; we control it via store
    manualGrouping: false,
    groupedColumnMode: false,
    autoResetExpanded: false,
  });

  // Flat list of visible rows for virtualization
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 36,
    overscan: 8,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalVirtualSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalVirtualSize - (virtualItems[virtualItems.length - 1]?.end ?? 0)
      : 0;

  const headerGroups = table.getHeaderGroups();
  const allColumns = table.getAllColumns();
  const leafCount = table.getFilteredRowModel().rows.filter(r => !r.subRows?.length).length;

  return (
    <div className="dhg">
      {/* Left panel: Group By */}
      <div className="dhg__sidebar">
        <GroupByPanel dimensions={DIMENSIONS} />
      </div>

      {/* Right: toolbar + grid */}
      <div className="dhg__main">
        <Toolbar
          allColumns={allColumns}
          measureColumnIds={MEASURE_COLUMN_IDS}
          totalRows={data.length}
          visibleRows={leafCount}
        />

        {/* Column filter row (inline, under each header) */}
        <div className="dhg__grid-wrapper" ref={scrollRef}>
          <table className="dhg__table">
            <thead className="dhg__thead">
              {headerGroups.map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const meta = header.column.columnDef.meta as { align?: string } | undefined;
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="dhg__th"
                        style={{ textAlign: (meta?.align as 'left' | 'right') ?? 'left' }}
                      >
                        {header.isPlaceholder ? null : (
                          <>
                            {/* Sort toggle */}
                            <div
                              className={`dhg__th-label ${header.column.getCanSort() ? 'dhg__th-label--sortable' : ''}`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() === 'asc' && ' ▲'}
                              {header.column.getIsSorted() === 'desc' && ' ▼'}
                              {header.column.getCanSort() && !header.column.getIsSorted() && (
                                <span className="dhg__sort-placeholder"> ⇅</span>
                              )}
                            </div>
                            {/* Column filter */}
                            {header.column.getCanFilter() && (
                              <input
                                className="dhg__col-filter"
                                placeholder="Filter…"
                                value={(header.column.getFilterValue() as string) ?? ''}
                                onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
                              />
                            )}
                          </>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="dhg__tbody">
              {paddingTop > 0 && (
                <tr><td style={{ height: paddingTop }} colSpan={allColumns.length} /></tr>
              )}

              {virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<FinancialRow>;
                const isGroupRow = row.getIsGrouped();
                return (
                  <tr
                    key={row.id}
                    className={`dhg__tr ${isGroupRow ? 'dhg__tr--group' : 'dhg__tr--leaf'}`}
                    data-depth={row.depth}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as { align?: string } | undefined;
                      return (
                        <td
                          key={cell.id}
                          className="dhg__td"
                          style={{ textAlign: (meta?.align as 'left' | 'right') ?? 'left' }}
                        >
                          {cell.getIsGrouped() ? (
                            // Group header cell — show expand/collapse + value + count
                            <button
                              className="dhg__group-toggle"
                              onClick={row.getToggleExpandedHandler()}
                              style={{ paddingLeft: row.depth * 20 }}
                            >
                              <span className="dhg__expand-icon">
                                {row.getIsExpanded() ? '▾' : '▸'}
                              </span>
                              <span className="dhg__group-value">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </span>
                              <span className="dhg__group-count">
                                ({row.subRows.length})
                              </span>
                            </button>
                          ) : cell.getIsAggregated() ? (
                            // Aggregated value cell
                            <span className="dhg__agg-value">
                              {flexRender(
                                cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </span>
                          ) : cell.getIsPlaceholder() ? null : (
                            // Regular leaf cell
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {paddingBottom > 0 && (
                <tr><td style={{ height: paddingBottom }} colSpan={allColumns.length} /></tr>
              )}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="dhg__empty">No results match the current filter.</div>
        )}
      </div>
    </div>
  );
}
