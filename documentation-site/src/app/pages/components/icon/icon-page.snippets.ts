import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const iconSnippets = {
  template: { language: 'html', code: '<ds-icon name="search" label="Поиск"></ds-icon>\n' },
  component: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsIconComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-icon-example',
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ds-icon name="search" label="Поиск"></ds-icon>',
})
export class IconExampleComponent {}
`,
  },
} satisfies Record<string, CodeSnippet>;
