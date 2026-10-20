## Токены

| Токен | За что отвечает |
| --- | --- |
| `ds-field-h` | Высота обоих полей с учётом плотности |
| `ds-surface`, `ds-fg`, `ds-bg` | Значение и поверхность доступного поля либо поля только для чтения |
| `ds-surface-disabled`, `ds-fg-disabled` | Недоступные границы |
| `ds-border-field`, `ds-border-field-hover`, `ds-border-width`, `ds-radius-md` | Оболочки DsField |
| `ds-brand`, `ds-focus-color`, `ds-focus-width`, `ds-focus-offset` | Фокус полей и кнопок |
| `ds-danger-solid`, `ds-danger-fg` | Ошибка порядка, ограничений или обязательности |
| `ds-type-body`, `ds-type-caption`, `ds-weight-medium` | Заголовок группы, значения и подписи |
| `ds-fg-muted`, `ds-fg-subtle` | Часовой пояс, подсказки и подписи |
| `ds-gap-md`, `ds-gap-sm` | Промежутки между границами, пояснениями и кнопками |
| `ds-control-h-sm` | Высота кнопок готовых периодов |

Поля используют DsField, готовые периоды — вторичные DsButton. На узком экране границы переносятся; собственной высоты страницы или прокрутки компонент не создаёт.
