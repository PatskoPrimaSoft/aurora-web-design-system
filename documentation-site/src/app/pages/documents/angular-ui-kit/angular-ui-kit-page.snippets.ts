import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const angularUiKitSnippets = {
  button: {
    language: 'html',
    code: `<button dsButton tone="primary" type="submit" [loading]="saving()">
  Сохранить
</button>
`,
  },
} satisfies Record<string, CodeSnippet>;
