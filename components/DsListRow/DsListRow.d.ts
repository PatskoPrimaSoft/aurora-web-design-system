/**
 * v2 object row — replaces `UnitListRow`.
 *
 * v1's row was a fixed 56px with secondary icons parked at `opacity: 0.5` and
 * snapped to 1 on hover (`.opacity50` → `.clear-opacity`). v2 keeps the reveal for
 * *actions* only — state and values are always at full contrast — and takes its
 * height from `--ds-row-h-lg`, so a compact object panel is 44px instead of 56px
 * and shows three more objects per screen.
 *
 * The subtitle is set in the mono face because it is almost always a plate plus a
 * timestamp, which must not jitter as the clock ticks.
 *
 * `actions` and `badge` also accept children carrying `slot="actions"` / `slot="badge"`.
 */
export interface DsListRowProps {
  /** Slot children for actions and badge. */
  children?: React.ReactNode;
  title?: React.ReactNode;
  /** Plate, IMEI, last-message time. Rendered in --ds-font-mono. */
  subtitle?: React.ReactNode;
  /** Draws a DsStateIcon instead of `icon`. */
  state?: 'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata';
  /** Course in degrees, for `state="moving"`. */
  course?: number;
  /** Trailing primary value — speed, fuel, count. Mono. */
  value?: React.ReactNode;
  /** Second trailing line under `value`. */
  valueMeta?: React.ReactNode;
  /** Material Symbols ligature, used when there is no `state`. */
  icon?: string;
  /** Row under inspection — tinted ground plus a 2px inset brand bar. */
  active?: boolean;
  /** Multi-select membership — tinted ground, no bar. */
  selected?: boolean;
  onClick?: () => void;
  /** Icon buttons; faded to 55% until the row is hovered or active. */
  actions?: React.ReactNode;
  /** A DsLozenge shown after the title. */
  badge?: React.ReactNode;
  /** `div` when the row already contains its own buttons. Default `button`. */
  as?: 'button' | 'div';
}
/** The main area is a button when `onClick` is set; `actions` are its siblings, never its children. */
export declare function DsListRow(props: DsListRowProps): JSX.Element;
