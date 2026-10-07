export type DsCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/** Checkbox and radio with one controlled selection model. */
export interface DsCheckboxProps {
  /** Radio uses unchecked or checked; indeterminate is treated as unchecked. */
  state?: DsCheckboxState;
  /** unchecked/indeterminate selects all; checked deselects. Radio never deselects itself. */
  onChange?: (nextState: 'unchecked' | 'checked') => void;
  label?: React.ReactNode;
  /** Accessible name; required when no visible label is provided. */
  ariaLabel?: string;
  /** Second line, linked to the input as its accessible description. */
  description?: string;
  radio?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  /** Minimum hit area edge. @default var(--ds-control-h) */
  hit?: number | string;
}
export declare function DsCheckbox(props: DsCheckboxProps): JSX.Element;
