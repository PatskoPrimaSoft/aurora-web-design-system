/**
 * Собирает `lint/tokens.allowed.json` из `tokens.json`.
 * Запускается в релизе, до `npm publish`: `node design-system/lint/scripts/build-allowlist.js`
 *
 * Расхождение предсобранного списка с `tokens.json` ловит `design-system/lint/test/run.js`,
 * поэтому забытый запуск валит сборку, а не уезжает в прод.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { customPropertiesFromTokens } from '../lib/tokens.js';

const tokensPath = fileURLToPath(new URL('../../../tokens.json', import.meta.url));
const outPath = fileURLToPath(new URL('../tokens.allowed.json', import.meta.url));

const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
const names = customPropertiesFromTokens(tokens);

const payload = {
  $comment: 'Сгенерировано из tokens.json. Не править руками: node design-system/lint/scripts/build-allowlist.js',
  tokensVersion: tokens.version ?? null,
  namespaces: ['--ds-', '--font-ds-'],
  names,
};

writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`tokens.allowed.json: ${names.length} имён`);
