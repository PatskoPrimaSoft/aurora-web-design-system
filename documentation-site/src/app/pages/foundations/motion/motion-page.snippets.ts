import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const motionSnippets = {
  controlTransition: {
    language: 'css',
    code: `.custom-control {
  transition: var(--ds-transition-control);
}
@media (prefers-reduced-motion: reduce) {
  .custom-control {
    transition: none;
  }
}
`,
  },
} satisfies Record<string, CodeSnippet>;
