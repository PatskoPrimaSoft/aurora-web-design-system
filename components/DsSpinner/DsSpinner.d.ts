/**
 * v2 spinner and skeleton.
 *
 * v1 had no spinner component — screens used `mat-spinner` directly at Ø25px inside
 * buttons and Ø20px in the toolbar, which is why loaders were re-invented per screen.
 * v2 ships one, and adds a skeleton because a spinner inside a data table is worse
 * than a greyed row: it moves, and it tells you nothing about shape.
 *
 * Buttons do not need this — `DsButton loading` and `DsIconButton loading` draw
 * their own inline spinner.
 */
export interface DsSpinnerProps {
  /** px diameter. 16 in a row, 20 default, 32 for a panel, 48 for a page. */
  size?: number;
  /** px. Derived from size when omitted. */
  thickness?: number;
  /** `inverse` uses currentColor — for brand or status grounds. */
  tone?: 'brand' | 'muted' | 'inverse';
  /** aria-label. Default "Loading". */
  label?: string;
}
export declare function DsSpinner(props: DsSpinnerProps): JSX.Element;
export interface DsSkeletonProps {
  /** Пульсация блока; отключается при prefers-reduced-motion независимо от этого параметра. */
  animated?: boolean;
  /** Ширина блока: число в px или CSS-значение, например 70%. */
  width?: number | string;
  /** Высота блока: число в px или CSS-значение. */
  height?: number | string;
  /** Скругление блока; 50% для круга при равных ширине и высоте. */
  radius?: string;
}
export declare function DsSkeleton(props: DsSkeletonProps): JSX.Element;
