import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const iconSnippets = {
  template: {
    language: 'html',
    code: `<ds-icon name="lock" label="Доступ ограничен"></ds-icon>
`,
  },
  component: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsIconComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-icon-example',
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<ds-icon name="search"></ds-icon> Поиск объекта\`,
})
export class IconExampleComponent {}
`,
  },
  sizes: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsIconComponent } from '@primasoftllc/design-system/angular';
import type { DsIconSize } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-icon-sizes',
  imports: [DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    @for (size of sizes; track size) {
      <ds-icon name="search" [size]="size"></ds-icon>
      <span>{{ size }}</span>
    }
  \`,
})
export class IconSizesComponent {
  readonly sizes: readonly DsIconSize[] = ['xs', 'sm', 'md', 'lg'];
}
`,
  },
  color: {
    language: 'html',
    code: `<!-- Цвет выбирает родитель; общие стили пакета подключены в приложении. -->
<span style="color: var(--ds-fg-muted)">
  <ds-icon name="info"></ds-icon> Дополнительная информация
</span>
<span style="color: var(--ds-warning-fg)">
  <ds-icon name="warning"></ds-icon> Предупреждение
</span>
<span style="
  background: var(--ds-brand);
  color: var(--ds-on-brand);
  padding: 8px 12px;
  border-radius: var(--ds-radius-sm);">
  <ds-icon name="done"></ds-icon> Сохранено
</span>
`,
  },
  accessibility: {
    language: 'html',
    code: `<!-- Видимый текст сообщает смысл: label у иконки не нужен. -->
<ds-icon name="warning"></ds-icon>
<span>Нет связи с объектом</span>

<!-- Самостоятельный символ: label задаёт доступное имя, не tooltip. -->
<ds-icon name="lock" label="Доступ ограничен"></ds-icon>
`,
  },
  rotation: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DsButtonComponent, DsIconComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-icon-direction',
  imports: [DsButtonComponent, DsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <ds-icon name="navigation" size="lg" [rotate]="angle()" [label]="directionLabel()"></ds-icon>
    <output>Курс: {{ angle() }}°</output>
    <button dsButton tone="secondary" size="sm" icon="refresh" (click)="turn()">Повернуть на 45°</button>
  \`,
  styles: \`:host { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; }\`,
})
export class IconDirectionComponent {
  readonly angle = signal(45);
  readonly directionLabel = computed(() => \`Направление: \${this.angle()}°\`);

  turn() {
    this.angle.update((angle) => (angle + 45) % 360);
  }
}
`,
  },
} satisfies Record<string, CodeSnippet>;
