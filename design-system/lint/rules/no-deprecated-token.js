import stylelint from 'stylelint';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { scrub } from '../lib/value.js';

const { createPlugin, utils } = stylelint;
const ruleName = 'aurora/no-deprecated-token';

const messages = utils.ruleMessages(ruleName, {
  deprecated: (old, next, removeIn) => `--${old} устарел — используйте --${next} (алиас удаляется в ${removeIn}).`,
});

const meta = { url: 'https://github.com/ORG/aurora-design-system/blob/main/lint/README.md#no-deprecated-token' };

/**
 * Устаревшие имена — список `aliases` в `lint/naming.config.json`. Пока алиас жив,
 * старое имя работает, поэтому в готовом конфиге правило — предупреждение, а не
 * ошибка: миграция идёт по срезам (docs/usage.md), а не одним коммитом.
 */
function loadAliases(path) {
  const file = path ?? fileURLToPath(new URL('../naming.config.json', import.meta.url));
  return JSON.parse(readFileSync(file, 'utf8')).aliases ?? [];
}

const rule = (primary, secondary = {}) => (root, result) => {
  if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;
  const aliases = loadAliases(secondary.configPath);
  const byName = new Map(aliases.map((a) => [`--${a.old}`, a]));
  root.walkDecls((decl) => {
    for (const m of scrub(decl.value).matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) {
      const a = byName.get(m[1]);
      if (!a) continue;
      utils.report({ result, ruleName, node: decl, word: m[1], message: messages.deprecated(a.old, a.new, a.removeIn) });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default createPlugin(ruleName, rule);
