import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  AuroraScopeDirective,
  DsButtonComponent,
  DsCheckboxComponent,
} from '@primasoftllc/design-system/angular';
import { ArticleLayoutComponent } from '../../../shared/article-layout/article-layout.component';
import { CodeBlockComponent } from '../../../shared/code-block/code-block.component';
import { ExampleBlockComponent } from '../../../shared/example-block/example-block.component';
import { SiteSettingsService } from '../../../site-settings.service';
import { checkboxSnippets } from './checkbox-page.snippets';

@Component({
  selector: 'aurora-checkbox-page',
  imports: [
    ArticleLayoutComponent,
    CodeBlockComponent,
    ExampleBlockComponent,
    AuroraScopeDirective,
    DsCheckboxComponent,
    DsButtonComponent,
    ReactiveFormsModule,
    JsonPipe,
  ],
  templateUrl: './checkbox-page.component.html',
  styleUrl: './checkbox-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPageComponent {
  protected readonly settings = inject(SiteSettingsService);
  protected readonly snippets = checkboxSnippets;
  protected readonly basic = signal(true);
  protected readonly row = signal(false);
  protected readonly groups = [
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
  protected readonly allIds = this.groups.flatMap((group) => this.ids(group));
  protected readonly selected = signal<string[]>(['maz', 'excavator']);
  protected readonly states = [
    { name: 'Не выбран', checked: false, mixed: false },
    { name: 'Выбран', checked: true, mixed: false },
    { name: 'Частично выбран', checked: false, mixed: true },
  ];
  protected readonly form = new FormGroup({
    showTracks: new FormControl(false, { nonNullable: true }),
    sendCommands: new FormControl({ value: true, disabled: true }, { nonNullable: true }),
  });
  protected readonly formMessage = signal('Форма ещё не отправлялась.');
  protected ids(group: { items: readonly { id: string }[] }): string[] {
    return group.items.map((item) => item.id);
  }
  protected allSelected(ids: readonly string[]): boolean {
    // Aggregation belongs to the example, not to the exported Checkbox.
    return ids.length > 0 && ids.every((id) => this.selected().includes(id));
  }
  protected partlySelected(ids: readonly string[]): boolean {
    const count = ids.filter((id) => this.selected().includes(id)).length;
    return count > 0 && count < ids.length;
  }
  protected select(ids: readonly string[], checked: boolean): void {
    this.selected.update((current) =>
      checked ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id)),
    );
  }
  protected toggleDisabled(): void {
    const control = this.form.controls.sendCommands;
    if (control.disabled) control.enable();
    else control.disable();
  }
  protected resetForm(): void {
    // Angular 19 FormGroup.reset accepts values; restore disabled separately.
    this.form.reset({ showTracks: false, sendCommands: true });
    this.form.controls.sendCommands.disable({ emitEvent: false });
    this.formMessage.set('Форма сброшена.');
  }
  protected submitForm(event: Event): void {
    event.preventDefault();
    this.formMessage.set('Отправлено: ' + JSON.stringify(this.form.value));
  }
}
