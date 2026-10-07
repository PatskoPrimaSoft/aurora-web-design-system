/**
 * v2 filter editor — replaces `CommonFilter` and covers all eight of its types.
 *
 * v1 put one of these inside every table header cell, which made the header two
 * rows tall, pushed the column labels up, and hid what was actually applied. v2
 * moves the editor into a popover opened from a labelled button, and the *result*
 * becomes a removable DsChip in DsChipGroup. The header goes back to doing one job:
 * sorting.
 *
 * Values are held as a draft until Apply, so a half-typed range never re-queries.
 */
export interface DsFilterOption {
  value: string;
  label: string;
  count?: number;
  /** `sort-by` only: direction labels, e.g. `asc: 'Oldest first'` / `desc: 'Newest first'`. */
  asc?: string;
  desc?: string;
  /** `sort-by` only: this option groups rather than orders — no direction pair. */
  group?: boolean;
}
export type DsFilterRange<T> = { from: T | null; to: T | null };
export type DsFilterValue =
  | string | number | null | undefined
  | DsFilterRange<number> | DsFilterRange<string>
  | string[]
  | { key: string; dir: 'asc' | 'desc' | null };
export interface DsFilterMenuProps {
  /** Column or attribute name. Also the popover's heading. */
  label?: string;
  /**
   * All eight v1 filter types. `sort-by` is the sort menu for surfaces with no
   * column headers (object panel, tree, card list): a radio list of fields, plus
   * one ascending / descending pair when the value is held as `{key, dir}`.
   */
  type?: 'string' | 'number' | 'number-range' | 'date' | 'date-range' | 'checkbox-list' | 'radio' | 'sort-by';
  /**
   * Applied value. Empty is only `null` / `undefined`: `0`, negative numbers and a
   * range starting at zero are real values and render as such.
   * - `string`: `string | null`
   * - `number`: `number | null` (a cleared field yields `null`, never `''`)
   * - `number-range`: `{ from: number | null, to: number | null }`
   * - `date`: `'YYYY-MM-DD' | null`; `date-range`: `{ from, to }` of those
   * - `checkbox-list`: `string[]`; `radio`: `string`; `sort-by`: `string` or `{ key, dir }`
   * Legacy string values (`'5'`, `{from: '', to: ''}`) are still read correctly.
   */
  value?: DsFilterValue;
  options?: Array<string | DsFilterOption>;
  /** Called with the draft value on Apply. */
  onApply?: (value: DsFilterValue) => void;
  onClear?: () => void;
  /** Replace the default button. DsFilterMenu attaches the click handler itself. */
  trigger?: React.ReactNode;
  width?: number;
}
export declare function DsFilterMenu(props: DsFilterMenuProps): JSX.Element;
