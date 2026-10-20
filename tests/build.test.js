/**
 * Инварианты собранного CSS и проверка паритета токенов.
 * Запуск: `node tests/build.test.js` после `npm run build`, часть `npm run verify`.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { checkParity } from '../tools/check-parity.js';
import { buildDist } from '../tools/build.js';
import { resolve as resolveCss, readSets } from '../tools/css.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const check = (name, fn) => { fn(); console.log(`ok   сборка: ${name}`); };

const { styles, tokens } = buildDist({ root });
const stylesAst = postcss.parse(styles);
check('подстановка шрифта сохраняет пробел между весом и размером', () => {
  const sets = readSets(':root{--weight:400;--size:14px}');
  assert.equal(resolveCss(sets,'root','var(--weight) var(--size)/1.5 sans-serif'), '400 14px/1.5 sans-serif');
});

check('паритет репозитория чистый', () => {
  const { mismatches, compared, kinds } = checkParity(read('tokens.css'), read('design-system/components/bundle.css'));
  assert.deepEqual(mismatches, []);
  console.log(`     паритет: ${compared} копий`);
});
const PARITY_TOKENS = [
  ':root, [data-theme="light"]{--ds-n-900:#1d222c;--ds-fg:var(--ds-n-900);--ds-brand:#2b5f9e}',
  '[data-theme="ds-appearance-light-ds-red2"]{--ds-brand:#555354}',
  '[data-theme="ds-appearance-dark-ds-default"]{--ds-fg:#eef0f4;--ds-brand:#5b92d4}',
  ':root{--ds-dur:180ms}',
].join('');
const mismatchesOf = (bundle) => checkParity(PARITY_TOKENS, bundle).mismatches;
check('паритет ловит расхождение каждого вида', () => {
  const cases = {
    ':root': ':root{--ds-dur:200ms}',
    'светлость light': '[data-ds-appearance="light"]{--ds-fg:#00ff00}',
    'светлость dark': '[data-ds-appearance="dark"], :where([data-theme="x"]){--ds-fg:#00ff00}',
    'тема RED2·light': '[data-ds-theme="RED2"], :where([data-theme="x"]){--ds-_brand--light:#ff00ff}',
    'тема RED2·dark → откат на DEFAULT·dark': '[data-ds-theme="RED2"]{--ds-_brand--dark:#ff00ff}',
    'тема DEFAULT·light': '[data-ds-theme="DEFAULT"]{--ds-_brand--light:#ff00ff}',
    'вход бренда без токена': '[data-ds-theme="DEFAULT"]{--ds-_nope--light:#ff00ff}',
  };
  for (const [name, bundle] of Object.entries(cases)) assert.equal(mismatchesOf(bundle).length, 1, name);
});
check('паритет сравнивает после подстановки var()', () => {
  assert.deepEqual(mismatchesOf('[data-ds-appearance="light"]{--ds-fg:#1d222c}'), []);
  assert.deepEqual(mismatchesOf('[data-ds-theme="RED2"]{--ds-_brand--light:#555354;--ds-_brand--dark:#5b92d4}'), []);
});
check('@media, переключатели и плотность — не копии', () => {
  const bundle = '@media (prefers-reduced-motion:reduce){:root{--ds-dur:0ms}[data-ds-appearance="light"]{--ds-fg:#000}}'
    + '[data-ds-appearance="light"]{--ds-_if-dark: ;--ds-control-h:30px}[data-ds-theme]{--ds-dur:1ms}';
  const { mismatches, compared } = checkParity(PARITY_TOKENS, bundle);
  assert.deepEqual(mismatches, []);
  assert.equal(compared, 0);
});
check('нет Google Fonts и рамочных селекторов артефакта', () => {
  assert.doesNotMatch(styles, /fonts\.googleapis\.com/);
  assert.doesNotMatch(styles, /\[data-theme=/);
  assert.doesNotMatch(tokens, /\[data-theme=/);
});
check('каждый url() ведёт к файлу пакета', () => {
  const urls = [...styles.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)].map((m) => m[1]);
  assert.ok(urls.length >= 7, 'шесть шрифтов и иконки');
  for (const url of urls) assert.ok(existsSync(join(root, 'dist', url)), `битый url(${url})`);
});
check('шрифты и иконки объявлены', () => {
  const faces = [];
  stylesAst.walkAtRules('font-face', (r) => r.walkDecls('font-family', (d) => faces.push(d.value.replaceAll(/['"]/g, ''))));
  assert.equal(faces.filter((f) => f === 'Inter Tight').length, 4);
  assert.equal(faces.filter((f) => f === 'JetBrains Mono').length, 2);
  assert.equal(faces.filter((f) => f === 'Material Symbols Outlined').length, 1);
});
check('каждый var(--ds-*) где-то объявлен', () => {
  const declared = new Set();
  stylesAst.walkDecls(/^--/, (d) => declared.add(d.prop));
  const used = new Set([...styles.matchAll(/var\(\s*(--ds-[a-z0-9_-]+)/g)].map((m) => m[1]));
  const missing = [...used].filter((u) => !declared.has(u));
  assert.deepEqual(missing, []);
});
check('наборы тем и плотности на месте', () => {
  assert.match(styles, /\[data-ds-theme="RED2"\][^{]*\{[^}]*--ds-_brand--light:/);
  assert.match(styles, /\[data-ds-density="compact"\]/);
});
check('tokens.css — только кастомные свойства', () => {
  postcss.parse(tokens).walkDecls((d) => assert.ok(d.prop.startsWith('--'), `не токен: ${d.prop}`));
  postcss.parse(tokens).walkAtRules((r) => assert.notEqual(r.name, 'font-face'));
});
check('dist совпадает с исходниками', () => {
  assert.equal(read('dist/styles.css'), styles, 'dist устарел: npm run build');
  assert.equal(read('dist/tokens.css'), tokens);
});
