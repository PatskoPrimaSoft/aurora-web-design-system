/**
 * v2 selection box — the shared look and state model behind every checkbox in the
 * system.
 *
 * Until September 2026 the same 18px box existed three times: in `DsCheckbox`
 * (form control with a label), in `DsSelectBox` (its own hit area, tri-state, for
 * the object tree) and as a private `Check` inside `DsTable` (select-all and
 * select-row). Three implementations of the same three states, tri-state written
 * twice, and the table's copy had drifted far enough to need its own keyboard fix.
 * They are now one primitive with two wrappers.
 *
 * **`state` is the tri-state** `'unchecked' | 'checked' | 'indeterminate'` — `indeterminate` is the
 * mixed/indeterminate value that an aggregate row (a user, a group, select-all)
 * needs. `DsCheckbox` keeps its boolean `checked` + `indeterminate` props for form
 * use and maps them onto this.
 *
 * `DsCheck` is decorative on purpose: it draws, it does not announce. Wrap it in a
 * `<label>` with a real input (`DsCheckbox`) or use `DsCheckButton`, which is a
 * real `<button role="checkbox">` — so Enter, Space and the `:focus-visible` ring
 * come from the platform rather than from a hand-written key handler.
 */
export interface DsCheckProps {
  state?: 'unchecked' | 'checked' | 'indeterminate';
  /** Circle with a centre dot. Use only unchecked or checked; indeterminate draws an empty circle. */
  radio?: boolean;
  disabled?: boolean;
  /** Draw the hover treatment — the parent owns the pointer events. */
  hover?: boolean;
  /** Box edge in px. 18 everywhere in the product so far. */
  size?: number;
  style?: React.CSSProperties;
}
export declare function DsCheck(props: DsCheckProps): JSX.Element;

export interface DsCheckButtonProps {
  state?: 'unchecked' | 'checked' | 'indeterminate';
  /** Required in practice: it is the accessible name of an icon-only control. */
  label?: string;
  disabled?: boolean;
  /** unchecked/indeterminate → checked; checked → unchecked. */
  onChange?: (next: 'checked' | 'unchecked') => void;
  /** Hit area edge. Default `var(--ds-control-h)`, i.e. density-sized. */
  hit?: number | string;
  size?: number;
}
export declare function DsCheckButton(props: DsCheckButtonProps): JSX.Element;
