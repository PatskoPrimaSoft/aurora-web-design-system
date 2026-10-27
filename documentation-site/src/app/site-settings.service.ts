import { Injectable, computed, signal } from '@angular/core';
import type { DsTheme, DsAppearance, DsDensity } from '@primasoftllc/design-system/angular';
/** Settings apply to demonstrations; documentation stays DEFAULT/light/cozy. */
@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  readonly theme = signal<DsTheme>('DEFAULT');
  readonly appearance = signal<DsAppearance>('light');
  readonly density = signal<DsDensity>('cozy');
  readonly queryParams = computed(() => ({
    theme: this.theme(),
    appearance: this.appearance(),
    density: this.density(),
  }));
}
