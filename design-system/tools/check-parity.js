/**
 * Паритет копий токенов в design-system/components/bundle.css с tokens.css.
 * bundle.css несёт свои копии значений tokens.css, и в каскаде они работают (сборка их не вырезает):
 * - `[data-ds-appearance="light"|"dark"]` — цветовые токены светлости, сверяются с DEFAULT·light / DEFAULT·dark;
 * - `[data-ds-theme="DEFAULT"|"RED2"]` — входы механизма бренда `--ds-_X--light|dark`, сверяются с `--ds-X`
 *   набора `<тема>·<светлость>` (с откатом на DEFAULT·<светлость>); по ним правило пересчёта собирает `--ds-brand` и др.;
 * - член `:root` в селекторе — сверяется с :root-наборами (root и DEFAULT·light).
 * Сравниваются значения после подстановки var() по наборам tokens.css. Смотрятся только правила верхнего уровня:
 * @media (prefers-reduced-motion и т. п.) — механизм системы, не копия. Свойства, которых нет в tokens.css
 * (переключатели `--ds-_if-*`, плотность), не копии; вход бренда без токена в tokens.css — расхождение.
 * Запуск: `node design-system/tools/check-parity.js` (выход 1 при расхождении).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { readSets, normalize, lookup, resolve } from './css.js';

const APPEARANCE = /^\[data-ds-appearance="(light|dark)"\]$/;
const THEME = /^\[data-ds-theme="([A-Z0-9]+)"\]$/;
const BRAND_INPUT = /^--ds-_(.+)--(light|dark)$/;

/** Все сравнения копий: [{kind, selector, prop, set, token, value, expected}]. */
export function copies(tokensCss, bundleCss) {
  const sets = readSets(tokensCss);
  const out = [];
  postcss.parse(bundleCss).each((rule) => {
    if (rule.type !== 'rule') return;
    const members = rule.selectors.map((s) => s.trim());
    rule.each((d) => {
      if (d.type !== 'decl' || !d.prop.startsWith('--')) return;
      for (const m of members) {
        if (m === ':root') {
          const set = sets.get('root')?.has(d.prop) ? 'root' : 'DEFAULT·light';
          if (sets.get(set)?.has(d.prop)) out.push({ kind: ':root', rule, prop: d.prop, set, token: d.prop, value: d.value });
          continue;
        }
        const app = APPEARANCE.exec(m);
        if (app) {
          const set = `DEFAULT·${app[1]}`;
          if (sets.get(set)?.has(d.prop)) out.push({ kind: 'appearance', rule, prop: d.prop, set, token: d.prop, value: d.value });
          continue;
        }
        const theme = THEME.exec(m);
        const input = BRAND_INPUT.exec(d.prop);
        if (theme && input) {
          out.push({ kind: 'theme', rule, prop: d.prop, set: `${theme[1]}·${input[2]}`, token: `--ds-${input[1]}`, value: d.value });
        }
      }
    });
  });
  for (const c of out) c.expected = lookup(sets, c.set, c.token);
  return { sets, list: out };
}

export function checkParity(tokensCss, bundleCss) {
  const { sets, list } = copies(tokensCss, bundleCss);
  const mismatches = [];
  const kinds = { ':root': 0, appearance: 0, theme: 0 };
  for (const c of list) {
    kinds[c.kind] += 1;
    const where = `${c.kind} ${c.rule.selectors[0].trim()} ${c.prop}`;
    if (c.expected === undefined) {
      mismatches.push(`${where}: в tokens.css нет ${c.token} (${c.set})`);
    } else if (normalize(c.value) !== normalize(c.expected)
      && resolve(sets, c.set, c.value) !== resolve(sets, c.set, c.expected)) {
      mismatches.push(`${where}: bundle.css «${c.value}» ≠ tokens.css ${c.set} ${c.token} «${c.expected}»`);
    }
  }
  return { compared: list.length, kinds, mismatches };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL('../..', import.meta.url);
  const { mismatches, compared, kinds } = checkParity(
    readFileSync(new URL('dist/legacy-tokens.css', root), 'utf8'),
    readFileSync(new URL('design-system/components/bundle.css', root), 'utf8'),
  );
  for (const m of mismatches) console.error(`FAIL паритет: ${m}`);
  const detail = Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(', ');
  console.log(`${mismatches.length ? 'FAIL' : 'ok  '} паритет: ${compared} копий (${detail}), ${mismatches.length} расхождений`);
  process.exit(mismatches.length ? 1 : 0);
}
