/**
 * The monitoring object-panel row, in the shape the panel actually needs:
 * photo disc (with online dot and unread count), a two-glyph status column
 * (movement, rotated to the course + satellite signal), two-line identity, and a
 * trailing selection box.
 *
 * Use `DsListRow` for generic lists (a report picker, a driver list, a geofence
 * list) — it is the neutral row. Use `DsObjectRow` inside the object tree, where
 * an operator scans hundreds of rows for state and only then for name.
 *
 * Rules carried over from the v1 panel review:
 * - the disc colour is data freshness (green / amber / red / grey) — that is the
 *   fastest signal in the panel, so it owns the largest coloured area in the row
 *   and keeps working when a photo is set (the photo sits inside a 2px ring of it);
 * - state lives in the glyph column, never in the row background (the background
 *   is selection/hover only);
 * - unread counts are the only accent-coloured thing in the row;
 * - the details line is prose, not mono — it holds speed, driver and last message
 *   already formatted by the caller.
 */
export interface DsObjectRowProps {
  name: React.ReactNode;
  /** One line under the name — speed · driver · last message, pre-formatted. */
  details?: React.ReactNode;
  state?: 'moving' | 'parked' | 'offline' | 'invalid' | 'alarm' | 'nodata';
  /** Localised state label for the screen reader; defaults to the shared dictionary (`dsFleetState`). */
  stateLabel?: string;
  /** Degrees; rotates the movement glyph when `state` is `moving`. */
  course?: number | null;
  signal?: 'good' | 'weak' | 'none';
  /** Service/contract warning shown before the name, e.g. `{icon:'block',tone:'danger',label:'Service blocked'}`. */
  service?: { icon: string; tone?: 'warning' | 'danger' | 'info' | 'neutral'; label?: string } | null;
  /** Object photo. Falls back to initials, and sits inside a 2px freshness ring. */
  avatarSrc?: string;
  online?: boolean;
  /** How old the last message is — this is the disc colour: live (green), recent (amber), late (red), none (grey). */
  freshness?: 'live' | 'recent' | 'late' | 'none';
  /** Tooltip for the disc; pass the real age ("Last message 12 min ago"). Defaults to a generic phrase. */
  freshnessLabel?: string;
  /** Unread messages. 0 hides the badge; >99 renders `99+`. */
  unread?: number;
  unreadPlacement?: 'avatar' | 'trailing';
  /** Omit to render a non-selectable row. */
  select?: 'checked' | 'unchecked';
  onSelectChange?: (next: 'checked' | 'unchecked') => void;
  /** The row the map is centred on. */
  active?: boolean;
  onClick?: (e: React.SyntheticEvent) => void;
  /** Extra left inset in px — the tree passes its level indent. */
  indent?: number;
}
/**
 * Anatomy: the main area (a button when `onClick` is set) and the selection box are siblings —
 * Space on the box selects and never opens the object.
 * Accessibility: the row's name is `name`; its description (aria-describedby) reads
 * state, freshness, signal, online, service, details and unread in that order —
 * the glyphs and colours themselves are aria-hidden.
 */
export declare function DsObjectRow(props: DsObjectRowProps): JSX.Element;
/** The description text DsObjectRow announces — exported so a list can reuse it. */
export declare function dsObjectRowDescription(props: Pick<DsObjectRowProps,
  'state' | 'stateLabel' | 'freshness' | 'freshnessLabel' | 'signal' | 'service' | 'details' | 'unread' | 'online'>): string;
