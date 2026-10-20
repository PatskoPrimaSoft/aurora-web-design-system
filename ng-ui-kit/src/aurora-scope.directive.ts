import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { AURORA_ATTR, type DsAppearance, type DsDensity, type DsTheme } from './aurora-tokens';

/**
 * Переопределяет любой из трёх скоупов на поддереве — компактная таблица внутри
 * cozy-страницы, тёмная панель поверх светлого экрана, превью чужой темы.
 *
 *   <section auroraScope density="compact">…</section>
 */
@Directive({ selector: '[auroraScope]', standalone: true })
export class AuroraScopeDirective {
  readonly theme = input<DsTheme | undefined>(undefined);
  readonly appearance = input<DsAppearance | undefined>(undefined);
  readonly density = input<DsDensity | undefined>(undefined);

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;

  constructor() {
    effect(() => {
      this.apply(AURORA_ATTR.theme, this.theme());
      this.apply(AURORA_ATTR.appearance, this.appearance());
      this.apply(AURORA_ATTR.density, this.density());
    });
  }

  private apply(attr: string, value?: string): void {
    if (value) this.host.setAttribute(attr, value);
    else this.host.removeAttribute(attr);
  }
}
