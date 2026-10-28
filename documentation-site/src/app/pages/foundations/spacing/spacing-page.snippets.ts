import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const spacingSnippets = {
  settingsLayout: {
    language: 'css',
    code: `.settings {
  display: grid;
  gap: var(--ds-gap-xl);
  padding: var(--ds-pad-xl);
}
.settings-group {
  display: grid;
  gap: var(--ds-gap-md);
}
`,
  },
} satisfies Record<string, CodeSnippet>;
