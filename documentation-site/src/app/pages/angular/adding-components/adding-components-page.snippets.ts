import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const addingComponentsSnippets = {
  directory: {
    language: 'text',
    code: `ng-ui-kit/src/components/<name>/
  <name>.component.ts
  README.md
`,
  },
  component: {
    language: 'typescript',
    code: `import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'ds-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<ng-content />\`,
  styles: [\`
    :host {
      display: block;
      color: var(--ds-fg);
      font: var(--ds-type-body);
    }
  \`],
})
export class DsExampleComponent {}
`,
  },
  exports: {
    language: 'typescript',
    code: `export * from './components/example/example.component';
`,
  },
  targetedChecks: {
    language: 'shell',
    code: `mise exec -- npm run build
mise exec -- npm run check:angular
`,
  },
  verify: {
    language: 'shell',
    code: `mise exec -- npm run verify
`,
  },
} satisfies Record<string, CodeSnippet>;
