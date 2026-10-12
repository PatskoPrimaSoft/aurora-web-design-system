/**
 * Тесты правил. Без тестового фреймворка: `node lint/test/run.js`.
 *
 * Каждое правило описано парами «код — ожидание». Правило без теста тихо
 * перестаёт срабатывать при первом же рефакторинге и никто этого не замечает,
 * поэтому новое правило без пары строк здесь не принимается.
 */
import stylelint from 'stylelint';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { customPropertiesFromTokens } from '../lib/tokens.js';
import { checkNames, checkOpen, loadConfig, isDirectRun } from '../scripts/check-names.js';
import { checkDelivery } from '../scripts/check-delivery.js';
import { parseSets, contrast } from '../lib/contrast.js';
import { buildScopedTokens, tokensCssPath, scopedCssPath } from '../scripts/build-scoped-tokens.js';

const plugins = [fileURLToPath(new URL('../index.js', import.meta.url))];

/** @type {{rule: string, options?: unknown, code: string, expect: number, contains?: string}[]} */
const cases = [
  // --- known-token -------------------------------------------------------
  { rule: 'aurora/known-token', code: '.a { color: var(--ds-fg); }', expect: 0 },
  { rule: 'aurora/known-token', code: '.a { font: var(--ds-type-body); }', expect: 0 },
  { rule: 'aurora/known-token', code: '.a { color: var(--my-local); }', expect: 0 },
  { rule: 'aurora/known-token', code: '.a { --local-gap: 8px; }', expect: 0 },
  {
    rule: 'aurora/known-token',
    code: '.a { color: var(--ds-fg-mutted); }',
    expect: 1,
    contains: '--ds-fg-muted',
  },
  {
    rule: 'aurora/known-token',
    code: '.a { font: var(--font-ds-type-body); }',
    expect: 1,
    contains: '--ds-type-body',
  },
  { rule: 'aurora/known-token', code: ':root { --ds-brand: #123456; }', expect: 1, contains: 'нельзя переопределять' },
  { rule: 'aurora/known-token', code: '.a { color: var(--ds-surface-hover); }', expect: 0 },
  ...['ds-header-badge-fg','ds-gap','ds-pad','ds-fresh-on','ds-header-chip-bg','ds-header-chip-border'].map(name=>({rule:'aurora/known-token',code:`.a { color: var(--${name}); }`,expect:1})),

  // --- no-literal-color --------------------------------------------------
  { rule: 'aurora/no-literal-color', code: '.a { color: var(--ds-fg); }', expect: 0 },
  { rule: 'aurora/no-literal-color', code: '.a { color: transparent; }', expect: 0 },
  { rule: 'aurora/no-literal-color', code: '.a { fill: currentColor; }', expect: 0 },
  { rule: 'aurora/no-literal-color', code: '.a { background: #fff; }', expect: 1 },
  { rule: 'aurora/no-literal-color', code: '.a { color: rgba(0,0,0,.5); }', expect: 1 },
  { rule: 'aurora/no-literal-color', code: '.a { border: 1px solid red; }', expect: 1 },
  { rule: 'aurora/no-literal-color', code: '.a { color: var(--ds-fg, #333); }', expect: 1 },
  { rule: 'aurora/no-literal-color', code: '.a { background-image: url("red.png"); }', expect: 0 },
  { rule: 'aurora/no-literal-color', code: '.a { grid-area: white-space; }', expect: 0 },
  {
    rule: 'aurora/no-literal-color',
    options: [true, { ignoreProperties: ['filter'] }],
    code: '.a { filter: drop-shadow(0 0 2px #000); }',
    expect: 0,
  },

  // --- no-rem ------------------------------------------------------------
  { rule: 'aurora/no-rem', code: '.a { padding: 8px; }', expect: 0 },
  { rule: 'aurora/no-rem', code: '.a { padding: 0.5rem; }', expect: 1 },
  { rule: 'aurora/no-rem', code: '.a { margin: 1rem 2px 1rem; }', expect: 2 },
  { rule: 'aurora/no-rem', code: '.a { letter-spacing: -0.015em; }', expect: 0 },

  // --- focus-from-tokens -------------------------------------------------
  { rule: 'aurora/focus-from-tokens', code: '.a:focus-visible { outline: var(--ds-focus-ring); }', expect: 0 },
  { rule: 'aurora/focus-from-tokens', code: '.a:hover { box-shadow: 0 0 0 2px; }', expect: 0 },
  { rule: 'aurora/focus-from-tokens', code: '.a:focus { outline: 2px solid; }', expect: 1 },
  { rule: 'aurora/focus-from-tokens', code: '.a:focus-visible { box-shadow: 0 0 0 3px; }', expect: 1 },
  { rule: 'aurora/focus-from-tokens', code: '.a:focus { outline: none; }', expect: 1, contains: 'outline снят' },

  // --- shadow-token-only -------------------------------------------------
  { rule: 'aurora/shadow-token-only', code: '.a { box-shadow: var(--ds-shadow-md); }', expect: 0 },
  // --- no-deprecated-token ------------------------------------------------
  { rule: 'aurora/no-deprecated-token', code: '.a { gap: var(--ds-gap-sm-plus); }', expect: 0 },
  { rule: 'aurora/no-deprecated-token', code: '.a { gap: var(--ds-gap-sm); padding: var(--ds-pad-md); }', expect: 0 },
  { rule: 'aurora/no-deprecated-token', options: [true, {configPath:fileURLToPath(new URL('./fixtures/deprecated-naming.json',import.meta.url))}], code: '.a { gap: var(--ds-gap); }', expect: 1, contains: '--ds-gap-sm-plus' },
  { rule: 'aurora/no-deprecated-token', options: [true, {configPath:fileURLToPath(new URL('./fixtures/deprecated-naming.json',import.meta.url))}], code: '.a { padding: var(--ds-pad) var(--ds-pad); }', expect: 2, contains: '--ds-pad-sm' },
  { rule: 'aurora/no-deprecated-token', options: [true, {configPath:fileURLToPath(new URL('./fixtures/deprecated-naming.json',import.meta.url))}], code: '.a { color: var(--ds-fresh-on); }', expect: 1, contains: '--ds-fresh-fg' },
  { rule: 'aurora/shadow-token-only', code: '.a { box-shadow: none; }', expect: 0 },
  { rule: 'aurora/shadow-token-only', code: '.a { box-shadow: 0 1px 2px rgba(0,0,0,.2); }', expect: 1 },
  { rule: 'aurora/shadow-token-only', code: '.a { box-shadow: var(--ds-shadow-sm), 0 0 0 1px; }', expect: 1 },
  { rule: 'aurora/shadow-token-only', code: '.a { box-shadow: var(--card-shadow); }', expect: 1 },
];

let failed = 0;

for (const testCase of cases) {
  const { rule, code, expect, contains, options = true } = testCase;
  const { results } = await stylelint.lint({
    code,
    config: { plugins, rules: { [rule]: options } },
  });

  const warnings = results[0].warnings.filter((w) => w.rule === rule);
  const label = `${rule}: ${code}`;

  if (warnings.length !== expect) {
    failed++;
    console.error(`FAIL ${label}\n  ожидалось ${expect}, получено ${warnings.length}`);
    for (const w of warnings) console.error(`    ${w.text}`);
    continue;
  }

  if (contains && !warnings.some((w) => w.text.includes(contains))) {
    failed++;
    console.error(`FAIL ${label}\n  в сообщении нет «${contains}»`);
    for (const w of warnings) console.error(`    ${w.text}`);
    continue;
  }

  console.log(`ok   ${label}`);
}

// --- предсобранный список не разошёлся с tokens.json ----------------------
const tokens = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../tokens.json', import.meta.url)), 'utf8'),
);
const baked = JSON.parse(
  readFileSync(fileURLToPath(new URL('../tokens.allowed.json', import.meta.url)), 'utf8'),
);
const fresh = customPropertiesFromTokens(tokens);

if (JSON.stringify(fresh) !== JSON.stringify(baked.names)) {
  failed++;
  console.error(
    'FAIL tokens.allowed.json разошёлся с tokens.json — запустите node lint/scripts/build-allowlist.js',
  );
} else {
  console.log(`ok   tokens.allowed.json (${fresh.length} имён)`);
}

// --- регламент имён (docs/tokens.md) -------------------------------------------
const config = loadConfig();
const spacing = (names) => ({ spacing: { tokens: names.map((name) => ({ name, value: '0' })) } });

/** @type {{title: string, tokens: object, codes: string[]}[]} */
const nameCases = [
  { title: 'обычное имя', tokens: spacing(['ds-gap-sm', 'ds-gap-md']), codes: [] },
  { title: 'целевой префикс ds', tokens: spacing(['ds-gap-sm']), codes: [] },
  { title: 'верхний регистр', tokens: spacing(['ds-Gap']), codes: ['shape'] },
  { title: 'чужой префикс', tokens: spacing(['aurora-gap']), codes: ['shape'] },
  { title: 'ступень вне лестницы', tokens: spacing(['ds-gap-xxl']), codes: ['size-ladder'] },
  { title: 'своя лестница брейкпоинтов', tokens: spacing(['ds-bp-m', 'ds-bp-l']), codes: [] },
  { title: 'своя лестница начертаний', tokens: spacing(['ds-weight-medium']), codes: [] },
  { title: 'базовое имя рядом с -md', tokens: spacing(['ds-pad', 'ds-pad-md']), codes: ['bare-base'] },
  { title: 'чернила без заливки', tokens: spacing(['ds-brand-on']), codes: ['orphan-on'] },
  { title: 'чернила с заливкой', tokens: spacing(['ds-brand', 'ds-brand-on']), codes: [] },
  {
    title: 'неполная четвёрка статуса',
    tokens: spacing(['ds-danger-bg', 'ds-danger-fg']),
    codes: ['status-quartet'],
  },
  {
    title: 'имя объявлено дважды',
    tokens: {
      spacing: { tokens: [{ name: 'ds-gap-sm', value: '8px' }] },
      radius: { tokens: [{ name: 'ds-gap-sm', value: '8px' }] },
    },
    codes: ['duplicate'],
  },
];

for (const { title, tokens, codes } of nameCases) {
  const got = checkNames(tokens, config).map((p) => p.code).sort();
  const want = [...codes].sort();
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    failed++;
    console.error(`FAIL имена: ${title}\n  ожидалось [${want}], получено [${got}]`);
  } else {
    console.log(`ok   имена: ${title}`);
  }
}

// Реальные токены: нарушений сверх записанных долгов быть не должно.
const openProblems = checkOpen(tokens, config);
if (openProblems.length) {
  failed++;
  console.error('FAIL имена: в tokens.json нарушения вне списка долгов');
  for (const p of openProblems) console.error(`    ${p.name} — ${p.message} [${p.code}]`);
} else {
  const debts = (config.debts ?? []).length;
  console.log(`ok   имена: tokens.json по регламенту (долгов: ${debts})`);
}

// CLI check-names: прямой запуск должен реально проверять, и из пути с пробелом
// и кириллицей тоже — иначе CI зеленеет, ничего не проверив.
const cliCases = [];
{
  const root = mkdtempSync(join(tmpdir(), 'aurora имена '));
  try {
    const scripts = join(root, 'lint', 'scripts');
    mkdirSync(scripts, { recursive: true });
    const script = join(scripts, 'check-names.js');
    copyFileSync(fileURLToPath(new URL('../scripts/check-names.js', import.meta.url)), script);
    copyFileSync(fileURLToPath(new URL('../naming.config.json', import.meta.url)), join(root, 'lint', 'naming.config.json'));
    const bad = join(root, 'плохие токены.json');
    writeFileSync(bad, JSON.stringify(spacing(['ds-gap-big'])));
    const good = join(root, 'хорошие токены.json');
    writeFileSync(good, JSON.stringify(spacing(['ds-gap-sm', 'ds-gap-md'])));

    const run = (file) => spawnSync(process.execPath, [script, file], { encoding: 'utf8' });
    const r1 = run(bad);
    cliCases.push({ title: 'новое нарушение даёт ненулевой код', ok: r1.status === 1 && /нарушений: 1/.test(r1.stdout), got: `код ${r1.status}, вывод «${(r1.stdout + r1.stderr).trim()}»` });
    const r2 = run(good);
    cliCases.push({ title: 'чистый набор печатает итог и даёт 0', ok: r2.status === 0 && /имён, нарушений: 0/.test(r2.stdout), got: `код ${r2.status}, вывод «${(r2.stdout + r2.stderr).trim()}»` });
    cliCases.push({ title: 'isDirectRun: путь с пробелом и кириллицей', ok: isDirectRun(pathToFileURL(script).href, script), got: 'false' });
    cliCases.push({ title: 'isDirectRun: импорт не считается запуском', ok: !isDirectRun(import.meta.url, script), got: 'true' });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
// Контраст: пороги WCAG во всех четырёх наборах. Граница-единственный-признак —
// 3:1 (1.4.11), текст действия — 4,5:1 (1.4.3). Последняя пара — нарочно низкая:
// она фиксирует решение владельца по ds-border-field и не даёт незаметно
// «починить» проверку, если кто-то заменит ds-border-control на ds-border-field.
{
  const sets = parseSets(readFileSync(fileURLToPath(new URL('../../tokens.css', import.meta.url)), 'utf8'));
  const rules = [
    ...['ds-surface', 'ds-bg', 'ds-surface-hover', 'ds-surface-selected'].map((bg) => ['ds-border-control', bg, 3]),
    ...['ds-surface', 'ds-bg'].map((bg) => ['ds-border-control-hover', bg, 3]),
    ['ds-on-brand', 'ds-border-control', 3],
    ['ds-fg-action-on-inverse', 'ds-surface-inverse', 4.5],
    ['ds-fg-on-inverse', 'ds-surface-inverse', 4.5],
  ];
  for (const [fg, bg, min] of rules) {
    const got = Object.entries(sets).map(([n, set]) => [n, contrast(set, fg, bg)]);
    const low = got.filter(([, c]) => c < min);
    cliCases.push({ title: `контраст ${fg} / ${bg} ≥ ${min}:1 (мин. ${Math.min(...got.map(([, c]) => c)).toFixed(2)})`,
      ok: low.length === 0, got: low.map(([n, c]) => `${n} ${c.toFixed(2)}`).join(', ') });
  }
  const field = Object.values(sets).map((set) => contrast(set, 'ds-border-field', 'ds-surface'));
  cliCases.push({ title: 'контраст: проверка ловит ds-border-field (< 3:1, решение владельца)',
    ok: field.every((c) => c < 3), got: field.map((c) => c.toFixed(2)).join(', ') });
}

// Каталог определяет светлость темы только по её имени (/dark|night/i): тема
// «DEFAULT · тёмная» считалась светлой, и превью в ней лежали на светлом столе.
{
  const themes = JSON.parse(readFileSync(fileURLToPath(new URL('../../tokens.json', import.meta.url)), 'utf8')).color.themes;
  const wrong = themes.filter((t) => /dark/.test(t.id) !== /dark|night/i.test(t.name));
  cliCases.push({ title: 'имена тем: тёмные называются dark, светлые — нет', ok: wrong.length === 0,
    got: wrong.map((t) => `${t.id} «${t.name}»`).join(', ') });
}

// Алиасы №13: новые имена объявлены, старые — только как var(--новое), а
// компоненты системы старыми именами больше не пользуются.
{
  const cfg = JSON.parse(readFileSync(fileURLToPath(new URL('../naming.config.json', import.meta.url)), 'utf8'));
  const root = fileURLToPath(new URL('../..', import.meta.url));
  const read = (f) => readFileSync(join(root, f), 'utf8');
  const bundleCss = read('components/bundle.css'), tokensCss = read('tokens.css'), bundleJs = read('components/bundle.js');
  for (const { old, new: next } of cfg.aliases ?? []) {
    const decl = new RegExp('--' + old + ':\\s*([^;]+);', 'g');
    const values = [...(bundleCss + tokensCss).matchAll(decl)].map((m) => m[1].trim());
    cliCases.push({ title: `алиас --${old} → --${next}: объявлен только как var(--${next})`,
      ok: values.length > 0 && values.every((v) => v === `var(--${next})`), got: values.join(', ') || 'не объявлен' });
    const uses = (bundleJs.match(new RegExp('var\\(--' + old + '\\)', 'g')) || []).length;
    cliCases.push({ title: `компоненты не используют --${old}`, ok: uses === 0, got: uses + ' использований' });
  }
}

// Поставка: tokens/scoped.css собран из текущего tokens.css.
{
  const fresh = buildScopedTokens(readFileSync(tokensCssPath, 'utf8'));
  let onDisk = '';
  try { onDisk = readFileSync(scopedCssPath, 'utf8'); } catch {}
  cliCases.push({ title: 'tokens/scoped.css совпадает с tokens.css', ok: fresh === onDisk,
    got: 'разошёлся — запустите node lint/scripts/build-scoped-tokens.js' });
}

// Поставка: проверка ловит старые имена и битые ссылки (пара «код — ожидание»)…
{
  const root = mkdtempSync(join(tmpdir(), 'aurora поставка '));
  try {
    mkdirSync(join(root, 'components', 'A'), { recursive: true });
    mkdirSync(join(root, 'components', 'B'), { recursive: true });
    mkdirSync(join(root, 'assets', 'notes'), { recursive: true });
    writeFileSync(join(root, 'components', 'B', 'preview.html'), '<p>ok</p>');
    writeFileSync(join(root, 'components', 'A', 'preview.html'),
      '<a href="../B/preview.html">ok</a><a href="./gone.html">x</a><a href="https://e.x/">ext</a>' +
      '<img src="\'+src+\'"><script src="../../' + '_ds_' + 'bundle.js"></script>');
    writeFileSync(join(root, 'components', 'A', 'x.js'), 'window.NS.' + 'V2' + 'Button; var(--' + 'v2-gap);');
    mkdirSync(join(root, 'components', 'assets'), { recursive: true });
    writeFileSync(join(root, 'components', 'assets', 'logo.png'), 'x');
    mkdirSync(join(root, 'components', 'C'), { recursive: true });
    writeFileSync(join(root, 'components', 'C', 'preview.html'),
      '<img src="../assets/logo.png"><img src="data:image/png;base64,AA=="><script>h(X,{logoSrc:"../assets/logo.png"})</script>');
    writeFileSync(join(root, 'assets', 'notes', 'history.js'), 'V2' + 'Table');
    writeFileSync(join(root, 'README.md'), 'V2' + 'Table в прозе не проверяется');
    const got = checkDelivery(root).map((p) => `${p.file}:${p.code}`).sort();
    const want = [
      'components/A/preview.html:broken-link', 'components/A/preview.html:broken-link',
      'components/A/preview.html:legacy', 'components/A/x.js:legacy', 'components/A/x.js:legacy',
    ].sort();
    cliCases.push({ title: 'поставка: ловит старые имена и битые ссылки; разрешает существующие локальные ресурсы, историю и прозу',
      ok: JSON.stringify(got) === JSON.stringify(want), got: JSON.stringify(got) });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
// …и в самой поставке нарушений нет.
{
  const problems = checkDelivery(fileURLToPath(new URL('../..', import.meta.url)));
  cliCases.push({ title: 'поставка: старых имён и битых ссылок нет', ok: problems.length === 0,
    got: problems.slice(0, 10).map((p) => `${p.file}:${p.line} ${p.message}`).join('; ') });
}

for (const { title, ok, got } of cliCases) {
  if (ok) console.log(`ok   cli: ${title}`);
  else { failed++; console.error(`FAIL cli: ${title}\n  получено: ${got}`); }
}

if (failed) {
  console.error(`\n${failed} тест(ов) не прошло`);
  process.exit(1);
}
console.log(`\nвсе тесты прошли (${cases.length + nameCases.length + cliCases.length + 2})`);
