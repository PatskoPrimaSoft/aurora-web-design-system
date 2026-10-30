import type { CodeSnippet } from '../../../shared/code-block/code-snippet';

export const checkboxSnippets = {
  basic: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsCheckboxComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-checkbox-example',
  imports: [DsCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <ds-checkbox label="Отправка команд"
      description="Разрешить отправку команд выбранным объектам"
      [checked]="basic()"
      (checkedChange)="basic.set($event)"></ds-checkbox>
    <p role="status">{{ basic() ? 'Отправка команд разрешена.' : 'Отправка команд запрещена.' }}</p>
  \`,
  styles: \`
    p {
      margin: var(--ds-gap-md) 0 0;
    }
  \`,
})
export class CheckboxExampleComponent {
  readonly basic = signal(true);
}
`,
  },
  tree: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsCheckboxComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-checkbox-example',
  imports: [DsCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="selection-tree">
      <ds-checkbox label="Выбрать все объекты"
        [checked]="allSelected(allIds)"
        [indeterminate]="partlySelected(allIds)"
        (checkedChange)="select(allIds, $event)"></ds-checkbox>
      <div class="branches">
        @for (group of groups; track group.name) {
          <fieldset>
            <legend>{{ group.name }}</legend>
            <ds-checkbox [label]="'Выбрать группу «' + group.name + '»'"
              [checked]="allSelected(ids(group))"
              [indeterminate]="partlySelected(ids(group))"
              (checkedChange)="select(ids(group), $event)"></ds-checkbox>
            <div class="leaves">
              @for (item of group.items; track item.id) {
                <ds-checkbox [label]="item.name"
                  [checked]="selected().includes(item.id)"
                  (checkedChange)="select([item.id], $event)"></ds-checkbox>
              }
            </div>
          </fieldset>
        }
      </div>
    </div>
    <p role="status">Выбрано объектов: {{ selected().length }} из {{ allIds.length }}.</p>
  \`,
  styles: \`
    .selection-tree,
    .branches,
    .leaves {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--ds-gap-sm);
    }
    .branches,
    .leaves {
      padding-left: 28px;
    }
    fieldset {
      margin: 0;
      padding: 0;
      border: 0;
    }
    legend {
      font: var(--ds-type-body-strong);
      margin-bottom: var(--ds-gap-sm);
    }
    p {
      margin: var(--ds-gap-md) 0 0;
    }
  \`,
})
export class CheckboxExampleComponent {
  readonly groups = [
    {
      name: 'Транспорт',
      items: [
        { id: 'maz', name: 'МАЗ 5440' },
        { id: 'volvo', name: 'Volvo FH16' },
      ],
    },
    {
      name: 'Спецтехника',
      items: [
        { id: 'excavator', name: 'Экскаватор' },
        { id: 'crane', name: 'Кран' },
      ],
    },
  ];
  readonly allIds = this.groups.flatMap((group) => this.ids(group));
  readonly selected = signal<string[]>(['maz', 'excavator']);
  ids(group: { items: readonly { id: string }[] }): string[] {
    return group.items.map((item) => item.id);
  }
  allSelected(ids: readonly string[]): boolean {
    return ids.length > 0 && ids.every((id) => this.selected().includes(id));
  }
  partlySelected(ids: readonly string[]): boolean {
    const count = ids.filter((id) => this.selected().includes(id)).length;
    return count > 0 && count < ids.length;
  }
  select(ids: readonly string[], checked: boolean): void {
    this.selected.update((current) =>
      checked ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id)),
    );
  }
}
`,
  },
  disabled: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsCheckboxComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-checkbox-example',
  imports: [DsCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="stack">
      <ds-checkbox label="Изменение параметров"
        description="Недоступно для вашей роли"
        disabled></ds-checkbox>
      <ds-checkbox label="Обязательная настройка"
        description="Включена администратором"
        [checked]="true"
        disabled></ds-checkbox>
      <ds-checkbox label="Выбор ограниченной группы"
        description="Часть объектов выбрана; изменение запрещено"
        [indeterminate]="true"
        disabled></ds-checkbox>
    </div>
  \`,
  styles: \`
    .stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--ds-gap-sm);
    }
  \`,
})
export class CheckboxExampleComponent {}
`,
  },
  unlabelled: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsCheckboxComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-checkbox-example',
  imports: [DsCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="sample">
      <ds-checkbox compact
        aria-label="Выбрать объект МАЗ 5440"
        [checked]="row()"
        (checkedChange)="row.set($event)"></ds-checkbox>
      <span>МАЗ 5440</span>
    </div>
    <p role="status">{{ row() ? 'Объект выбран.' : 'Объект не выбран.' }}</p>
  \`,
  styles: \`
    .sample {
      display: flex;
      align-items: center;
      gap: var(--ds-gap-sm);
    }
    p {
      margin: var(--ds-gap-md) 0 0;
    }
  \`,
})
export class CheckboxExampleComponent {
  readonly row = signal(false);
}
`,
  },
  alignment: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsCheckboxComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-checkbox-example',
  imports: [DsCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="alignment">
      <ds-checkbox aria-label="Выбрать объект без видимой подписи"></ds-checkbox>
      <ds-checkbox label="Показывать треки"></ds-checkbox>
      <ds-checkbox label="Показывать события"
        description="События выбранных объектов за текущий день"></ds-checkbox>
      <ds-checkbox label="Разрешить отображение подробных сведений обо всех выбранных объектах"
        description="Длинные подпись и пояснение переносятся; чекбокс остаётся по центру всего текстового блока"></ds-checkbox>
    </div>
  \`,
  styles: \`
    .alignment {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      max-width: 320px;
      gap: var(--ds-gap-md);
    }
  \`,
})
export class CheckboxExampleComponent {}
`,
  },
  forms: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsCheckboxComponent, DsButtonComponent } from '@primasoftllc/design-system/angular';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox-example',
  imports: [DsCheckboxComponent, DsButtonComponent, ReactiveFormsModule, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <form [formGroup]="form" (submit)="submitForm($event)">
      <div class="stack">
        <ds-checkbox formControlName="showTracks"
          name="showTracks"
          label="Показывать треки"
          description="Значение связано с FormControl"></ds-checkbox>
        <ds-checkbox formControlName="sendCommands"
          name="sendCommands"
          label="Разрешить команды"
          description="Недоступность задаётся через FormControl"></ds-checkbox>
      </div>
      <div class="row form-actions">
        <button dsButton type="submit">Сохранить настройки</button>
        <button dsButton tone="secondary" (click)="resetForm()">Сбросить форму</button>
        <button dsButton
          tone="ghost"
          (click)="form.controls.showTracks.setValue(!form.controls.showTracks.value)">
          Изменить значение из кода
        </button>
        <button dsButton tone="ghost" (click)="toggleDisabled()">
          {{ form.controls.sendCommands.disabled ? 'Разрешить команды' : 'Заблокировать команды' }}
        </button>
      </div>
    </form>
    <p>
      Значение:
      <code>{{ form.value | json }}</code>
    </p>
    <p>
      Поле треков touched:
      <code>{{ form.controls.showTracks.touched }}</code>
    </p>
    <p role="status">{{ formMessage() }}</p>
  \`,
  styles: \`
    .stack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--ds-gap-sm);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ds-gap-md);
    }
    .form-actions {
      margin-top: var(--ds-gap-md);
    }
    p {
      margin: var(--ds-gap-sm) 0 0;
    }
  \`,
})
export class CheckboxExampleComponent {
  readonly form = new FormGroup({
    showTracks: new FormControl(false, { nonNullable: true }),
    sendCommands: new FormControl({ value: true, disabled: true }, { nonNullable: true }),
  });
  readonly formMessage = signal('Форма ещё не отправлялась.');
  toggleDisabled(): void {
    const control = this.form.controls.sendCommands;
    if (control.disabled) control.enable();
    else control.disable();
  }
  resetForm(): void {
    // Angular 19 FormGroup.reset accepts values; restore disabled separately.
    this.form.reset({ showTracks: false, sendCommands: true });
    this.form.controls.sendCommands.disable({ emitEvent: false });
    this.formMessage.set('Форма сброшена.');
  }
  submitForm(event: Event): void {
    event.preventDefault();
    this.formMessage.set('Отправлено: ' + JSON.stringify(this.form.value));
  }
}
`,
  },
  states: {
    language: 'typescript',
    code: `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsCheckboxComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-checkbox-example',
  imports: [DsCheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <div class="table-scroll" tabindex="0" role="region" aria-label="Состояния Checkbox">
      <table>
        <thead>
          <tr>
            <th scope="col">Начальное состояние</th>
            <th scope="col">Доступен</th>
            <th scope="col">Недоступен</th>
          </tr>
        </thead>
        <tbody>
          @for (state of states; track state.name) {
            <tr>
              <th scope="row">{{ state.name }}</th>
              <td>
                <ds-checkbox [checked]="state.checked"
                  [indeterminate]="state.mixed"
                  [aria-label]="state.name + ': доступный образец'"></ds-checkbox>
              </td>
              <td>
                <ds-checkbox [checked]="state.checked"
                  [indeterminate]="state.mixed"
                  [aria-label]="state.name + ': недоступный образец'"
                  disabled></ds-checkbox>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  \`,
  styles: \`
    .table-scroll {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      padding: 12px 8px;
      border-bottom: 1px solid var(--ds-divider);
      text-align: center;
    }
    th {
      font: var(--ds-type-body-strong);
      background: var(--ds-bg);
    }
  \`,
})
export class CheckboxExampleComponent {
  readonly states = [
    { name: 'Не выбран', checked: false, mixed: false },
    { name: 'Выбран', checked: true, mixed: false },
    { name: 'Частично выбран', checked: false, mixed: true },
  ];
}
`,
  },
  usage: {
    language: 'typescript',
    code: `import { Component, signal } from '@angular/core';
import { DsCheckboxComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-track-setting',
  imports: [DsCheckboxComponent],
  template: \`
    <ds-checkbox label="Показывать треки"
      [checked]="checked()"
      (checkedChange)="checked.set($event)"></ds-checkbox>
  \`,
})
export class TrackSettingComponent {
  readonly checked = signal(false);
}
`,
  },
} satisfies Record<string, CodeSnippet>;
