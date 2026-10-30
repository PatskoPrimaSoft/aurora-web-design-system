import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DsCheckboxComponent } from '@primasoftllc/design-system/angular';

@Component({
  selector: 'checkbox-demo',
  imports: [DsCheckboxComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ds-checkbox
      id="checkbox-direct"
      inputId="checkbox-native"
      label="Отправка команд"
      description="Разрешить команды выбранным объектам"
      [checked]="checked()"
      [indeterminate]="mixed()"
      (checkedChange)="checked.set($event); events.set(events() + 1)"
      (indeterminateChange)="mixed.set($event)"></ds-checkbox>
    <output id="checkbox-events">{{ events() }}</output>
    <button id="checkbox-mixed" (click)="mixed.set(true)">Частичный выбор</button>
    <ds-checkbox
      id="checkbox-form"
      [formControl]="control"
      label="Показывать треки"
      (checkedChange)="formEvents.set(formEvents() + 1)"></ds-checkbox>
    <button id="checkbox-set" (click)="control.setValue(true)">Задать значение</button>
    <button id="checkbox-disable" (click)="control.disable()">Запретить изменение</button>
    <button id="checkbox-reset" (click)="control.enable(); control.reset()">Сбросить</button>
    <output id="checkbox-form-events">{{ formEvents() }}</output>
    <output id="checkbox-form-value">{{ control.value }} / {{ control.touched }}</output>
    <ds-checkbox id="checkbox-compact" compact aria-label="Выбрать строку"></ds-checkbox>
    <ds-checkbox id="checkbox-disabled" label="Ограничение" disabled></ds-checkbox>
  `,
})
export class CheckboxDemo {
  readonly checked = signal(false);
  readonly mixed = signal(true);
  readonly events = signal(0);
  readonly formEvents = signal(0);
  readonly control = new FormControl(false, { nonNullable: true });
}
