/**
 * v2 dialog.
 *
 * Three deliberate breaks from v1's `Dialog`:
 * 1. **actions are right-aligned.** v1 centred them with the cancelling action on the
 *    left and the confirming action on the right; centred footers read as a 2015
 *    Material alert and give the primary action no fixed home. v2 right-aligns,
 *    cancel then confirm.
 * 2. **height is content-driven**, capped at `min(90vh,760px)`, instead of a fixed
 *    `65vh` — a two-field dialog no longer opens as a tall empty box.
 * 3. `tone` draws a status glyph in the header, so a destructive confirmation is
 *    recognisable before the copy is read.
 *
 * Confirmation copy keeps the product's voice: quote the object in typographic
 * quotes, state the consequence as a fact — `The driver "X" will be removed from
 * the object "Y"` — and never ask for bravery.
 *
 * `actions` also accepts a child carrying `slot="actions"`; unslotted children are
 * the dialog body.
 */
export interface DsDialogProps {
  /** Accessible name when title is absent. */
  'aria-label'?: string;
  open?: boolean;
  title?: React.ReactNode;
  /** One line under the title. Full sentences here take a terminal period. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Buttons, in reading order: cancel first, confirm last. */
  actions?: React.ReactNode;
  /** Omit to make the dialog non-dismissable (no close button, no Escape, no scrim click). */
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Status glyph in the header — use `danger` for archive/remove confirmations. */
  tone?: 'info' | 'warning' | 'danger' | 'success';
  scroll?: boolean;
  /** false keeps the close button but ignores Escape and scrim clicks. */
  dismissable?: boolean;
}
export declare function DsDialog(props: DsDialogProps): React.JSX.Element;
/** Регистрирует слой, обрабатывающий Escape только когда он верхний. */
export declare function useDsLayer(active: boolean, onEscape?: ((event: KeyboardEvent) => void) | null | false): void;
