/**
 * Источник имён токенов для правил.
 *
 * Список собирается из `tokens.json` — того же файла, из которого генерируется
 * `tokens.css`. Поэтому линтер не может разойтись с системой: переименование
 * токена в мажоре автоматически становится ошибкой у всех потребителей.
 *
 * В пакет уезжает предсобранный `tokens.allowed.json` (см. `scripts/build-allowlist.js`),
 * чтобы правило не парсило 30 КБ JSON на каждом файле. Тест `test/run.js`
 * падает, если предсобранный список разошёлся с `tokens.json`.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cache = new Map();

/**
 * Имена кастомных свойств, которые реально попадают в `tokens.css`.
 *
 * Семейства из `type.families` в продуктовой таблице стилей называются так же,
 * как в `tokens.json`: `ds-type-body` → `--ds-type-body`. Префикс `--font-`
 * добавляет только страница артефакта в своём `tokens.css` — это её внутреннее
 * имя, в приложениях его нет.
 */
export function customPropertiesFromTokens(tokens) {
  const names = new Set();

  for (const [family, value] of Object.entries(tokens)) {
    if (family === 'type' || !value || typeof value !== 'object') continue;
    for (const token of value.tokens ?? []) {
      if (token?.name) names.add(`--${token.name}`);
    }
  }

  for (const family of Object.keys(tokens.type?.families ?? {})) {
    names.add(`--${family}`);
  }
  for (const group of tokens.type?.groups ?? []) {
    for (const style of group.styles ?? []) {
      if (style?.name) names.add(`--${style.name}`);
    }
  }

  return [...names].sort();
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * @param {{tokensPath?: string, allowlistPath?: string}} [options]
 * @returns {{names: Set<string>, namespaces: string[]}}
 */
export function loadTokens(options = {}) {
  const key = options.tokensPath ?? options.allowlistPath ?? 'default';
  if (cache.has(key)) return cache.get(key);

  let names;
  let namespaces = ['--ds-', '--font-ds-'];

  if (options.tokensPath) {
    names = customPropertiesFromTokens(readJson(options.tokensPath));
  } else {
    const baked = fileURLToPath(new URL('../tokens.allowed.json', import.meta.url));
    const data = readJson(options.allowlistPath ?? baked);
    names = data.names;
    namespaces = data.namespaces ?? namespaces;
  }

  const result = { names: new Set(names), namespaces };
  cache.set(key, result);
  return result;
}

/** Принадлежит ли имя пространству имён системы (и значит, проверяется). */
export function isOwned(name, namespaces) {
  return namespaces.some((prefix) => name.startsWith(prefix));
}

/**
 * Подсказка «вы имели в виду …».
 *
 * Отдельный случай — префикс `--font-`: так семейства называет страница
 * артефакта (`--font-ds-type-body`), и это имя легко скопировать из её
 * `tokens.css`. В приложениях оно не существует; продуктовое имя — без префикса.
 */
export function suggestName(name, names) {
  if (name.startsWith('--font-')) {
    const product = `--${name.slice('--font-'.length)}`;
    if (names.has(product)) return product;
  }
  return null;
}

export function clearCache() {
  cache.clear();
}
