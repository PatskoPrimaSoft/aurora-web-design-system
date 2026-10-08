/**
 * v2 object-state glyph — replaces `UnitStatusIcon`.
 *
 * Keeps the two v1 behaviours that carry information: the glyph is rotated by the
 * object's course when it is moving, and the colour is the status palette (so it is
 * identical in every brand). It drops v1's `opacity: 0.5` de-emphasis trick —
 * a half-transparent status icon fails contrast and reads as disabled, which offline
 * objects are not. v2 puts the glyph on a tinted disc instead, which separates it
 * from the row text without fading it.
 *
 * Always paired with a text label somewhere in the row; colour alone is never the
 * only carrier of state.
 */
export interface DsStateIconProps {
  state?: 'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata';
  /** Degrees, 0 = north. Only applied when `state="moving"`. */
  course?: number;
  /** Disc diameter in px. Default 28; use 20 inside a dense table cell. */
  size?: number;
  /** No disc — just the coloured glyph. For map overlays. */
  bare?: boolean;
  /** Overrides the aria-label / tooltip. Pass a localised string. */
  label?: string;
}
export declare function DsStateIcon(props: DsStateIconProps): JSX.Element;
/** The single fleet-state dictionary: glyph, status tone and label. Shared with DsListRow. */
export declare const dsFleetState: Record<'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata',
  { glyph: string; tone: 'success' | 'neutral' | 'danger' | 'info' | 'warning'; label: string }>;
