# Типографика

## Пример кода

Подключение `@primasoftllc/design-system/styles.css` загружает Inter Tight
и JetBrains Mono. Роль назначается через `font`, а трекинг — отдельно.
HTML-заголовки выбирайте по структуре документа.

```css
@import '@primasoftllc/design-system/styles.css';

.panel-title {
  font: var(--ds-type-title);
  letter-spacing: var(--ds-tracking-tight);
  color: var(--ds-fg-strong);
}

.description {
  font: var(--ds-type-body);
  color: var(--ds-fg);
  max-width: 74ch;
  text-wrap: pretty;
}

.telemetry {
  font: var(--ds-type-mono);
  text-align: right;
}
```

Числа в одном столбце форматируйте с одинаковой точностью, если это
соответствует смыслу данных. Для верхнего регистра используйте
`text-transform: uppercase` только с короткими метками роли `eyebrow`;
добавляйте `letter-spacing: var(--ds-tracking-eyebrow)`.

Если подходящей роли нет, обсудите изменение системы. Дополнительный
размер из примитивной шкалы не заменяет согласованную текстовую роль.

## Дальше

- [Плотность интерфейса](../DsDensity/README.md) — сравнение геометрии компонентов.
- [Смена типографической системы](../../docs/typography-migration.md) — история решения и правила переноса.
