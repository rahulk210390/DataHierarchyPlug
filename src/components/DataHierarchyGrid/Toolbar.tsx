import { useHierarchyStore } from '../../store/hierarchyStore';
import type { Column } from '@tanstack/react-table';
import type { FinancialRow } from '../../types';

const AGG_OPTIONS = ['sum', 'mean', 'min', 'max', 'count'] as const;

interface ToolbarProps {
  allColumns: Column<FinancialRow, unknown>[];
  measureColumnIds: string[];
  totalRows: number;
  visibleRows: number;
}

export function Toolbar({ allColumns, measureColumnIds, totalRows, visibleRows }: ToolbarProps) {
  const {
    globalFilter, setGlobalFilter,
    columnVisibility, setColumnVisibility,
    measureAggFns, setMeasureAggFn,
    expandAll, collapseAll,
  } = useHierarchyStore();

  return (
    <div className="toolbar">
      {/* Search */}
      <div className="toolbar__search">
        <span className="toolbar__search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search all columns…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="toolbar__search-input"
        />
        {globalFilter && (
          <button className="toolbar__clear" onClick={() => setGlobalFilter('')}>✕</button>
        )}
      </div>

      {/* Expand / Collapse */}
      <div className="toolbar__group">
        <button className="toolbar__btn" onClick={expandAll} title="Expand all groups">
          ⊞ Expand All
        </button>
        <button className="toolbar__btn" onClick={collapseAll} title="Collapse all groups">
          ⊟ Collapse All
        </button>
      </div>

      {/* Aggregation selectors for measure columns */}
      <div className="toolbar__group toolbar__agg">
        {measureColumnIds.map((colId) => {
          const col = allColumns.find((c) => c.id === colId);
          if (!col) return null;
          return (
            <div key={colId} className="toolbar__agg-item">
              <label className="toolbar__agg-label">{col.columnDef.header as string}:</label>
              <select
                className="toolbar__agg-select"
                value={measureAggFns[colId] ?? 'sum'}
                onChange={(e) => setMeasureAggFn(colId, e.target.value)}
              >
                {AGG_OPTIONS.map((fn) => (
                  <option key={fn} value={fn}>{fn}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Column visibility */}
      <div className="toolbar__group toolbar__cols">
        <details className="toolbar__dropdown">
          <summary className="toolbar__btn">⚙ Columns</summary>
          <div className="toolbar__dropdown-content">
            {allColumns
              .filter((col) => col.getCanHide())
              .map((col) => (
                <label key={col.id} className="toolbar__col-item">
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={(e) =>
                      setColumnVisibility({
                        ...columnVisibility,
                        [col.id]: e.target.checked,
                      })
                    }
                  />
                  <span>{col.columnDef.header as string}</span>
                </label>
              ))}
          </div>
        </details>
      </div>

      {/* Row count */}
      <div className="toolbar__row-count">
        {visibleRows.toLocaleString()} / {totalRows.toLocaleString()} rows
      </div>
    </div>
  );
}
