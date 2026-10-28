import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const statusSnippets = {
  reportStatus: {
    language: 'css',
    code: `.report-status {
  display: inline-flex;
  padding: 4px 10px;
  font: var(--ds-type-caption);
  color: var(--ds-success-fg);
  background: var(--ds-success-bg);
  border: 1px solid var(--ds-success-line);
  border-radius: var(--ds-radius-pill);
}
`,
  },
} satisfies Record<string, CodeSnippet>;
