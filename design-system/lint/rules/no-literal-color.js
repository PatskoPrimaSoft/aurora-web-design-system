import stylelint from 'stylelint';
import { findColorLiterals } from '../lib/value.js';

const { createPlugin, utils } = stylelint;
const ruleName = 'aurora/no-literal-color';

const messages = utils.ruleMessages(ruleName, {
  literal: (text) => `Цвет ${text} задан литералом. Возьмите токен по роли: var(--ds-…)`,
});

const meta = { url: 'https://github.com/ORG/aurora-design-system/blob/main/lint/README.md#no-literal-color' };

/**
 * По умолчанию проверяются все объявления. Свойства, где литерал бывает
 * оправдан (градиентные маски, фильтры и тому подобное), перечисляются
 * в `ignoreProperties` — списком, а не молчаливым исключением в правиле.
 */
const rule = (primary, secondary = {}) => (root, result) => {
  if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

  const ignore = new Set((secondary.ignoreProperties ?? []).map((p) => p.toLowerCase()));

  root.walkDecls((decl) => {
    if (ignore.has(decl.prop.toLowerCase())) return;

    for (const hit of findColorLiterals(decl.value)) {
      utils.report({
        result,
        ruleName,
        message: messages.literal(hit.text),
        node: decl,
        index: decl.prop.length + (decl.raws.between?.length ?? 1) + hit.index,
        endIndex:
          decl.prop.length + (decl.raws.between?.length ?? 1) + hit.index + hit.length,
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default createPlugin(ruleName, rule);
