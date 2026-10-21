import stylelint from 'stylelint';
import { scrub } from '../lib/value.js';
import { loadTokens } from '../lib/tokens.js';

const { createPlugin, utils } = stylelint;
const ruleName = 'aurora/shadow-token-only';

const messages = utils.ruleMessages(ruleName, {
  own: (available) => `Своя тень. Ступени системы: ${available}`,
});

const meta = { url: 'https://github.com/ORG/aurora-design-system/blob/main/lint/README.md#shadow-token-only' };

const PROP = /^(-webkit-)?box-shadow$/i;
const ALLOWED_KEYWORD = /^(none|inherit|initial|unset|revert)$/i;

/**
 * `box-shadow` допускается только как ссылка на ступень тени из системы.
 * Составное значение вида `var(--ds-shadow-sm), 0 0 0 1px red` не проходит:
 * вторая тень — это своё кольцо, а оно приходит из токенов фокуса.
 */
const rule = (primary, secondary = {}) => (root, result) => {
  if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

  const pattern = new RegExp(secondary.tokenPattern ?? '^--ds-shadow-');
  // Список ступеней берётся из системы, а не из текста сообщения: добавили
  // ступень — подсказка обновилась сама.
  const available = [...loadTokens(secondary).names].filter((n) => pattern.test(n)).join(', ');

  root.walkDecls((decl) => {
    if (!PROP.test(decl.prop)) return;

    const value = scrub(decl.value).trim();
    if (ALLOWED_KEYWORD.test(value)) return;

    const refs = [...value.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)].map((m) => m[1]);
    const rest = value.replace(/var\(\s*--[A-Za-z0-9_-]+\s*(,[^)]*)?\)/g, '').replace(/[\s,]/g, '');

    const ok = refs.length > 0 && refs.every((name) => pattern.test(name)) && rest === '';
    if (ok) return;

    utils.report({ result, ruleName, message: messages.own(available), node: decl, word: decl.prop });
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default createPlugin(ruleName, rule);
