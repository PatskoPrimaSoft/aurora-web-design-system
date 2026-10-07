/**
 * One collapsible level of the object tree. The panel nests it: user (level 0,
 * avatar) → group or label (level 1, `sell` icon) → DsObjectRow leaves.
 *
 * Why a separate component from DsObjectRow: the header carries aggregate state —
 * how many of its children are selected (`selected / total`), a tri-state
 * select-all, and an aggregated unread count — and it must stay visually lighter
 * than its leaves so the eye reads the tree structure before the rows. Group
 * headers are `--ds-fg-muted`; only user headers are full ink.
 *
 * `level` sets the 20px indent step. Groups with nothing to select pass
 * `selectDisabled` rather than hiding the box, so trailing controls stay in one
 * column down the whole panel.
 */
export interface DsTreeRowProps {
  title: React.ReactNode;
  /** Small trailing note after the title, e.g. a tag name or "no objects". */
  meta?: React.ReactNode;
  /** Leading glyph for a group/label level (ignored when `avatar` is set). */
  icon?: string;
  avatarSrc?: string;
  /** Render the initials disc (user level) instead of a glyph. */
  avatar?: boolean;
  /** Indent step: 0 for users, 1 for groups. */
  level?: number;
  expanded?: boolean;
  onToggle?: (next: boolean) => void;
  /** Aggregate counter — renders as `3 / 12` when `total` is given. */
  selected?: number;
  total?: number;
  select?: 'checked' | 'indeterminate' | 'unchecked';
  onSelectChange?: (next: 'checked' | 'unchecked') => void;
  selectDisabled?: boolean;
  unread?: number;
  onClick?: (e: React.SyntheticEvent) => void;
  /** Chevron button names when both `onClick` and `onToggle` are set. */
  expandLabel?: string;
  collapseLabel?: string;
}
/**
 * Anatomy — siblings, never nested: with `onClick`, a chevron button (aria-expanded) plus an
 * open button; with `onToggle` only, one button that expands (aria-expanded). The group
 * checkbox is separate: Space on it selects and never collapses.
 */
export declare function DsTreeRow(props: DsTreeRowProps): JSX.Element;
