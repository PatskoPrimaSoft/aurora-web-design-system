import stylelint from 'stylelint';
import { loadTokens, isOwned, suggestName } from '../lib/tokens.js';
import { findVarRefs, closest } from '../lib/value.js';

const { createPlugin, utils } = stylelint;
const ruleName = 'aurora/known-token';

const messages = utils.ruleMessages(ruleName, {
  unknown: (name, hint) =>
    `Токена ${name} нет в системе${hint ? `. Возможно, ${hint}` : ''}`,
  redeclared: (name) =>
    `${name} — токен системы, его нельзя переопределять в приложении. Нужен свой — назовите его вне пространства имён системы`,
});

const meta = { url: 'https://github.com/ORG/aurora-design-system/blob/main/lint/README.md#known-token' };

/**
 * Проверяет, что каждое `var(--ds-…)` ссылается на токен, который существует
 * в `tokens.json`, и что приложение не объявляет свои `--ds-*`.
 *
 * Это единственное правило, которого нет и не может быть у генерических
 * линтеров: оно знает инвентарь системы.
 */
const rule = (primary, secondary = {}) => (root, result) => {
  if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

  const { names, namespaces } = loadTokens(secondary);
  const allowDeclare = secondary.allowDeclare === true;

  root.walkDecls((decl) => {
    if (!allowDeclare && decl.prop.startsWith('--') && isOwned(decl.prop, namespaces)) {
      utils.report({
        result,
        ruleName,
        message: messages.redeclared(decl.prop),
        node: decl,
        word: decl.prop,
      });
    }

    if (!decl.value.includes('var(')) return;

    for (const ref of findVarRefs(decl.value)) {
      if (!isOwned(ref.name, namespaces) || names.has(ref.name)) continue;
      const hint = suggestName(ref.name, names) ?? closest(ref.name, names);
      utils.report({
        result,
        ruleName,
        message: messages.unknown(ref.name, hint),
        node: decl,
        word: ref.name,
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default createPlugin(ruleName, rule);
