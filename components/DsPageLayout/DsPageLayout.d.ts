/**
 * v2 app shell — replaces `TwoColumnPageLayout`.
 *
 * One region layout for both portals: the monitoring screen is
 * `left` (object panel) + `children` (map and object card); an admin screen is
 * `children` (filter bar and table) + `right` (detail panel). `left` defaults to
 * `--ds-panel-w`, which is 340px cozy and 300px compact — v1's side panel was a
 * hard-coded 350px, and the header's tab rail was positioned on that same axis.
 *
 * Every region prop also accepts a child carrying `slot="header" | "pageHeader" |
 * "left" | "right" | "footer"`, so the shell can be composed from static markup
 * (that is how the reference screens keep their regions editable). A prop wins when
 * both are given; children without a slot are the main region.
 *
 * The shell owns the page gutters; panels inside it must not set their own outer
 * margins (the v1 rule that a reusable component never sets external margins still
 * holds).
 */
export interface DsPageLayoutProps {
  /** A DsAppHeader. */
  header?: React.ReactNode;
  /** Application page heading markup, below the app header. */
  pageHeader?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
  /** Default `var(--ds-panel-w)`. */
  leftWidth?: number | string;
  /** Default 360. */
  rightWidth?: number | string;
  /** false makes the regions flush — for a full-bleed map screen. */
  gap?: boolean;
  footer?: React.ReactNode;
}
export declare function DsPageLayout(props: DsPageLayoutProps): JSX.Element;
