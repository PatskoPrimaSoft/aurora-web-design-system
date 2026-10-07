/**
 * v2 checkbox and radio (one component, `radio` flag).
 *
 * Deliberate correction of a legacy inconsistency: in the Angular product
 * selection controls are `accent`-coloured while the selected calendar date is
 * `primary`. v2 makes every selected state `--ds-brand` and reserves the accent
 * for attention (badges, the environment tag), which is one fewer rule to remember.
 */
export interface DsCheckboxProps {
  label?: React.ReactNode;
  /** Optional second line under the label — used by filter lists. */
  description?: string;
  checked?: boolean;
  /** Renders a dash. Used by a table's header select-all. Ignored when `radio`. */
  indeterminate?: boolean;
  radio?: boolean;
  disabled?: boolean;
  /** An indeterminate checkbox selects all on activation: e.target.checked is true. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  value?: string;
}
export declare function DsCheckbox(props: DsCheckboxProps): JSX.Element;
