/**
 * v2 icon-only button. The legacy system shipped twelve semantic icon-button
 * wrappers plus six colour classes, two of which referenced undefined CSS
 * variables; this is one component with a tone and a required label.
 *
 * Rotation is still meaningful in this product: `navigation` rotated by course,
 * `straighten` at -45deg to read as a measuring line.
 */
export interface DsIconButtonProps {
  /** Material Symbols Outlined ligature name. */
  icon: string;
  /** Required. Becomes aria-label and title — icon-only controls must be named. */
  label: string;
  /** `onHeader` is for the app header chrome — neutral by default, so the tone is named for the surface, not for brand; inks from --ds-header-icon-fg (near-full-opacity, not the muted label value). */
  tone?: 'ghost' | 'secondary' | 'primary' | 'danger' | 'onHeader';
  size?: 'sm' | 'md' | 'lg';
  /**
   * Persistent toggled state — brand tint ground, brand ink, `aria-pressed`. Pass it (true or
   * false) only for a real toggle, e.g. an engaged filter; leave it out for an ordinary button.
   * Not the momentary press: that is drawn while the gesture lasts (mouse, touch, Space, Enter).
   */
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Accent pip in the corner: this control has something applied (an active filter, a narrowed user list). Use a separate numeric counter for counts. */
  dot?: boolean;
  /** Degrees. Carries meaning (heading, measuring line), never decoration. */
  rotate?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
export declare function DsIconButton(props: DsIconButtonProps): JSX.Element;
