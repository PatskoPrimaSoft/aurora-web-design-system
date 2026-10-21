import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;
const ruleName = 'aurora/focus-from-tokens';

const messages = utils.ruleMessages(ruleName, {
  own: (prop) =>
    `Свой ${prop} в состоянии фокуса. Кольцо фокуса приходит из dist/styles.css — компонент его не рисует`,
  removed: () =>
    'outline снят. Если нужно убрать кольцо браузера, используйте токены фокуса, а не outline: none',
});

const meta = { url: 'https://github.com/ORG/aurora-design-system/blob/main/lint/README.md#focus-from-tokens' };

const FOCUS = /:focus(-visible)?\b/;
const RING_PROPS = /^(outline|outline-(color|width|style|offset)|box-shadow|border-color)$/i;
const OFF = /^(none|0|0px)$/i;

const rule = (primary) => (root, result) => {
  if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

  root.walkDecls((decl) => {
    if (decl.prop.toLowerCase() !== 'outline' || !OFF.test(decl.value.trim())) return;
    utils.report({ result, ruleName, message: messages.removed(), node: decl });
  });

  root.walkRules((ruleNode) => {
    if (!FOCUS.test(ruleNode.selector)) return;

    ruleNode.walkDecls((decl) => {
      if (!RING_PROPS.test(decl.prop)) return;
      if (/var\(\s*--ds-/.test(decl.value)) return;
      if (OFF.test(decl.value.trim())) return; // уже отмечено выше
      utils.report({
        result,
        ruleName,
        message: messages.own(decl.prop),
        node: decl,
        word: decl.prop,
      });
    });
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default createPlugin(ruleName, rule);
