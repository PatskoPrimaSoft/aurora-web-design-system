import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const lintSnippets = {
  install: {
    language: 'shell',
    code: `npm i -D stylelint postcss-scss
`,
  },
  configuration: {
    language: 'json',
    code: `{
  "extends": "@primasoftllc/design-system/stylelint-config",
  "overrides": [
    { "files": ["**/*.scss"], "customSyntax": "postcss-scss" }
  ]
}
`,
  },
  overrides: {
    language: 'json',
    code: `"scripts": { "lint:css": "stylelint \\"src/**/*.{css,scss}\\"" }
`,
  },
  styles: {
    language: 'scss',
    code: `color: var(--ds-fg-mutted);   /* Токена --ds-fg-mutted нет в системе. Возможно, --ds-fg-muted */
font:  var(--font-ds-type-body);   /* Токена --font-ds-type-body нет в системе. Возможно, --ds-type-body */
`,
  },
  checks: {
    language: 'shell',
    code: `node design-system/lint/scripts/build-allowlist.js   # пересобрать список имён из tokens.json
node design-system/lint/scripts/check-names.js       # проверить имена по регламенту
node design-system/lint/test/run.js                  # тесты правил, имён и сверка списка с tokens.json
`,
  },
} satisfies Record<string, CodeSnippet>;
