/**
 * v2 chart — the system's cartesian plot.
 *
 * The product draws its real graphs with ECharts; this component is the *design*
 * of that plot, and the one place the chart tokens are exercised. It renders the
 * same anatomy the Angular sensor chart has — left value axis, dotted split
 * lines, category axis, a vertical toolbox rail on the right, an inside+slider
 * dataZoom, an axis tooltip with a crosshair, min/max markers, mark areas — so a
 * mock and the shipped screen agree. For production, map these tokens onto an
 * `EChartsOption` with `charts/echartsTheme.js`.
 *
 * Deviations from the ECharts defaults, all deliberate:
 * - the title is left-aligned like every other v2 header, not centred;
 * - series colours come from `--ds-series-1…8`, never from the library palette,
 *   and are theme-independent: a sensor keeps its colour in every brand;
 * - a gap in telemetry stays a gap. `connectNulls` is off by default, because a
 *   straight line across a two-hour silence is a fabricated reading;
 * - a filled series reaches its own zero. `area` and `bar` extend the value axis to
 *   0 automatically; an area whose baseline is the lowest reading claims "empty" at
 *   that reading, which is the same class of error as connecting across a gap. Only
 *   a line, which has no baseline, may be truncated — pin the domain with
 *   `yMin` / `yMax` when the data itself does not establish it;
 * - no gradients, no drop shadows on series, no 3D, no pie.
 *
 * Reusable components own no outer margin — put it in a `DsPanel`.
 */
export interface DsChartSeries {
  /** Legend label and tooltip name. Must be unique — it is the toggle key. */
  name: string;
  /** `number[]` indexed against `categories`, or `[x, y][]`. `null` = no data, drawn as a gap. */
  data: Array<number | null | [number | string, number | null]>;
  /** Overrides the assigned `--ds-series-N`. Use for a series whose colour carries meaning. */
  color?: string;
  /** Unit suffix shown in the legend and tooltip — a separate token from the number. */
  unit?: string;
  /** Per-series override of the chart `type`, for a bar + line combination. */
  type?: 'line' | 'area' | 'bar';
  /** 1.5px stroke instead of 2px — for a reference or previous-period series. */
  thin?: boolean;
}
export interface DsChartToolboxItem {
  /** Material Symbols name. Stay inside the product's icon vocabulary. */
  icon: string;
  /** Required — becomes the aria-label and the tooltip. */
  label: string;
  onClick?: () => void;
  /** `'reset'` wires the built-in zoom reset. */
  action?: 'reset';
}
export interface DsChartProps {
  title?: React.ReactNode;
  /** Period and sample count, the way the product's chart subtitle reads. */
  subtitle?: React.ReactNode;
  series?: DsChartSeries[];
  /** Category axis labels — pre-formatted times for a time series. */
  categories?: Array<string | number>;
  type?: 'line' | 'area' | 'bar';
  /** Plot height in px. Width is measured from the parent. */
  height?: number;
  /** Default unit for the tooltip when a series does not set its own. */
  yUnit?: string;
  yTicks?: number;
  /** Pins the bottom of the value axis. `area` and `bar` already include 0; use this
   *  for a line whose scale is fixed by the sensor, not by the day's readings
   *  (a tank capacity, a 0–100 percentage). */
  yMin?: number;
  /** Pins the top of the value axis — for a fixed capacity or a rating maximum. */
  yMax?: number;
  /** Swatch row; toggling hides a series. Hidden unless there are 2+ series. */
  legend?: boolean;
  /** `true` for the product's six tools, or your own list. Reserves 38px on the right. */
  toolbox?: boolean | DsChartToolboxItem[];
  /** Draggable brush under the plot — the equivalent of the ECharts slider dataZoom. */
  zoom?: boolean;
  /** Labelled dots on each series' extremes, as `markPoint` does in the product. */
  showMinMax?: boolean;
  /** Horizontal reference lines: a speed limit, a norm consumption, a tank capacity. */
  thresholds?: Array<{value: number; label?: string; tone?: 'danger' | 'warning' | 'success' | 'info' | 'neutral'}>;
  /** Shaded index ranges — the `markArea` the sensor chart uses for a customised band. */
  markAreas?: Array<{from: number; to: number; color?: string}>;
  /** Step interpolation. Correct for a discrete state (ignition, digital sensor). */
  stepped?: boolean;
  /** Skeleton bars, never a spinner: a spinner says nothing about the shape of the data. */
  loading?: boolean;
  empty?: boolean;
  emptyIcon?: string;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
  /** Header controls — period picker, generate button. */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function DsChart(props: DsChartProps): JSX.Element;

export interface DsChartLegendProps {
  series?: DsChartSeries[];
  /** Series names currently hidden. */
  hidden?: string[];
  onToggle?: (name: string) => void;
  style?: React.CSSProperties;
}
/** Standalone legend, for a legend that must live outside the plot (a panel footer, a map overlay). */
export declare function DsChartLegend(props: DsChartLegendProps): JSX.Element;

export interface DsChartTooltipProps {
  label?: React.ReactNode;
  rows?: Array<{name: string; value: React.ReactNode; color: string; unit?: string}>;
  style?: React.CSSProperties;
}
/** The axis readout — inverse ground, mono values. Exported so a map hover can reuse it. */
export declare function DsChartTooltip(props: DsChartTooltipProps): JSX.Element;
