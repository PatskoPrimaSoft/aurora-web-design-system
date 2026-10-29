import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const tokenNamesSnippets = {
  naming: {
    language: 'text',
    code: `<префикс>-<домен?>-<роль>-<вариант?>-<слот?>
`,
  },
} satisfies Record<string, CodeSnippet>;
