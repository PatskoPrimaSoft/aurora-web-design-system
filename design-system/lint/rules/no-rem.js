import stylelint from 'stylelint';
import { findUnits } from '../lib/value.js';

const { createPlugin, utils } = stylelint;
const ruleName = 'aurora/no-rem';

const messages = utils.ruleMessages(ruleName, {
  unit: (text) =>
    `${text}: размеры задаются в px. Порталы ставят html { font-size: 10px }, поэтому rem из старого кода умножается на 10 один раз и остаётся px`,
});

const meta = { url: 'https://github.com/ORG/aurora-design-system/blob/main/lint/README.md#no-rem' };

const rule = (primary, secondary = {}) => (root, result) => {
  if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

  const units = secondary.units ?? ['rem'];
  const ignore = new Set((secondary.ignoreProperties ?? []).map((p) => p.toLowerCase()));

  root.walkDecls((decl) => {
    if (ignore.has(decl.prop.toLowerCase())) return;

    for (const hit of findUnits(decl.value, units)) {
      utils.report({
        result,
        ruleName,
        message: messages.unit(hit.text),
        node: decl,
        word: hit.text,
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default createPlugin(ruleName, rule);
