/**
 * v2 score bar — one value read against named bands.
 *
 * Built for the eco-driving rate, which the product states as a number plus a band
 * name (`"Bad"` … `"THE BEST"` — the one deliberate ALL-CAPS string in the system).
 * The bands are tinted to 26%, not solid: the bar is a scale, and the marker is the
 * datum. A solid banded bar reads as four filled segments and the eye loses the value.
 *
 * Not a progress bar and not a gauge. A radial gauge was rejected: it costs three
 * times the area for the same one number and cannot be read at row height.
 */
export interface DsScoreBand {
  /** Upper bound of the band, inclusive. Bands must be listed in ascending order. */
  to: number;
  label: string;
  tone: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
}
export interface DsScoreBarProps {
  /** Missing value renders the scale with an em dash and no marker. */
  value?: number | null;
  min?: number;
  max?: number;
  /** Defaults to the eco-driving bands: Bad / Normal / Good / THE BEST. */
  bands?: DsScoreBand[];
  /** Unit suffix — a separate token from the number, as everywhere else. */
  unit?: string;
  label?: React.ReactNode;
  /** The number and the band name above the bar. */
  showValue?: boolean;
  /** Numeric band boundaries under the bar. For a settings screen, not a row. */
  showScale?: boolean;
  height?: number;
  style?: React.CSSProperties;
}
export declare function DsScoreBar(props: DsScoreBarProps): JSX.Element;
