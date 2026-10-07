/**
 * v2 data table — the admin portal's whole reason to exist, and the loudest
 * "Material 2015" surface in the legacy product.
 *
 * What changed: the 2px `--color-primary` rules above the header and below the
 * footer are gone (they read as a 2014 Material data-table), `mat-elevation-z3`
 * is gone, and the table is now a bordered container with one tinted header band.
 * Row height, cell padding and the header eyebrow all come from density tokens, so
 * `[data-ds-density="compact"]` on the page turns a 44px row into 34px without a
 * prop. The active row keeps a 2px inset brand bar instead of a full-bleed fill,
 * so a selected row and a hovered row are distinguishable.
 *
 * `empty` and `footer` also accept children carrying `slot="empty"` / `slot="footer"`.
 */
export interface DsTableColumn {
  key: string;
  label: string;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  /**
   * Marks the column as sortable: the header label becomes a real button that
   * cycles ascending → descending (never back to "unsorted" — the default order
   * is itself a sort). Only set it on a column the data source can actually
   * order by: with server pagination a client-side sort would reorder the
   * current page only. See the "Sorting" foundation card.
   */
  sortable?: boolean;
  /** This column carries the row's open button (keyboard access to `onRowClick`). Default: the first column. */
  rowAction?: boolean;
  /** Field to order by when it differs from `key` — a composite or rendered cell. */
  sortBy?: string;
  /** Render this column in --ds-font-mono — speeds, coordinates, IMEI, timestamps. */
  mono?: boolean;
  strong?: boolean;
  muted?: boolean;
  /** Allow wrapping. Cells clip with an ellipsis by default. */
  wrap?: boolean;
  render?: (row: any) => React.ReactNode;
}
export interface DsTableProps {
  /** Composition slots, including footer. */
  children?: React.ReactNode;
  columns?: DsTableColumn[];
  rows?: any[];
  /** Field to read each row's identity from. Default `id`. */
  rowKey?: string;
  selectable?: boolean;
  selectedIds?: Array<string | number>;
  onToggleRow?: (id: string | number) => void;
  /**
   * Header checkbox: select / clear the VISIBLE rows. Receives the visible IDs and the next
   * state; merge them into the selection yourself. The header state is computed from the
   * intersection of visible and selected IDs, so rows selected on another page never turn it on.
   */
  onToggleVisible?: (visibleIds: Array<string | number>, next: 'checked' | 'unchecked') => void;
  /** @deprecated Use `onToggleVisible`. Still called with the next state when `onToggleVisible` is absent. */
  onToggleAll?: (next?: 'checked' | 'unchecked') => void;
  /** Total rows across all pages. With `onSelectAll`, a fully selected page offers "Select all N". */
  totalCount?: number;
  /** The whole result set is selected, not just a page. Owned by the consumer. */
  allSelected?: boolean;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  /** The one column currently ordering the table. Single-column sort only. */
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  /** Fires with the next direction. The screen re-queries and returns to page 1. */
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  /** Row under inspection — gets the inset brand bar. */
  activeId?: string | number;
  onRowClick?: (row: any) => void;
  /** Accessible name of a row for its checkbox ("Select «…»"). Default: the row-action column's value. */
  rowLabel?: (row: any) => string;
  stickyHeader?: boolean;
  empty?: React.ReactNode;
  /** Footer band — normally a DsPaginator or a selection summary. */
  footer?: React.ReactNode;
}
export declare function DsTable(props: DsTableProps): JSX.Element;
/** unchecked / indeterminate / checked for visible rows — the header checkbox rule, exported for a custom header. */
export declare function dsVisibleSelection(visibleIds: Array<string | number>, selectedIds: Array<string | number>, allSelected?: boolean): 'unchecked' | 'indeterminate' | 'checked';
