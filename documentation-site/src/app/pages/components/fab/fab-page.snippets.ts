import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const fabSnippets = {
  basic: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsFabComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-fab-example',
  imports: [DsFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="row">
      <button dsFab label="Добавить объект" (click)="added.set(added() + 1)"></button>
      <button dsFab extended label="Добавить объект" (click)="added.set(added() + 1)"></button>
    </div>
    <p role="status">Добавлено объектов: {{ added() }}</p>
  \`,
  styles: \`
    .row { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; }
    .sample { display: inline-flex; align-items: center; gap: 8px; }
    .limited { width: 100%; max-width: 240px; }
  \`,
})
export class FabExampleComponent {
  readonly added = signal(0);
}
`,
  },
  tones: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsFabComponent, type DsFabTone } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-fab-example',
  imports: [DsFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="row">
      @for (tone of tones; track tone) {
        <span class="sample">
          <button dsFab
            [tone]="tone"
            [label]="'Действие: ' + tone"
            (click)="selectedTone.set(tone)"></button>
          <code>{{ tone }}</code>
        </span>
      }
    </div>
    <p role="status">Выбран тон: {{ selectedTone() }}</p>
  \`,
  styles: \`
    .row { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; }
    .sample { display: inline-flex; align-items: center; gap: 8px; }
    .limited { width: 100%; max-width: 240px; }
  \`,
})
export class FabExampleComponent {
  readonly tones: readonly DsFabTone[] = ['primary', 'accent', 'surface'];
  readonly selectedTone = signal<DsFabTone>('primary');
}
`,
  },
  sizes: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsFabComponent, type DsFabSize } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-fab-example',
  imports: [DsFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="row">
      @for (size of sizes; track size) {
        <span class="sample">
          <button dsFab
            [size]="size"
            [label]="'Добавить объект: ' + size"
            (click)="selectedSize.set(size)"></button>
          <code>{{ size }}</code>
        </span>
      }
    </div>
    <p role="status">Выбран размер: {{ selectedSize() }}</p>
  \`,
  styles: \`
    .row { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; }
    .sample { display: inline-flex; align-items: center; gap: 8px; }
    .limited { width: 100%; max-width: 240px; }
  \`,
})
export class FabExampleComponent {
  readonly sizes: readonly DsFabSize[] = ['sm', 'md', 'lg'];
  readonly selectedSize = signal<DsFabSize>('md');
}
`,
  },
  states: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DsFabComponent, DsButtonComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-fab-example',
  imports: [DsFabComponent, DsButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="row">
      <button dsFab
        extended
        icon="save"
        label="Сохранить изменения"
        [loading]="loading()"
        (click)="save()"></button>
      <button dsFab
        icon="delete"
        label="Удалить объект"
        [disabled]="locked()"
        (click)="message.set('Объект удалён.')"></button>
      <button dsButton tone="secondary" (click)="locked.set(!locked())">
        {{ locked() ? "Разрешить удаление" : "Запретить удаление" }}
      </button>
    </div>
    <p role="status">{{ message() }}</p>
  \`,
  styles: \`
    .row { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; }
    .sample { display: inline-flex; align-items: center; gap: 8px; }
    .limited { width: 100%; max-width: 240px; }
  \`,
})
export class FabExampleComponent {
  readonly loading = signal(false);
  readonly locked = signal(true);
  readonly message = signal('Действие ещё не выполнялось.');
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }
  save(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.message.set('Сохраняем изменения…');
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.message.set('Изменения сохранены.');
    }, 800);
  }
}
`,
  },
  tooltip: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsFabComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-fab-example',
  imports: [DsFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="limited">
      <button dsFab
        extended
        label="Добавить новый объект в выбранную группу"
        (click)="added.set(added() + 1)"></button>
    </div>
    <p role="status">Добавлено объектов: {{ added() }}</p>
  \`,
  styles: \`
    .row { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; }
    .sample { display: inline-flex; align-items: center; gap: 8px; }
    .limited { width: 100%; max-width: 240px; }
  \`,
})
export class FabExampleComponent {
  readonly added = signal(0);
}
`,
  },
  usage: {
    language: 'typescript',
    code: `import { Component } from '@angular/core';
import { DsFabComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-create-action',
  imports: [DsFabComponent],
  template: '<button dsFab extended label="Добавить объект"></button>',
})
export class CreateActionComponent {}
`,
  },
} satisfies Record<string, CodeSnippet>;
