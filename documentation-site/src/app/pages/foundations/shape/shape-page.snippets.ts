import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const shapeSnippets = {
  panel: {
    language: 'css',
    code: `.region {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
}
`,
  },
} satisfies Record<string, CodeSnippet>;
