import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DsFabComponent,
  type DsFabSize,
  type DsFabTone,
} from '@primasoftllc/design-system/angular';

/** Installed-package harness, deliberately independent of the documentation application. */
@Component({
  selector: 'fab-demo',
  imports: [DsFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      id="fab-action"
      dsFab
      label="Добавить объект"
      [size]="size()"
      [tone]="tone()"
      [extended]="extended()"
      [loading]="loading()"
      [disabled]="disabled()"
      aria-describedby="fab-description"
      (click)="count.set(count() + 1)"></button>
    <p id="fab-description">Описание действия</p>
    <output id="fab-count">{{ count() }}</output>
    <button id="fab-size" (click)="size.set(size() === 'sm' ? 'lg' : 'sm')">Размер</button>
    <button id="fab-tone" (click)="tone.set('surface')">Тон</button>
    <button id="fab-extended" (click)="extended.set(!extended())">Подпись</button>
    <button id="fab-loading" (click)="loading.set(!loading())">Загрузка</button>
    <button id="fab-disabled" (click)="disabled.set(!disabled())">Недоступность</button>
  `,
})
export class FabDemo {
  readonly size = signal<DsFabSize>('md');
  readonly tone = signal<DsFabTone>('primary');
  readonly extended = signal(false);
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly count = signal(0);
}
