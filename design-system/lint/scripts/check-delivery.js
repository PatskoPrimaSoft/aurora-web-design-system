/**
 * Проверка поставки: действующие файлы не ссылаются на старые идентификаторы,
 * не содержат битых локальных ссылок, а локальные ресурсы превью существуют.
 * Запуск: `node design-system/lint/scripts/check-delivery.js`, часть `design-system/lint/test/run.js`.
 *
 * Старые идентификаторы — имена до миграции: компоненты `V2*`, токены
 * `--v2-*`, страницы `v2-*.html`, файлы `_ds_bundle.js` / `_ds_manifest.json`.
 * Проверяется код и разметка (html, js, jsx, ts, css, json). Проза (`*.md`)
 * не проверяется: история миграций законно называет старые имена.
 *
 * Исключения — поимённо и с причиной, как долги в naming.config.json.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDirectRun } from './check-names.js';

export const EXCLUDE = [
  { path: 'lint/', why: 'генерируемая совместимая копия; проверяются канонический линтер и tarball' },
  { path: 'design-system/assets/notes/', why: 'история миграции — законно называет старые имена' },
  { path: 'design-system/templates/leadership-deck/', why: 'стартер сохранён как есть до собственной миграции (README, раздел Starters)' },
  { path: 'design-system/lint/scripts/check-delivery.js', why: 'сам содержит шаблоны старых имён' },
  { path: 'design-system/lint/test/', why: 'фикстуры проверок' },
  { path: 'node_modules/', why: 'зависимости' },
  { path: 'design-system/tests/consumers/react19/node_modules/', why: 'установленные зависимости React-потребителя; исходники фикстуры проверяются' },
  { path: 'ng-ui-kit/tests/consumers/', why: 'шаблоны приложений: пути проверяет AOT и браузер после установки tarball' },
  { path: 'site/', why: 'генерируемый каталог проверяется в браузере' },
  { path: 'dist/', why: 'генерируемая поставка проверяется отдельно' },
  { path: 'design-system/catalog/index.html', why: 'HTML-шаблон: ссылки разрешаются в site/, проверяется браузером' },
];

const CODE = /\.(html|js|mjs|cjs|jsx|ts|css|json)$/;
const LEGACY = [
  { re: /\bV2[A-Z][A-Za-z]+/g, what: 'компонент V2*' },
  { re: /--v2-[a-z][\w-]*/g, what: 'токен --v2-*' },
  { re: /\bv2-[a-z][\w-]*\.(?:card\.)?html\b/g, what: 'страница v2-*.html' },
  { re: /\b_ds_(?:bundle\.js|manifest\.json)\b/g, what: 'старый файл поставки' },
];

function walk(root, dir = root, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const abs = join(dir, name);
    const rel = relative(root, abs).split('\\').join('/');
    if (EXCLUDE.some((e) => rel === e.path || rel.startsWith(e.path) || `${rel}/` === e.path)) continue;
    if (statSync(abs).isDirectory()) walk(root, abs, out);
    else out.push({ abs, rel });
  }
  return out;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

export function checkDelivery(root) {
  const problems = [];
  for (const { abs, rel } of walk(root)) {
    if (!CODE.test(rel)) continue;
    const text = readFileSync(abs, 'utf8');
    for (const { re, what } of LEGACY) {
      for (const m of text.matchAll(re)) {
        problems.push({ file: rel, line: lineOf(text, m.index), code: 'legacy', message: `${what}: ${m[0]}` });
      }
    }
    // Локальные изображения допускаются: проверяем достижимый файл, включая query/hash.
    if (/^design-system\/components\/[^/]+\/preview\.html$/.test(rel)) {
      for (const m of text.matchAll(/(?:\bsrc|logoSrc|avatarSrc)\s*[=:]\s*["']([^"']+\.(?:png|jpe?g|gif|webp|svg)(?:[?#][^"']*)?)["']/gi)) {
        if (/^(?:data:|https?:)/i.test(m[1])) continue;
        const target = normalize(join(dirname(abs), m[1].split(/[?#]/)[0]));
        if (!existsSync(target)) problems.push({ file: rel, line: lineOf(text, m.index), code: 'preview-fetch', message: `нет ресурса превью: ${m[1]}` });
      }
    }
    if (rel.endsWith('.html')) {
      // overview публикуется в корне site и ссылается на собранные страницы.
      const linkBase = rel === 'design-system/overview.html' ? join(root, 'site/design-system') : dirname(abs);
      for (const m of text.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
        const url = m[1];
        // внешние, якоря, data:, и адреса, собираемые в скрипте ('+x+', {{x}}, ${x})
        if (!url || /^(?:[a-z]+:|\/\/|#)/i.test(url) || /['+{}$]/.test(url)) continue;
        const target = normalize(join(linkBase, url.split(/[?#]/)[0]));
        if (!existsSync(target)) {
          problems.push({ file: rel, line: lineOf(text, m.index), code: 'broken-link', message: `нет файла: ${url}` });
        }
      }
    }
  }
  return problems;
}

if (isDirectRun(import.meta.url)) {
  const root = process.argv[2] ?? fileURLToPath(new URL('../../..', import.meta.url));
  const problems = checkDelivery(root);
  for (const p of problems) console.error(`× ${p.file}:${p.line} — ${p.message} [${p.code}]`);
  console.log(`поставка: нарушений ${problems.length}`);
  if (problems.length) process.exit(1);
}
