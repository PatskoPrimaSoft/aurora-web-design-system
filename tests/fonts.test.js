/**
 * Шрифты интерфейса лежат в пакете: шесть woff2 из design-system/tokens/webfonts-selfhost.css и лицензии OFL.
 * Покрытие кириллицы проверяет tools/fonts/build_fonts.py --verify (нужен fontTools).
 * Запуск: `node tests/fonts.test.js`, часть `npm run test:ui`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(join(root, 'design-system/tokens/webfonts-selfhost.css'), 'utf8');
const urls = [...css.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]);

assert.equal(urls.length, 6, 'в webfonts-selfhost.css шесть начертаний');
for (const url of urls) {
  const path = join(root, 'design-system/tokens', url);
  assert.ok(existsSync(path), `нет файла ${url}`);
  const head = readFileSync(path).subarray(0, 4).toString('latin1');
  assert.equal(head, 'wOF2', `${url} — не woff2`);
  assert.ok(existsSync(join(dirname(path), 'OFL.txt')), `рядом с ${url} нет OFL.txt`);
  console.log(`ok   шрифт: ${url}`);
}
