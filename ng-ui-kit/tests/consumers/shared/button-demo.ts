import {Component, signal} from '@angular/core';
import {DsButtonComponent, type DsButtonTone, type DsButtonSize} from '@primasoftllc/design-system/angular';

@Component({
  selector: 'button-demo', standalone: true, imports: [DsButtonComponent],
  styles: [':host{display:block;background:var(--ds-surface);color:var(--ds-fg);padding:12px} label{display:block}'],
  template: `
    <h2>Кнопка</h2>
    <form (submit)="submit($event)">
      <input id="form-field" name="query" value="initial" aria-label="Комментарий">
      <button id="action" dsButton [tone]="tone()" [size]="size()" [type]="type()"
        [disabled]="disabled()" [loading]="loading()" [icon]="icon()" [iconRight]="iconRight()"
        name="action" value="save" data-purpose="save" (click)="activate()">Сохранить</button>
      <button id="default-type" dsButton (click)="defaults = defaults + 1">Обычная кнопка</button>
    </form>
    <p role="status" id="counts">{{clicks}} / {{submits}} / {{defaults}}</p>
    <label><input id="loading" type="checkbox" [checked]="loading()" (change)="loading.set($any($event.target).checked)"> Загрузка</label>
    <label><input id="disabled" type="checkbox" [checked]="disabled()" (change)="disabled.set($any($event.target).checked)"> Недоступна</label>
    <label><input id="autoload" type="checkbox" [checked]="autoload" (change)="autoload = $any($event.target).checked"> Загрузка после клика</label>
    <label>Тон <select id="tone" (change)="tone.set($any($event.target).value)">@for (t of tones; track t) {<option [value]="t">{{t}}</option>}</select></label>
    <label>Размер <select id="size" (change)="size.set($any($event.target).value)">@for (s of sizes; track s) {<option [value]="s" [selected]="s === size()">{{s}}</option>}</select></label>
    <label>Тип <select id="type" (change)="type.set($any($event.target).value)"><option value="submit">submit</option><option value="button">button</option><option value="reset">reset</option></select></label>
    <label>Иконка слева <input id="icon" [value]="icon()" (input)="icon.set($any($event.target).value)"></label>
    <label>Иконка справа <input id="icon-right" [value]="iconRight()" (input)="iconRight.set($any($event.target).value)"></label>
    <div style="width:100%;max-width:240px"><button id="long" dsButton fullWidth icon="save" iconRight="arrow_forward">ОченьДлинноеНазваниеДействияБезПробеловКотороеНужноПеренестиПолностью</button></div>
    <button id="icon-only" dsButton icon="add" aria-label="Добавить"></button>
    <button id="aria" dsButton aria-busy="true" aria-disabled="true">Внешние ARIA атрибуты</button>
    <button id="false-attributes" dsButton disabled="false" loading="false" fullWidth="false">Булевы атрибуты</button>
    <fieldset disabled><legend>Недоступная группа</legend><button id="fieldset-button" dsButton (click)="activate()">Действие группы</button></fieldset>
    <form id="external-form" (submit)="submit($event)"></form>
    <button id="external-button" dsButton type="submit" form="external-form" name="external" value="yes">Внешняя форма</button>
  `,
})
export class ButtonDemo {
  readonly tone = signal<DsButtonTone>('primary');
  readonly size = signal<DsButtonSize>('md');
  readonly type = signal<'button'|'submit'|'reset'>('submit');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly icon = signal('save');
  readonly iconRight = signal('arrow_forward');
  readonly tones: DsButtonTone[] = ['primary','secondary','subtle','ghost','danger','accent','inverse'];
  readonly sizes: DsButtonSize[] = ['sm','md','lg'];
  clicks = 0; submits = 0; defaults = 0; autoload = false;
  activate() { this.clicks++; if (this.autoload) this.loading.set(true); }
  submit(event: Event) { event.preventDefault(); this.submits++; }
}
