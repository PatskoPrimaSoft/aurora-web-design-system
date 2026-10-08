/**
 * v2 sparkline — a trend small enough to live inside a row.
 *
 * It answers "is this rising or falling", nothing else: no axes, no labels, no
 * tooltip, no legend. Anything that needs a value belongs in a `DsChart`. Drawn at
 * 1.5px so it does not out-weigh the text in its own cell, and a gap in the data
 * stays a gap.
 *
 * Avoid adding a sparkline to a row that already carries several status indicators.
 */
export interface DsSparklineProps {
  /** Ordered values. `null` / `NaN` is missing data and breaks the line. */
  data?: Array<number | null>;
  width?: number;
  height?: number;
  /** `series` is the default `--ds-series-1`; the status tones are for a sparkline
   *  whose direction itself is good or bad (fuel drain, over-speed count). */
  tone?: 'brand' | 'series' | 'success' | 'warning' | 'danger' | 'muted';
  /** Explicit colour — use to match a line in the full chart above it. */
  color?: string;
  /** 14% fill under the line. Turn off in a dense table where many rows have one. */
  area?: boolean;
  /** Dot on the last known value. */
  dot?: boolean;
  /** Makes it `role="img"` with this label. Without it the sparkline is `aria-hidden`
   *  — correct only when the same number is already in the row as text. */
  label?: string;
  style?: React.CSSProperties;
}
export declare function DsSparkline(props: DsSparklineProps): JSX.Element;
