import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  numberAttribute,
  signal,
} from '@angular/core';

export type DsSpinnerTone = 'brand' | 'muted' | 'inverse';

/** Indeterminate progress only; operation lifecycle and aria-busy belong to the application. */
@Component({
  selector: 'ds-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
  host: {
    'data-ds-spinner': '',
    '[attr.data-ds-tone]': 'tone()',
    '[style.width.px]': 'diameter()',
    '[style.height.px]': 'diameter()',
    '[attr.role]': 'ready() ? "status" : null',
    '[attr.aria-label]': 'ready() ? label() : null',
  },
})
export class DsSpinnerComponent {
  readonly label = input.required<string>();
  readonly size = input(20, { transform: numberAttribute });
  readonly tone = input<DsSpinnerTone>('brand');
  readonly delay = input(0, { transform: numberAttribute });

  protected readonly diameter = computed(() => {
    const size = this.size();
    return Number.isFinite(size) && size > 0 ? size : 20;
  });
  protected readonly thickness = computed(() =>
    // Preserve the DS rule, keeping borders inside unusually small positive diameters.
    Math.min(this.diameter() / 2, Math.max(2, Math.round(this.diameter() / 9))),
  );
  protected readonly ready = signal(false);

  constructor() {
    effect((onCleanup) => {
      const requested = this.delay();
      const delay = Number.isFinite(requested) ? Math.max(0, requested) : 0;
      this.ready.set(delay === 0);
      if (delay === 0) return;
      // A changed delay restarts the wait; destruction cancels it without a late status announcement.
      const timer = setTimeout(() => this.ready.set(true), delay);
      onCleanup(() => clearTimeout(timer));
    });
  }
}
