import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuroraScopeDirective, DsIconComponent } from '@primasoftllc/design-system/angular';
import type {
  DsAppearance,
  DsDensity,
  DsIconSize,
  DsTheme,
} from '@primasoftllc/design-system/angular';

/** Consumer harness: all icons and types come from the installed public package. */
@Component({
  selector: 'icon-demo',
  imports: [AuroraScopeDirective, DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon-demo.html',
})
export class IconDemo {
  readonly sizes: readonly DsIconSize[] = ['xs', 'sm', 'md', 'lg'];
  readonly name = signal('search');
  readonly size = signal<DsIconSize>('md');
  readonly angle = signal(0);
  readonly label = signal<string | undefined>(undefined);
  readonly theme = signal<DsTheme>('DEFAULT');
  readonly appearance = signal<DsAppearance>('light');
  readonly density = signal<DsDensity>('cozy');

  update() {
    this.name.set('navigation');
    this.size.set('lg');
    this.angle.set(90);
    this.label.set('  Направление: восток  ');
  }
}
