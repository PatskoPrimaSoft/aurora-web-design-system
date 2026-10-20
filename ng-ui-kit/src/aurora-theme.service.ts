import { DOCUMENT } from '@angular/common';
import { inject, Injectable, InjectionToken, signal, effect, APP_INITIALIZER, type Provider } from '@angular/core';
import {
  AURORA_ATTR, AURORA_DEFAULTS, AURORA_STORAGE,
  type AuroraScopes, type DsAppearance, type DsDensity, type DsTheme,
} from './aurora-tokens';

export const AURORA_CONFIG = new InjectionToken<Partial<AuroraScopes>>('AURORA_CONFIG');

/** Регистрирует стартовые значения скоупов. Тему сюда передаёт FRONT_BRAND. */
export function provideAurora(config: Partial<AuroraScopes> = {}): Provider[] {
  return [
    { provide: AURORA_CONFIG, useValue: config },
    { provide: APP_INITIALIZER, multi: true, deps: [AuroraThemeService],
      useFactory: (_service: AuroraThemeService) => () => undefined },
  ];
}

/**
 * Держит три скоупа на <body>. Оформление и плотность переживают перезагрузку,
 * тема — нет: она свойство тенанта, а не пользователя.
 */
@Injectable({ providedIn: 'root' })
export class AuroraThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly config = inject(AURORA_CONFIG, { optional: true }) ?? {};

  readonly theme = signal<DsTheme>(this.config.theme ?? AURORA_DEFAULTS.theme);
  readonly appearance = signal<DsAppearance>(
    this.read(AURORA_STORAGE.appearance, ['light', 'dark']) ?? this.config.appearance ?? AURORA_DEFAULTS.appearance,
  );
  readonly density = signal<DsDensity>(
    this.read(AURORA_STORAGE.density, ['cozy', 'compact']) ?? this.config.density ?? AURORA_DEFAULTS.density,
  );

  constructor() {
    this.applyScopes();
    effect(() => this.applyScopes());
  }

  private applyScopes(): void {
    // Читаем сигналы до появления body, чтобы effect продолжал следить за ними.
    const theme = this.theme(), appearance = this.appearance(), density = this.density();
    const body = this.doc.body;
    body?.setAttribute(AURORA_ATTR.theme, theme);
    body?.setAttribute(AURORA_ATTR.appearance, appearance);
    body?.setAttribute(AURORA_ATTR.density, density);
    this.write(AURORA_STORAGE.appearance, appearance);
    this.write(AURORA_STORAGE.density, density);
  }

  setTheme(value: DsTheme): void { this.theme.set(value); }
  setAppearance(value: DsAppearance): void { this.appearance.set(value); }
  setDensity(value: DsDensity): void { this.density.set(value); }

  private read<T extends string>(key: string, allowed: readonly T[]): T | null {
    try {
      const v = this.doc.defaultView?.localStorage.getItem(key) as T | null;
      return v && allowed.includes(v) ? v : null;
    } catch { return null; }
  }

  private write(key: string, value: string): void {
    try { this.doc.defaultView?.localStorage.setItem(key, value); } catch { /* приватный режим */ }
  }
}
