/** Значения трёх скоупов системы. Строки — контракт: они же имена в CSS. */
export type DsTheme = 'DEFAULT' | 'RED2';
export type DsAppearance = 'light' | 'dark';
export type DsDensity = 'cozy' | 'compact';

export interface AuroraScopes {
  theme: DsTheme;
  appearance: DsAppearance;
  density: DsDensity;
}

export const AURORA_ATTR = {
  theme: 'data-ds-theme',
  appearance: 'data-ds-appearance',
  density: 'data-ds-density',
} as const;

export const AURORA_DEFAULTS: AuroraScopes = { theme: 'DEFAULT', appearance: 'light', density: 'cozy' };

/** Ключи в localStorage. Тема сюда не пишется: она приходит из FRONT_BRAND. */
export const AURORA_STORAGE = { appearance: 'ds-appearance', density: 'ds-density' } as const;
