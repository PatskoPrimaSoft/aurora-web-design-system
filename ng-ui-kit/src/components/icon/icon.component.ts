import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';

export type DsIconSize = 'xs' | 'sm' | 'md' | 'lg';

/** Шрифтовая иконка Aurora. Цвет наследуется, размер определяется ролью и плотностью. */
@Component({
  selector: 'ds-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './icon.component.css',
  template: `<span class="material-symbols-outlined" aria-hidden="true">{{name()}}</span>`,
  host: {
    '[attr.data-ds-icon-size]': 'size()',
    '[attr.data-ds-icon-nudge]': 'name() === "navigation" ? "navigation" : null',
    '[attr.role]': 'accessibleLabel() ? "img" : null',
    '[attr.aria-label]': 'accessibleLabel()',
    '[attr.aria-hidden]': 'accessibleLabel() ? null : "true"',
    '[style.transform]': '"rotate(" + rotate() + "deg)"',
  },
})
export class DsIconComponent {
  readonly name = input.required<string>();
  readonly size = input<DsIconSize>('md');
  readonly label = input<string>();
  readonly rotate = input<number>(0);

  protected readonly accessibleLabel = computed(() => this.label()?.trim() || null);
}
