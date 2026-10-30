import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const hoverSnippets = {
  template: {
    language: 'html',
    code: `<button dsButton (click)="result.set('Изменения сохранены.')">Сохранить</button>
<button dsButton tone="secondary" (click)="result.set('Изменения отменены.')">Отмена</button>
<button dsButton disabled>Недоступно</button>
<p role="status">{{ result() }}</p>
`,
  },
  component: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsButtonComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-action-feedback',
  imports: [DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="actions">
      <button dsButton (click)="result.set('Изменения сохранены.')">Сохранить</button>
      <button dsButton tone="secondary" (click)="result.set('Изменения отменены.')">Отмена</button>
      <button dsButton disabled>Недоступно</button>
    </div>
    <p role="status">{{ result() }}</p>
  \`,
  styles: \`
    .actions { display: flex; flex-wrap: wrap; gap: var(--ds-gap-md); }
    p { margin: var(--ds-gap-md) 0 0; }
  \`,
})
export class ActionFeedbackComponent {
  readonly result = signal('Изменения ещё не сохранены.');
}
`,
  },
} satisfies Record<string, CodeSnippet>;
