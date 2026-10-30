import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsSpinnerComponent, type DsSpinnerTone } from '@primasoftllc/design-system/angular';

/** Consumer harness imports the installed package, never the library's source files. */
@Component({
  selector: 'spinner-demo',
  imports: [DsSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner-demo.html',
})
export class SpinnerDemo {
  readonly size = signal(20);
  readonly tone = signal<DsSpinnerTone>('brand');
  readonly label = signal('Загрузка отчёта');
  readonly shown = signal(false);
  readonly delay = signal(1000);
}
