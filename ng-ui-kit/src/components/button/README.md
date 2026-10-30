# DsButtonComponent

Кнопка для Angular 19.2.25 и 20.3.34 на нативном элементе `button[dsButton]`.
Страница с примерами нового сайта: `/components/button`.

Подключите пакетный `styles.css` и `provideAurora` по [руководству](../../../../design-system/docs/usage.md).
Компонент импортируется из `@primasoftllc/design-system/angular` и применяется
к нативному `<button>`. Вложенные интерактивные элементы в подписи недопустимы.

## Пример подключения

```ts
import {Component, signal} from '@angular/core';
import {DsButtonComponent} from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-save-example',
  imports: [DsButtonComponent],
  template: `<button dsButton icon="save" [loading]="saving()" (click)="save()">Сохранить</button>
    <p role="status">{{message()}}</p>`,
})
export class SaveExample {
  readonly saving = signal(false);
  readonly message = signal('');

  async save(): Promise<void> {
    this.saving.set(true);
    this.message.set('Сохраняем изменения…');
    try {
      // Демонстрация асинхронного действия; в приложении здесь вызов сервиса.
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      this.message.set('Изменения сохранены.');
    } catch {
      this.message.set('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      this.saving.set(false);
    }
  }
}
```

## Angular API

Таблица описывает Angular inputs; генерируемые `.d.ts` поставляются с библиотекой.
Иконки внутри кнопки отрисовывает DsIconComponent; отдельно импортировать его
для параметров icon/iconRight не требуется.

| Input | Тип | По умолчанию |
| --- | --- | --- |
| `tone` | `DsButtonTone`: primary, secondary, subtle, ghost, danger, accent, inverse | primary |
| `size` | `DsButtonSize`: sm, md, lg | md |
| `icon`, `iconRight` | `string`: имя Material Symbols | нет |
| `loading` | `boolean` | false |
| `disabled` | `boolean` | false |
| `fullWidth` | `boolean` | false |
| `type` | button, submit, reset | button |
| `aria-busy`, `aria-disabled` | `string \| boolean \| null` | null |

Булевы inputs поддерживают атрибутную запись (`fullWidth`) и Angular binding
(`[disabled]="locked"`); строка `"false"` означает false.
Подпись передаётся содержимым элемента, действие — нативным `(click)`.
`id`, `name`, `value`, `form`, `aria-label` и остальные HTML-атрибуты остаются на кнопке.

`loading` временно устанавливает `aria-busy="true"` и `aria-disabled="true"`,
а после завершения возвращает заданные приложением ARIA-значения. При этом
блокируются click и отправка формы, сохраняются фокус, подпись и размеры.
Самостоятельный `aria-disabled` описывает доступность, но не заменяет `disabled`.

Для отправки формы задайте `type="submit"` и обрабатывайте submit формы.
`disabled` исключает кнопку из Tab; loading оставляет её в Tab.
Причина недоступности и результат действия выводятся приложением рядом с кнопкой.
Библиотека не выполняет запросы и не меняет loading самостоятельно.

## Кнопка без текста

```html
<button dsButton icon="add" aria-label="Добавить запись"></button>
```

При одной иконке и пустой проецируемой подписи кнопка становится квадратной:
размеры sm/md/lg — 28/36/44 px в cozy и 24/30/36 px в compact.
Используются токены высоты контролов, нулевые внутренние отступы и radius-md.
`fullWidth` явно растягивает такую кнопку по ширине. Иконка декоративная;
доступное имя задаётся на кнопке. За корректность имени иконки отвечает приложение.
Отдельного IconButton, параметра iconOnly и автоматической подсказки нет.

На странице Button показаны обычное действие, семь тонов, три размера, иконки
с подписью и без, disabled, loading, перенос длинной подписи и нативная форма.

## Проверка

`npm run check:angular` устанавливает tarball в независимые приложения Angular 19/20,
компилирует этот пример и запускает браузерные проверки. Общая интерактивная
демонстрация — `ng-ui-kit/tests/consumers/shared/button-demo.ts` в репозитории.
Поддержка SSR, hydration и zoneless пока не проверена.
