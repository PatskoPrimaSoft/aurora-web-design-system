# DsCheckboxComponent

Нативный input type="checkbox" внутри `<ds-checkbox>`. Публичный импорт:
`@primasoftllc/design-system/angular`. Общий styles.css подключается один раз.
Страница примеров: `/components/checkbox`, меню «Компоненты → Поля и выбор → Checkbox».

```html
<ds-checkbox label="Отправка команд" description="Разрешить отправку команд объектам"
  [checked]="allowed" (checkedChange)="allowed = $event"></ds-checkbox>

<ds-checkbox label="Показывать треки" [formControl]="showTracks"></ds-checkbox>
```

Импортируйте DsCheckboxComponent в imports компонента страницы; для Forms
добавьте ReactiveFormsModule и используйте boolean FormControl. Forms входят
в стандартный пакет @angular/forms той же версии, что @angular/core.

## API

| Input | Тип | По умолчанию |
| --- | --- | --- |
| checked | boolean | false |
| indeterminate | boolean | false |
| disabled | boolean | false |
| compact | boolean; область нажатия 24 px для строки таблицы | false |
| label | string | Нет |
| description | string | Нет |
| inputId | string; ID внутреннего input | Генерируется |
| name | string; имя поля для нативного FormData | Нет |
| aria-label, aria-labelledby | string; доступное имя внутреннего input | Из label |
| aria-describedby | string; внешние описания внутреннего input | Нет |

Булевы inputs поддерживают booleanAttribute. checkedChange и
indeterminateChange передают boolean; поддерживаются [(checked)] и
[(indeterminate)]. Не используйте checked одновременно с formControl,
formControlName или ngModel. В режиме Forms значение задаёт CVA; disabled
формы и входной disabled объединяются: любой из них запрещает взаимодействие.

Indeterminate имеет приоритет при отрисовке: минус виден независимо от checked.
Нажатие, включая Space, устанавливает checked=true и indeterminate=false.
Enter выбор не переключает. Группы, дерево и частичный выбор вычисляет родитель.

При пользовательском действии компонент меняет локальное состояние, вызывает
зарегистрированный callback Forms и checkedChange; при снятии частичного
выбора также отправляет indeterminateChange(false). Внешние изменения inputs
обновляют состояние. writeValue/setValue/reset не вызывают outputs и onChange;
touched передаётся при blur. CVA принимает true как выбранное значение,
false и null/reset — как невыбранное. Indeterminate остаётся отдельным визуальным
флагом, не третьим значением FormControl.

## Разметка и доступность

Символ — 18 × 18 px. Галочка/минус — декоративный Material Symbols 14 px с
wght=600 по оформлению Checkbox. Цвета, границы, типографика, интервалы и фокус
берутся из токенов дизайн-системы. Область нажатия следует --ds-control-h;
compact задаёт предусмотренные для табличного выбора 24 × 24 px без изменения символа.

Label и description находятся внутри одного нативного label, оба переключают
контрол. Символ центрируется относительно всего текстового блока, в том числе
многострочного. Компактная ширина label ограничивает кликабельную область;
пустое место справа не переключает значение. Ширину и внешние отступы задаёт родитель.

При наличии label доступное имя формируется автоматически; description связан
с input через aria-describedby. Без label задавайте aria-label или
aria-labelledby. Внешний aria-describedby дополняется внутренним description.
Все три ARIA-параметра относятся к внутреннему input, а не к хосту ds-checkbox.
InputId необязателен и нужен только для внешней связи, например label[for].
Name необязателен: нативный FormData отправляет отмеченный checkbox с именем
и значением on. Reactive Forms используют значение boolean, не строку on.

Radio, required, отображение ошибок и проекция сложной подписи не добавлены.
SSR/hydration пока не заявлены, как и у текущих компонентов библиотеки.

## Примеры и проверки

На сайте семь сценариев: обычный выбор, дерево с «Выбрать всё», disabled,
контрол без подписи, выравнивание, Reactive Forms, сравнение состояний.
Добавлены сценарии установленного пакета для Angular 19/20 и браузерная
проверка страницы. Точечные проверки 2026-10-30 прошли: production-сборка,
страница во всех четырёх режимах и двух ширинах, статьи colors/shape,
установленный пакет в Angular 19/20.
Полный verify не запускался.
