# Типографика

## Пример кода

Подключение `@primasoftllc/design-system/styles.css` загружает Inter Tight
и JetBrains Mono. Ниже — стили для собственной разметки. Готовые компоненты
уже используют нужные текстовые роли и цвета.
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

Если подходящей роли нет, обсудите изменение системы. Дополнительный
размер из примитивной шкалы не заменяет согласованную текстовую роль.

## Дальше

- [Нейтральные цвета](../DsNeutrals/README.md) — роли цвета текста и поверхностей.
- [Плотность интерфейса](../DsDensity/README.md) — сравнение геометрии компонентов.
- [Смена типографической системы](../../docs/typography-migration.md) — история решения и правила переноса.
