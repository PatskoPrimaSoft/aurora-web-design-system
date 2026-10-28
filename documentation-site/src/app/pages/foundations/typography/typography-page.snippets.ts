import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const typographySnippets = {
  customStyles: {
    language: 'css',
    code: `@import '@primasoftllc/design-system/styles.css';

.panel-title {
  font: var(--ds-type-title);
  letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-fg-strong);
}

.description {
  font: var(--ds-type-body);
  color: var(--ds-fg);
  max-width: 74ch;
  text-wrap: pretty;
}

.telemetry {
  font: var(--ds-type-mono);
  text-align: right;
}
`,
  },
} satisfies Record<string, CodeSnippet>;
